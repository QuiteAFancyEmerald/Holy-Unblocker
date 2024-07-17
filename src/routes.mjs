import { readFileSync } from "fs";
import path from "path";
import { readFile } from "fs/promises";

const insert = JSON.parse(
  await readFile(new URL("./data.json", import.meta.url))
);

const __dirname = path.resolve();

const text404 = readFileSync(
  path.normalize(__dirname + "/views/error.html"),
  "utf8"
);

const pages = {
  index: "index.html",
  /* Main */
  documentation: "docs.html",
  faq: "faq.html",
  s: "pages/frame.html",
  browse: "pages/surf.html",
  credits: "pages/nav/credits.html",
  x: "pages/nav/bookmarklets.html",
  terms: "pages/nav/terms.html",
  /* Games */
  g: "pages/nav/gtools.html",
  h: "pages/nav/games5.html",
  el: "pages/nav/emulators.html",
  f: "pages/nav/flash.html",
  m: "pages/nav/emulibrary.html",
  /* Proxies */
  q: "pages/proxnav/ultraviolet.html",
  rh: "pages/proxnav/rammerhead.html",
  /* Proxy Presets */
  y: "pages/proxnav/preset/youtube.html",
  apps: "pages/proxnav/preset/applications.html",
  /* Misc */
  fg: "archive/gfiles/flash/index.html",
  eg: "archive/gfiles/rarch/index.html",
  vos: "archive/vibeOS/index.html",
};

const cookingInserts = insert.content,
vegetables = insert.keywords,
charRandom = insert.chars,
splashRandom = insert.splash,
cacheBustList = {
  "styles.css": "styles-1644738239.css",
  "common.js": "common-16451543478.js",
};

export default {
  pages,
  text404,
  cookingInserts,
  vegetables,
  charRandom,
  splashRandom,
  cacheBustList,
};
