import pkg from './routes.mjs';
import { existsSync, readFileSync } from 'fs';
const { cookingInserts, vegetables, charRandom, splashRandom, cacheBustList, text404 } = pkg;
export { insertText, paintSource, tryReadFile };

/*
//  Try this instead of the .replace method. Might be more performant.
//  Will edit str by replacing all matches of lis with newText.
//  Usage: insertText(["<Example1>", "<Example2>"],
//             "<Example1> Big Giant Paragraph <Example2> Smol Paragraph",
//             stringOrFunctionToGenerateNewText);
*/
const insertText = (lis, str, newText) => {
//  The lis argument should be a list of strings containing placeholders.
//  This will put other relevant argument types, like a string, into a list.
    lis = [].concat(lis);

    let position;
//  Loop through each of the placeholder strings.
    for (let placeholder of lis) {
//      Find all matches of a placeholder string and insert new text there.
        while ((position = str.indexOf(placeholder)) >= 0)
            str = str.slice(0, position)
                + (typeof newText == "function" ? newText() : newText)
                + str.slice(position + placeholder.length);
    }
    return str;
};



//  Below are lots of function definitions used to obfuscate the website.
//  This makes the website harder to properly categorize, as its source code
//  changes with each time it is loaded.
const randomListItem = lis => () => lis[Math.random() * lis.length | 0],

charset = ["&#173;", "&#8203;", "&shy;", "<wbr>"],
getRandomChar = randomListItem(charRandom),
insertCharset = str => insertText(
    charset,
    str,
    getRandomChar
),

getRandomSplash = randomListItem(splashRandom),
hutaoInsert = str => insertText(
    "<!--HUTAOWOA-->",
    str,
    getRandomSplash
),

getCookingText = () => `<span style="display:none" data-fact="${randomListItem(vegetables)()}">${randomListItem(cookingInserts)()}</span>`,
insertCooking = str => insertText(
    "<!-- IMPORTANT-HUTAOCOOKINGINSERT-DONOTDELETE -->",
    str,
    getCookingText
),

//  This one isn't for obfuscation; it's just for dealing with cache issues.
cacheBusting = str => {
    for (let item of Object.entries(cacheBustList))
        str = insertText(item[0], str, item[1]);
    return str;
},

//  Applies the final obfuscation changes to an entire file.
paintSource = str => insertCharset(hutaoInsert(insertCooking(cacheBusting(str)))),

//  Grabs the text content of a file.
tryReadFile = file => existsSync(file) ? readFileSync(file, "utf8") : text404;

/*
//  All of this is now old code.
//  The newer versions of these functions are directly above.
*/
/*

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