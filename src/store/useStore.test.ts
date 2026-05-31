import { describe, expect, it, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createFileTab, useActiveTab, useSortedTabs, useStore } from "./useStore";

vi.mock("../utils/fileSystem", () => ({
  listWorkspaceEntries: vi.fn(async () => [{ name: "a.md", path: "/a.md", isDir: false }]),
}));

describe("useStore", () => {
  beforeEach(() => {
    localStorage.clear();
    const tab = createFileTab("test.md", "hello", null);
    useStore.setState({
      tabs: [tab],
      activeTabId: tab.id,
      recentFiles: [],
      recentWorkspaces: [],
      workspacePath: null,
      workspaceEntries: [],
      saveStatus: "idle",
      saveMessage: "",
      search: {
        isOpen: false,
        query: "",
        replaceQuery: "",
        matches: [],
        currentMatch: 0,
        caseSensitive: false,
        useRegex: false,
      },
      commandPaletteOpen: false,
      globalSearchQuery: "",
    });
  });

  it("creates and updates tabs", () => {
    const id = useStore.getState().createTab("new.md", "body");
    expect(useStore.getState().tabs.some((t) => t.id === id)).toBe(true);
    useStore.getState().updateTabContent(id, "changed");
    expect(useStore.getState().tabs.find((t) => t.id === id)?.isDirty).toBe(true);
    useStore.getState().saveTab(id, "/new.md");
    expect(useStore.getState().tabs.find((t) => t.id === id)?.isDirty).toBe(false);
  });

  it("closes tabs and blocks dirty close", () => {
    const id = useStore.getState().createTab("x.md", "dirty");
    useStore.getState().updateTabContent(id, "changed");
    expect(useStore.getState().closeTab(id)).toBe(false);
    expect(useStore.getState().closeTab(id, true)).toBe(true);
  });

  it("closes last tab by creating new one", () => {
    const only = useStore.getState().tabs[0];
    useStore.getState().closeTab(only.id, true);
    expect(useStore.getState().tabs.length).toBe(1);
  });

  it("markTabSaved and reloadTabFromDisk", () => {
    const id = useStore.getState().tabs[0].id;
    useStore.getState().markTabSaved(id, "/f.md", "saved");
    useStore.getState().reloadTabFromDisk(id, "disk", 123);
    expect(useStore.getState().tabs[0].fileModifiedAt).toBe(123);
  });

  it("rename pin reorder tabs", () => {
    const a = useStore.getState().createTab("a.md");
    const b = useStore.getState().createTab("b.md");
    useStore.getState().renameTab(a, "renamed.md");
    useStore.getState().pinTab(a);
    const idxA = useStore.getState().tabs.findIndex((t) => t.id === a);
    useStore.getState().reorderTabs(idxA, 0);
    expect(useStore.getState().tabs.find((t) => t.id === a)?.pinned).toBe(true);
    expect(useStore.getState().tabs[0].id).toBe(a);
  });

  it("settings persist and toggle", () => {
    useStore.getState().updateSettings({ fontSize: 16 });
    expect(localStorage.getItem("mdit-settings")).toContain("16");
    useStore.getState().toggleTheme();
    useStore.getState().toggleFocusMode();
    expect(useStore.getState().settings.focusMode).toBe(true);
    localStorage.setItem("mdit-settings", "{bad");
    useStore.getState().updateSettings({ fontSize: 14 });
  });

  it("loadSettings invalid editorKeymap falls back", () => {
    localStorage.setItem("mdit-settings", JSON.stringify({ editorKeymap: "bad", theme: "dark" }));
    useStore.getState().updateSettings({});
    expect(useStore.getState().settings.editorKeymap).toBe("default");
    expect(useStore.getState().settings.theme).toBe("dark");
  });

  it("search navigation", () => {
    useStore.getState().openSearch();
    useStore.getState().setSearchQuery("q");
    useStore.getState().setReplaceQuery("r");
    useStore.getState().setSearchMatches([0, 5], 0);
    useStore.getState().nextMatch();
    useStore.getState().prevMatch();
    useStore.getState().toggleCaseSensitive();
    useStore.getState().toggleRegex();
    useStore.getState().closeSearch();
    expect(useStore.getState().search.isOpen).toBe(false);
  });

  it("recent files and workspaces", () => {
    useStore.getState().addRecentFile("a.md", "/a.md");
    useStore.getState().addRecentFile("b.md", "/b.md");
    useStore.getState().addRecentFile("a.md", "/a.md");
    expect(useStore.getState().recentFiles[0].path).toBe("/a.md");
    useStore.getState().addRecentWorkspace("/ws");
    useStore.getState().addRecentWorkspace("/ws2");
  });

  it("workspace refresh and UI state", async () => {
    useStore.setState({ workspacePath: "/ws" });
    await useStore.getState().refreshWorkspace();
    expect(useStore.getState().workspaceEntries.length).toBe(1);
    useStore.getState().setWorkspacePath(null);
    await useStore.getState().refreshWorkspace();
    useStore.getState().setSidebarPanel("search");
    useStore.getState().setSplitEditor(true);
    useStore.getState().setSecondaryTabId("x");
    useStore.getState().openCommandPalette();
    useStore.getState().setGlobalSearchQuery("cmd");
    useStore.getState().closeCommandPalette();
    useStore.getState().setEditorCursor(1, 1);
    useStore.getState().setViewMode("preview");
    useStore.getState().toggleSidebar();
    useStore.getState().setSidebarWidth(300);
    useStore.getState().setPreviewWidth(60);
    useStore.getState().setSaveStatus("saved", "ok");
    expect(useStore.getState().hasUnsavedTabs()).toBe(false);
  });

  it("selectors derive active and sorted tabs", () => {
    const a = useStore.getState().createTab("a.md");
    useStore.getState().pinTab(a);
    const { result: activeResult } = renderHook(() => useActiveTab());
    expect(activeResult.current?.id).toBe(a);
    const { result: sortedResult } = renderHook(() => useSortedTabs());
    expect(sortedResult.current[0].pinned).toBe(true);
  });

  it("closeTab on missing tab returns true", () => {
    expect(useStore.getState().closeTab("missing-id")).toBe(true);
  });

  it("hasUnsavedTabs detects dirty tabs", () => {
    const id = useStore.getState().createTab("dirty.md", "x");
    useStore.getState().updateTabContent(id, "changed");
    expect(useStore.getState().hasUnsavedTabs()).toBe(true);
  });

  it("persistSettings ignores storage failures", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    useStore.getState().updateSettings({ fontSize: 18 });
    expect(useStore.getState().settings.fontSize).toBe(18);
    vi.mocked(Storage.prototype.setItem).mockRestore();
  });

  it("setActiveTab switches active tab", () => {
    const id = useStore.getState().createTab("b.md");
    useStore.getState().setActiveTab(id);
    expect(useStore.getState().activeTabId).toBe(id);
  });
});
