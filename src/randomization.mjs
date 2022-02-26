import pkg from './routes.mjs';
import { existsSync, readFileSync } from 'fs';
const { cookingInserts, vegetables, charRandom, splashRandom, cacheBustList, text404 } = pkg;

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