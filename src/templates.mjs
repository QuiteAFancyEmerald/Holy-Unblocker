import { insertText, tryReadFile } from "./randomization.mjs";
import path from "path";
export { loadTemplates as default };

const __dirname = path.resolve();

const header = tryReadFile(
    path.normalize(__dirname + "/views/pages/misc/deobf/header.html")
  ),
  footer = tryReadFile(
    path.normalize(__dirname + "/views/pages/misc/deobf/footer.html")
  ),
  documentation = tryReadFile(
    path.normalize(__dirname + "/views/pages/misc/deobf/docs.html")
  ),
  faq = tryReadFile(
    path.normalize(__dirname + "/views/pages/misc/deobf/faq.html")
  ),
  terms = tryReadFile(
    path.normalize(__dirname + "/views/pages/misc/deobf/tos.html")
  ),
  settings = tryReadFile(
    path.normalize(__dirname + "/views/pages/misc/deobf/settings.html")
  ),
  loadTemplates = (str) => {
    str = insertText("<!--HEADER-->", str, header);
    str = insertText("<!--FOOTER-->", str, footer);

    //  Used only on docs.html
    str = insertText("<!--DOCS-->", str, documentation);
    //  Used only on faq.html
    str = insertText("<!--FAQ-->", str, faq);
    //  Used only on terms.html
    str = insertText("<!--TOS-->", str, terms);
    //  Used only on csel.html
    str = insertText("<!--SETTINGS-->", str, settings);
    return str;
  };
