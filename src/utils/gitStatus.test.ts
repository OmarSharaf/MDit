import { describe, expect, it, vi } from "vitest";
import { getGitRepoStatus } from "./gitStatus";

describe("gitStatus", () => {
  it("returns error when no repo path", async () => {
    const r = await getGitRepoStatus("");
    expect(r.available).toBe(false);
  });

  it("returns web-only message outside tauri", async () => {
    const r = await getGitRepoStatus("/repo");
    expect(r.error).toContain("desktop");
  });

  it("invokes tauri when available", async () => {
    vi.stubGlobal("__TAURI_INTERNALS__", {});
    vi.doMock("@tauri-apps/api/core", () => ({
      invoke: vi.fn().mockResolvedValue({
        branch: "main",
        clean: true,
        files: [],
        available: true,
      }),
    }));
    const { getGitRepoStatus: getStatus } = await import("./gitStatus");
    const r = await getStatus("/repo");
    expect(r.available).toBe(true);
    vi.unstubAllGlobals();
  });

  it("handles invoke failure in tauri", async () => {
    vi.stubGlobal("__TAURI_INTERNALS__", {});
    vi.doMock("@tauri-apps/api/core", () => ({
      invoke: vi.fn().mockRejectedValue(new Error("fail")),
    }));
    vi.resetModules();
    const { getGitRepoStatus: getStatus } = await import("./gitStatus");
    const r = await getStatus("/repo");
    expect(r.available).toBe(false);
    vi.unstubAllGlobals();
    vi.resetModules();
  });
});
