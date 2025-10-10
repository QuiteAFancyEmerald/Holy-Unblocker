(() => {
  const windowEventListeners = [],
    documentEventListeners = [],
    loadedModules = [];
  let _addEventListener = addEventListener,
    _document = document,
    _window = window,
    origin = location;
  _addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.code === 'KeyM' && event.isTrusted) {
      if (localStorage.getItem('{{hu-lts}}-loader-key') !== navigator.userAgent)
        localStorage.setItem('{{hu-lts}}-loader-key', navigator.userAgent);
      else localStorage.removeItem('{{hu-lts}}-loader-key');
      _window.location.reload();
    }
  });
  const setListeners = () => {
    const currentWindow = _window,
      currentDoc = _document;
    currentWindow.Window.prototype.addEventListener = (...args) => {
      windowEventListeners.push([...args]);
      return _addEventListener.bind(currentWindow)(...args);
    };
    currentWindow.Document.prototype.addEventListener = (...args) => {
      documentEventListeners.push([...args]);
      return _addEventListener.bind(currentDoc)(...args);
    };
  };
  setListeners();
  const displayErrorPage = (overwrite = false, currentDoc = _document) => {
    currentDoc.body.removeAttribute('style');
    if (overwrite)
      currentDoc.body.replaceWith(currentDoc.createElement('body'));
    currentDoc.body.insertAdjacentHTML(
      'afterbegin',
      '<center><h1>403 Forbidden</h1></center><center>You don’t have permission to access this page.</center><hr><center>nginx</center>'
    );
    let head = currentDoc.createElement('head'),
      title = currentDoc.createElement('title');
    title.textContent = '500 Internal Server Error';
    head.appendChild(title);
    currentDoc.head.replaceWith(head);
    if (currentDoc.currentScript) currentDoc.currentScript.remove();
  };
  if (
    _window.localStorage.getItem('{{hu-lts}}-loader-key') !==
    navigator.userAgent
  )
    return displayErrorPage();
  const lastUpdated = '{{cacheVal}}',
    retrieveUrl = (pathname) => {
      let capturedUrl = new URL(pathname, origin),
        capturedParams = new URLSearchParams(capturedUrl.search);
      capturedParams.set('cache', lastUpdated);
      capturedUrl.search = capturedParams.toString();
      return capturedUrl;
    };

  const loadAttachments = () => {
    if (_document.readyState === 'complete') loadPage()();
    else addEventListener('load', loadPage());
    _addEventListener('popstate', () => {
      if (_window.location.href.includes('#')) return;
      _window.console.clear();
      loadPage(location, false)();
    });
  };

  const loadPage =
    (destination = origin, pushState = true) =>
    () => {
      _window
        .fetch(
          retrieveUrl(
            destination.pathname.replace(/\/+/g, '/').replace(/\/$/, '') +
              '.ico'
          ),
          { mode: 'same-origin' }
        )
        .then((response) => {
          let i = windowEventListeners.length - 1;
          for (; i >= 0; i--) {
            _window.removeEventListener(...windowEventListeners[i]);
            windowEventListeners.pop();
          }
          for (i = documentEventListeners.length - 1; i >= 0; i--) {
            _document.removeEventListener(...documentEventListeners[i]);
            documentEventListeners.pop();
          }
          if (destination !== _window.location && pushState) {
            _window.console.clear();
            if (response.status === 200) {
              if (_window === window)
                _window.history.pushState({}, '', retrieveUrl(destination));
            } else return _window.location.assign(new URL(destination, origin));
          }
          response.blob().then((blob) => {
            new _window.Response(
              blob.stream().pipeThrough(new _window.DecompressionStream('gzip'))
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
                      'head' ===
                        currentScript.parentElement.tagName.toLowerCase()
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
                    else {
                      reachedEnd = true;
                      if (waitForHead) return;
                      [
                        ...windowEventListeners,
                        ...documentEventListeners,
                      ].forEach((listenerParams) => {
                        if (listenerParams[0] === 'DOMContentLoaded')
                          listenerParams[1](
                            new _window.Event('DOMContentLoaded')
                          );
                      });
                      windowEventListeners.forEach((listenerParams) => {
                        if (listenerParams[0] === 'load')
                          listenerParams[1](new _window.Event('load'));
                      });
                    }
                  };
                  const recursiveClone = (node) => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return node;
                    const nodeName = node.tagName.toLowerCase();
                    let src = { pathname: node.src || '' };
                    if (
                      node.src &&
                      './'.indexOf(node.getAttribute('src')[0]) >= 0
                    ) {
                      src = retrieveUrl(node.src);
                      node.setAttribute(
                        'src',
                        src.pathname + src.search + src.hash
                      );
                    }
                    if (['svg', 'xml'].includes(nodeName))
                      return node.cloneNode(1);
                    let elementCopy = currentDoc.createElement(nodeName);
                    let j = 0,
                      nodeList = [...node.attributes];
                    for (; j < nodeList.length; j++) {
                      let attrName = nodeList[j].nodeName;
                      let attrValue = nodeList[j].nodeValue;
                      elementCopy.setAttribute(attrName, attrValue || '');
                      if (attrName.toLowerCase() === 'href')
                        try {
                          new URL(attrValue);
                        } catch (e) {
                          if ('./?'.indexOf(attrValue[0]) !== -1)
                            if (
                              nodeName === 'a' &&
                              attrValue.indexOf('#') === -1
                            )
                              elementCopy.addEventListener('click', (event) => {
                                event.preventDefault();
                                if (attrValue === '{{route}}{{/}}')
                                  attrValue = '{{route}}{{/index}}';
                                loadPage(new URL(attrValue, origin))();
                              });
                            else if (nodeName === 'link') {
                              src = retrieveUrl(node.href);
                              elementCopy.setAttribute(
                                'href',
                                src.pathname + src.search + src.hash
                              );
                            }
                        }
                    }
                    nodeList = [...node.childNodes];
                    for (j = 0; j < nodeList.length; j++)
                      elementCopy.appendChild(recursiveClone(nodeList[j]));
                    if ('script' === nodeName) {
                      if (
                        node.async ||
                        'module' === node.type.toLowerCase() ||
                        node.hasAttribute('data-module')
                      ) {
                        if (
                          loadedModules.includes(
                            src.pathname || node.textContent
                          )
                        )
                          return currentDoc.createElement('script');
                        loadedModules.push(src.pathname || node.textContent);
                        if (node.async) return elementCopy;
                      }
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
                      if (
                        'link' === nodeName &&
                        !/^stylesheet$/i.test(node.rel)
                      )
                        return elementCopy;
                      else if (node.childNodes.length <= 0) {
                        elementCopy.addEventListener('load', bodyLoader);
                        elementCopy.addEventListener('error', bodyLoader);
                        if ('head' === node.parentElement.tagName.toLowerCase())
                          headScripts++;
                      }
                    }
                    /*
                    if (node.id === 'newtab')
                      elementCopy.addEventListener('click', () => {
                        origin = new URL(location.href);
                        _window = open();
                        _addEventListener = _addEventListener.bind(_window);
                        _document = _window.document;
                        setListeners();
                        loadAttachments();
                      });
                    */
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
                        currentDoc.head.replaceWith(
                          recursiveClone(newDoc.head)
                        );
                      } else
                        currentDocNode.replaceWith(recursiveClone(newDocNode));
                    } else currentDocNode.remove();
                  else if (newDocNode)
                    currentDocNode.appendChild(recursiveClone(newDocNode));

                  loadNextScript(false)();
                })(
                  _document,
                  new _window.DOMParser().parseFromString(text, 'text/html')
                );
              });
          });
        })
        .catch((error) => {
          _window.console.log(error);
          displayErrorPage(true);
        });
    };
  loadAttachments();
})();
