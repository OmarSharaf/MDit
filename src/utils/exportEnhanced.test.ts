import { describe, expect, it } from "vitest";
import {
  buildDocxHtml,
  buildSelfContainedHtml,
  exportAsDocxBlob,
  exportAsOdtBlob,
  markdownToPlainText,
} from "./exportEnhanced";

describe("exportEnhanced", () => {
  it("buildSelfContainedHtml includes theme and custom css", () => {
    const html = buildSelfContainedHtml("T", "<p>Body</p>", "dark", ".x{}");
    expect(html).toContain("#0b0d11");
    expect(html).toContain(".x{}");
  });

  it("buildDocxHtml and blobs", () => {
    expect(buildDocxHtml("T", "<p>B</p>")).toContain("word");
    expect(exportAsDocxBlob("T", "<p>B</p>").type).toContain("ms-word");
    expect(exportAsOdtBlob("T", "plain").type).toContain("opendocument");
    expect(markdownToPlainText("**x**")).toBe("x");
  });
});
