// Shapes dist-artifact/ for a claude.ai artifact: the host wraps the page in
// its own <html>, and serves no ".gz" files. Prints the file list to publish.
import { readFileSync, writeFileSync, renameSync, rmSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dir = new URL("../dist-artifact/", import.meta.url).pathname;
const html = readFileSync(join(dir, "index.html"), "utf8");
const head = html.match(/<head>([\s\S]*)<\/head>/)[1]
  .replace(/\s*<(meta charset|meta name="viewport"|link rel="icon"|meta name="theme-color")[^>]*>/g, "")
  .replace(/\s*<title>[^<]*<\/title>/, "");
writeFileSync(join(dir, "splitto.html"), `<title>Splitto</title>\n${head.trim()}\n<div id="root"></div>\n`);

renameSync(join(dir, "ocr/lang/eng.traineddata.gz"), join(dir, "ocr/lang/eng.traineddata.gz.wasm"));
for (const f of ["PWA", "index.html", "Splitto_logo2.jpeg", "SplittoLogo.png", "vite.svg"]) rmSync(join(dir, f), { recursive: true, force: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [relative(dir, join(d, f))]));
console.log(JSON.stringify(walk(dir).filter((f) => f !== "splitto.html").sort().map((path) => ({ path }))));
