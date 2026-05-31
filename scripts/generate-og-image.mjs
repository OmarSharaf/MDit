/**
 * Renders public/og-image.png from og-image.svg (needs sharp).
 * Run: npm run icons:og
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public", "og-image.svg");
const outPath = join(root, "public", "og-image.png");

if (!existsSync(svgPath)) {
  console.error("Missing public/og-image.svg");
  process.exit(1);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("Install sharp: npm install -D sharp");
  process.exit(1);
}

const svg = readFileSync(svgPath);
await sharp(svg).resize(1200, 630).png().toFile(outPath);
console.log("→ public/og-image.png");
