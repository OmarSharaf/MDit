import { describe, expect, it, vi, beforeEach } from "vitest";
import { GitHubImportError, importFromGitHubUrl, isGitHubImportUrl } from "./githubImport";

describe("githubImport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("detects github urls", () => {
    expect(isGitHubImportUrl("https://github.com/u/r/blob/main/a.md")).toBe(true);
    expect(isGitHubImportUrl("https://raw.githubusercontent.com/u/r/main/a.md")).toBe(true);
    expect(isGitHubImportUrl("https://gist.github.com/u/id")).toBe(true);
    expect(isGitHubImportUrl("https://example.com")).toBe(false);
    expect(isGitHubImportUrl("not-a-url")).toBe(false);
  });

  it("rejects empty and invalid urls", async () => {
    await expect(importFromGitHubUrl("")).rejects.toThrow(GitHubImportError);
    await expect(importFromGitHubUrl("not-url")).rejects.toThrow(/valid URL/);
    await expect(importFromGitHubUrl("https://example.com/x")).rejects.toThrow(/Only GitHub/);
  });

  it("rejects tree urls", async () => {
    await expect(
      importFromGitHubUrl("https://github.com/u/r/tree/main/docs")
    ).rejects.toThrow(/Folder URLs/);
  });

  it("rejects unsupported github urls", async () => {
    await expect(importFromGitHubUrl("https://github.com/user")).rejects.toThrow(/Unsupported/);
  });

  it("imports raw github file from blob url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("# Hello"),
      })
    );
    const r = await importFromGitHubUrl("https://github.com/u/r/blob/main/README.md");
    expect(r.content).toContain("Hello");
    expect(r.name).toBe("README.md");
  });

  it("imports raw githubusercontent url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("raw content"),
      })
    );
    const r = await importFromGitHubUrl(
      "https://raw.githubusercontent.com/u/r/main/docs/guide.md"
    );
    expect(r.content).toBe("raw content");
    expect(r.name).toBe("guide.md");
  });

  it("handles fetch errors for files", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(
      importFromGitHubUrl("https://github.com/u/r/blob/main/README.md")
    ).rejects.toThrow(/not found/);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(
      importFromGitHubUrl("https://github.com/u/r/blob/main/README.md")
    ).rejects.toThrow(/Access denied/);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(
      importFromGitHubUrl("https://github.com/u/r/blob/main/README.md")
    ).rejects.toThrow(/Could not fetch file/);
  });

  it("rejects empty file content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("   ") })
    );
    await expect(
      importFromGitHubUrl("https://github.com/u/r/blob/main/README.md")
    ).rejects.toThrow(/empty/);
  });

  it("imports gist raw url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve("gist body"),
      })
    );
    const r = await importFromGitHubUrl("https://gist.githubusercontent.com/u/id/raw/file.md");
    expect(r.content).toBe("gist body");
  });

  it("handles gist raw fetch errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(
      importFromGitHubUrl("https://gist.githubusercontent.com/u/id/raw/file.md")
    ).rejects.toThrow(/not found/);
  });

  it("imports gist via api with markdown file", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            html_url: "https://gist.github.com/x",
            files: { "note.md": { content: "# Gist", filename: "note.md" } },
          }),
      })
    );
    const r = await importFromGitHubUrl("https://gist.github.com/u/abc123");
    expect(r.content).toContain("Gist");
  });

  it("imports gist file selected by hash", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            files: {
              "My Notes.md": { content: "picked", filename: "My Notes.md" },
              "other.txt": { content: "other", filename: "other.txt" },
            },
          }),
      })
    );
    const r = await importFromGitHubUrl("https://gist.github.com/u/abc123#file-my-notes");
    expect(r.content).toBe("picked");
  });

  it("prefers text gist files when no markdown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            files: { "notes.txt": { content: "text file", filename: "notes.txt" } },
          }),
      })
    );
    const r = await importFromGitHubUrl("https://gist.github.com/u/abc123");
    expect(r.content).toBe("text file");
  });

  it("handles gist api errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(importFromGitHubUrl("https://gist.github.com/u/bad")).rejects.toThrow(/not found/);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(importFromGitHubUrl("https://gist.github.com/u/rate")).rejects.toThrow(/rate limit/);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(importFromGitHubUrl("https://gist.github.com/u/err")).rejects.toThrow(/Could not fetch Gist/);
  });

  it("rejects invalid gist url and empty gist files", async () => {
    await expect(importFromGitHubUrl("https://gist.github.com/onlyone")).rejects.toThrow(/Invalid Gist/);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ files: {} }),
      })
    );
    await expect(importFromGitHubUrl("https://gist.github.com/u/abc123")).rejects.toThrow(/no files/);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            files: { "empty.md": { content: "   ", filename: "empty.md" } },
          }),
      })
    );
    await expect(importFromGitHubUrl("https://gist.github.com/u/abc123")).rejects.toThrow(/empty or truncated/);
  });
});
