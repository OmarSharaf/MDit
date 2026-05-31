import { useState, useMemo, useEffect } from "react";
import {
  FilePlus, FolderOpen, FileText, Clock, ChevronDown, ChevronRight,
  Folder, Pin, ListTree, Github, Search, GitBranch
} from "lucide-react";
import { useStore, useActiveTab, type SidebarPanel } from "../store/useStore";
import { useFileActions } from "../hooks/useFileActions";
import { extractHeadings } from "../utils/headings";
import { scrollEditorToLine } from "../utils/editorRef";
import {
  listWorkspaceEntries,
  browserRootAvailable,
  isBrowserPath,
  isTauriApp,
  browserWorkspaceDisplayName,
} from "../utils/fileSystem";
import { WorkspaceTree } from "./workspace/WorkspaceTree";
import { WorkspaceSearchPanel } from "./workspace/WorkspaceSearchPanel";
import { GitPanel } from "./workspace/GitPanel";
import styles from "./Sidebar.module.css";

interface Props {
  onGitHubImport: () => void;
}

export function Sidebar({ onGitHubImport }: Props) {
  const desktop = isTauriApp();
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const recentFiles = useStore((s) => s.recentFiles);
  const recentWorkspaces = useStore((s) => s.recentWorkspaces);
  const workspacePath = useStore((s) => s.workspacePath);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const setSidebarWidth = useStore((s) => s.setSidebarWidth);
  const sidebarPanel = useStore((s) => s.sidebarPanel);
  const setSidebarPanel = useStore((s) => s.setSidebarPanel);
  const refreshWorkspace = useStore((s) => s.refreshWorkspace);
  const activeTab = useActiveTab();
  const { handleNew, handleOpen, openWorkspace, openFileFromPath } = useFileActions();

  useEffect(() => {
    if (!desktop && sidebarPanel !== "files") {
      setSidebarPanel("files");
    }
  }, [desktop, sidebarPanel, setSidebarPanel]);

  const [openSections, setOpenSections] = useState({
    outline: true,
    openFiles: true,
    recent: true,
  });

  const outline = useMemo(
    () => (activeTab ? extractHeadings(activeTab.content) : []),
    [activeTab?.content]
  );

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      setSidebarWidth(Math.max(180, Math.min(420, startW + ev.clientX - startX)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const openRecentWorkspace = async (path: string) => {
    if (isBrowserPath(path) && !browserRootAvailable(path)) {
      useStore.getState().setSaveStatus(
        "error",
        "Pick the folder again — browser access is cleared after refresh"
      );
      window.setTimeout(() => useStore.getState().setSaveStatus("idle"), 3500);
      void openWorkspace();
      return;
    }
    useStore.getState().setWorkspacePath(path);
    useStore.getState().addRecentWorkspace(path);
    const entries = await listWorkspaceEntries(path);
    useStore.getState().setWorkspaceEntries(entries);
  };

  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return 0;
  });

  const panels: { id: SidebarPanel; icon: typeof Folder; label: string }[] = [
    { id: "files", icon: Folder, label: "Files" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Git" },
  ];

  const renderFileSections = () => (
    <>
      {desktop && workspacePath ? (
        <WorkspaceTree
          rootPath={workspacePath}
          onOpenFile={(path, name) => void openFileFromPath(path, name)}
          onRefresh={() => void refreshWorkspace()}
        />
      ) : desktop && !workspacePath ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Folder size={22} className={styles.emptyIcon} />
          </div>
          <p className={styles.emptyTitle}>Open a project folder</p>
          <p className={styles.emptyHint}>
            Browse your workspace to see files, search, and wiki links.
          </p>
          <button type="button" className={styles.emptyBtn} onClick={() => void openWorkspace()}>
            <FolderOpen size={14} />
            Open folder
          </button>
          <p className={styles.emptyMeta}>Or use Ctrl+O to open a single file</p>
        </div>
      ) : !desktop ? (
        <div className={styles.webHint}>
          <p className={styles.webHintTitle}>Quick start</p>
          <ul className={styles.webHintList}>
            <li>
              <button type="button" className={styles.webHintAction} onClick={handleNew}>
                <FilePlus size={13} />
                New file
              </button>
            </li>
            <li>
              <button type="button" className={styles.webHintAction} onClick={() => void handleOpen()}>
                <FolderOpen size={13} />
                Open file
              </button>
            </li>
            <li>
              <button type="button" className={styles.webHintAction} onClick={onGitHubImport}>
                <Github size={13} />
                Import from GitHub
              </button>
            </li>
          </ul>
          <p className={styles.webHintFoot}>
            Folder workspaces are available in the desktop app.
          </p>
        </div>
      ) : null}

      {outline.length > 0 && (
        <div className={styles.section}>
          <button type="button" className={styles.sectionHeader} onClick={() => toggle("outline")}>
            {openSections.outline ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            <ListTree size={11} />
            <span>Outline</span>
          </button>
          {openSections.outline && (
            <div className={styles.fileList}>
              {outline.map((h) => (
                <button
                  key={`${h.line}-${h.id}`}
                  type="button"
                  className={styles.outlineItem}
                  style={{ paddingLeft: 8 + (h.level - 1) * 12 }}
                  onClick={() => scrollEditorToLine(h.line)}
                  title={h.text}
                >
                  {h.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.section}>
        <button type="button" className={styles.sectionHeader} onClick={() => toggle("openFiles")}>
          {openSections.openFiles ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          <span>Open Files</span>
          <span className={styles.badge}>{tabs.length}</span>
        </button>
        {openSections.openFiles && (
          <div className={styles.fileList}>
            {sortedTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.fileItem} ${tab.id === activeTabId ? styles.active : ""}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.path ?? tab.name}
              >
                {tab.pinned && <Pin size={10} className={styles.pinIcon} />}
                <FileText size={12} className={styles.fileIcon} />
                <span className={styles.fileName}>{tab.name}</span>
                {tab.isDirty && <span className={styles.dirtyDot} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {desktop && recentWorkspaces.length > 0 && (
        <div className={styles.section}>
          <button type="button" className={styles.sectionHeader} onClick={() => toggle("recent")}>
            {openSections.recent ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            <span>Recent folders</span>
          </button>
          {openSections.recent && (
            <div className={styles.fileList}>
              {recentWorkspaces.slice(0, 5).map((w) => (
                <button
                  key={w.path}
                  type="button"
                  className={styles.fileItem}
                  title={w.path}
                  onClick={() => void openRecentWorkspace(w.path)}
                >
                  <Folder size={11} className={styles.fileIcon} />
                  <span className={styles.fileName}>
                    {isBrowserPath(w.path) ? browserWorkspaceDisplayName(w.path) : w.path.split(/[\\/]/).pop()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {recentFiles.length > 0 && (
        <div className={styles.section}>
          <button type="button" className={styles.sectionHeader} onClick={() => toggle("recent")}>
            {openSections.recent ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            <span>Recent files</span>
          </button>
          {openSections.recent && (
            <div className={styles.fileList}>
              {recentFiles.slice(0, 10).map((f) => (
                <button
                  key={f.path}
                  type="button"
                  className={styles.fileItem}
                  title={f.path}
                  onClick={() => void openFileFromPath(f.path, f.name)}
                >
                  <Clock size={11} className={styles.fileIcon} style={{ color: "var(--txt-3)" }} />
                  <span className={styles.fileName}>{f.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <aside className={styles.sidebar} style={{ width: sidebarWidth }} aria-label="Sidebar">
      <div className={styles.header}>
        {desktop ? (
          <>
            <div className={styles.panelTabs} role="tablist" aria-label="Sidebar panels">
              {panels.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={sidebarPanel === id}
                  className={`${styles.panelTab} ${sidebarPanel === id ? styles.panelTabActive : ""}`}
                  onClick={() => setSidebarPanel(id)}
                  title={label}
                >
                  <Icon size={13} strokeWidth={sidebarPanel === id ? 2.25 : 1.75} />
                  <span className={styles.panelTabLabel}>{label}</span>
                </button>
              ))}
            </div>
            <div className={styles.headerActions}>
              <button type="button" className={styles.actionBtn} onClick={handleNew} title="New file">
                <FilePlus size={13} />
              </button>
              <button type="button" className={styles.actionBtn} onClick={handleOpen} title="Open file">
                <FolderOpen size={13} />
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => void openWorkspace()} title="Open folder">
                <Folder size={13} />
              </button>
              <button type="button" className={styles.actionBtn} onClick={onGitHubImport} title="Import from GitHub">
                <Github size={13} />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.webHeader}>
            <span className={styles.webTitle}>Explorer</span>
            <div className={styles.headerActions}>
              <button type="button" className={styles.actionBtn} onClick={handleNew} title="New file">
                <FilePlus size={13} />
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => void handleOpen()} title="Open file">
                <FolderOpen size={13} />
              </button>
              <button type="button" className={styles.actionBtn} onClick={onGitHubImport} title="Import from GitHub">
                <Github size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.scroll}>
        {desktop && sidebarPanel === "search" && (
          <WorkspaceSearchPanel
            workspacePath={workspacePath}
            onOpenHit={(path, name) => void openFileFromPath(path, name)}
          />
        )}

        {desktop && sidebarPanel === "git" && (
          <GitPanel
            workspacePath={workspacePath}
            onOpenFile={(path) => {
              const name = path.split(/[\\/]/).pop() ?? path;
              void openFileFromPath(path, name);
            }}
          />
        )}

        {(sidebarPanel === "files" || !desktop) && renderFileSections()}
      </div>

      <div className={styles.resizeHandle} onMouseDown={onMouseDown} />
    </aside>
  );
}
