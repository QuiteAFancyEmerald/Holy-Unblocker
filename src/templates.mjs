import { tryReadFile } from "./randomization.mjs";
import path from "path";
export { loadTemplates as default };

const __dirname = path.resolve() + "/views/pages/misc/deobf";

const header = tryReadFile(
    path.normalize(__dirname + "/header.html")
  ),
  footer = tryReadFile(
    path.normalize(__dirname + "/footer.html")
  ),
  documentation = tryReadFile(
    path.normalize(__dirname + "/docs.html")
  ),
  faq = tryReadFile(
    path.normalize(__dirname + "/faq.html")
  ),
  terms = tryReadFile(
    path.normalize(__dirname + "/tos.html")
  ),
  settings = tryReadFile(
    path.normalize(__dirname + "/settings.html")
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
