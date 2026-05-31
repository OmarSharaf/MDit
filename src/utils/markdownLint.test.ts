import { describe, expect, it } from "vitest";
import { lineDiagnostics, markdownLintExtension } from "./markdownLint";

describe("markdownLint", () => {
  it("returns empty when disabled", () => {
    expect(markdownLintExtension(false)).toEqual([]);
  });

  it("lineDiagnostics flags issues", () => {
    const doc = "# H1\n### H3 skip\n![ ](img.png)\n- [ ] tab\titem\nline with spaces   \n";
    const diags = lineDiagnostics(doc);
    expect(diags.some((d) => d.message.includes("alt text"))).toBe(true);
    expect(diags.some((d) => d.message.includes("Heading skips"))).toBe(true);
    expect(diags.some((d) => d.message.includes("Trailing whitespace"))).toBe(true);
  });

  it("lineDiagnostics flags tab-indented lists", () => {
    const diags = lineDiagnostics("\t\t\t\t- deeply tabbed item\n");
    expect(diags.some((d) => d.message.includes("tabs"))).toBe(true);
  });

  it("enabled extension returns linter", () => {
    expect(markdownLintExtension(true)).toHaveLength(1);
  });
});
