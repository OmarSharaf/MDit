import { useEffect, useRef } from "react";
import { createFileTab, useStore } from "../store/useStore";
import { saveSession, loadSession } from "../utils/session";
import { readTextFilePath, restoreBrowserRoots } from "../utils/fileSystem";
import { BUILT_IN_DOCS, isBuiltInDoc } from "../constants/builtInDocs";

function ensureBuiltInTabs() {
  const state = useStore.getState();
  let tabs = [...state.tabs];

  for (const doc of BUILT_IN_DOCS) {
    const existing = tabs.find((t) => t.name === doc.name && t.path === null);
    if (existing) {
      if (existing.content !== doc.content) {
        state.updateTabContent(existing.id, doc.content);
      }
      if ("pinned" in doc && doc.pinned && !existing.pinned) {
        useStore.setState({
          tabs: tabs.map((t) =>
            t.id === existing.id ? { ...t, pinned: true } : t
          ),
        });
      }
      continue;
    }
    tabs = [...tabs, createFileTab(doc.name, doc.content, null, doc.pinned)];
  }

  if (tabs.length !== state.tabs.length) {
    useStore.setState({ tabs });
  }
}

export function useSession() {
  const settings = useStore((s) => s.settings);
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const viewMode = useStore((s) => s.viewMode);
  const workspacePath = useStore((s) => s.workspacePath);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const restoring = useRef(false);

  useEffect(() => {
    ensureBuiltInTabs();

    if (!settings.restoreSession) return;

    const session = loadSession();
    if (!session?.tabs.length) return;

    restoring.current = true;

    void (async () => {
      await restoreBrowserRoots();

      const builtInTabs = BUILT_IN_DOCS.map((doc) =>
        createFileTab(doc.name, doc.content, null, doc.pinned)
      );
      const restored = [];

      for (const t of session.tabs) {
        if (isBuiltInDoc(t.name, t.path)) continue;

        let content = "";
        if (t.path) {
          content = (await readTextFilePath(t.path)) ?? "";
        }
        restored.push(createFileTab(t.name, content, t.path, t.pinned));
      }

      const allTabs = [...builtInTabs, ...restored];
      let nextActiveId = builtInTabs[0]?.id ?? allTabs[0]?.id ?? null;

      if (session.activeTabPath) {
        const match = allTabs.find((tab) => tab.path === session.activeTabPath);
        if (match) nextActiveId = match.id;
      } else {
        const named = allTabs.find((tab) => tab.name === session.tabs[0]?.name);
        if (named && !isBuiltInDoc(named.name, named.path)) {
          nextActiveId = named.id;
        }
      }

      useStore.setState({
        tabs: allTabs,
        activeTabId: nextActiveId,
        viewMode: session.viewMode ?? useStore.getState().viewMode,
        workspacePath: session.workspacePath,
        sidebarOpen: session.sidebarOpen ?? useStore.getState().sidebarOpen,
      });

      if (session.workspacePath) {
        const { listWorkspaceEntries } = await import("../utils/fileSystem");
        const entries = await listWorkspaceEntries(session.workspacePath);
        useStore.getState().setWorkspaceEntries(entries);
      }

      restoring.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!settings.restoreSession || restoring.current) return;
    if (!tabs.length) return;

    const active = tabs.find((t) => t.id === activeTabId);
    saveSession({
      tabs: tabs
        .filter((t) => !isBuiltInDoc(t.name, t.path))
        .map((t) => ({
          name: t.name,
          path: t.path,
          pinned: t.pinned,
        })),
      activeTabId,
      activeTabPath: active?.path ?? null,
      viewMode,
      workspacePath,
      sidebarOpen,
    });
  }, [tabs, activeTabId, viewMode, workspacePath, sidebarOpen, settings.restoreSession]);
}
