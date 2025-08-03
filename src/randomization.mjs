import pkg from './routes.mjs';
import { existsSync, readFileSync } from 'node:fs';
export { paintSource, preloaded404, tryReadFile };
const {
  config,
  flatAltPaths,
  cookingInserts,
  vegetables,
  charRandom,
  delimiter,
  textMasks,
  splashRandom,
  cacheBustList,
  VersionValue,
  text404,
  uvError,
} = pkg;

/* Below are lots of function definitions used to obfuscate the website.
 * This makes the website harder to properly categorize, as its source code
 * changes with each time it is compiled using npm run build.
 *
 * For customizing source code transformation and more, see the config.json file.
 * For automatically recompiling in production mode, see ecosystem.config.js.
 */
const regExpEscape = /[-[\]{}()*+?.,\\^$#\s]/g,
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
  charset = /&#173;|&#8203;|&shy;|<wbr>/gi,
  getRandomChar = randomListItem(charRandom),
  subtermsByCaps = /[A-Z]?[^A-Z]+|[A-Z]/g,
  subtermsByVowels = /(?<=[AEIOUYaeiouy])/g,
  termsBySpaces = /\S+/g,
  containsMask = /&#\d+;|&[A-z]+;/,
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
  orderedTransforms = [
    [ifSEO, 1],
    [maskTerm, 1],
    [autoMask, 1],
  ],
  namedEntries = Object.freeze({
    'ultraviolet-error': uvError,
    __uv$config: JSON.stringify(
      config.randomizeIdentifiers ? createRandomID() : '__uv$config'
    ),
    // This is purely for dealing with cached file loading issues.
    ...cacheBustList,
  }),
  // Apply the final obfuscation changes to an entire file.
  paintSource = (str) => {
    let paintedSource = insertCharset(
      hutaoInsert(versionInsert(insertCooking(str)))
    );
    paintedSource = applyMassInsert(
      applyMassInsert(paintedSource, flatAltPaths, config.usingSEO),
      namedEntries
    );
    for (let i = 0, total = orderedTransforms.length; i < total; i++)
      paintedSource = applyInsert(paintedSource, ...orderedTransforms[i]);
    return paintedSource;
  },
  // Use this instead of text404 for a preloaded error page.
  preloaded404 = paintSource(text404),
  isImage = /\.(?:ico|png|jpg|jpeg)$/,
  // Grab the text content of a file. Use the root directory if no base is supplied.
  tryReadFile = (file, baseUrl = new URL('../', import.meta.url)) => {
    file = new URL(file, baseUrl);
    return existsSync(file)
      ? readFileSync(file, isImage.test(file) ? undefined : 'utf8')
      : preloaded404;
  };
