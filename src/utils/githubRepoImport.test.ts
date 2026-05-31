import { describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { GitHubRepoImportError, importGitHubRepoAsZip, isGitHubRepoUrl } from "./githubRepoImport";

describe("githubRepoImport", () => {
  it("detects repo urls", () => {
    expect(isGitHubRepoUrl("https://github.com/user/repo")).toBe(true);
    expect(isGitHubRepoUrl("https://github.com/user/repo/blob/main/a.md")).toBe(false);
    expect(isGitHubRepoUrl("bad")).toBe(false);
  });

  it("rejects invalid repo url", async () => {
    await expect(importGitHubRepoAsZip("https://github.com/user")).rejects.toThrow(
      GitHubRepoImportError
    );
  });

  it("imports markdown from zip", async () => {
    const zip = new JSZip();
    zip.file("repo-main/readme.md", "# Hi");
    const buffer = await zip.generateAsync({ type: "arraybuffer" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, arrayBuffer: () => Promise.resolve(buffer) })
    );
    const progress = vi.fn();
    const r = await importGitHubRepoAsZip("https://github.com/user/repo", progress);
    expect(r.files[0].content).toContain("Hi");
    expect(progress).toHaveBeenCalled();
  });

  it("handles download failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(importGitHubRepoAsZip("https://github.com/user/repo")).rejects.toThrow(/not found/);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(importGitHubRepoAsZip("https://github.com/user/repo")).rejects.toThrow(/Could not download/);
  });

  it("errors when zip has no markdown", async () => {
    const zip = new JSZip();
    zip.file("repo-main/app.js", "console.log(1)");
    const buffer = await zip.generateAsync({ type: "arraybuffer" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, arrayBuffer: () => Promise.resolve(buffer) })
    );
    await expect(importGitHubRepoAsZip("https://github.com/user/repo")).rejects.toThrow(/No markdown/);
  });
});
