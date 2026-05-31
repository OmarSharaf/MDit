import { describe, expect, it } from "vitest";
import { extractHeadings, lineForHeadingId, slugify } from "./headings";

describe("headings", () => {
  it("slugify normalizes heading text", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  Multiple   spaces  ")).toBe("multiple-spaces");
  });

  it("extractHeadings parses levels and duplicate ids", () => {
    const md = "# One\n## Two\n# One\n### Skip";
    const headings = extractHeadings(md);
    expect(headings).toHaveLength(4);
    expect(headings[0]).toMatchObject({ level: 1, text: "One", line: 1, id: "one" });
    expect(headings[2].id).toBe("one-1");
  });

  it("lineForHeadingId finds line by id", () => {
    const md = "## Target\n\nBody";
    expect(lineForHeadingId(md, "target")).toBe(1);
    expect(lineForHeadingId(md, "missing")).toBeNull();
  });
});
