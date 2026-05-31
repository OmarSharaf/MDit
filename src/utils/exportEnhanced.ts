import { markdownToPlainText } from "./export";

const BASE_STYLES = `
body { font-family: system-ui, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.7; }
img { max-width: 100%; } pre { overflow-x: auto; padding: 16px; border-radius: 8px; }
table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 8px; }
code { font-family: ui-monospace, monospace; }
`;

export function buildSelfContainedHtml(
  title: string,
  bodyHtml: string,
  theme: "light" | "dark",
  customCss = ""
): string {
  const bg = theme === "light" ? "#ffffff" : "#0b0d11";
  const fg = theme === "light" ? "#1a1d2e" : "#eaedf8";
  const preBg = theme === "light" ? "#f4f5f8" : "#181b24";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    ${BASE_STYLES}
    body { background: ${bg}; color: ${fg}; }
    pre { background: ${preBg}; }
    ${customCss}
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

export function buildDocxHtml(title: string, bodyHtml: string): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body>${bodyHtml}</body></html>`;
}

export function exportAsDocxBlob(title: string, bodyHtml: string): Blob {
  const html = buildDocxHtml(title, bodyHtml);
  return new Blob([html], {
    type: "application/vnd.ms-word;charset=utf-8",
  });
}

export function exportAsOdtBlob(title: string, plainText: string): Blob {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0">
  <office:body><office:text>
    <text:h text:outline-level="1">${escapeXml(title)}</text:h>
    <text:p>${escapeXml(plainText)}</text:p>
  </office:text></office:body>
</office:document>`;
  return new Blob([content], { type: "application/vnd.oasis.opendocument.text" });
}

export { markdownToPlainText };

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
