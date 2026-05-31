import { describe, expect, it } from "vitest";
import { APP_FEATURES, APP_NAME, APP_TAGLINE, APP_VERSION, AUTHOR } from "./appInfo";

describe("appInfo", () => {
  it("exports app metadata", () => {
    expect(APP_NAME).toBe("MDit");
    expect(APP_TAGLINE).toContain("Markdown");
    expect(APP_VERSION).toMatch(/\d+\.\d+\.\d+/);
    expect(AUTHOR.name).toBeTruthy();
    expect(AUTHOR.website).toContain("https://");
    expect(APP_FEATURES.length).toBeGreaterThan(0);
  });
});
