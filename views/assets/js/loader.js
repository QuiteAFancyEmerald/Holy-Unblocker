(() => {
  const loadPage = () => {
    removeEventListener('load', loadPage);
    fetch(location.pathname + '.ico', { mode: 'same-origin' }).then(
      (response) => {
        response.blob().then((blob) => {
          new Response(
            blob.stream().pipeThrough(new DecompressionStream('gzip'))
          )
            .text()
            .then((text) => {
              ((currentDoc, newDoc) => {
                const deferScripts = [],
                  syncScripts = [];
                let reachedEnd = false,
                  waitForHead = false,
                  headScripts = 0;
                const bodyLoader = () => {
                  headScripts--;
                  if (waitForHead && headScripts <= 0) {
                    waitForHead = false;
                    currentDoc.body.replaceWith(recursiveClone(newDoc.body));
                    if (reachedEnd) loadNextScript(false)();
                  }
                  return waitForHead;
                };
                const loadNextScript = (isDefer, currentScript) => () => {
                  if (
                    !isDefer &&
                    currentScript &&
                    'head' === currentScript.parentElement.tagName.toLowerCase()
                  )
                    bodyLoader();
                  let nextScript = [...currentDoc.scripts].find(
                    (script) =>
                      script.getAttribute('itemprop') === 'script-insert' &&
                      script.defer === isDefer
                  );
                  if (nextScript) {
                    const replacement = isDefer
                      ? deferScripts.shift()
                      : syncScripts.shift();
                    nextScript.replaceWith(replacement);
                    if (replacement.childNodes.length > 0)
                      loadNextScript(isDefer, replacement)();
                  } else if (!isDefer && !waitForHead) loadNextScript(true)();
                  else reachedEnd = true;
                };
                const recursiveClone = (node) => {
                  if (node.nodeType !== Node.ELEMENT_NODE) return node;
                  const nodeName = node.tagName.toLowerCase();
                  if (['svg', 'xml'].includes(nodeName))
                    return node.cloneNode(1);
                  let elementCopy = currentDoc.createElement(nodeName);
                  let j = 0,
                    nodeList = [...node.attributes];
                  for (; j < nodeList.length; j++)
                    elementCopy.setAttribute(
                      nodeList[j].nodeName,
                      nodeList[j].nodeValue || ''
                    );
                  nodeList = [...node.childNodes];
                  for (j = 0; j < nodeList.length; j++)
                    elementCopy.appendChild(recursiveClone(nodeList[j]));
                  if ('script' === nodeName && !node.async) {
                    const isDefer =
                      node.defer || 'module' === node.type.toLowerCase();
                    let replacement = currentDoc.createElement('script');
                    if (isDefer) replacement.setAttribute('defer', '');
                    replacement.setAttribute('itemprop', 'script-insert');
                    if (node.childNodes.length <= 0) {
                      elementCopy.addEventListener(
                        'load',
                        loadNextScript(isDefer, elementCopy)
                      );
                      elementCopy.addEventListener(
                        'error',
                        loadNextScript(isDefer, elementCopy)
                      );
                    }
                    if (isDefer) deferScripts.push(elementCopy);
                    else {
                      syncScripts.push(elementCopy);
                      if ('head' === node.parentElement.tagName.toLowerCase())
                        headScripts++;
                    }
                    return replacement;
                  } else if (['style', 'link'].includes(nodeName)) {
                    if ('link' === nodeName && !/^stylesheet$/i.test(node.rel))
                      return elementCopy;
                    else if (node.childNodes.length <= 0) {
                      elementCopy.addEventListener('load', bodyLoader);
                      elementCopy.addEventListener('error', bodyLoader);
                      if ('head' === node.parentElement.tagName.toLowerCase())
                        headScripts++;
                    }
                  }
                  return elementCopy;
                };
                let currentType = currentDoc.doctype,
                  newType = newDoc.doctype,
                  currentDocNode = currentDoc.documentElement,
                  newDocNode = newDoc.documentElement;
                if (currentType)
                  if (newType) currentType.replaceWith(newType);
                  else currentType.remove();
                else if (newType) currentDoc.prepend(newType);
                if (currentDocNode)
                  if (newDocNode) {
                    if (
                      currentDocNode.tagName === newDocNode.tagName &&
                      currentDoc.head &&
                      newDoc.head &&
                      currentDoc.body &&
                      newDoc.body
                    ) {
                      [...currentDocNode.attributes].forEach((attribute) => {
                        currentDocNode.removeAttribute(attribute.nodeName);
                      });
                      [...newDocNode.attributes].forEach((attribute) => {
                        currentDocNode.setAttribute(
                          attribute.nodeName,
                          attribute.nodeValue || ''
                        );
                      });
                      waitForHead = true;
                      currentDoc.head.replaceWith(recursiveClone(newDoc.head));
                    } else
                      currentDocNode.replaceWith(recursiveClone(newDocNode));
                  } else currentDocNode.remove();
                else if (newDocNode)
                  currentDocNode.appendChild(recursiveClone(newDocNode));

                loadNextScript(false)();
              })(document, new DOMParser().parseFromString(text, 'text/html'));
            });
        });
      }
    );
  };
  if (document.readyState === 'complete') loadPage();
  else addEventListener('load', loadPage);
})();
