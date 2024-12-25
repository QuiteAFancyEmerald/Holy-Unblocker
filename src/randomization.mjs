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
    `<span style="display:none" data-fact="${randomListItem(
      vegetables
    )()}">${randomListItem(cookingInserts)()}</span>`,
  insertCooking = (str) =>
    str.replaceAll(
      '<!-- IMPORTANT-HUCOOKINGINSERT-DONOTDELETE -->',
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
      ? readFileSync(
          file + '',
          /\.(?:ico|png|jpg|jpeg)$/.test(file) ? undefined : 'utf8'
        )
      : preloaded404;
  };
