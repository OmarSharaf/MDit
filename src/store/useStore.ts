import { create } from "zustand";
import { BUILT_IN_DOCS } from "../constants/builtInDocs";

export type ViewMode = "edit" | "split" | "preview" | "presentation";
export type ColorTheme = "light" | "dark";
export type PreviewTheme = "default" | "github" | "solarized";
export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type EditorKeymap = "default" | "vim" | "emacs";
export type SidebarPanel = "files" | "search" | "git";

export interface FileTab {
  id: string;
  name: string;
  path: string | null;
  content: string;
  savedContent: string;
  isDirty: boolean;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  charCount: number;
  lineCount: number;
  fileModifiedAt?: number;
  importSource?: string | null;
}

export interface WorkspaceEntry {
  name: string;
  path: string;
  isDir: boolean;
}

export interface AppSettings {
  fontSize: number;
  lineHeight: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  spellCheck: boolean;
  focusMode: boolean;
  theme: ColorTheme;
  previewTheme: PreviewTheme;
  autoSave: boolean;
  autoSaveDelay: number;
  syncScroll: boolean;
  syncScrollPosition: boolean;
  typewriterMode: boolean;
  showFrontMatter: boolean;
  wordGoal: number;
  restoreSession: boolean;
  markdownLint: boolean;
  editorKeymap: EditorKeymap;
  customPreviewCss: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface SearchState {
  isOpen: boolean;
  query: string;
  replaceQuery: string;
  matches: number[];
  currentMatch: number;
  caseSensitive: boolean;
  useRegex: boolean;
}

interface AppState {
  tabs: FileTab[];
  activeTabId: string | null;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  sidebarWidth: number;
  previewWidth: number;
  settings: AppSettings;
  saveStatus: SaveStatus;
  saveMessage: string;
  search: SearchState;
  recentFiles: { name: string; path: string; openedAt: Date }[];
  recentWorkspaces: { path: string; openedAt: Date }[];
  workspacePath: string | null;
  workspaceEntries: WorkspaceEntry[];
  sidebarPanel: SidebarPanel;
  secondaryTabId: string | null;
  splitEditor: boolean;
  commandPaletteOpen: boolean;
  globalSearchQuery: string;
  editorCursor: { line: number; col: number } | null;

  createTab: (name?: string, content?: string, path?: string | null, pinned?: boolean) => string;
  closeTab: (id: string, force?: boolean) => boolean;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  saveTab: (id: string, path: string) => void;
  renameTab: (id: string, name: string) => void;
  pinTab: (id: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  markTabSaved: (id: string, path: string, content: string) => void;
  reloadTabFromDisk: (id: string, content: string, modifiedAt?: number) => void;

  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  setPreviewWidth: (w: number) => void;

  updateSettings: (s: Partial<AppSettings>) => void;
  toggleFocusMode: () => void;
  toggleTheme: () => void;
  setSaveStatus: (status: SaveStatus, message?: string) => void;

  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (q: string) => void;
  setReplaceQuery: (q: string) => void;
  setSearchMatches: (matches: number[], current?: number) => void;
  nextMatch: () => void;
  prevMatch: () => void;
  toggleCaseSensitive: () => void;
  toggleRegex: () => void;

  addRecentFile: (name: string, path: string) => void;
  setWorkspacePath: (path: string | null) => void;
  setWorkspaceEntries: (entries: WorkspaceEntry[]) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setSecondaryTabId: (id: string | null) => void;
  setSplitEditor: (open: boolean) => void;
  refreshWorkspace: () => Promise<void>;
  addRecentWorkspace: (path: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setGlobalSearchQuery: (q: string) => void;
  setEditorCursor: (line: number, col: number) => void;
  hasUnsavedTabs: () => boolean;
}

function countStats(content: string) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const lines = content.split("\n").length;
  return { wordCount: words, charCount: chars, lineCount: lines };
}

function newTab(
  name = "untitled.md",
  content = "",
  path: string | null = null,
  pinned = false
): FileTab {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name,
    path,
    content,
    savedContent: content,
    isDirty: false,
    pinned,
    createdAt: now,
    updatedAt: now,
    ...countStats(content),
  };
}

export { newTab as createFileTab };

const SETTINGS_KEY = "mdit-settings";

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 14,
  lineHeight: 1.75,
  wordWrap: true,
  showLineNumbers: true,
  spellCheck: false,
  focusMode: false,
  theme: "light",
  previewTheme: "default",
  autoSave: true,
  autoSaveDelay: 1500,
  syncScroll: true,
  syncScrollPosition: false,
  typewriterMode: false,
  showFrontMatter: true,
  wordGoal: 500,
  restoreSession: true,
  markdownLint: true,
  editorKeymap: "default",
  customPreviewCss: "",
  reducedMotion: false,
  highContrast: false,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        theme: parsed.theme === "dark" ? "dark" : "light",
        editorKeymap: ["default", "vim", "emacs"].includes(parsed.editorKeymap)
          ? parsed.editorKeymap
          : "default",
      };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

function persistSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

const initialBuiltInTabs = BUILT_IN_DOCS.map((doc) =>
  newTab(doc.name, doc.content, null, doc.pinned)
);

