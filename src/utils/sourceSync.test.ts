import { describe, expect, it } from "vitest";
import {
  bodyLineToEditorLine,
  editorLineFromPreviewNode,
  editorLineToBodyLine,
  getFrontMatterLineOffset,
  lineFromPreviewClick,
  lineFromPreviewTarget,
  nearestHeadingId,
  rangeFromPreviewSelection,
} from "./sourceSync";

describe("sourceSync", () => {
  const fm = "---\ntitle: x\n---\n# Title\n\nBody";

  it("front matter line offsets", () => {
    expect(getFrontMatterLineOffset("plain")).toBe(0);
    expect(getFrontMatterLineOffset(fm)).toBeGreaterThan(0);
    expect(bodyLineToEditorLine(fm, 1)).toBe(getFrontMatterLineOffset(fm) + 1);
    expect(editorLineToBodyLine(fm, 10)).toBeGreaterThan(0);
  });

  it("preview node mapping", () => {
    expect(editorLineFromPreviewNode(null, fm)).toBeNull();
    const block = document.createElement("p");
    block.setAttribute("data-source-line", "2");
    document.body.appendChild(block);
    const text = document.createTextNode("hello");
    block.appendChild(text);
    expect(editorLineFromPreviewNode(text, fm)).not.toBeNull();
    expect(editorLineFromPreviewNode(block, fm)).not.toBeNull();
    block.remove();
  });

  it("lineFromPreviewClick on heading and block", () => {
    expect(lineFromPreviewClick(null, fm)).toBeNull();
    expect(lineFromPreviewClick(document.createElement("span"), "plain")).toBeNull();

    const h = document.createElement("h2");
    h.id = "title";
    document.body.appendChild(h);
    expect(lineFromPreviewClick(h, fm)).toBe(4);
    h.remove();

    const p = document.createElement("p");
    p.setAttribute("data-source-line", "1");
    expect(lineFromPreviewClick(p, fm)).not.toBeNull();
  });

  it("range and target from preview root", () => {
    const root = document.createElement("div");
    root.setAttribute("data-mdit-preview", "");
    const p = document.createElement("p");
    p.setAttribute("data-source-line", "1");
    p.textContent = "selected text";
    root.appendChild(p);
    document.body.appendChild(root);

    const sel = window.getSelection()!;
    const range = document.createRange();
    range.selectNodeContents(p);
    sel.removeAllRanges();
    sel.addRange(range);
    expect(rangeFromPreviewSelection(root, fm)).not.toBeNull();
    expect(lineFromPreviewTarget(root, fm)).not.toBeNull();

    p.classList.add("syncActive");
    sel.removeAllRanges();
    expect(lineFromPreviewTarget(root, fm)).not.toBeNull();

    root.remove();
    expect(rangeFromPreviewSelection(null, fm)).toBeNull();
    expect(lineFromPreviewTarget(null, fm)).toBeNull();

    const collapsed = document.createElement("div");
    collapsed.setAttribute("data-mdit-preview", "");
    document.body.appendChild(collapsed);
    expect(rangeFromPreviewSelection(collapsed, fm)).toBeNull();
    expect(lineFromPreviewTarget(collapsed, fm)).toBeNull();
    collapsed.remove();
  });

  it("nearestHeadingId", () => {
    expect(nearestHeadingId(fm, 100)).toBe("title");
    expect(nearestHeadingId("plain", 1)).toBeNull();
  });
});
