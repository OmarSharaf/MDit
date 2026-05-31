import { describe, expect, it } from "vitest";
import { APP_DOWNLOAD_LINKS, isDownloadLinkReady } from "./downloads";

describe("downloads", () => {
  it("lists download placeholders", () => {
    expect(APP_DOWNLOAD_LINKS).toHaveLength(2);
    expect(APP_DOWNLOAD_LINKS[0].id).toBe("exe");
  });

  it("isDownloadLinkReady validates urls", () => {
    expect(isDownloadLinkReady("")).toBe(false);
    expect(isDownloadLinkReady("  ")).toBe(false);
    expect(isDownloadLinkReady("#")).toBe(false);
    expect(isDownloadLinkReady("https://example.com/app.exe")).toBe(true);
  });

  it("ships release download urls", () => {
    const exe = APP_DOWNLOAD_LINKS.find((l) => l.id === "exe");
    const msi = APP_DOWNLOAD_LINKS.find((l) => l.id === "msi");
    expect(isDownloadLinkReady(exe!.url)).toBe(true);
    expect(isDownloadLinkReady(msi!.url)).toBe(true);
    expect(exe!.url).toContain("/v1.0.0/");
    expect(msi!.url).toContain(".msi");
  });
});
