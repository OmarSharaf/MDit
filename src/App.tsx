import { useEffect } from "react";
import { useStore } from "./store/useStore";
import { TitleBar } from "./components/TitleBar";
import { Sidebar } from "./components/Sidebar";
import { TabBar } from "./components/TabBar";
import { EditorPane } from "./components/EditorPane";
import { StatusBar } from "./components/StatusBar";
import { SearchOverlay } from "./components/SearchOverlay";
import { SettingsPanel } from "./components/SettingsPanel";
import { AboutDialog } from "./components/AboutDialog";
import { CommandPalette } from "./components/CommandPalette";
import { GitHubImportDialog } from "./components/GitHubImportDialog";
import { SnapshotPanel } from "./components/SnapshotPanel";
import { useFileActions } from "./hooks/useFileActions";
import { useAutoSave } from "./hooks/useAutoSave";
import { useTheme } from "./hooks/useTheme";
import { useSession } from "./hooks/useSession";
import { useFileWatch } from "./hooks/useFileWatch";
import { restoreBrowserRoots } from "./utils/fileSystem";
import { matchesShortcut, getShortcutBindings } from "./utils/shortcuts";
import styles from "./App.module.css";
import { useState } from "react";
import { useActiveTab } from "./store/useStore";

export default function App() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const focusMode = useStore((s) => s.settings.focusMode);
  const viewMode = useStore((s) => s.viewMode);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);
  const openCommandPalette = useStore((s) => s.openCommandPalette);
  const hasUnsavedTabs = useStore((s) => s.hasUnsavedTabs);
  const { handleNew, handleOpen, handleSave, handleSaveAs } = useFileActions();
  const openSearch = useStore((s) => s.openSearch);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const setSidebarPanel = useStore((s) => s.setSidebarPanel);
  const setSplitEditor = useStore((s) => s.setSplitEditor);
  const setSecondaryTabId = useStore((s) => s.setSecondaryTabId);
  const updateTabContent = useStore((s) => s.updateTabContent);
  const activeTab = useActiveTab();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [githubImportOpen, setGitHubImportOpen] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const createTab = useStore((s) => s.createTab);
  const setSaveStatus = useStore((s) => s.setSaveStatus);
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);

  useTheme();
  useAutoSave();
  useSession();
  useFileWatch();

  useEffect(() => {
    void restoreBrowserRoots();
  }, []);

  useEffect(() => {
    if (!activeTabId && tabs.length) setActiveTab(tabs[0].id);
  }, [activeTabId, tabs, setActiveTab]);

  useEffect(() => {
    const bindings = getShortcutBindings();
    const handler = (e: KeyboardEvent) => {
      for (const b of bindings) {
        if (!matchesShortcut(e, b.keys)) continue;
        e.preventDefault();
        switch (b.id) {
          case "new": handleNew(); return;
          case "open": void handleOpen(); return;
          case "saveAs": void handleSaveAs(); return;
          case "save": void handleSave(); return;
          case "find": openSearch(); return;
          case "palette": openCommandPalette(); return;
          case "sidebar": toggleSidebar(); return;
          case "focus": toggleFocusMode(); return;
          case "workspaceSearch":
            setSidebarPanel("search");
            if (!sidebarOpen) toggleSidebar();
            return;
          case "snapshot":
            setSnapshotOpen(true);
            return;
        }
      }
      if (e.key === "Escape" && focusMode) toggleFocusMode();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    focusMode,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    openSearch,
    openCommandPalette,
    toggleSidebar,
    toggleFocusMode,
    setSidebarPanel,
    sidebarOpen,
  ]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedTabs()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedTabs]);

  const hideChrome = focusMode || viewMode === "presentation";

  const openSplitEditor = () => {
    if (!activeTab) return;
    const other = tabs.find((t) => t.id !== activeTab.id);
    if (!other) return;
    setSecondaryTabId(other.id);
    setSplitEditor(true);
    useStore.getState().setViewMode("edit");
  };

  return (
    <div className={`${styles.app} ${focusMode ? styles.focusMode : ""}`}>
      {!hideChrome && (
        <TitleBar
          onSettings={() => setSettingsOpen(true)}
          onAbout={() => setAboutOpen(true)}
        />
      )}
      <div className={styles.body}>
        {!hideChrome && sidebarOpen && <Sidebar onGitHubImport={() => setGitHubImportOpen(true)} />}
        <div className={styles.content}>
          {!hideChrome && <TabBar />}
          <EditorPane />
          {!hideChrome && <StatusBar onAbout={() => setAboutOpen(true)} />}
        </div>
      </div>
      <SearchOverlay />
      <CommandPalette
        onAbout={() => setAboutOpen(true)}
        onGitHubImport={() => setGitHubImportOpen(true)}
        onSnapshot={() => setSnapshotOpen(true)}
        onWorkspaceSearch={() => {
          setSidebarPanel("search");
          if (!sidebarOpen) toggleSidebar();
        }}
        onSplitEditor={openSplitEditor}
      />
      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          onAbout={() => {
            setSettingsOpen(false);
            setAboutOpen(true);
          }}
        />
      )}
      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
      <GitHubImportDialog
        open={githubImportOpen}
        onClose={() => setGitHubImportOpen(false)}
        onImported={(name, content) => {
          createTab(name, content, null);
          setSaveStatus("saved", `Imported ${name} from GitHub`);
          window.setTimeout(() => setSaveStatus("idle"), 2500);
        }}
      />
      {activeTab && (
        <SnapshotPanel
          open={snapshotOpen}
          tabId={activeTab.id}
          tabName={activeTab.name}
          content={activeTab.content}
          onClose={() => setSnapshotOpen(false)}
          onRestore={(content) => updateTabContent(activeTab.id, content)}
        />
      )}
    </div>
  );
}
