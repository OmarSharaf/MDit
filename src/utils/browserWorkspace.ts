export const BROWSER_PATH_PREFIX = "browser://";

const DB_NAME = "mdit-workspace";
const DB_VERSION = 1;
const STORE = "roots";

export function isBrowserPath(path: string): boolean {
  return path.startsWith(BROWSER_PATH_PREFIX);
}

export function browserFolderPickerSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

const roots = new Map<string, FileSystemDirectoryHandle>();
const rootLabels = new Map<string, string>();

function parseBrowserPath(path: string): { rootId: string; relative: string } {
  const rest = path.slice(BROWSER_PATH_PREFIX.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return { rootId: rest, relative: "" };
  return { rootId: rest.slice(0, slash), relative: rest.slice(slash + 1) };
}

function joinBrowserPath(rootId: string, relative: string): string {
  return relative
    ? `${BROWSER_PATH_PREFIX}${rootId}/${relative}`
    : `${BROWSER_PATH_PREFIX}${rootId}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function persistRoot(
  rootId: string,
  handle: FileSystemDirectoryHandle,
  label: string
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ handle, label }, rootId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn("persistRoot", err);
  }
}

async function ensurePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    const current = await handle.queryPermission({ mode: "readwrite" });
    if (current === "granted") return true;
    const next = await handle.requestPermission({ mode: "readwrite" });
    return next === "granted";
  } catch {
    return false;
  }
}

let restorePromise: Promise<void> | null = null;

export function restoreBrowserRoots(): Promise<void> {
  if (!browserFolderPickerSupported()) return Promise.resolve();
  if (restorePromise) return restorePromise;

  restorePromise = (async () => {
    try {
      const db = await openDb();
      const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      for (const key of keys) {
        if (typeof key !== "string") continue;
        const record = await new Promise<{ handle: FileSystemDirectoryHandle; label: string } | undefined>(
          (resolve, reject) => {
            const tx = db.transaction(STORE, "readonly");
            const req = tx.objectStore(STORE).get(key);
            req.onsuccess = () => resolve(req.result as { handle: FileSystemDirectoryHandle; label: string });
            req.onerror = () => reject(req.error);
          }
        );
        if (!record?.handle) continue;

        const perm = await record.handle.queryPermission({ mode: "readwrite" });
        if (perm !== "granted") continue;

        roots.set(key, record.handle);
        rootLabels.set(key, record.label || record.handle.name);
      }
      db.close();
    } catch (err) {
      console.warn("restoreBrowserRoots", err);
    }
  })();

  return restorePromise;
}

export function browserRootAvailable(path: string): boolean {
  const { rootId } = parseBrowserPath(path);
  return roots.has(rootId);
}

export function browserWorkspaceDisplayName(path: string): string {
  const { rootId } = parseBrowserPath(path);
  return rootLabels.get(rootId) ?? rootId;
}

async function getDirectoryHandle(
  rootId: string,
  relative = ""
): Promise<FileSystemDirectoryHandle | null> {
  await restoreBrowserRoots();
  const root = roots.get(rootId);
  if (!root) return null;
  if (!relative) return root;

  let dir = root;
  for (const part of relative.split("/").filter(Boolean)) {
    try {
      dir = await dir.getDirectoryHandle(part);
    } catch {
      return null;
    }
  }
  return dir;
}

export async function browserOpenFolder(): Promise<string | null> {
  if (!browserFolderPickerSupported()) return null;
  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    if (!(await ensurePermission(handle))) return null;

    const rootId = crypto.randomUUID();
    roots.set(rootId, handle);
    rootLabels.set(rootId, handle.name);
    await persistRoot(rootId, handle, handle.name);
    return joinBrowserPath(rootId, "");
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null;
    console.error("browserOpenFolder", err);
    return null;
  }
}

export async function browserReconnectFolder(path: string): Promise<boolean> {
  if (!browserFolderPickerSupported() || !isBrowserPath(path)) return false;
  const { rootId } = parseBrowserPath(path);

  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    if (!(await ensurePermission(handle))) return false;

    roots.set(rootId, handle);
    rootLabels.set(rootId, handle.name);
    await persistRoot(rootId, handle, handle.name);
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return false;
    console.error("browserReconnectFolder", err);
    return false;
  }
}

export async function browserReadDir(
  dirPath: string
): Promise<{ name: string; path: string; isDir: boolean }[]> {
  const { rootId, relative } = parseBrowserPath(dirPath);
  const dir = await getDirectoryHandle(rootId, relative);
  if (!dir) return [];

  const entries: { name: string; path: string; isDir: boolean }[] = [];
  for await (const [name, handle] of dir.entries()) {
    if (name.startsWith(".")) continue;
    const entryRelative = relative ? `${relative}/${name}` : name;
    const isDir = handle.kind === "directory";
    if (isDir || /\.(md|markdown|txt|mdx)$/i.test(name)) {
      entries.push({
        name,
        path: joinBrowserPath(rootId, entryRelative),
        isDir,
      });
    }
  }

  entries.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return entries;
}

export async function browserReadTextFile(filePath: string): Promise<string | null> {
  const { rootId, relative } = parseBrowserPath(filePath);
  if (!relative) return null;

  const parts = relative.split("/");
  const fileName = parts.pop()!;
  const dir = await getDirectoryHandle(rootId, parts.join("/"));
  if (!dir) return null;

  try {
    const fileHandle = await dir.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return file.text();
  } catch {
    return null;
  }
}

export async function browserWriteTextFile(filePath: string, content: string): Promise<void> {
  const { rootId, relative } = parseBrowserPath(filePath);
  if (!relative) throw new Error("Invalid browser file path");

  const segments = relative.split("/");
  const fileName = segments.pop()!;
  const parent = await getDirectoryHandle(rootId, segments.join("/"));
  if (!parent) throw new Error("Directory not available");

  const fileHandle = await parent.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function browserSearchInDirectory(
  rootPath: string,
  query: string
): Promise<{ path: string; name: string; line: number; column: number; excerpt: string }[]> {
  const q = query.trim().toLowerCase();
  if (!q || !isBrowserPath(rootPath)) return [];

  const hits: { path: string; name: string; line: number; column: number; excerpt: string }[] = [];
  const stack = [rootPath];

  while (stack.length && hits.length < 200) {
    const dirPath = stack.pop()!;
    const entries = await browserReadDir(dirPath);
    for (const e of entries) {
      if (e.isDir) {
        stack.push(e.path);
        continue;
      }
      const content = await browserReadTextFile(e.path);
      if (content == null) continue;
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const idx = line.toLowerCase().indexOf(q);
        if (idx === -1) continue;
        hits.push({
          path: e.path,
          name: e.name,
          line: i + 1,
          column: idx + 1,
          excerpt: line.trim().slice(0, 120),
        });
        if (hits.length >= 200) break;
      }
    }
  }
  return hits;
}
