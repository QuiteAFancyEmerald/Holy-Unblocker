import pkg from './routes.mjs';
import { existsSync, readFileSync } from 'node:fs';
export { config, paintSource, randomizeGlobal, preloaded404, tryReadFile };
const {
  cookingInserts,
  vegetables,
  charRandom,
  splashRandom,
  cacheBustList,
  VersionValue,
  text404,
} = pkg;

// For customizing source code transformation and more, see the config.json file.
const config = Object.freeze(
    JSON.parse(readFileSync(new URL('../config.json', import.meta.url)))
  ),
  /* Below are lots of function definitions used to obfuscate the website.
   * This makes the website harder to properly categorize, as its source code
   * changes with each time it is loaded.
   */
  randomListItem = (lis) => () => lis[(Math.random() * lis.length) | 0],
  charset = /&#173;|&#8203;|&shy;|<wbr>/gi,
  getRandomChar = randomListItem(charRandom),
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
  randomValue = crypto
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
  randomizeGlobal = config.randomizeIdentifiers
    ? (file) =>
        tryReadFile(file, import.meta.url).replace(
          /(["'`])\{\{__uv\$config\}\}\1/g,
          JSON.stringify(randomValue)
        )
    : (file) =>
        tryReadFile(file, import.meta.url).replace(
          /(["'`])\{\{__uv\$config\}\}\1/g,
          JSON.stringify('__uv$config')
        ),
  // This one isn't for obfuscation; it's just for dealing with cache issues.
  cacheBusting = (str) => {
    for (let item of Object.entries(cacheBustList))
      str = str.replaceAll(item[0], item[1]);
    return str;
  },
  // Apply the final obfuscation changes to an entire file.
  paintSource = (str) =>
    insertCharset(hutaoInsert(versionInsert(insertCooking(cacheBusting(str))))),
  // Use this instead of text404 for a preloaded error page.
  preloaded404 = paintSource(text404),
  // Grab the text content of a file. Uses the root directory if no base is supplied.
  tryReadFile = (file, baseUrl = new URL('../', import.meta.url)) => {
    file = new URL(file, baseUrl);
    return existsSync(file)
      ? readFileSync(
          file,
          /\.(?:ico|png|jpg|jpeg)$/.test(file) ? undefined : 'utf8'
        )
      : preloaded404;
  };

/*

All of this is now old code.
The newer versions of these functions are directly above.

function randomListItem(lis) {
    return lis[Math.floor(Math.random() * lis.length)];
}

function insertCharset(str) {
    return str.replace(/&#173;|&#8203;|&shy;|<wbr>/g, function() { return randomListItem(charRandom); });
}

function hutaoInsert(str) {
    return str.replace(/<!--HUTAOWOA-->/g, function() { return randomListItem(splashRandom); });
}

function insertCooking(str) {
    return str.replace(/<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->/g, function() { return '<span style="display: none;" data-fact="' + randomListItem(vegetables) + '" data-type="' + randomListItem(vegetables) + '">' + randomListItem(cookingInserts) + '</span>'; }); // this needs to be inside a function, so that not every string is the same
}

function cacheBusting(str) {
    for (var item of Object.entries(cacheBustList)) {
        str = str.replace(new RegExp(item[0], "g"), item[1]);
    }
    return str;
}

export function paintSource(str) {
    return insertCharset(hutaoInsert(insertCooking(cacheBusting(str))));
}

export function tryReadFile(file) {
    return existsSync(file) ? readFileSync(file, 'utf8') : text404;
}

*/
