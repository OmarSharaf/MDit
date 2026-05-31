import { useRef, useCallback, useState, useMemo } from "react";
import { Plus, FolderOpen, Columns2 } from "lucide-react";
import { useStore, useActiveTab } from "../store/useStore";
import { useFileActions } from "../hooks/useFileActions";
import { EditorToolbar } from "./EditorToolbar";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownPreview, PreviewHandle } from "./MarkdownPreview";
import { PresentationView } from "./PresentationView";
import { FrontMatterPanel } from "./FrontMatterPanel";
import { TableEditorDialog } from "./TableEditorDialog";
import { scrollEditorToRange } from "../utils/editorRef";
import { saveDroppedImage } from "../utils/assets";
import { stripFrontMatter } from "../utils/frontmatter";
import { resolveWikiLink } from "../utils/wikiLinks";
import styles from "./EditorPane.module.css";

export function EditorPane() {
  const viewMode = useStore((s) => s.viewMode);
  const activeTab = useActiveTab();
  const tabs = useStore((s) => s.tabs);
  const secondaryTabId = useStore((s) => s.secondaryTabId);
  const splitEditor = useStore((s) => s.splitEditor);
  const workspacePath = useStore((s) => s.workspacePath);
  const setViewMode = useStore((s) => s.setViewMode);
  const focusMode = useStore((s) => s.settings.focusMode);
  const syncSelection = useStore((s) => s.settings.syncScroll);
  const syncScrollPosition = useStore((s) => s.settings.syncScrollPosition);
  const showFrontMatter = useStore((s) => s.settings.showFrontMatter);
  const updateTabContent = useStore((s) => s.updateTabContent);
  const { handleNew, handleOpen, openFileFromPath } = useFileActions();
  const [splitPos, setSplitPos] = useState(50);
  const [tableOpen, setTableOpen] = useState(false);
  const previewRef = useRef<PreviewHandle>(null);
  const syncing = useRef(false);
  const scrollSyncing = useRef(false);

  const secondaryTab = tabs.find((t) => t.id === secondaryTabId) ?? null;
  const canSyncSelection = syncSelection && viewMode === "split";
  const canSyncScroll = syncScrollPosition && viewMode === "split";

  const dragging = useRef(false);
  const paneRef = useRef<HTMLDivElement>(null);

  const onDividerDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !paneRef.current) return;
      const rect = paneRef.current.getBoundingClientRect();
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.max(20, Math.min(80, pct)));
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const onEditorSelectionRange = useCallback(
    (fromLine: number, toLine: number) => {
      if (!canSyncSelection || syncing.current) return;
      syncing.current = true;
      previewRef.current?.highlightRange(fromLine, toLine);
      window.setTimeout(() => { syncing.current = false; }, 50);
    },
    [canSyncSelection]
  );

  const onPreviewRangeSelect = useCallback(
    (fromLine: number, toLine: number) => {
      if (!canSyncSelection || syncing.current) return;
      syncing.current = true;
      scrollEditorToRange(fromLine, toLine, { focus: false });
      window.setTimeout(() => { syncing.current = false; }, 80);
    },
    [canSyncSelection]
  );

  const onEditorScrollRatio = useCallback(
    (ratio: number) => {
      if (!canSyncScroll || scrollSyncing.current) return;
      scrollSyncing.current = true;
      previewRef.current?.scrollToRatio(ratio);
      window.setTimeout(() => { scrollSyncing.current = false; }, 30);
    },
    [canSyncScroll]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (!files.length || !activeTab) return;
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const url = await saveDroppedImage(file, activeTab.path, workspacePath);
        const snippet = `\n![${file.name}](${url})\n`;
        updateTabContent(activeTab.id, activeTab.content + snippet);
        return;
      }
      if (file.name.match(/\.(md|markdown|txt)$/i)) {
        const text = await file.text();
        updateTabContent(activeTab.id, text);
      }
    },
    [activeTab, updateTabContent, workspacePath]
  );

  const insertTable = (markdown: string) => {
    if (!activeTab) return;
    updateTabContent(activeTab.id, activeTab.content + markdown);
  };

  const slides = useMemo(() => {
    if (!activeTab) return [];
    const body = stripFrontMatter(activeTab.content);
    return body.split(/\n---\n/).map((s) => s.trim()).filter(Boolean);
  }, [activeTab?.content]);

  if (!activeTab) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyInner}>
          <div className={styles.emptyLogo}>MD</div>
          <p className={styles.emptyTitle}>Start writing</p>
          <span className={styles.emptyHint}>Create a new file or open an existing markdown document</span>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.emptyBtn} onClick={handleNew}>
              <Plus size={14} /> New file
            </button>
            <button type="button" className={styles.emptyBtn} onClick={() => void handleOpen()}>
              <FolderOpen size={14} /> Open file
            </button>
            <button type="button" className={`${styles.emptyBtn} ${styles.emptyBtnGhost}`} onClick={() => setViewMode("split")}>
              <Columns2 size={14} /> Split view
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showEditor = viewMode === "edit" || viewMode === "split";
  const showPreview = viewMode === "preview" || viewMode === "split" || viewMode === "presentation";
  const isPresentation = viewMode === "presentation";

  return (
    <div className={`${styles.pane} ${isPresentation ? styles.presentationPane : ""}`}>
      {!focusMode && !isPresentation && (
        <EditorToolbar onInsertTable={() => setTableOpen(true)} />
      )}
      {showFrontMatter && !isPresentation && <FrontMatterPanel tab={activeTab} />}
      <div
        className={styles.editorArea}
        ref={paneRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {splitEditor && secondaryTab && showEditor && !isPresentation && (
          <div className={styles.dualEditor}>
            <MarkdownEditor tab={activeTab} onSelectionRange={onEditorSelectionRange} onScrollRatio={onEditorScrollRatio} />
            <div className={styles.divider}><div className={styles.dividerLine} /></div>
            <MarkdownEditor tab={secondaryTab} />
          </div>
        )}

        {!splitEditor && showEditor && !isPresentation && (
          <div
            className={styles.editorWrap}
            style={viewMode === "split" ? { flex: `0 0 ${splitPos}%` } : undefined}
          >
            <MarkdownEditor
              tab={activeTab}
              onSelectionRange={onEditorSelectionRange}
              onScrollRatio={onEditorScrollRatio}
            />
          </div>
        )}

        {viewMode === "split" && !splitEditor && (
          <div className={styles.divider} onMouseDown={onDividerDown}>
            <div className={styles.dividerLine} />
          </div>
        )}

        {showPreview && !isPresentation && (
          <div
            className={styles.previewWrap}
            style={viewMode === "split" && !splitEditor ? { flex: `0 0 ${100 - splitPos}%` } : undefined}
          >
            <MarkdownPreview
              ref={previewRef}
              content={activeTab.content}
              filePath={activeTab.path}
              onRangeSelect={onPreviewRangeSelect}
              onWikiLink={(target) => {
                const path = resolveWikiLink(target, activeTab.path, workspacePath);
                if (path) {
                  const name = path.split(/[\\/]/).pop() ?? `${target}.md`;
                  void openFileFromPath(path, name);
                }
              }}
              syncSelection={canSyncSelection}
            />
          </div>
        )}

        {isPresentation && (
          <PresentationView slides={slides} content={activeTab.content} />
        )}
      </div>
      <TableEditorDialog open={tableOpen} onClose={() => setTableOpen(false)} onInsert={insertTable} />
    </div>
  );
}
