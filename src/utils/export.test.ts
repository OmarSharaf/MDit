import { describe, expect, it, vi } from "vitest";
import {
  buildExportHtml,
  copyHtmlToClipboard,
  copyMarkdownToClipboard,
  defaultExportName,
  getPreviewBodyHtml,
  markdownToPlainText,
  printHtml,
} from "./export";

describe("export", () => {
  it("markdownToPlainText strips markup", () => {
    const plain = markdownToPlainText("# Title\n\n**bold** [link](u)");
    expect(plain).toContain("Title");
    expect(plain).not.toContain("**");
  });

  it("buildExportHtml escapes title and supports dark theme", () => {
    const html = buildExportHtml("<script>", "<p>x</p>", "light");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<p>x</p>");
    const dark = buildExportHtml("Doc", "<p>x</p>", "dark");
    expect(dark).toContain("#0b0d11");
  });

  it("defaultExportName", () => {
    expect(defaultExportName("readme.md", "html")).toBe("readme.html");
    expect(defaultExportName("", "txt")).toBe("document.txt");
  });

  it("getPreviewBodyHtml reads preview element", () => {
    const el = document.createElement("div");
    el.setAttribute("data-mdit-preview", "");
    el.innerHTML = "<p>Hi</p>";
    document.body.appendChild(el);
    expect(getPreviewBodyHtml()).toBe("<p>Hi</p>");
    el.remove();
    expect(getPreviewBodyHtml()).toBe("");
  });

  it("copy and print helpers", async () => {
    const writeText = vi.fn();
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
        write,
      },
    });
    vi.stubGlobal("ClipboardItem", class {
      constructor(public items: Record<string, Blob>) {}
    });

    await copyMarkdownToClipboard("md");
    expect(writeText).toHaveBeenCalledWith("md");

    await copyHtmlToClipboard("<b>x</b>");
    expect(write).toHaveBeenCalled();

    const open = vi.fn(() => ({
      document: { write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      print: vi.fn(),
    }));
    vi.stubGlobal("window", { ...window, open });
    printHtml("<html></html>");
    expect(open).toHaveBeenCalled();

    vi.stubGlobal("window", { ...window, open: vi.fn(() => null) });
    printHtml("<html></html>");
  });
});
