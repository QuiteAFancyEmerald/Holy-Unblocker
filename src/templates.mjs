import { tryReadFile } from "./randomization.mjs";
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
  loadTemplates = (str) =>
    str.replace("<!--HEADER-->", header)
        .replace("<!--FOOTER-->", footer)

    //  Used only on docs.html
        .replace("<!--DOCS-->", documentation)
    //  Used only on faq.html
        .replace("<!--FAQ-->", faq)
    //  Used only on terms.html
        .replace("<!--TOS-->", terms)
    //  Used only on header.html
        .replace("<!--SETTINGS-->", settings);
