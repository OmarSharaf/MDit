import {
  FileText, FolderOpen, Save, SaveAll, Plus,
  Search, SidebarClose, SidebarOpen, Settings, Info,
  Columns2, Eye, Edit3, Sun, Moon, Presentation, Command
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStore, useActiveTab } from "../store/useStore";
import { useFileActions } from "../hooks/useFileActions";
import {
  closeWindow,
  isTauri,
  isWindowMaximized,
  minimizeWindow,
  toggleMaximizeWindow,
} from "../utils/windowControls";
import { DownloadMenu } from "./DownloadMenu";
import styles from "./TitleBar.module.css";

interface Props {
  onSettings: () => void;
  onAbout: () => void;
}

export function TitleBar({ onSettings, onAbout }: Props) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const openSearch = useStore((s) => s.openSearch);
  const openCommandPalette = useStore((s) => s.openCommandPalette);
  const activeTab = useActiveTab();
  const theme = useStore((s) => s.settings.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const { handleNew, handleOpen, handleSave, handleSaveAs } = useFileActions();
  const desktopApp = isTauri();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!desktopApp) return;
    let unlisten: (() => void) | undefined;

    void (async () => {
      setMaximized(await isWindowMaximized());

      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      unlisten = await win.onResized(async () => {
        setMaximized(await win.isMaximized());
      });
    })();

    return () => {
      unlisten?.();
    };
  }, [desktopApp]);

  const handleMinimize = () => void minimizeWindow();
  const handleToggleMaximize = () => void toggleMaximizeWindow().then(() => isWindowMaximized().then(setMaximized));
  const handleClose = () => void closeWindow();

  return (
    <div className={styles.titlebar} data-tauri-drag-region>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.logo}
          onClick={onAbout}
          title="About MDit"
          data-tauri-drag-region="false"
        >
          <span className={styles.logoMark}>MD</span>
          <span className={styles.logoName}>it</span>
          <span className={styles.logoDot}>.</span>
        </button>

        <div className={styles.sep} />

        <div className={styles.menuGroup}>
          <button className={styles.menuBtn} onClick={handleNew} title="New (Ctrl+N)">
            <Plus size={13} />
            <span>New</span>
          </button>
          <button className={styles.menuBtn} onClick={handleOpen} title="Open (Ctrl+O)">
            <FolderOpen size={13} />
            <span>Open</span>
          </button>
          <button className={styles.menuBtn} onClick={handleSave} title="Save (Ctrl+S)">
            <Save size={13} />
            <span>Save</span>
          </button>
          <button className={styles.menuBtn} onClick={handleSaveAs} title="Save As (Ctrl+Shift+S)">
            <SaveAll size={13} />
            <span>Save As</span>
          </button>
        </div>
      </div>

      <div className={styles.center} data-tauri-drag-region>
        {activeTab && (
          <span className={styles.filename}>
            <FileText size={12} />
            {activeTab.name}
            {activeTab.isDirty && <span className={styles.dirty}>●</span>}
          </span>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === "edit" ? styles.active : ""}`}
            onClick={() => setViewMode("edit")}
            title="Edit only"
          >
            <Edit3 size={12} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "split" ? styles.active : ""}`}
            onClick={() => setViewMode("split")}
            title="Split view"
          >
            <Columns2 size={12} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "preview" ? styles.active : ""}`}
            onClick={() => setViewMode("preview")}
            title="Preview only"
          >
            <Eye size={12} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === "presentation" ? styles.active : ""}`}
            onClick={() => setViewMode("presentation")}
            title="Presentation mode"
          >
            <Presentation size={12} />
          </button>
        </div>

        <div className={styles.sep} />

        <button className={styles.iconBtn} onClick={openCommandPalette} title="Command palette (Ctrl+Shift+P)">
          <Command size={14} />
        </button>
        <button className={styles.iconBtn} onClick={openSearch} title="Search (Ctrl+F)">
          <Search size={14} />
        </button>
        <button className={styles.iconBtn} onClick={toggleSidebar} title="Toggle sidebar (Ctrl+\)">
          {sidebarOpen ? <SidebarClose size={14} /> : <SidebarOpen size={14} />}
        </button>
        <button className={styles.iconBtn} onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button className={styles.iconBtn} onClick={onAbout} title="About MDit">
          <Info size={14} />
        </button>
        <button className={styles.iconBtn} onClick={onSettings} title="Settings">
          <Settings size={14} />
        </button>

        <div className={styles.winControls} data-tauri-drag-region="false">
          {desktopApp ? (
            <>
              <button
                type="button"
                className={`${styles.winBtn} ${styles.minimize}`}
                title="Minimize"
                onClick={handleMinimize}
              >
                ─
              </button>
              <button
                type="button"
                className={`${styles.winBtn} ${styles.maximize}`}
                title={maximized ? "Restore" : "Maximize"}
                onClick={handleToggleMaximize}
              >
                {maximized ? "❐" : "□"}
              </button>
              <button
                type="button"
                className={`${styles.winBtn} ${styles.close}`}
                title="Close"
                onClick={handleClose}
              >
                ✕
              </button>
            </>
          ) : (
            <DownloadMenu variant="corner" />
          )}
        </div>
      </div>
    </div>
  );
}
