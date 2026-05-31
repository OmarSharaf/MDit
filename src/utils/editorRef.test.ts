import { describe, expect, it } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import {
  applyEditorFormat,
  getEditorView,
  scrollEditorToLine,
  scrollEditorToRange,
  setEditorView,
} from "./editorRef";
import { wrapSelection } from "./markdown";

describe("editorRef", () => {
  it("applyEditorFormat updates document", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const view = new EditorView({
      state: EditorState.create({ doc: "hello" }),
      parent,
    });
    setEditorView(view);
    expect(getEditorView()).toBe(view);
    view.dispatch({
      selection: { anchor: 0, head: 5 },
    });
    const result = applyEditorFormat((v, s, e) => wrapSelection(v, s, e, "**", "**"));
    expect(result).toContain("**hello**");
    scrollEditorToLine(1);
    scrollEditorToRange(1, 1, { focus: false, select: false });
    setEditorView(null);
    parent.remove();
  });

  it("no-ops without view", () => {
    setEditorView(null);
    expect(applyEditorFormat(wrapSelection)).toBeNull();
    scrollEditorToLine(1);
  });
});
