import { tryReadFile } from './source-rewrites.mjs';
export { loadTemplates as default };

const __dirname = '../views/pages/misc/deobf',
  getLineHeads = /^/gm,
  regExpEscape2 = /[-[\]{}()*+?.,\\^$|#\s]/g,
  templateNames = [
    'head-content',
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
  locateTemplate = (key) =>
    new RegExp(
      `([^\\S\\n]*)<!--(${key.replace(regExpEscape2, '\\$&')})-->`,
      'gm'
    ),
  preserveIndentation = (template) => (line, leadingSpaces) =>
    template.replace(getLineHeads, leadingSpaces),
  templates = templateNames.map((name) => [
    locateTemplate(name.toUpperCase()),
    preserveIndentation(readTemplate(name).replace(/\s+$/, '')),
  ]),
  loadTemplates = (str) =>
    templates.reduce(
      (updatedStr, [key, template]) => updatedStr.replace(key, template),
      str
    );
