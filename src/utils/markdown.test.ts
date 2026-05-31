import { describe, expect, it } from "vitest";
import {
  getReadingTime,
  getWordCount,
  insertAtLine,
  insertSnippet,
  replaceTextAll,
  replaceTextOne,
  searchText,
  wrapSelection,
} from "./markdown";

describe("markdown", () => {
  it("wrapSelection wraps text and defaults empty selection", () => {
    const r = wrapSelection("hello world", 0, 5, "**", "**");
    expect(r.value).toBe("**hello** world");
    const empty = wrapSelection("hello", 2, 2, "*", "*");
    expect(empty.value).toBe("he*text*llo");
  });

  it("insertAtLine toggles prefix", () => {
    const add = insertAtLine("line\n", 0, "# ");
    expect(add.value.startsWith("# line")).toBe(true);
    const remove = insertAtLine(add.value, 2, "# ");
    expect(remove.value.startsWith("line")).toBe(true);
  });

  it("insertSnippet inserts at cursor", () => {
    const r = insertSnippet("ab", 1, "XY", 1);
    expect(r.value).toBe("aXYb");
    expect(r.selectionStart).toBe(2);
  });

  it("word count and reading time", () => {
    expect(getWordCount("one two three")).toBe(3);
    expect(getWordCount("   ")).toBe(0);
    expect(getReadingTime("word ".repeat(200))).toBe("1 min read");
    expect(getReadingTime("word ".repeat(400))).toBe("2 min read");
  });

  it("search and replace", () => {
    const content = "foo bar foo";
    expect(searchText(content, "foo", false, false)).toHaveLength(2);
    expect(searchText(content, "", false, false)).toEqual([]);
    expect(replaceTextAll(content, "foo", "baz", false, false)).toBe("baz bar baz");
    expect(replaceTextOne(content, "foo", "baz", 0, false, false)).toBe("baz bar foo");
    expect(replaceTextOne(content, "", "baz", 0, false, false)).toBe(content);
    expect(replaceTextOne(content, "foo", "baz", 99, false, false)).toBe(content);
    expect(replaceTextOne(content, "foo", "baz", 0, false, true)).toBe("baz bar foo");
    expect(searchText(content, "[bad", false, true)).toEqual([]);
    expect(replaceTextAll(content, "[bad", "x", false, true)).toBe(content);
    expect(replaceTextAll(content, "", "x", false, false)).toBe(content);
  });
});
