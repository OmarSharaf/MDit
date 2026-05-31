import { describe, expect, it, vi } from "vitest";
import { searchWorkspace } from "./workspaceSearch";

vi.mock("./fileSystem", () => ({
  readDir: vi.fn(async (dir: string) =>
    dir.endsWith("sub")
      ? [{ name: "nested.md", path: "/root/sub/nested.md", isDir: false }]
      : [
          { name: "sub", path: "/root/sub", isDir: true },
          { name: "readme.md", path: "/root/readme.md", isDir: false },
          { name: ".hidden", path: "/root/.hidden", isDir: false },
          { name: "node_modules", path: "/root/node_modules", isDir: true },
        ]
  ),
  readTextFilePath: vi.fn(async (path: string) =>
    path.includes("readme") ? "hello world\nsecond" : "nested content"
  ),
}));

describe("workspaceSearch", () => {
  it("returns empty for blank query", async () => {
    expect(await searchWorkspace("/root", "")).toEqual([]);
    expect(await searchWorkspace("", "q")).toEqual([]);
  });

  it("finds matches case-insensitively", async () => {
    const hits = await searchWorkspace("/root", "HELLO");
    expect(hits.some((h) => h.name === "readme.md")).toBe(true);
  });

  it("supports case sensitive search", async () => {
    const hits = await searchWorkspace("/root", "hello", true);
    expect(hits.length).toBeGreaterThan(0);
  });
});
