import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mockDialogOpen = vi.fn();
const mockDialogSave = vi.fn();
const mockReadTextFile = vi.fn();
const mockWriteTextFile = vi.fn();
const mockInvoke = vi.fn();

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: (...args: unknown[]) => mockDialogOpen(...args),
  save: (...args: unknown[]) => mockDialogSave(...args),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: (...args: unknown[]) => mockReadTextFile(...args),
  writeTextFile: (...args: unknown[]) => mockWriteTextFile(...args),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

import * as bw from "./browserWorkspace";
import {
  copyFile,
  createDir,
  deletePath,
  isBrowserPath,
  isTauriApp,
  listWorkspaceEntries,
  openFileDialog,
  openFolderDialog,
  readDir,
  readFileMeta,
  readTextFilePath,
  reloadWorkspaceEntries,
  renamePath,
  revealInExplorer,
  saveExportFile,
  saveFileAs,
  saveFileDialog,
  searchInDirectory,
  watchFileMtime,
  writeBinaryFile,
  writeTextFile,
} from "./fileSystem";

function enableTauri() {
  vi.stubGlobal("__TAURI_INTERNALS__", {});
}

function disableTauri() {
  vi.unstubAllGlobals();
  delete (window as Record<string, unknown>).__TAURI_INTERNALS__;
}

describe("fileSystem browser", () => {
  beforeEach(() => {
    disableTauri();
    vi.clearAllMocks();
    vi.spyOn(bw, "browserOpenFolder").mockResolvedValue(`${bw.BROWSER_PATH_PREFIX}root`);
    vi.spyOn(bw, "browserReadDir").mockResolvedValue([
      { name: "a.md", path: "browser://root/a.md", isDir: false },
      { name: "skip.js", path: "browser://root/skip.js", isDir: false },
    ]);
    vi.spyOn(bw, "browserReadTextFile").mockResolvedValue("# note");
    vi.spyOn(bw, "browserWriteTextFile").mockResolvedValue(undefined);
    vi.spyOn(bw, "browserSearchInDirectory").mockResolvedValue([
      { path: "browser://root/a.md", name: "a.md", line: 1, column: 1, excerpt: "hit" },
    ]);
    vi.spyOn(bw, "browserFolderPickerSupported").mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("detects environment", () => {
    expect(isTauriApp()).toBe(false);
    expect(isBrowserPath("browser://x")).toBe(true);
  });

  it("openFolderDialog uses browser picker", async () => {
    expect(await openFolderDialog()).toBe("browser://root");
  });

  it("openFolderDialog returns null when picker unsupported", async () => {
    vi.mocked(bw.browserFolderPickerSupported).mockReturnValue(false);
    expect(await openFolderDialog()).toBeNull();
  });

  it("openFileDialog reads selected browser file", async () => {
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = createElement(tag);
      if (tag === "input") {
        queueMicrotask(() => {
          Object.defineProperty(el, "files", {
            value: [new File(["# Hello"], "note.md", { type: "text/markdown" })],
          });
          el.dispatchEvent(new Event("change"));
        });
      }
      return el;
    });
    const result = await openFileDialog();
    expect(result).toEqual({ name: "note.md", path: "note.md", content: "# Hello" });
    vi.mocked(document.createElement).mockRestore();
  });

  it("openFileDialog resolves null on cancel", async () => {
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = createElement(tag);
      if (tag === "input") {
        queueMicrotask(() => el.dispatchEvent(new Event("cancel")));
      }
      return el;
    });
    expect(await openFileDialog()).toBeNull();
    vi.mocked(document.createElement).mockRestore();
  });

  it("readDir delegates to browser paths", async () => {
    const entries = await readDir("browser://root");
    expect(entries[0].name).toBe("a.md");
  });

  it("readDir returns empty outside tauri for normal paths", async () => {
    expect(await readDir("/some/path")).toEqual([]);
  });

  it("listWorkspaceEntries filters markdown files", async () => {
    const entries = await listWorkspaceEntries("browser://root");
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("a.md");
  });

  it("readTextFilePath uses browser reader", async () => {
    expect(await readTextFilePath("browser://root/a.md")).toBe("# note");
  });

  it("readTextFilePath returns null outside tauri", async () => {
    expect(await readTextFilePath("/local/file.md")).toBeNull();
  });

  it("writeTextFile uses browser writer", async () => {
    await writeTextFile("browser://root/a.md", "updated");
    expect(bw.browserWriteTextFile).toHaveBeenCalledWith("browser://root/a.md", "updated");
  });

  it("writeTextFile triggers browser download outside tauri", async () => {
    const click = vi.fn();
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") return { click, href: "", download: "" } as unknown as HTMLAnchorElement;
      return createElement(tag);
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    await writeTextFile("/path/readme.html", "<html></html>");
    expect(click).toHaveBeenCalled();
    vi.mocked(document.createElement).mockRestore();
    vi.mocked(URL.revokeObjectURL).mockRestore();
  });

  it("saveFileDialog saves via browser download", async () => {
    const click = vi.fn();
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") return { click, href: "", download: "" } as unknown as HTMLAnchorElement;
      return createElement(tag);
    });
    expect(await saveFileDialog("# md", "out.md")).toBe("out.md");
    vi.mocked(document.createElement).mockRestore();
  });

  it("saveFileAs and saveExportFile use browser download", async () => {
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") return { click: vi.fn(), href: "", download: "" } as unknown as HTMLAnchorElement;
      return document.createElement.bind(document)(tag);
    });
    expect(await saveFileAs("txt", "doc.txt")).toBe("doc.txt");
    expect(await saveExportFile("html", "page.html", [{ name: "HTML", extensions: ["html"] }])).toBe("page.html");
    vi.mocked(document.createElement).mockRestore();
  });

  it("searchInDirectory delegates to browser search", async () => {
    const hits = await searchInDirectory("browser://root", "hello");
    expect(hits).toHaveLength(1);
  });

  it("searchInDirectory returns empty for blank query", async () => {
    expect(await searchInDirectory("browser://root", "  ")).toEqual([]);
  });

  it("searchInDirectory returns empty outside tauri", async () => {
    expect(await searchInDirectory("/ws", "q")).toEqual([]);
  });

  it("desktop-only helpers no-op outside tauri", async () => {
    await createDir("/x");
    await deletePath("/x");
    await renamePath("/a", "/b");
    await copyFile("/a", "/b");
    await writeBinaryFile("/x", new Uint8Array([1]));
    await revealInExplorer("/x");
    expect(await readFileMeta("/x")).toBeNull();
    expect(await watchFileMtime("/x", 0)).toBeNull();
  });

  it("reloadWorkspaceEntries returns filtered list", async () => {
    const entries = await reloadWorkspaceEntries("browser://root");
    expect(entries).toHaveLength(1);
  });
});

