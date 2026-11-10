// Assembles the demo site in _site/ for GitHub Pages: site/index.html with the quick-start code
// taken from README.md (so the two never drift apart), the freshly built browser bundle, and
// the standalone page. Run `npm run build` first; the Pages workflow runs both.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const out = new URL("_site/", root);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const readme = read("README.md");
const blocks = [...readme.matchAll(/```(\w+)\n([\s\S]*?)```/g)].map(([, lang, code]) => ({ lang, code: code.trimEnd() }));
const pick = (name, test) => {
  const block = blocks.find(test);
  if (!block) throw new Error(`README.md: quick-start block "${name}" not found`);
  return block.code;
};
const code = {
  install: pick("install", (b) => b.lang === "sh" && b.code === "npm install packing-bingo"),
  component: pick("component", (b) => b.lang === "tsx" && b.code.includes("export function OkinawaPackingBingo")),
  usage: pick("usage", (b) => b.lang === "tsx" && b.code.includes('from "./components/OkinawaPackingBingo"')),
  nextPage: pick("nextPage", (b) => b.lang === "tsx" && b.code.includes("@/components/OkinawaPackingBingo")),
  html: pick("html", (b) => b.lang === "html" && b.code.includes("cdn.jsdelivr.net/npm/packing-bingo")),
};

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let html = read("site/index.html");
for (const [name, value] of Object.entries(code)) {
  const slot = `{{${name}}}`;
  if (!html.includes(slot)) throw new Error(`site/index.html: slot ${slot} not found`);
  html = html.replaceAll(slot, escape(value));
}
const left = html.match(/\{\{\w+\}\}/);
if (left) throw new Error(`site/index.html: unknown slot ${left[0]}`);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(new URL("index.html", out), html);
copyFileSync(new URL("dist/packing-bingo.global.js", root), new URL("packing-bingo.global.js", out));
copyFileSync(new URL("index.html", root), new URL("standalone.html", out));
writeFileSync(new URL(".nojekyll", out), "");
console.log("_site/ written: index.html, packing-bingo.global.js, standalone.html");
