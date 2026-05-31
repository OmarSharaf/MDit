import { readDir, readTextFilePath } from "./fileSystem";

export interface WorkspaceSearchHit {
  path: string;
  name: string;
  line: number;
  column: number;
  excerpt: string;
}

const MD_EXT = /\.(md|markdown|txt|mdx)$/i;

async function collectFiles(root: string, max = 500): Promise<{ path: string; name: string }[]> {
  const out: { path: string; name: string }[] = [];
  const stack = [root];

  while (stack.length && out.length < max) {
    const dir = stack.pop()!;
    const entries = await readDir(dir);
    for (const e of entries) {
      if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "dist") continue;
      if (e.isDir) stack.push(e.path);
      else if (MD_EXT.test(e.name)) out.push({ path: e.path, name: e.name });
    }
  }
  return out;
}

export async function searchWorkspace(
  root: string,
  query: string,
  caseSensitive = false
): Promise<WorkspaceSearchHit[]> {
  const q = query.trim();
  if (!q || !root) return [];

  const files = await collectFiles(root);
  const hits: WorkspaceSearchHit[] = [];
  const needle = caseSensitive ? q : q.toLowerCase();

  for (const file of files) {
    const content = await readTextFilePath(file.path);
    if (content == null) continue;
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hay = caseSensitive ? line : line.toLowerCase();
      const idx = hay.indexOf(needle);
      if (idx === -1) continue;
      hits.push({
        path: file.path,
        name: file.name,
        line: i + 1,
        column: idx + 1,
        excerpt: line.trim().slice(0, 120),
      });
      if (hits.length >= 200) return hits;
    }
  }
  return hits;
}
