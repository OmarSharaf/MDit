// Tauri FS bridge — wraps @tauri-apps/plugin-fs and dialog
// Falls back to File System Access API in browser dev mode

import {
  isBrowserPath,
  browserFolderPickerSupported,
  browserOpenFolder,
  browserReadDir,
  browserReadTextFile,
  browserWriteTextFile,
  browserSearchInDirectory,
  browserRootAvailable,
  browserWorkspaceDisplayName,
  browserReconnectFolder,
  restoreBrowserRoots,
} from "./browserWorkspace";

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function isTauriApp(): boolean {
  return isTauri();
}

export {
  browserFolderPickerSupported,
  isBrowserPath,
  browserRootAvailable,
  browserWorkspaceDisplayName,
  browserReconnectFolder,
  restoreBrowserRoots,
};

export interface OpenedFile {
  name: string;
  path: string;
  content: string;
}

export async function openFileDialog(): Promise<OpenedFile | null> {
  if (!isTauri()) {
    return browserOpenFile();
  }
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { readTextFile } = await import("@tauri-apps/plugin-fs");

    const selected = await open({
      multiple: false,
      filters: [
        { name: "Markdown", extensions: ["md", "markdown", "mdx"] },
        { name: "Text", extensions: ["txt"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (!selected || typeof selected !== "string") return null;
    const content = await readTextFile(selected);
    const name = selected.split(/[\\/]/).pop() ?? "file.md";
    return { name, path: selected, content };
  } catch (e) {
    console.error("openFileDialog error", e);
    return null;
  }
}

export async function openFolderDialog(): Promise<string | null> {
  if (!isTauri()) {
    if (!browserFolderPickerSupported()) return null;
    return browserOpenFolder();
  }
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, multiple: false });
    return typeof selected === "string" ? selected : null;
  } catch {
    return null;
  }
}

export async function readDir(
  dirPath: string
): Promise<{ name: string; path: string; isDir: boolean }[]> {
  if (isBrowserPath(dirPath)) return browserReadDir(dirPath);
  if (!isTauri()) return [];
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const entries = await invoke<{ name: string; path: string; is_dir: boolean }[]>(
      "list_dir",
      { path: dirPath }
    );
    return entries.map((e) => ({
      name: e.name,
      path: e.path,
      isDir: e.is_dir,
    }));
  } catch {
    return [];
  }
}

export async function listWorkspaceEntries(dirPath: string) {
  const entries = await readDir(dirPath);
  return entries.filter(
    (e) => e.isDir || /\.(md|markdown|txt)$/i.test(e.name)
  );
}

export async function readTextFilePath(path: string): Promise<string | null> {
  if (isBrowserPath(path)) return browserReadTextFile(path);
  if (!isTauri()) return null;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<string>("read_file", { path });
  } catch {
    try {
      const { readTextFile } = await import("@tauri-apps/plugin-fs");
      return await readTextFile(path);
    } catch {
      return null;
    }
  }
}

export async function readFileMeta(
  path: string
): Promise<{ modified: number; isDir: boolean } | null> {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const info = await invoke<{ modified: number; is_dir: boolean }>("file_info", { path });
    return { modified: info.modified, isDir: info.is_dir };
  } catch {
    return null;
  }
}

export async function writeTextFile(path: string, content: string): Promise<void> {
  if (isBrowserPath(path)) {
    await browserWriteTextFile(path, content);
    return;
  }
  if (!isTauri()) {
    browserSaveFile(content, path.split(/[\\/]/).pop() ?? "untitled.md");
    return;
  }
  const { writeTextFile: tauriWrite } = await import("@tauri-apps/plugin-fs");
  await tauriWrite(path, content);
}

export async function saveFileDialog(
  content: string,
  defaultName = "untitled.md",
  existingPath?: string | null
): Promise<string | null> {
  if (!isTauri()) {
    browserSaveFile(content, defaultName);
    return defaultName;
  }
  try {
    if (existingPath) {
      await writeTextFile(existingPath, content);
      return existingPath;
    }

    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({
      defaultPath: defaultName,
      filters: [
        { name: "Markdown", extensions: ["md", "markdown"] },
        { name: "Text", extensions: ["txt"] },
      ],
    });
    if (!path) return null;
    await writeTextFile(path, content);
    return path;
  } catch (e) {
    console.error("saveFileDialog error", e);
    throw e;
  }
}

export async function saveFileAs(
  content: string,
  defaultName = "untitled.md"
): Promise<string | null> {
  if (!isTauri()) {
    browserSaveFile(content, defaultName);
    return defaultName;
  }
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({
      defaultPath: defaultName,
      filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
    });
    if (!path) return null;
    await writeTextFile(path, content);
    return path;
  } catch (e) {
    console.error("saveFileAs error", e);
    throw e;
  }
}

export async function saveExportFile(
  content: string,
  defaultName: string,
  filters: { name: string; extensions: string[] }[]
): Promise<string | null> {
  if (!isTauri()) {
    browserSaveFile(content, defaultName);
    return defaultName;
  }
  try {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const path = await save({ defaultPath: defaultName, filters });
    if (!path) return null;
    await writeTextFile(path, content);
    return path;
  } catch (e) {
    console.error("saveExportFile error", e);
    throw e;
  }
}

export async function createDir(dirPath: string): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("create_dir", { path: dirPath });
}

export async function deletePath(targetPath: string): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("delete_path", { path: targetPath });
}

export async function renamePath(from: string, to: string): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("rename_path", { from, to });
}

export async function copyFile(from: string, to: string): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("copy_file", { from, to });
}

export async function writeBinaryFile(path: string, contents: Uint8Array): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("write_binary_file", { path, contents: Array.from(contents) });
}

export async function revealInExplorer(path: string): Promise<void> {
  if (!isTauri()) return;
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("reveal_in_explorer", { path });
}

export async function searchInDirectory(
  root: string,
  query: string,
  extensions: string[] = ["md", "markdown", "txt", "mdx"]
): Promise<{ path: string; name: string; line: number; column: number; excerpt: string }[]> {
  if (!query.trim()) return [];
  if (isBrowserPath(root)) return browserSearchInDirectory(root, query);
  if (!isTauri()) return [];
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke("search_in_directory", { root, query, extensions });
}

export async function watchFileMtime(
  path: string,
  lastMtime: number
): Promise<{ modified: number; changed: boolean } | null> {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke("watch_file_mtime", { path, lastMtime });
  } catch {
    return null;
  }
}

export async function reloadWorkspaceEntries(workspacePath: string) {
  const entries = await listWorkspaceEntries(workspacePath);
  return entries;
}

// --- Browser fallbacks ---
function browserOpenFile(): Promise<OpenedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown,.mdx,.txt";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const content = await file.text();
      resolve({ name: file.name, path: file.name, content });
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

function browserSaveFile(content: string, name: string) {
  const type = name.endsWith(".html")
    ? "text/html"
    : name.endsWith(".txt")
      ? "text/plain"
      : "text/markdown";
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
