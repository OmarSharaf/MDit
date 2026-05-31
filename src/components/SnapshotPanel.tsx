import { listSnapshots, saveSnapshot, deleteSnapshot, type TabSnapshot } from "../utils/snapshots";
import { X, RotateCcw, Trash2, Save } from "lucide-react";
import styles from "./SnapshotPanel.module.css";

interface Props {
  open: boolean;
  tabId: string;
  tabName: string;
  content: string;
  onClose: () => void;
  onRestore: (content: string) => void;
}

export function SnapshotPanel({ open, tabId, tabName, content, onClose, onRestore }: Props) {
  if (!open) return null;
  const snaps = listSnapshots(tabId);

  const handleSave = () => {
    const label = prompt("Snapshot label:", `Before edit — ${new Date().toLocaleString()}`);
    if (!label) return;
    saveSnapshot(tabId, label, content);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Snapshots — {tabName}</h3>
          <button type="button" onClick={onClose}><X size={14} /></button>
        </div>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          <Save size={13} /> Save snapshot
        </button>
        <ul className={styles.list}>
          {snaps.map((s: TabSnapshot) => (
            <li key={s.id} className={styles.item}>
              <div>
                <div className={styles.label}>{s.label}</div>
                <div className={styles.date}>{new Date(s.createdAt).toLocaleString()}</div>
              </div>
              <div className={styles.actions}>
                <button type="button" title="Restore" onClick={() => { onRestore(s.content); onClose(); }}>
                  <RotateCcw size={13} />
                </button>
                <button type="button" title="Delete" onClick={() => deleteSnapshot(tabId, s.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
          {!snaps.length && <li className={styles.empty}>No snapshots yet</li>}
        </ul>
      </div>
    </div>
  );
}
