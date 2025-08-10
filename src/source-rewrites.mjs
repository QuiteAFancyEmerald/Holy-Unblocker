import {
  config,
  serverUrl,
  flatAltPaths,
  cookingInserts,
  vegetables,
  charRandom,
  delimiter,
  textMasks,
  splashRandom,
  cacheBustList,
  VersionValue,
  uvError,
  sjError,
} from './routes.mjs';
export { paintSource as default };

/* Below are lots of function definitions used to obfuscate the website.
 * This makes the website harder to properly categorize, as its source code
 * changes with each time it is compiled using npm run build.
 *
 * For customizing source code transformation and more, see the config.json file.
 * For automatically recompiling in production mode, see ecosystem.config.js.
 */
const regExpEscape = /[-[\]{}()*+?.,\\^$#\s]/g,
  basicStrEscape = /["'`$\\]/g,
  charset = /&#173;|&#8203;|&shy;|<wbr>/gi,
  subtermsByCaps = /[A-Z]?[^A-Z]+|[A-Z]/g,
  subtermsByVowels = /(?<=[AEIOUYaeiouy])/g,
  termsBySpaces = /\S+/g,
  containsMask = /&#\d+;|&[A-z]+;/,
  getEndPoint = /((?<![^\/])github\/)?[^\/]+$/,
  getPaths = /[^\/]+(?=\/)/g,
  getAbsoluteRoot = /^~?\/+|^~$|^(?!\.\/)/,
  applyInsert = (str, insertFunction, numArgs = 0) => {
    const mode = 'function' === typeof insertFunction,
      keyword = mode ? insertFunction.name : insertFunction,
      replaceParams1 = new RegExp(
        `[^\\S\\n]*{{${keyword}}}\\s*` +
          '\\s*{{\\s*\\n((?:(?!}})[^])*\\n)\\s*}}\\s*?\\n?'.repeat(numArgs),
        'g'
      ),
      replaceParams2 = new RegExp(
        `{{${keyword}}}` + '{{([^]*?)}}'.repeat(numArgs),
        'g'
      ),
      replaceFunc = mode
        ? (text, ...captures) => insertFunction(...captures.splice(0, numArgs))
        : (text) => flatAltPaths[keyword] || text;
    return numArgs > 0
      ? str
          .replace(replaceParams1, replaceFunc)
          .replace(replaceParams2, replaceFunc)
      : str.replace(replaceParams2, replaceFunc);
  },
  applyMassInsert = (str, flatPathObject, shouldIgnore = false) => {
    const replaceParams = new RegExp(
        `{{(${Object.keys(flatPathObject).join('|').replace(regExpEscape, '\\$&')})}}`,
        'g'
      ),
      replaceFunc = shouldIgnore
        ? (text, capture) => capture
        : (text, capture) => flatPathObject[capture] || text;
    return str.replace(replaceParams, replaceFunc);
  },
  ifSEO = (text) => (config.usingSEO ? text : ''),
  randomListItem = (lis) => () => lis[(Math.random() * lis.length) | 0],
  getRandomChar = randomListItem(charRandom),
  // Text masks, found in src/data.json, are meant to be variations of the
  // same term. Using a different term as a mask will break the spelling.
  parsedTextMasks = Object.freeze(
    Object.entries(textMasks).map((entry) => [
      entry[0],
      randomListItem(entry[1]),
      entry[0].match(subtermsByCaps),
    ])
  ),
  maskTerm = (term) => {
    if (config.usingSEO) return term;
    const altList = parsedTextMasks.find(
      (entry) => entry[0].toLowerCase() === term.toLowerCase()
    );
    let capitals = altList[2].map((word) => {
      const letter = term[0];
      term = term.slice(word.length);
      return letter;
    });
    return altList[1]()
      .replace(subtermsByCaps, (word) => capitals.shift() + word.slice(1))
      .replaceAll(delimiter, getRandomChar);
  },
  autoMask = (text) =>
    config.usingSEO
      ? text
      : text.replace(termsBySpaces, (term) =>
          containsMask.test(term)
            ? term
            : term.replace(subtermsByVowels, getRandomChar)
        ),
  route = (text) =>
    text
      .replace(
        getEndPoint,
        // cacheBustList is purely for dealing with cached file loading issues.
        (name, ancestor) =>
          ancestor
            ? flatAltPaths[name] || name
            : flatAltPaths['files/' + name] ||
              cacheBustList[name] ||
              flatAltPaths[name] ||
              name
      )
      .replace(
        getPaths,
        (path) => flatAltPaths['prefixes/' + path] || flatAltPaths[path] || path
      )
      .replace(getAbsoluteRoot, serverUrl.pathname),
  insertCharset = (str) => str.replace(charset, getRandomChar),
  getRandomSplash = randomListItem(splashRandom),
  hutaoInsert = (str) => str.replaceAll('<!--HUTAOWOA-->', getRandomSplash),
  versionInsert = (str) => str.replaceAll('<!-- VERSION -->', VersionValue),
  getCookingText = () =>
    `<span style="display:none" data-fact="${randomListItem(vegetables)()}">${randomListItem(cookingInserts)()}</span>`,
  insertCooking = (str) =>
    str.replaceAll(
      '<!-- IMPORTANT-HUTAOCOOKINGINSERT-DONOTDELETE -->',
      getCookingText
    ),
  encodingTable = (() => {
    let yummyOneBytes = '';
    for (let i = 0; i < 128; i++)
      if (
        JSON.stringify(JSON.stringify(String.fromCodePoint(i)).slice(1, -1))
          .length < 6
      )
        yummyOneBytes += String.fromCodePoint(i);
    return yummyOneBytes;
  })(),
  createRandomID = () =>
    crypto
      .randomUUID()
      .split('-')
      .map((gibberish) => {
        let randomNumber = parseInt(gibberish, 16),
          output = '';
        while (randomNumber >= encodingTable.length) {
          output +=
            encodingTable[Math.floor(randomNumber) % encodingTable.length];
          randomNumber = randomNumber / encodingTable.length;
        }
        return output + Math.floor(randomNumber);
      })
      .join(''),
  // To be used for {{insertions}} that are also encased in string literals.
  escapeStr = (str) =>
    str
      .replace(basicStrEscape, '\\$&')
      .replaceAll('\r', '\\r')
      .replaceAll('\n', '\\n'),
  orderedTransforms = [
    [route, 1],
    [ifSEO, 1],
    [maskTerm, 1],
    [autoMask, 1],
  ],
  namedEntries = Object.freeze({
    __uv$config: escapeStr(
      config.randomizeIdentifiers ? createRandomID() : '__uv$config'
    ),
  }),
  // List of manual censors for unavoidable cases.
  manualCensors = Object.freeze({
    Google: 'Glasses',
    Bing: 'Bell Sound',
    Brave: 'Brave',
    DuckDuckGo: '2x Waterfowl Moves',
    Startpage: 'Beginning Sheet',
    'wisp-transport': 'wst',
    libcurl: 'unix',
    epoxy: 'epoch',
    bare: 'time',
  }),
  // Apply most obfuscation changes to an entire file's text content.
  prePaint = (str) => {
    let paintedSource = insertCharset(
      hutaoInsert(versionInsert(insertCooking(str)))
    );
    paintedSource = applyMassInsert(
      applyMassInsert(paintedSource, manualCensors, config.usingSEO),
      namedEntries
    );
    for (let i = 0, total = orderedTransforms.length; i < total; i++)
      paintedSource = applyInsert(paintedSource, ...orderedTransforms[i]);
    return paintedSource;
  },
  // Functionally similar to templates.mjs, but requires more situational formatting.
  specialTemplates = Object.freeze({
    'ultraviolet-error': escapeStr(prePaint(uvError)),
    'scramjet-error': escapeStr(prePaint(sjError)),
  }),
  // Apply final changes to a given file's text content.
  paintSource = (str) => applyMassInsert(prePaint(str), specialTemplates);
