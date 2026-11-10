import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");

test("the public page states that this address is not a release", () => {
  assert.match(html, /not a public release/);
  assert.match(html, /https:\/\/rn-selected-work\.vercel\.app/);
  assert.doesNotMatch(html, /Manhattan|Reykjav|source-materials|interview|consent/i);
});
