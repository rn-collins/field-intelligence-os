import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
if (!html.includes("not a public release")) {
  throw new Error("Public page is missing its release boundary.");
}
if (/Manhattan|Reykjav|source-materials|interview|consent/i.test(html)) {
  throw new Error("Public page includes field material.");
}
console.log("public/index.html ready");
