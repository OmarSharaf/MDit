import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Download, FileBox, MonitorDown } from "lucide-react";
import { APP_DOWNLOAD_LINKS, isDownloadLinkReady } from "../constants/downloads";
import { openExternalUrl } from "../utils/openUrl";
import { useStore } from "../store/useStore";
import styles from "./DownloadMenu.module.css";

const MENU_MIN_WIDTH = 240;

interface Props {
  variant?: "default" | "about" | "corner";
}

export function DownloadMenu({ variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number } | null>(
    null
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const setSaveStatus = useStore((s) => s.setSaveStatus);
  const isAbout = variant === "about";
  const isCorner = variant === "corner";

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const minWidth = Math.max(MENU_MIN_WIDTH, rect.width);
    setMenuStyle({
      top: rect.bottom + 6,
      left: isAbout
        ? Math.max(8, rect.left)
        : Math.max(8, rect.right - minWidth), // corner + default: align menu to trigger right edge
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
  }, [open, isAbout, isCorner]);

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

  const handleDownload = (url: string, label: string) => {
    if (!isDownloadLinkReady(url)) {
      setSaveStatus("error", "Download link not set yet");
      setTimeout(() => setSaveStatus("idle"), 2500);
      return;
    }
    void openExternalUrl(url);
    setOpen(false);
    setSaveStatus("saved", `Opening ${label}`);
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const iconFor = (id: "exe" | "msi") =>
    id === "exe" ? <MonitorDown size={14} /> : <FileBox size={14} />;

  return (
    <div
      className={`${styles.wrap} ${isAbout ? styles.wrapAbout : ""}`}
      ref={rootRef}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isAbout ? styles.triggerAbout : ""} ${
          isCorner ? styles.triggerCorner : ""
        } ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Download MDit for Windows"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Download size={13} />
        <span>Download</span>
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
            {APP_DOWNLOAD_LINKS.map((item) => {
              const ready = isDownloadLinkReady(item.url);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.item} ${!ready ? styles.itemPending : ""}`}
                  onClick={() => handleDownload(item.url, item.label)}
                  title={ready ? item.url : "Download link not configured yet"}
                >
                  {iconFor(item.id)}
                  <span className={styles.itemText}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    <span className={styles.itemHint}>
                      {ready ? item.hint : `${item.hint} · `}
                      {!ready && <span className={styles.pending}>Link coming soon</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
