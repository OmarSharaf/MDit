import { useState } from "react";
import { X, FileText, Pin, Plus } from "lucide-react";
import { useStore } from "../store/useStore";
import styles from "./TabBar.module.css";

export function TabBar() {
  const tabs = useStore((s) => s.tabs);
  const activeTabId = useStore((s) => s.activeTabId);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const closeTab = useStore((s) => s.closeTab);
  const createTab = useStore((s) => s.createTab);
  const pinTab = useStore((s) => s.pinTab);
  const reorderTabs = useStore((s) => s.reorderTabs);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sorted = [...tabs].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return tabs.indexOf(a) - tabs.indexOf(b);
  });

  const handleClose = (id: string, name: string, isDirty: boolean) => {
    if (isDirty && !confirm(`"${name}" has unsaved changes. Close anyway?`)) return;
    closeTab(id, true);
  };

  return (
    <div className={styles.tabBar}>
      {sorted.map((tab) => {
        const realIndex = tabs.findIndex((t) => t.id === tab.id);
        return (
          <div
            key={tab.id}
            draggable
            onDragStart={() => setDragIndex(realIndex)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== realIndex) {
                reorderTabs(dragIndex, realIndex);
              }
              setDragIndex(null);
            }}
            className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ""} ${
              tab.pinned ? styles.pinned : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                handleClose(tab.id, tab.name, tab.isDirty);
              }
            }}
            title={tab.path ?? tab.name}
          >
            {tab.pinned && <Pin size={9} className={styles.pinIcon} />}
            <FileText size={11} className={styles.tabIcon} />
            <span className={styles.tabName}>{tab.name}</span>
            {tab.isDirty && <span className={styles.dirty}>●</span>}
            <button
              className={styles.pinBtn}
              onClick={(e) => {
                e.stopPropagation();
                pinTab(tab.id);
              }}
              title={tab.pinned ? "Unpin tab" : "Pin tab"}
            >
              <Pin size={9} />
            </button>
            <button
              className={styles.closeBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleClose(tab.id, tab.name, tab.isDirty);
              }}
              title="Close tab"
            >
              <X size={10} />
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className={styles.newTabBtn}
        onClick={() => createTab()}
        title="New tab (Ctrl+N)"
      >
        <Plus size={14} />
      </button>
      <div className={styles.spacer} />
    </div>
  );
}
