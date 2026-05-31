import { describe, expect, it, beforeEach } from "vitest";
import { loadSession, saveSession, type SessionData } from "./session";

describe("session", () => {
  const data: SessionData = {
    tabs: [{ name: "a.md", path: "/a.md", pinned: false }],
    activeTabId: "1",
    activeTabPath: "/a.md",
    viewMode: "split",
    workspacePath: "/ws",
    sidebarOpen: true,
  };

  beforeEach(() => localStorage.clear());

  it("save and load session", () => {
    saveSession(data);
    expect(loadSession()).toEqual(data);
  });

  it("returns null when missing or invalid", () => {
    expect(loadSession()).toBeNull();
    localStorage.setItem("mdit-session", "not-json");
    expect(loadSession()).toBeNull();
  });
});
