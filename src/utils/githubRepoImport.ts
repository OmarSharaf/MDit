export class GitHubRepoImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubRepoImportError";
  }
}

function parseRepoUrl(input: string): { owner: string; repo: string; branch: string } | null {
  try {
    const url = new URL(input.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const branch = url.searchParams.get("branch") ?? "main";
    return { owner: parts[0], repo: parts[1], branch };
  } catch {
    return null;
  }
}

export async function importGitHubRepoAsZip(
  input: string,
  onProgress?: (msg: string) => void
): Promise<{ name: string; files: { path: string; content: string }[] }> {
  const parsed = parseRepoUrl(input);
  if (!parsed) {
    throw new GitHubRepoImportError("Paste a GitHub repo URL like github.com/user/repo");
  }

  const { owner, repo, branch } = parsed;
  onProgress?.(`Fetching ${owner}/${repo}…`);

  const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  const res = await fetch(zipUrl);
  if (!res.ok) {
    throw new GitHubRepoImportError(
      res.status === 404
        ? "Repo or branch not found. Try ?branch=master"
        : `Could not download repo (${res.status})`
    );
  }

  const buffer = await res.arrayBuffer();
  onProgress?.("Extracting…");

  const files = await extractZipMarkdown(buffer);
  if (!files.length) {
    throw new GitHubRepoImportError("No markdown files found in this repo.");
  }

  return { name: `${repo}.md`, files };
}

async function extractZipMarkdown(buffer: ArrayBuffer): Promise<{ path: string; content: string }[]> {
  const zip = await JSZip.loadAsync(buffer);
  const out: { path: string; content: string }[] = [];

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    if (!/\.(md|markdown|mdx)$/i.test(path)) continue;
    if (path.includes("node_modules/")) continue;
    const content = await entry.async("string");
    const shortPath = path.split("/").slice(1).join("/") || path;
    out.push({ path: shortPath, content });
  }

  return out.sort((a, b) => a.path.localeCompare(b.path));
}

import JSZip from "jszip";

export function isGitHubRepoUrl(input: string): boolean {
  try {
    const url = new URL(input.trim());
    return url.hostname.replace(/^www\./, "") === "github.com" && !url.pathname.includes("/blob/");
  } catch {
    return false;
  }
}
