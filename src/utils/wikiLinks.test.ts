import { describe, expect, it } from "vitest";
import {
  parseWikiLinkHref,
  preprocessWikiLinks,
  resolveWikiLink,
  wikiLinkToMarkdownPath,
} from "./wikiLinks";

describe("wikiLinks", () => {
  it("resolveWikiLink builds candidate paths", () => {
    expect(resolveWikiLink("page", null, "/ws")).toBe("/ws/page.md");
    expect(resolveWikiLink("https://x.com", null, "/ws")).toBeNull();
    expect(resolveWikiLink("", null, "/ws")).toBeNull();
    expect(resolveWikiLink("guide", "C:\\proj\\doc.md", null)).toContain("guide.md");
  });

  it("parseWikiLinkHref and preprocessWikiLinks", () => {
    expect(parseWikiLinkHref("wiki:hello")).toBe("hello");
    expect(parseWikiLinkHref("[[target]]")).toBe("target");
    expect(parseWikiLinkHref("http://x")).toBeNull();
    expect(parseWikiLinkHref("plain")).toBeNull();
    const out = preprocessWikiLinks("See [[page|Label]] and [[solo]]");
    expect(out).toContain("[Label](wiki:");
    expect(out).toContain("[solo](wiki:");
  });

  it("wikiLinkToMarkdownPath", () => {
    expect(wikiLinkToMarkdownPath("readme", "/root")).toBe("/root/readme.md");
    expect(wikiLinkToMarkdownPath("readme.md", null)).toBe("readme.md");
  });
});
