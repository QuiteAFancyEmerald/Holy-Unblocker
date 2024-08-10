import pkg from './routes.mjs';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'node:url';
export { paintSource, preloaded404, tryReadFile };
const {
  cookingInserts,
  vegetables,
  charRandom,
  splashRandom,
  cacheBustList,
  VersionValue,
  text404,
} = pkg;

/* Below are lots of function definitions used to obfuscate the website.
 * This makes the website harder to properly categorize, as its source code
 * changes with each time it is loaded.
 */
const randomListItem = (lis) => () => lis[(Math.random() * lis.length) | 0],
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
  // Grab the text content of a file. Ensure the file is a string.
  tryReadFile = (file, baseUrl) => {
    file = fileURLToPath(new URL(file, baseUrl));
    return existsSync(file + '')
      ? readFileSync(file + '', 'utf8')
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
