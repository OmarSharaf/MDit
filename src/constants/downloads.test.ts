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
});
