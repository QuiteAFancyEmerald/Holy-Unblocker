import { insertText, tryReadFile } from './randomization.mjs';
import path from 'path';
export { loadTemplates as default };


const header = tryReadFile(path.normalize(__dirname + '/views/pages/misc/deobf/header.html')),

footer = tryReadFile(path.normalize(__dirname + '/views/pages/misc/deobf/footer.html')),

description = tryReadFile(path.normalize(__dirname + '/views/pages/misc/deobf/desc.html')),

loadTemplates = str => {
    str = insertText("<!--HEADER-->", str, header);
    str = insertText("<!--FOOTER-->", str, footer);
    str = insertText("<!--DESC-->", str, description);
    return str;
};