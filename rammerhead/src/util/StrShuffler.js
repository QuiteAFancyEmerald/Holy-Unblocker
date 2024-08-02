/*

baseDictionary originally generated with (certain characters was removed to avoid breaking pages):

let str = '';
for (let i = 32; i <= 126; i++) {
  let c = String.fromCharCode(i);
  if (c !== '/' && c !== '_' && encodeURI(c).length === 1) str += c;
}

*/

const mod = (n, m) => ((n % m) + m) % m;
const baseDictionary = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~-';
const shuffledIndicator = '_rhs';
const generateDictionary = function () {
    let str = '';
    const split = baseDictionary.split('');
    while (split.length > 0) {
        str += split.splice(Math.floor(Math.random() * split.length), 1)[0];
    }
    return str;
};
class StrShuffler {
    constructor(dictionary = generateDictionary()) {
        this.dictionary = dictionary;
    }
    shuffle(str) {
        if (str.startsWith(shuffledIndicator)) {
            return str;
        }
        let shuffledStr = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charAt(i);
            const idx = baseDictionary.indexOf(char);
            if (char === '%' && str.length - i >= 3) {
                shuffledStr += char;
                shuffledStr += str.charAt(++i);
                shuffledStr += str.charAt(++i);
            } else if (idx === -1) {
                shuffledStr += char;
            } else {
                shuffledStr += this.dictionary.charAt(mod(idx + i, baseDictionary.length));
            }
        }
        return shuffledIndicator + shuffledStr;
    }
    unshuffle(str) {
        if (!str.startsWith(shuffledIndicator)) {
            return str;
        }

        str = str.slice(shuffledIndicator.length);

        let unshuffledStr = '';
        for (let i = 0; i < str.length; i++) {
            const char = str.charAt(i);
            const idx = this.dictionary.indexOf(char);
            if (char === '%' && str.length - i >= 3) {
                unshuffledStr += char;
                unshuffledStr += str.charAt(++i);
                unshuffledStr += str.charAt(++i);
            } else if (idx === -1) {
                unshuffledStr += char;
            } else {
                unshuffledStr += baseDictionary.charAt(mod(idx - i, baseDictionary.length));
            }
        }
        return unshuffledStr;
    }
}

StrShuffler.baseDictionary = baseDictionary;
StrShuffler.shuffledIndicator = shuffledIndicator;
StrShuffler.generateDictionary = generateDictionary;

module.exports = StrShuffler;
