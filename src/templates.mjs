import { tryReadFile } from './source-rewrites.mjs';
export { loadTemplates as default };

const __dirname = '../views/pages/misc/deobf',
  getLineHeads = /^/gm,
  regExpEscape2 = /[-[\]{}()*+?.,\\^$|#\s]/g,
  templateNames = [
    'header',
    'footer',
    'docs',
    'faq',
    'tos',
    'settings',
    'proxnav-settings',
  ],
  readTemplate = (identifier) =>
    tryReadFile(__dirname + `/${identifier}.html`, import.meta.url),
  templates = templateNames.map((name) => [
    name.toUpperCase(),
    readTemplate(name).replace(/\s+$/, ''),
  ]),
  locateTemplate = (key) =>
    new RegExp(`([^\\S\\n]*)<!--(${key.replace(regExpEscape2, '\\$&')})-->`, 'gm'),
  preserveIndentation = (template) => (line, leadingSpaces) =>
    template.replace(getLineHeads, leadingSpaces),
  loadTemplates = (str) =>
    templates.reduce(
      (updatedStr, [key, template]) =>
        updatedStr.replace(locateTemplate(key), preserveIndentation(template)),
      str
    );
