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
  "manifest.json": "manifest.json",
  /* Main */
  documentation: "docs.html",
  questions: "faq.html",
  s: "pages/frame.html",
  browsing: "pages/surf.html",
  credits: "pages/nav/credits.html",
  bookmarklets: "pages/nav/bookmarklets.html",
  terms: "pages/nav/terms.html",
  /* Games */
  games: "pages/nav/gtools.html",
  "web-games": "pages/nav/games5.html",
  emulators: "pages/nav/emulators.html",
  "flash-games": "pages/nav/flash.html",
  "retro-games": "pages/nav/emulibrary.html",
  /* Proxies */
  ultraviolet: "pages/proxnav/ultraviolet.html",
  rammerhead: "pages/proxnav/rammerhead.html",
  /* Proxy Presets */
  youtube: "pages/proxnav/preset/youtube.html",
  apps: "pages/proxnav/preset/applications.html",
  /* Misc */
  flash: "archive/gfiles/flash/index.html",
  webretro: "archive/gfiles/rarch/index.html",
  vos: "archive/vibeOS/index.html",
};

const cookingInserts = insert.content,
vegetables = insert.keywords,
charRandom = insert.chars,
splashRandom = insert.splash,
VersionValue = insert.version,
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
  VersionValue,
  cacheBustList,
};