describe("fileSystem tauri", () => {
  beforeEach(() => {
    enableTauri();
    vi.clearAllMocks();
  });

  afterEach(() => {
    disableTauri();
  });

  it("openFileDialog reads via tauri dialog", async () => {
    mockDialogOpen.mockResolvedValue("C:\\docs\\note.md");
    mockReadTextFile.mockResolvedValue("# Tauri");
    const result = await openFileDialog();
    expect(result).toEqual({ name: "note.md", path: "C:\\docs\\note.md", content: "# Tauri" });
  });

  it("openFileDialog handles dialog errors", async () => {
    mockDialogOpen.mockRejectedValue(new Error("fail"));
    expect(await openFileDialog()).toBeNull();
  });

  it("openFileDialog returns null for non-string selection", async () => {
    mockDialogOpen.mockResolvedValue(["many"]);
    expect(await openFileDialog()).toBeNull();
  });

  it("openFolderDialog reads directory via tauri", async () => {
    mockDialogOpen.mockResolvedValue("/workspace");
    expect(await openFolderDialog()).toBe("/workspace");
  });

  it("openFolderDialog returns null on failure", async () => {
    mockDialogOpen.mockRejectedValue(new Error("cancel"));
    expect(await openFolderDialog()).toBeNull();
  });

  it("readDir invokes list_dir", async () => {
    mockInvoke.mockResolvedValue([{ name: "a.md", path: "/ws/a.md", is_dir: false }]);
    const entries = await readDir("/ws");
    expect(entries[0].isDir).toBe(false);
  });

  it("readDir returns empty on invoke failure", async () => {
    mockInvoke.mockRejectedValue(new Error("fail"));
    expect(await readDir("/ws")).toEqual([]);
  });

  it("readTextFilePath invokes read_file with fs fallback", async () => {
    mockInvoke.mockResolvedValue("from invoke");
    expect(await readTextFilePath("/a.md")).toBe("from invoke");

    mockInvoke.mockRejectedValueOnce(new Error("fail"));
    mockReadTextFile.mockResolvedValue("from fs");
    expect(await readTextFilePath("/a.md")).toBe("from fs");

    mockInvoke.mockRejectedValueOnce(new Error("fail"));
    mockReadTextFile.mockRejectedValue(new Error("fail"));
    expect(await readTextFilePath("/a.md")).toBeNull();
    mockInvoke.mockReset();
  });

  it("readFileMeta and watchFileMtime invoke tauri commands", async () => {
    mockInvoke.mockResolvedValueOnce({ modified: 123, is_dir: false });
    expect(await readFileMeta("/a.md")).toEqual({ modified: 123, isDir: false });

    mockInvoke.mockResolvedValueOnce({ modified: 456, changed: true });
    expect(await watchFileMtime("/a.md", 123)).toEqual({ modified: 456, changed: true });

    mockInvoke.mockImplementation((cmd: string) => Promise.reject(new Error(`fail:${cmd}`)));
    expect(await readFileMeta("/a.md")).toBeNull();
    expect(await watchFileMtime("/a.md", 0)).toBeNull();
    mockInvoke.mockReset();
  });

  it("writeTextFile uses tauri fs", async () => {
    mockWriteTextFile.mockResolvedValue(undefined);
    await writeTextFile("/out.md", "body");
    expect(mockWriteTextFile).toHaveBeenCalledWith("/out.md", "body");
  });

  it("saveFileDialog writes existing path without dialog", async () => {
    mockWriteTextFile.mockResolvedValue(undefined);
    expect(await saveFileDialog("body", "x.md", "/saved.md")).toBe("/saved.md");
  });

  it("saveFileDialog opens save dialog for new files", async () => {
    mockDialogSave.mockResolvedValue("/new.md");
    mockWriteTextFile.mockResolvedValue(undefined);
    expect(await saveFileDialog("body", "x.md")).toBe("/new.md");
  });

  it("saveFileDialog returns null when save cancelled", async () => {
    mockDialogSave.mockResolvedValue(null);
    expect(await saveFileDialog("body", "x.md")).toBeNull();
  });

  it("saveFileDialog throws on error", async () => {
    mockDialogSave.mockRejectedValue(new Error("fail"));
    await expect(saveFileDialog("body", "x.md")).rejects.toThrow("fail");
  });

  it("saveFileAs saves through dialog", async () => {
    mockDialogSave.mockResolvedValue("/copy.md");
    mockWriteTextFile.mockResolvedValue(undefined);
    expect(await saveFileAs("body", "copy.md")).toBe("/copy.md");
  });

  it("saveFileAs throws on error", async () => {
    mockDialogSave.mockRejectedValue(new Error("fail"));
    await expect(saveFileAs("body")).rejects.toThrow("fail");
  });

  it("saveExportFile saves with custom filters", async () => {
    mockDialogSave.mockResolvedValue("/export.html");
    mockWriteTextFile.mockResolvedValue(undefined);
    const path = await saveExportFile("html", "page.html", [{ name: "HTML", extensions: ["html"] }]);
    expect(path).toBe("/export.html");
  });

  it("saveExportFile throws on error", async () => {
    mockDialogSave.mockRejectedValue(new Error("fail"));
    await expect(saveExportFile("x", "a.html", [])).rejects.toThrow("fail");
  });

  it("mutating file operations invoke tauri", async () => {
    mockInvoke.mockResolvedValue(undefined);
    await createDir("/new");
    await deletePath("/old");
    await renamePath("/a", "/b");
    await copyFile("/a", "/b");
    await writeBinaryFile("/bin", new Uint8Array([1, 2]));
    await revealInExplorer("/a");
    expect(mockInvoke).toHaveBeenCalledWith("create_dir", { path: "/new" });
    expect(mockInvoke).toHaveBeenCalledWith("delete_path", { path: "/old" });
    expect(mockInvoke).toHaveBeenCalledWith("rename_path", { from: "/a", to: "/b" });
    expect(mockInvoke).toHaveBeenCalledWith("copy_file", { from: "/a", to: "/b" });
    expect(mockInvoke).toHaveBeenCalledWith("write_binary_file", { path: "/bin", contents: [1, 2] });
    expect(mockInvoke).toHaveBeenCalledWith("reveal_in_explorer", { path: "/a" });
  });

  it("searchInDirectory invokes tauri search", async () => {
    mockInvoke.mockResolvedValue([{ path: "/a.md", name: "a.md", line: 1, column: 1, excerpt: "x" }]);
    const hits = await searchInDirectory("/ws", "x");
    expect(hits).toHaveLength(1);
  });

  it("isTauriApp returns true in tauri", () => {
    expect(isTauriApp()).toBe(true);
  });
});
