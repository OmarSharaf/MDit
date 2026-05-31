import { useCallback } from "react";
import { useStore, useActiveTab } from "../store/useStore";
import {
  openFileDialog,
  saveFileDialog,
  saveFileAs,
  writeTextFile,
  openFolderDialog,
  listWorkspaceEntries,
  readTextFilePath,
  browserFolderPickerSupported,
  isBrowserPath,
  browserRootAvailable,
  isTauriApp,
  browserWorkspaceDisplayName,
} from "../utils/fileSystem";

export function useFileActions() {
  const createTab = useStore((s) => s.createTab);
  const saveTab = useStore((s) => s.saveTab);
  const renameTab = useStore((s) => s.renameTab);
  const addRecentFile = useStore((s) => s.addRecentFile);
  const setSaveStatus = useStore((s) => s.setSaveStatus);
  const setWorkspacePath = useStore((s) => s.setWorkspacePath);
  const setWorkspaceEntries = useStore((s) => s.setWorkspaceEntries);
  const addRecentWorkspace = useStore((s) => s.addRecentWorkspace);
  const updateTabContent = useStore((s) => s.updateTabContent);
  const activeTab = useActiveTab();

  const handleNew = useCallback(() => {
    createTab("untitled.md", "", null);
  }, [createTab]);

  const handleOpen = useCallback(async () => {
    const file = await openFileDialog();
    if (!file) return;
    const id = createTab(file.name, file.content, file.path);
    addRecentFile(file.name, file.path);
    return id;
  }, [createTab, addRecentFile]);

  const openWorkspace = useCallback(async () => {
    const path = await openFolderDialog();
    if (!path) {
      if (!isTauriApp() && !browserFolderPickerSupported()) {
        setSaveStatus(
          "error",
          "Folder picker needs Chrome or Edge. Use the desktop app for full support."
        );
        window.setTimeout(() => setSaveStatus("idle"), 4000);
      }
      return;
    }
    setWorkspacePath(path);
    addRecentWorkspace(path);
    const entries = await listWorkspaceEntries(path);
    setWorkspaceEntries(entries);
    const label = isBrowserPath(path) ? browserWorkspaceDisplayName(path) : path.split(/[\\/]/).pop() ?? "folder";
    setSaveStatus("saved", `Opened ${label}`);
    window.setTimeout(() => setSaveStatus("idle"), 2000);
  }, [setWorkspacePath, addRecentWorkspace, setWorkspaceEntries, setSaveStatus]);

  const openFileFromPath = useCallback(
    async (path: string, name: string) => {
      if (isBrowserPath(path)) {
        if (!browserRootAvailable(path)) {
          setSaveStatus("error", "Re-open the folder — browser access expired after refresh");
          window.setTimeout(() => setSaveStatus("idle"), 3500);
          return;
        }
        const content = await readTextFilePath(path);
        if (content == null) return;
        createTab(name, content, path);
        addRecentFile(name, path);
        return;
      }
      try {
        const { readTextFile } = await import("@tauri-apps/plugin-fs");
        const content = await readTextFile(path);
        createTab(name, content, path);
        addRecentFile(name, path);
      } catch {
        const content = await readTextFilePath(path);
        if (content != null) {
          createTab(name, content, path);
          addRecentFile(name, path);
        }
      }
    },
    [createTab, addRecentFile, setSaveStatus]
  );

  const insertTemplate = useCallback(
    (content: string) => {
      if (activeTab) {
        updateTabContent(activeTab.id, content);
      } else {
        createTab("untitled.md", content, null);
      }
    },
    [activeTab, updateTabContent, createTab]
  );

  const saveQuietly = useCallback(async (): Promise<boolean> => {
    if (!activeTab?.path || !activeTab.isDirty) return false;

    setSaveStatus("saving", "Saving…");
    try {
      await writeTextFile(activeTab.path, activeTab.content);
      saveTab(activeTab.id, activeTab.path);
      addRecentFile(activeTab.name, activeTab.path);
      setSaveStatus("saved", "Auto-saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return true;
    } catch {
      setSaveStatus("error", "Auto-save failed");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, [activeTab, saveTab, addRecentFile, setSaveStatus]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!activeTab) return false;

    setSaveStatus("saving", "Saving…");

    try {
      const path = await saveFileDialog(
        activeTab.content,
        activeTab.name,
        activeTab.path
      );
      if (!path) {
        setSaveStatus("idle");
        return false;
      }

      const name = path.split(/[\\/]/).pop() ?? activeTab.name;
      saveTab(activeTab.id, path);
      renameTab(activeTab.id, name);
      addRecentFile(name, path);
      setSaveStatus("saved", activeTab.path ? "Saved" : "Saved as new file");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return true;
    } catch {
      setSaveStatus("error", "Save failed");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, [activeTab, saveTab, renameTab, addRecentFile, setSaveStatus]);

  const handleSaveAs = useCallback(async (): Promise<boolean> => {
    if (!activeTab) return false;

    setSaveStatus("saving", "Saving…");

    try {
      const path = await saveFileAs(activeTab.content, activeTab.name);
      if (!path) {
        setSaveStatus("idle");
        return false;
      }

      const name = path.split(/[\\/]/).pop() ?? activeTab.name;
      saveTab(activeTab.id, path);
      renameTab(activeTab.id, name);
      addRecentFile(name, path);
      setSaveStatus("saved", "Saved as");
      setTimeout(() => setSaveStatus("idle"), 2000);
      return true;
    } catch {
      setSaveStatus("error", "Save failed");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return false;
    }
  }, [activeTab, saveTab, renameTab, addRecentFile, setSaveStatus]);

  return {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    saveQuietly,
    openWorkspace,
    openFileFromPath,
    insertTemplate,
  };
}
