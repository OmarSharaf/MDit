import { describe, expect, it } from "vitest";
import { previewSanitizeSchema } from "./previewSchema";

describe("previewSchema", () => {
  it("allows svg tags and attributes", () => {
    expect(previewSanitizeSchema.tagNames).toContain("svg");
    expect(previewSanitizeSchema.attributes?.svg).toContain("viewBox");
  });
});
