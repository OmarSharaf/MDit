import { describe, expect, it } from "vitest";
import { BUILT_IN_DOCS, isBuiltInDoc } from "../constants/builtInDocs";

describe("builtInDocs", () => {
  it("lists built-in docs", () => {
    expect(BUILT_IN_DOCS.length).toBe(2);
    expect(BUILT_IN_DOCS.some((d) => d.pinned)).toBe(true);
  });

  it("isBuiltInDoc matches name without path", () => {
    expect(isBuiltInDoc("welcome.md", null)).toBe(true);
    expect(isBuiltInDoc("welcome.md", "/path")).toBe(false);
    expect(isBuiltInDoc("other.md", null)).toBe(false);
  });
});
