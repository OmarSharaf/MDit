import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download, FileCode, FileText, Copy, Printer, ChevronDown,
} from "lucide-react";
import { useExportActions } from "../hooks/useExportActions";
import styles from "./ExportMenu.module.css";

const MENU_MIN_WIDTH = 210;

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number } | null>(
    null
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
    hasActiveTab,
  } = useExportActions();

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const minWidth = Math.max(MENU_MIN_WIDTH, rect.width);
    setMenuStyle({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - minWidth),
      minWidth,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const run = (action: () => void | Promise<void>) => {
    void action();
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        disabled={!hasActiveTab}
        title="Export document"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download size={13} />
        <span>Export</span>
        <ChevronDown size={11} className={open ? styles.chevronOpen : ""} />
      </button>

      {open &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            className={styles.menu}
            style={{
              position: "fixed",
              top: menuStyle.top,
              left: menuStyle.left,
              minWidth: menuStyle.minWidth,
            }}
            role="menu"
          >
            <button type="button" className={styles.item} onClick={() => run(exportHtml)}>
              <FileCode size={13} />
              <span>Export as HTML</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(exportMarkdown)}>
              <FileText size={13} />
              <span>Export as Markdown</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(exportPlainText)}>
              <FileText size={13} />
              <span>Export as plain text</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(exportDocx)}>
              <FileText size={13} />
              <span>Export as Word (.doc)</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(exportOdt)}>
              <FileText size={13} />
              <span>Export as ODT</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(publishFolder)}>
              <Download size={13} />
              <span>Publish workspace site</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(exportPdf)}>
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>
            <div className={styles.divider} />
            <button type="button" className={styles.item} onClick={() => run(copyHtml)}>
              <Copy size={13} />
              <span>Copy rendered HTML</span>
            </button>
            <button type="button" className={styles.item} onClick={() => run(copyMarkdown)}>
              <Copy size={13} />
              <span>Copy Markdown</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
