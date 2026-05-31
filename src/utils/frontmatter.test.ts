import { describe, expect, it } from "vitest";
import { parseFrontMatter, stripFrontMatter, updateFrontMatter } from "./frontmatter";

describe("frontmatter", () => {
  it("parseFrontMatter without front matter", () => {
    const r = parseFrontMatter("# Title\n\nBody");
    expect(r.data).toEqual({});
    expect(r.body).toBe("# Title\n\nBody");
  });

  it("parseFrontMatter with valid yaml", () => {
    const r = parseFrontMatter("---\ntitle: Hi\n---\n\nBody");
    expect(r.data.title).toBe("Hi");
    expect(r.body).toBe("\nBody");
  });

  it("parseFrontMatter with invalid yaml", () => {
    const r = parseFrontMatter("---\n: bad\n---\nBody");
    expect(r.data).toEqual({});
    expect(r.body).toBe("Body");
  });

  it("updateFrontMatter and stripFrontMatter", () => {
    const updated = updateFrontMatter("old", { title: "New" });
    expect(updated.startsWith("---")).toBe(true);
    expect(stripFrontMatter(updated)).not.toContain("title:");
    expect(updateFrontMatter("body only", {})).toBe("body only");
  });
});
