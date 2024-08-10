import { tryReadFile } from './randomization.mjs';
export { loadTemplates as default };

const __dirname = '../views/pages/misc/deobf';

const header = tryReadFile(__dirname + '/header.html', import.meta.url),
  footer = tryReadFile(__dirname + '/footer.html', import.meta.url),
  documentation = tryReadFile(__dirname + '/docs.html', import.meta.url),
  faq = tryReadFile(__dirname + '/faq.html', import.meta.url),
  terms = tryReadFile(__dirname + '/tos.html', import.meta.url),
  settings = tryReadFile(__dirname + '/settings.html', import.meta.url),
  loadTemplates = (str) =>
    str
      .replace('<!--HEADER-->', header)
      .replace('<!--FOOTER-->', footer)

      // Used only on docs.html
      .replace('<!--DOCS-->', documentation)
      // Used only on faq.html
      .replace('<!--FAQ-->', faq)
      // Used only on terms.html
      .replace('<!--TOS-->', terms)
      // Used only on header.html
      .replace('<!--SETTINGS-->', settings);
