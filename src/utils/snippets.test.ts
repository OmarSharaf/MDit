import { describe, expect, it } from "vitest";
import { SNIPPET_TEMPLATES } from "./snippets";

describe("snippets", () => {
  it("provides templates", () => {
    expect(SNIPPET_TEMPLATES.length).toBeGreaterThan(3);
    expect(SNIPPET_TEMPLATES.find((t) => t.id === "readme")?.content).toContain("# Project Name");
  });
});
