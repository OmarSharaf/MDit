export interface GitHubImportResult {
  name: string;
  content: string;
  sourceUrl: string;
}

export class GitHubImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubImportError";
  }
}

function trimInput(input: string): string {
  return input.trim();
}

export function isGitHubImportUrl(input: string): boolean {
  try {
    const url = new URL(trimInput(input));
    const host = url.hostname.replace(/^www\./, "");
    return (
      host === "github.com" ||
      host === "raw.githubusercontent.com" ||
      host === "gist.github.com" ||
      host === "gist.githubusercontent.com"
    );
  } catch {
    return false;
  }
}

function fileNameFromPath(path: string): string {
  const segment = path.split("/").pop() ?? "document.md";
  return decodeURIComponent(segment);
}

function gistFileSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseGitHubFileUrl(url: URL): { rawUrl: string; fileName: string } | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "raw.githubusercontent.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;
    return {
      rawUrl: url.toString(),
      fileName: fileNameFromPath(parts.slice(3).join("/")),
    };
  }

  const blobMatch = url.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
  if (blobMatch) {
    const [, owner, repo, branch, filePath] = blobMatch;
    return {
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`,
      fileName: fileNameFromPath(filePath),
    };
  }

  return null;
}

function pickGistFile(
  files: Record<string, { content?: string | null; filename?: string }>,
  hash?: string
): [string, { content?: string | null; filename?: string }] {
  const entries = Object.entries(files);
  if (!entries.length) {
    throw new GitHubImportError("This Gist has no files.");
  }

  if (hash?.startsWith("file-")) {
    const slug = hash.slice("file-".length);
    const match = entries.find(([name]) => gistFileSlug(name) === slug);
    if (match) return match;
  }

  const markdown = entries.find(([name]) => /\.(md|markdown|mdx)$/i.test(name));
  if (markdown) return markdown;

  const text = entries.find(([name]) => /\.(txt|text)$/i.test(name));
  if (text) return text;

  return entries[0];
}

async function fetchGist(url: URL): Promise<GitHubImportResult> {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "gist.githubusercontent.com") {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new GitHubImportError(
        res.status === 404
          ? "Gist file not found. Check the URL or file privacy."
          : `Could not fetch Gist (${res.status}).`
      );
    }
    const content = await res.text();
    const fileName = fileNameFromPath(url.pathname) || "gist.md";
    return { name: fileName, content, sourceUrl: url.toString() };
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new GitHubImportError("Invalid Gist URL.");
  }

  const gistId = parts[1];
  const apiUrl = `https://api.github.com/gists/${gistId}`;
  const res = await fetch(apiUrl, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!res.ok) {
    throw new GitHubImportError(
      res.status === 404
        ? "Gist not found. It may be private or the URL is wrong."
        : res.status === 403
          ? "GitHub rate limit reached. Try again in a few minutes."
          : `Could not fetch Gist (${res.status}).`
    );
  }

  const data = (await res.json()) as {
    html_url?: string;
    files?: Record<string, { content?: string | null; filename?: string }>;
  };

  const hash = url.hash ? url.hash.slice(1) : undefined;
  const [fileName, file] = pickGistFile(data.files ?? {}, hash);
  const content = file.content ?? "";

  if (!content.trim()) {
    throw new GitHubImportError("The selected Gist file is empty or truncated.");
  }

  return {
    name: file.filename ?? fileName,
    content,
    sourceUrl: data.html_url ?? url.toString(),
  };
}

async function fetchRawFile(rawUrl: string, fileName: string, sourceUrl: string): Promise<GitHubImportResult> {
  const res = await fetch(rawUrl, { headers: { Accept: "text/plain, text/markdown, */*" } });
  if (!res.ok) {
    throw new GitHubImportError(
      res.status === 404
        ? "File not found. Use a public repo URL or check the branch and path."
        : res.status === 403
          ? "Access denied. Private repos need to be cloned locally first."
          : `Could not fetch file (${res.status}).`
    );
  }

  const content = await res.text();
  if (!content.trim()) {
    throw new GitHubImportError("The file is empty.");
  }

  return { name: fileName, content, sourceUrl };
}

export async function importFromGitHubUrl(input: string): Promise<GitHubImportResult> {
  const trimmed = trimInput(input);
  if (!trimmed) {
    throw new GitHubImportError("Paste a GitHub or Gist URL.");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new GitHubImportError("That does not look like a valid URL.");
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "gist.github.com" || host === "gist.githubusercontent.com") {
    return fetchGist(url);
  }

  if (host === "github.com" || host === "raw.githubusercontent.com") {
    if (url.pathname.includes("/tree/")) {
      throw new GitHubImportError(
        "Folder URLs are not supported. Paste a link to a single file (…/blob/…/file.md)."
      );
    }

    const parsed = parseGitHubFileUrl(url);
    if (!parsed) {
      throw new GitHubImportError(
        "Unsupported GitHub URL. Use a file link like github.com/user/repo/blob/main/README.md."
      );
    }

    return fetchRawFile(parsed.rawUrl, parsed.fileName, trimmed);
  }

  throw new GitHubImportError("Only GitHub and Gist URLs are supported.");
}
