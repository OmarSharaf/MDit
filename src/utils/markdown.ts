// Formatting helpers for the editor toolbar

export interface FormatResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string
): FormatResult {
  const selected = value.substring(start, end) || "text";
  const wrapped = before + selected + after;
  const newValue = value.substring(0, start) + wrapped + value.substring(end);
  return {
    value: newValue,
    selectionStart: start + before.length,
    selectionEnd: start + before.length + selected.length,
  };
}

export function insertAtLine(
  value: string,
  cursorPos: number,
  prefix: string
): FormatResult {
  const lineStart = value.lastIndexOf("\n", cursorPos - 1) + 1;
  const lineEnd = value.indexOf("\n", cursorPos);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const line = value.substring(lineStart, end);

  // Toggle: if line already starts with prefix, remove it
  if (line.startsWith(prefix)) {
    const newLine = line.substring(prefix.length);
    const newValue = value.substring(0, lineStart) + newLine + value.substring(end);
    return {
      value: newValue,
      selectionStart: Math.max(lineStart, cursorPos - prefix.length),
      selectionEnd: Math.max(lineStart, cursorPos - prefix.length),
    };
  }

  const newLine = prefix + line;
  const newValue = value.substring(0, lineStart) + newLine + value.substring(end);
  return {
    value: newValue,
    selectionStart: cursorPos + prefix.length,
    selectionEnd: cursorPos + prefix.length,
  };
}

export function insertSnippet(
  value: string,
  cursorPos: number,
  snippet: string,
  cursorOffset?: number
): FormatResult {
  const newValue = value.substring(0, cursorPos) + snippet + value.substring(cursorPos);
  const pos = cursorPos + (cursorOffset ?? snippet.length);
  return { value: newValue, selectionStart: pos, selectionEnd: pos };
}

export const SNIPPETS = {
  link: "[link text](https://)",
  image: "![alt text](image-url)",
  table: `
| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
`.trimStart(),
  codeBlock: "```\n\n```",
  taskList: "- [ ] Task 1\n- [ ] Task 2\n- [x] Completed task",
  hr: "\n---\n",
  footnote: "[^1]\n\n[^1]: Footnote text",
  details: "<details>\n<summary>Click to expand</summary>\n\nContent here\n\n</details>",
};

export function getWordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function getReadingTime(text: string): string {
  const words = getWordCount(text);
  const minutes = Math.ceil(words / 200);
  return minutes === 1 ? "1 min read" : `${minutes} min read`;
}

export function searchText(
  content: string,
  query: string,
  caseSensitive: boolean,
  useRegex: boolean
): number[] {
  if (!query) return [];
  try {
    const flags = caseSensitive ? "g" : "gi";
    const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(pattern, flags);
    const matches: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      matches.push(m.index);
      if (matches.length > 1000) break; // safety
    }
    return matches;
  } catch {
    return [];
  }
}

export function replaceTextAll(
  content: string,
  query: string,
  replacement: string,
  caseSensitive: boolean,
  useRegex: boolean
): string {
  if (!query) return content;
  try {
    const flags = caseSensitive ? "g" : "gi";
    const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return content.replace(new RegExp(pattern, flags), replacement);
  } catch {
    return content;
  }
}

export function replaceTextOne(
  content: string,
  query: string,
  replacement: string,
  matchIndex: number,
  caseSensitive: boolean,
  useRegex: boolean
): string {
  if (!query) return content;
  const matches = searchText(content, query, caseSensitive, useRegex);
  if (!matches.length || matchIndex >= matches.length) return content;
  const pos = matches[matchIndex];
  const len = useRegex
    ? (new RegExp(caseSensitive ? query : query, caseSensitive ? "" : "i").exec(content.substring(pos)) ?? [""])[0].length
    : query.length;
  return content.substring(0, pos) + replacement + content.substring(pos + len);
}
