import { readDir, readTextFilePath, writeTextFile, openFolderDialog } from "./fileSystem";
import { buildSelfContainedHtml } from "./exportEnhanced";
import { stripFrontMatter } from "./frontmatter";
import { joinPath } from "./pathUtils";

const MD_EXT = /\.(md|markdown|mdx)$/i;

async function collectMarkdownFiles(root: string): Promise<{ path: string; name: string }[]> {
  const out: { path: string; name: string }[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    const entries = await readDir(dir);
    for (const e of entries) {
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      if (e.isDir) stack.push(e.path);
      else if (MD_EXT.test(e.name)) out.push({ path: e.path, name: e.name });
    }
  }
  return out;
}

function slug(name: string): string {
  return name.replace(/\.(md|markdown|mdx)$/i, "").replace(/[^\w-]+/g, "-").toLowerCase();
}

export async function publishWorkspaceFolder(
  workspaceRoot: string,
  outputDir: string,
  theme: "light" | "dark"
): Promise<number> {
  const files = await collectMarkdownFiles(workspaceRoot);
  let count = 0;
  const links: { title: string; href: string }[] = [];

  for (const file of files) {
    const content = await readTextFilePath(file.path);
    if (content == null) continue;
    const title = file.name.replace(/\.(md|markdown|mdx)$/i, "");
    const body = stripFrontMatter(content);
    const html = buildSelfContainedHtml(title, `<pre>${escapeHtml(body)}</pre>`, theme);
    const outName = `${slug(file.name)}.html`;
    const outPath = joinPath(outputDir, outName)!;
    await writeTextFile(outPath, html);
    links.push({ title, href: outName });
    count++;
  }

  const index = buildIndexHtml(links, theme);
  const indexPath = joinPath(outputDir, "index.html")!;
  await writeTextFile(indexPath, index);
  return count + 1;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildIndexHtml(links: { title: string; href: string }[], theme: "light" | "dark"): string {
  const items = links.map((l) => `<li><a href="${l.href}">${escapeHtml(l.title)}</a></li>`).join("\n");
  return buildSelfContainedHtml(
    "MDit Site",
    `<h1>Documentation</h1><ul>${items}</ul>`,
    theme
  );
}

export async function promptPublishWorkspace(workspaceRoot: string, theme: "light" | "dark") {
  const outputDir = await openFolderDialog();
  if (!outputDir) return null;
  return publishWorkspaceFolder(workspaceRoot, outputDir, theme);
}
