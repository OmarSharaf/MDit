import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  BROWSER_PATH_PREFIX,
  browserFolderPickerSupported,
  browserOpenFolder,
  browserReadDir,
  browserReadTextFile,
  browserReconnectFolder,
  browserRootAvailable,
  browserSearchInDirectory,
  browserWorkspaceDisplayName,
  browserWriteTextFile,
  isBrowserPath,
  restoreBrowserRoots,
} from "./browserWorkspace";

function mockDir(entries: Record<string, "file" | "dir">, name = "Project") {
  return {
    name,
    kind: "directory" as const,
    queryPermission: vi.fn().mockResolvedValue("granted"),
    requestPermission: vi.fn().mockResolvedValue("granted"),
    entries: async function* () {
      for (const [entryName, kind] of Object.entries(entries)) {
        yield [
          entryName,
          {
            kind: kind === "dir" ? "directory" : "file",
            name: entryName,
            getFile: async () => new File(["# md"], entryName),
          },
        ] as const;
      }
    },
    getDirectoryHandle: vi.fn(async (entryName: string) => {
      if (!entries[entryName] || entries[entryName] !== "dir") throw new Error("missing");
      return mockDir({});
    }),
    getFileHandle: vi.fn(async (entryName: string, opts?: { create?: boolean }) => {
      if (!entries[entryName] && !opts?.create) throw new Error("missing");
      return {
        getFile: async () => new File(["file content\nsearchme"], entryName),
        createWritable: async () => {
          let data = "";
          return {
            write: async (chunk: string) => {
              data = chunk;
            },
            close: async () => data,
          };
        },
      };
    }),
  } as unknown as FileSystemDirectoryHandle;
}

describe("browserWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal("showDirectoryPicker", vi.fn());
    vi.stubGlobal("crypto", { randomUUID: () => "root-id-1" });
  });

  it("detects browser paths", () => {
    expect(isBrowserPath(`${BROWSER_PATH_PREFIX}id`)).toBe(true);
    expect(isBrowserPath("/normal")).toBe(false);
    expect(browserFolderPickerSupported()).toBe(true);
  });

  it("opens folder and reads directory", async () => {
    const handle = mockDir({ "readme.md": "file", docs: "dir" });
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(handle);
    const root = await browserOpenFolder();
    expect(root).toBe(`${BROWSER_PATH_PREFIX}root-id-1`);
    expect(browserRootAvailable(root!)).toBe(true);
    expect(browserWorkspaceDisplayName(root!)).toBe("Project");
    const entries = await browserReadDir(root!);
    expect(entries.some((e) => e.name === "readme.md")).toBe(true);
    expect(entries.some((e) => e.isDir && e.name === "docs")).toBe(true);
  });

  it("reads and writes text files", async () => {
    const handle = mockDir({ "note.md": "file" });
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(handle);
    const root = await browserOpenFolder();
    const filePath = `${root}/note.md`;
    expect(await browserReadTextFile(filePath)).toBeTruthy();
    await browserWriteTextFile(filePath, "updated");
  });

  it("searches in directory", async () => {
    const handle = mockDir({ "a.md": "file" });
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(handle);
    const root = await browserOpenFolder();
    const hits = await browserSearchInDirectory(root!, "searchme");
    expect(hits.length).toBeGreaterThan(0);
    expect(await browserSearchInDirectory(root!, "   ")).toEqual([]);
    expect(await browserSearchInDirectory("/not-browser", "x")).toEqual([]);
  });

  it("returns empty when root missing", async () => {
    expect(await browserReadDir(`${BROWSER_PATH_PREFIX}missing`)).toEqual([]);
    expect(await browserReadTextFile(`${BROWSER_PATH_PREFIX}missing/x.md`)).toBeNull();
    expect(await browserReadTextFile(`${BROWSER_PATH_PREFIX}root-id-1`)).toBeNull();
  });

  it("handles open folder abort and permission denial", async () => {
    vi.mocked(window.showDirectoryPicker).mockRejectedValue(new DOMException("aborted", "AbortError"));
    expect(await browserOpenFolder()).toBeNull();

    const denied = mockDir({});
    vi.mocked(denied.queryPermission).mockResolvedValue("prompt");
    vi.mocked(denied.requestPermission).mockResolvedValue("denied");
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(denied);
    expect(await browserOpenFolder()).toBeNull();
  });

  it("handles open folder generic errors", async () => {
    vi.mocked(window.showDirectoryPicker).mockRejectedValue(new Error("boom"));
    expect(await browserOpenFolder()).toBeNull();
  });

  it("reconnects folder for existing browser path", async () => {
    const handle = mockDir({ "a.md": "file" });
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(handle);
    const root = await browserOpenFolder();
    expect(await browserReconnectFolder(root!)).toBe(true);
    expect(await browserReconnectFolder("/not-browser")).toBe(false);
  });

  it("reconnect handles abort and errors", async () => {
    const root = `${BROWSER_PATH_PREFIX}root-id-1`;
    vi.mocked(window.showDirectoryPicker).mockRejectedValue(new DOMException("aborted", "AbortError"));
    expect(await browserReconnectFolder(root)).toBe(false);

    vi.mocked(window.showDirectoryPicker).mockRejectedValue(new Error("fail"));
    expect(await browserReconnectFolder(root)).toBe(false);
  });

  it("write rejects invalid paths", async () => {
    await expect(browserWriteTextFile(`${BROWSER_PATH_PREFIX}only-root`, "x")).rejects.toThrow(/Invalid/);
    await expect(browserWriteTextFile(`${BROWSER_PATH_PREFIX}missing/a.md`, "x")).rejects.toThrow(/not available/);
  });

  it("restoreBrowserRoots resolves when picker unsupported", async () => {
    vi.stubGlobal("showDirectoryPicker", undefined);
    await expect(restoreBrowserRoots()).resolves.toBeUndefined();
  });

  it("restoreBrowserRoots loads persisted handles", async () => {
    const handle = mockDir({ "saved.md": "file" });
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(handle);
    await browserOpenFolder();
    await restoreBrowserRoots();
    const root = `${BROWSER_PATH_PREFIX}root-id-1`;
    expect(browserRootAvailable(root)).toBe(true);
  });

  it("readDir skips hidden entries and sorts directories first", async () => {
    const handle = mockDir({ ".hidden": "file", "b.md": "file", sub: "dir", "a.md": "file" });
    vi.mocked(window.showDirectoryPicker).mockResolvedValue(handle);
    const root = await browserOpenFolder();
    const entries = await browserReadDir(root!);
    expect(entries.every((e) => !e.name.startsWith("."))).toBe(true);
    expect(entries[0].isDir).toBe(true);
  });
});
