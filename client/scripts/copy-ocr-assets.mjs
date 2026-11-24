// Copies Tesseract's worker, WASM core and English model into public/ocr so
// the app never fetches them from a third-party CDN (privacy, offline PWA,
// and no surprise breakage if the CDN changes). Runs before dev and build.
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "ocr");
mkdirSync(join(out, "core"), { recursive: true });
mkdirSync(join(out, "lang"), { recursive: true });

const pkgDir = (name) => dirname(require.resolve(`${name}/package.json`));
const copies = [
  [join(pkgDir("tesseract.js"), "dist", "worker.min.js"), join(out, "worker.min.js")],
  ...["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js", "tesseract-core-relaxedsimd-lstm.wasm.js"].map(
    (f) => [join(pkgDir("tesseract.js-core"), f), join(out, "core", f)]
  ),
  [join(pkgDir("@tesseract.js-data/eng"), "4.0.0_best_int", "eng.traineddata.gz"), join(out, "lang", "eng.traineddata.gz")],
];
for (const [from, to] of copies) {
  if (!existsSync(from)) throw new Error(`OCR asset missing: ${from}`);
  cpSync(from, to);
}
console.log(`OCR assets copied to ${out}`);
