import { describe, expect, it } from "vitest";
import { VIEW_MODE_LABELS } from "./viewMode";

describe("viewMode", () => {
  it("has labels for all modes", () => {
    expect(VIEW_MODE_LABELS.edit).toBe("Edit");
    expect(VIEW_MODE_LABELS.split).toBe("Split");
    expect(VIEW_MODE_LABELS.preview).toBe("Preview");
    expect(VIEW_MODE_LABELS.presentation).toBe("Present");
  });
});
