import { describe, expect, it, vi } from "vitest";
import { promptPublishWorkspace, publishWorkspaceFolder } from "./publish";

vi.mock("./fileSystem", () => ({
  readDir: vi.fn(async (dir: string) => {
    if (dir.endsWith("sub")) {
      return [{ name: "nested.md", path: "/ws/sub/nested.md", isDir: false }];
    }
    return [
      { name: "doc.md", path: "/ws/doc.md", isDir: false },
      { name: "skip.txt", path: "/ws/skip.txt", isDir: false },
      { name: ".git", path: "/ws/.git", isDir: true },
      { name: "node_modules", path: "/ws/node_modules", isDir: true },
      { name: "sub", path: "/ws/sub", isDir: true },
    ];
  }),
  readTextFilePath: vi.fn(async (path: string) => {
    if (path.includes("missing")) return null;
    return "---\ntitle: T\n---\n# Body";
  }),
  writeTextFile: vi.fn(async () => undefined),
  openFolderDialog: vi.fn(async () => "/out"),
}));

describe("publish", () => {
  it("publishWorkspaceFolder writes html files and index", async () => {
    const { writeTextFile } = await import("./fileSystem");
    const count = await publishWorkspaceFolder("/ws", "/out", "light");
    expect(count).toBeGreaterThan(1);
    expect(writeTextFile).toHaveBeenCalled();
  });

  it("promptPublishWorkspace uses folder dialog", async () => {
    const count = await promptPublishWorkspace("/ws", "dark");
    expect(count).toBeGreaterThan(0);
  });

  it("promptPublishWorkspace returns null when cancelled", async () => {
    const fs = await import("./fileSystem");
    vi.mocked(fs.openFolderDialog).mockResolvedValueOnce(null);
    expect(await promptPublishWorkspace("/ws", "light")).toBeNull();
  });
});
