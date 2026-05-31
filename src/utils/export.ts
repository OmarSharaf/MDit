import { stripFrontMatter } from "./frontmatter";

export function markdownToPlainText(content: string): string {
  let text = stripFrontMatter(content);
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/_(.+?)_/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  return text.trim();
}

export function buildExportHtml(title: string, bodyHtml: string, theme: "light" | "dark"): string {
  const bg = theme === "light" ? "#ffffff" : "#0b0d11";
  const fg = theme === "light" ? "#1a1d2e" : "#eaedf8";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 24px; line-height: 1.7; background: ${bg}; color: ${fg}; }
    img { max-width: 100%; } pre { overflow-x: auto; padding: 16px; border-radius: 8px; background: ${theme === "light" ? "#f4f5f8" : "#181b24"}; }
    table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccc; padding: 8px; }
  </style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function getPreviewBodyHtml(): string {
  const el = document.querySelector("[data-mdit-preview]");
  return el?.innerHTML ?? "";
}

export async function copyHtmlToClipboard(html: string) {
  if (navigator.clipboard && "write" in navigator.clipboard) {
    try {
      const blob = new Blob([html], { type: "text/html" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })]);
      return;
    } catch {
      /* fall through to plain text */
    }
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(html);
  }
}

export function printHtml(html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

export async function copyMarkdownToClipboard(content: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
  }
}

export function defaultExportName(tabName: string, ext: string): string {
  const base = tabName.replace(/\.(md|markdown|txt)$/i, "") || "document";
  return `${base}.${ext}`;
}
