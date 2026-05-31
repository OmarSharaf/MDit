import { describe, expect, it } from "vitest";
import { filterSlashCommands, SLASH_COMMANDS } from "./slashCommands";

describe("slashCommands", () => {
  it("filters by label and id", () => {
    expect(filterSlashCommands("head").some((c) => c.id === "h1")).toBe(true);
    expect(filterSlashCommands("")).toEqual(SLASH_COMMANDS);
  });
});
