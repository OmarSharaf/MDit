import { describe, expect, it } from "vitest";
import { isBuiltInWelcome, WELCOME_FILE_NAME, WELCOME_MD } from "./welcome";

describe("welcome", () => {
  it("exports welcome content", () => {
    expect(WELCOME_FILE_NAME).toBe("welcome.md");
    expect(WELCOME_MD).toContain("Welcome to MDit");
  });

  it("isBuiltInWelcome matches built-in welcome tab", () => {
    expect(isBuiltInWelcome(WELCOME_FILE_NAME, null)).toBe(true);
    expect(isBuiltInWelcome(WELCOME_FILE_NAME, "/path")).toBe(false);
    expect(isBuiltInWelcome("other.md", null)).toBe(false);
  });
});
