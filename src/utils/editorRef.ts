import { EditorView } from "@codemirror/view";
import type { FormatResult } from "./markdown";

let editorView: EditorView | null = null;

export function setEditorView(view: EditorView | null) {
  editorView = view;
}

export function getEditorView() {
  return editorView;
}

export function applyEditorFormat(
  fn: (value: string, start: number, end: number) => FormatResult
) {
  const view = editorView;
  if (!view) return null;

  const { from, to } = view.state.selection.main;
  const value = view.state.doc.toString();
  const result = fn(value, from, to);

  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: result.value },
    selection: { anchor: result.selectionStart, head: result.selectionEnd },
  });

  view.focus();
  return result.value;
}

export function scrollEditorToLine(line: number, options?: { focus?: boolean; select?: boolean }) {
  scrollEditorToRange(line, line, options);
}

export function scrollEditorToRange(
  fromLine: number,
  toLine: number,
  options?: { focus?: boolean; select?: boolean }
) {
  const view = editorView;
  if (!view) return;
  const doc = view.state.doc;
  const startLine = Math.max(1, Math.min(fromLine, toLine));
  const endLine = Math.max(1, Math.max(fromLine, toLine));
  const endLineClamped = Math.min(endLine, doc.lines);
  const lineInfoFrom = doc.line(startLine);
  const lineInfoTo = doc.line(endLineClamped);
  const anchor = lineInfoFrom.from;
  const head = options?.select === false ? anchor : lineInfoTo.to;
  view.dispatch({
    selection: { anchor, head },
    effects: EditorView.scrollIntoView(anchor, { y: "center" }),
  });
  if (options?.focus !== false) view.focus();
}
