import { useEffect, useMemo, useState } from "react";
import { useStore, useActiveTab } from "../store/useStore";
import { useFileActions } from "../hooks/useFileActions";
import { SNIPPET_TEMPLATES } from "../utils/snippets";
import { useExportActions } from "../hooks/useExportActions";
import { isTauriApp } from "../utils/fileSystem";
import styles from "./CommandPalette.module.css";

interface Command {
  id: string;
  label: string;
  hint?: string;
  action: () => void | Promise<void>;
}

interface Props {
  onAbout: () => void;
  onGitHubImport: () => void;
  onSnapshot: () => void;
  onWorkspaceSearch: () => void;
  onSplitEditor: () => void;
}

export function CommandPalette({
  onAbout,
  onGitHubImport,
  onSnapshot,
  onWorkspaceSearch,
  onSplitEditor,
}: Props) {
  const open = useStore((s) => s.commandPaletteOpen);
  const close = useStore((s) => s.closeCommandPalette);
  const query = useStore((s) => s.globalSearchQuery);
  const setQuery = useStore((s) => s.setGlobalSearchQuery);
  const tabs = useStore((s) => s.tabs);
  const setViewMode = useStore((s) => s.setViewMode);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);
  const openSearch = useStore((s) => s.openSearch);
  const activeTab = useActiveTab();
  const setSidebarPanel = useStore((s) => s.setSidebarPanel);
  const setSplitEditor = useStore((s) => s.setSplitEditor);
  const setSecondaryTabId = useStore((s) => s.setSecondaryTabId);
  const {
    exportHtml,
    exportMarkdown,
    exportPlainText,
    exportPdf,
    exportDocx,
    exportOdt,
    publishFolder,
    copyHtml,
    copyMarkdown,
  } = useExportActions();
  const {
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    openWorkspace,
    insertTemplate,
  } = useFileActions();
  const [index, setIndex] = useState(0);

  const commands: Command[] = useMemo(() => {
    const desktop = isTauriApp();
    const list: Command[] = [
      { id: "new", label: "New file", hint: "Ctrl+N", action: handleNew },
      { id: "open", label: "Open file", hint: "Ctrl+O", action: handleOpen },
      {
        id: "github-import",
        label: "Import from GitHub URL",
        hint: "Public file or Gist",
        action: onGitHubImport,
      },
      ...(desktop
        ? [
            { id: "folder", label: "Open folder", action: openWorkspace },
            {
              id: "workspace-search",
              label: "Search in workspace",
              hint: "Ctrl+Shift+F",
              action: onWorkspaceSearch,
            },
          ]
        : []),
      { id: "split-editor", label: "Split editor (two documents)", action: onSplitEditor },
      { id: "snapshot", label: "Snapshots", hint: "Ctrl+Shift+K", action: onSnapshot },
      { id: "save", label: "Save", hint: "Ctrl+S", action: handleSave },
      { id: "saveas", label: "Save as", hint: "Ctrl+Shift+S", action: handleSaveAs },
      { id: "find", label: "Find & replace", hint: "Ctrl+F", action: openSearch },
      { id: "split", label: "Split view", action: () => setViewMode("split") },
      { id: "preview", label: "Preview only", action: () => setViewMode("preview") },
      { id: "edit", label: "Edit only", action: () => setViewMode("edit") },
      {
        id: "present",
        label: "Presentation mode",
        action: () => setViewMode("presentation"),
      },
      { id: "theme", label: "Toggle light/dark theme", action: toggleTheme },
      { id: "focus", label: "Toggle focus mode", hint: "F11", action: toggleFocusMode },
      { id: "about", label: "About MDit", action: onAbout },
      ...SNIPPET_TEMPLATES.map((t) => ({
        id: `tpl-${t.id}`,
        label: `Insert template: ${t.name}`,
        action: () => insertTemplate(t.content),
      })),
    ];

    if (activeTab) {
      list.push(
        { id: "export-html", label: "Export as HTML", action: exportHtml },
        { id: "export-md", label: "Export as Markdown", action: exportMarkdown },
        { id: "export-txt", label: "Export as plain text", action: exportPlainText },
        { id: "export-docx", label: "Export as Word (.doc)", action: exportDocx },
        { id: "export-odt", label: "Export as ODT", action: exportOdt },
        ...(desktop
          ? [{ id: "publish", label: "Publish workspace as static site", action: publishFolder }]
          : []),
        { id: "copy-html", label: "Copy rendered HTML", action: copyHtml },
        { id: "copy-md", label: "Copy Markdown", action: copyMarkdown },
        { id: "print", label: "Print / export PDF", action: exportPdf },
      );
    }

    tabs.forEach((tab) => {
      if (tab.content.toLowerCase().includes(query.toLowerCase()) && query.length > 1) {
        list.push({
          id: `tab-${tab.id}`,
          label: `Go to: ${tab.name}`,
          hint: tab.path ?? "unsaved",
          action: () => useStore.getState().setActiveTab(tab.id),
        });
      }
    });

    return list;
  }, [
    activeTab,
    tabs,
    query,
    handleNew,
    handleOpen,
    handleSave,
    handleSaveAs,
    openWorkspace,
    insertTemplate,
    setViewMode,
    toggleTheme,
    toggleFocusMode,
    openSearch,
    onAbout,
    onGitHubImport,
    onSnapshot,
    onWorkspaceSearch,
    onSplitEditor,
    exportDocx,
    exportOdt,
    publishFolder,
    setSidebarPanel,
    setSplitEditor,
    setSecondaryTabId,
    exportHtml,
    exportMarkdown,
    exportPlainText,
    exportPdf,
    copyHtml,
    copyMarkdown,
  ]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => setIndex(0), [query, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[index]) {
        e.preventDefault();
        void filtered[index].action();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, index, close]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <input
          className={styles.input}
          autoFocus
          placeholder="Type a command or search open files…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className={styles.list}>
          {filtered.map((cmd, i) => (
            <li key={cmd.id}>
              <button
                className={`${styles.item} ${i === index ? styles.active : ""}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => {
                  void cmd.action();
                  close();
                }}
              >
                <span>{cmd.label}</span>
                {cmd.hint && <span className={styles.hint}>{cmd.hint}</span>}
              </button>
            </li>
          ))}
          {!filtered.length && <li className={styles.empty}>No matches</li>}
        </ul>
      </div>
    </div>
  );
}
