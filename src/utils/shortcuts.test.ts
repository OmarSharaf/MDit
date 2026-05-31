import { describe, expect, it, beforeEach } from "vitest";
import {
  getShortcutBindings,
  loadShortcutOverrides,
  matchesShortcut,
  parseShortcut,
  resetShortcutOverrides,
  saveShortcutOverrides,
  SHORTCUT_DEFINITIONS,
} from "./shortcuts";

describe("shortcuts", () => {
  beforeEach(() => resetShortcutOverrides());

  it("loads and saves overrides", () => {
    saveShortcutOverrides({ new: "Ctrl+Shift+N" });
    expect(loadShortcutOverrides().new).toBe("Ctrl+Shift+N");
    expect(getShortcutBindings().find((b) => b.id === "new")?.keys).toBe("Ctrl+Shift+N");
  });

  it("parseShortcut parses modifiers", () => {
    expect(parseShortcut("Ctrl+Shift+S")).toEqual({
      ctrl: true,
      shift: true,
      alt: false,
      key: "S",
    });
    expect(parseShortcut("Cmd+O").ctrl).toBe(true);
  });

  it("matchesShortcut matches keyboard events", () => {
    const e = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
    expect(matchesShortcut(e, "Ctrl+S")).toBe(true);
    expect(matchesShortcut(e, "Ctrl+Shift+S")).toBe(false);
    expect(matchesShortcut(new KeyboardEvent("keydown", { key: "F11" }), "F11")).toBe(true);
    expect(matchesShortcut(new KeyboardEvent("keydown", { key: "\\", ctrlKey: true }), "Ctrl+\\")).toBe(true);
    expect(matchesShortcut(new KeyboardEvent("keydown", { key: "a", altKey: true }), "Alt+A")).toBe(true);
    expect(parseShortcut("Alt+Meta+K").alt).toBe(true);
  });

  it("handles corrupt localStorage", () => {
    localStorage.setItem("mdit-shortcuts", "{bad");
    expect(loadShortcutOverrides()).toEqual({});
    expect(SHORTCUT_DEFINITIONS.length).toBeGreaterThan(5);
  });
});
