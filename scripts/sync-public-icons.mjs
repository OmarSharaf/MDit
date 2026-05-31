/**
 * Copies Tauri bundle icons into public/ for the web app (favicon, PWA, social).
 * Run: npm run icons
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tauriIcons = join(root, "src-tauri", "icons");
const pub = join(root, "public");

const copies = [
  ["icon.ico", "favicon.ico"],
  ["icon.png", "icon-512.png"],
  ["128x128@2x.png", "apple-touch-icon.png"],
  ["128x128.png", "icon-192.png"],
];

if (!existsSync(tauriIcons)) {
  console.error("Missing src-tauri/icons — run from project root.");
  process.exit(1);
}

mkdirSync(pub, { recursive: true });

for (const [from, to] of copies) {
  const src = join(tauriIcons, from);
  const dest = join(pub, to);
  if (!existsSync(src)) {
    console.warn(`skip ${from} (not found)`);
    continue;
  }
  copyFileSync(src, dest);
  console.log(`→ public/${to}`);
}

console.log("Done. For og-image.png run: npm run icons:og");
