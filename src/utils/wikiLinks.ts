import { joinPath, dirnamePath, basenameWithoutExt } from "./pathUtils";

/** Resolve [[wiki-link]] or [[page|label]] to a file path within workspace */
export function resolveWikiLink(
  linkTarget: string,
  currentFilePath: string | null,
  workspaceRoot: string | null
): string | null {
  const target = linkTarget.split("|")[0].trim();
  if (!target) return null;

  if (/^https?:\/\//i.test(target)) return null;

  const root = workspaceRoot ?? (currentFilePath ? dirnamePath(currentFilePath) : null);
  if (!root) return null;

  const base = target.replace(/\.(md|markdown)$/i, "");
  const candidates = [
    `${base}.md`,
    `${base}.markdown`,
    `${base}.mdx`,
    `${base}/README.md`,
    `${base}/index.md`,
  ];

  for (const c of candidates) {
    const full = joinPath(root, c);
    if (full) return full;
  }

  return joinPath(root, `${base}.md`);
}

export function parseWikiLinkHref(href: string): string | null {
  if (href.startsWith("wiki:")) return decodeURIComponent(href.slice(5));
  const m = href.match(/^\[\[(.+?)\]\]$/);
  return m ? m[1] : null;
}

export function wikiLinkToMarkdownPath(link: string, workspaceRoot: string | null): string {
  const name = link.split("|")[0].trim();
  if (workspaceRoot) return joinPath(workspaceRoot, `${name.replace(/\.(md|markdown)$/i, "")}.md`) ?? name;
  return `${basenameWithoutExt(name)}.md`;
}

export function preprocessWikiLinks(body: string): string {
  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, label) => {
    const text = (label || target).trim();
    return `[${text}](wiki:${encodeURIComponent(target.trim())})`;
  });
}