export const useStore = create<AppState>((set, get) => ({
  tabs: initialBuiltInTabs,
  activeTabId: initialBuiltInTabs[0]?.id ?? null,
  viewMode: "split",
  sidebarOpen: true,
  sidebarWidth: 260,
  previewWidth: 50,
  settings: loadSettings(),
  saveStatus: "idle",
  saveMessage: "",
  recentFiles: [],
  recentWorkspaces: [],
  workspacePath: null,
  workspaceEntries: [],
  sidebarPanel: "files",
  secondaryTabId: null,
  splitEditor: false,
  commandPaletteOpen: false,
  globalSearchQuery: "",
  editorCursor: null,
  search: {
    isOpen: false,
    query: "",
    replaceQuery: "",
    matches: [],
    currentMatch: 0,
    caseSensitive: false,
    useRegex: false,
  },

  createTab: (name = "untitled.md", content = "", path = null, pinned = false) => {
    const tab = newTab(name, content, path, pinned);
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }));
    return tab.id;
  },

  closeTab: (id, force = false) => {
    const { tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return true;
    if (!force && tab.isDirty) return false;

    const idx = tabs.findIndex((t) => t.id === id);
    const remaining = tabs.filter((t) => t.id !== id);
    if (!remaining.length) {
      const newT = newTab();
      set({ tabs: [newT], activeTabId: newT.id });
      return true;
    }
    let newActive = activeTabId;
    if (activeTabId === id) {
      newActive = remaining[Math.min(idx, remaining.length - 1)].id;
    }
    set({ tabs: remaining, activeTabId: newActive });
    return true;
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabContent: (id, content) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              content,
              isDirty: content !== t.savedContent,
              updatedAt: new Date(),
              ...countStats(content),
            }
          : t
      ),
    }));
  },

  saveTab: (id, path) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id
          ? { ...t, path, savedContent: t.content, isDirty: false, updatedAt: new Date() }
          : t
      ),
    }));
  },

  markTabSaved: (id, path, content) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              path,
              content,
              savedContent: content,
              isDirty: false,
              updatedAt: new Date(),
              ...countStats(content),
            }
          : t
      ),
    }));
  },

  reloadTabFromDisk: (id, content, modifiedAt) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              content,
              savedContent: content,
              isDirty: false,
              fileModifiedAt: modifiedAt,
              updatedAt: new Date(),
              ...countStats(content),
            }
          : t
      ),
    }));
  },

  renameTab: (id, name) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, name } : t)),
    }));
  },

  pinTab: (id) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)),
    }));
  },

  reorderTabs: (fromIndex, toIndex) => {
    set((s) => {
      const tabs = [...s.tabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { tabs };
    });
  },

  setViewMode: (viewMode) => set({ viewMode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  setPreviewWidth: (previewWidth) => set({ previewWidth }),

  updateSettings: (partial) =>
    set((state) => {
      const settings = { ...state.settings, ...partial };
      persistSettings(settings);
      return { settings };
    }),

  toggleFocusMode: () =>
    set((s) => ({
      settings: { ...s.settings, focusMode: !s.settings.focusMode },
    })),

  toggleTheme: () =>
    set((s) => {
      const theme: ColorTheme = s.settings.theme === "dark" ? "light" : "dark";
      const settings = { ...s.settings, theme };
      persistSettings(settings);
      return { settings };
    }),

  setSaveStatus: (saveStatus, message = "") => set({ saveStatus, saveMessage: message }),

  openSearch: () => set((s) => ({ search: { ...s.search, isOpen: true } })),
  closeSearch: () =>
    set((s) => ({ search: { ...s.search, isOpen: false, matches: [], currentMatch: 0 } })),
  setSearchQuery: (query) => set((s) => ({ search: { ...s.search, query } })),
  setReplaceQuery: (replaceQuery) => set((s) => ({ search: { ...s.search, replaceQuery } })),
  setSearchMatches: (matches, current = 0) =>
    set((s) => ({ search: { ...s.search, matches, currentMatch: current } })),
  nextMatch: () =>
    set((s) => ({
      search: {
        ...s.search,
        currentMatch: s.search.matches.length
          ? (s.search.currentMatch + 1) % s.search.matches.length
          : 0,
      },
    })),
  prevMatch: () =>
    set((s) => ({
      search: {
        ...s.search,
        currentMatch: s.search.matches.length
          ? (s.search.currentMatch - 1 + s.search.matches.length) % s.search.matches.length
          : 0,
      },
    })),
  toggleCaseSensitive: () =>
    set((s) => ({ search: { ...s.search, caseSensitive: !s.search.caseSensitive } })),
  toggleRegex: () =>
    set((s) => ({ search: { ...s.search, useRegex: !s.search.useRegex } })),

  addRecentFile: (name, path) => {
    set((s) => ({
      recentFiles: [
        { name, path, openedAt: new Date() },
        ...s.recentFiles.filter((f) => f.path !== path).slice(0, 19),
      ],
    }));
  },

  setWorkspacePath: (workspacePath) => set({ workspacePath }),
  setWorkspaceEntries: (workspaceEntries) => set({ workspaceEntries }),
  setSidebarPanel: (sidebarPanel) => set({ sidebarPanel }),
  setSecondaryTabId: (secondaryTabId) => set({ secondaryTabId }),
  setSplitEditor: (splitEditor) => set({ splitEditor }),

  refreshWorkspace: async () => {
    const { workspacePath } = get();
    if (!workspacePath) return;
    const { listWorkspaceEntries } = await import("../utils/fileSystem");
    const entries = await listWorkspaceEntries(workspacePath);
    set({ workspaceEntries: entries });
  },

  addRecentWorkspace: (path) => {
    set((s) => ({
      recentWorkspaces: [
        { path, openedAt: new Date() },
        ...s.recentWorkspaces.filter((w) => w.path !== path).slice(0, 9),
      ],
    }));
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false, globalSearchQuery: "" }),
  setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
  setEditorCursor: (line, col) => set({ editorCursor: { line, col } }),

  hasUnsavedTabs: () => get().tabs.some((t) => t.isDirty),
}));

export const useActiveTab = () => {
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  return tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? null;
};

export const useSortedTabs = () => {
  const tabs = useStore((s) => s.tabs);
  return [...tabs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return 0;
  });
};
