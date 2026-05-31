import { useState } from "react";
import { X } from "lucide-react";
import styles from "./TableEditorDialog.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

export function TableEditorDialog({ open, onClose, onInsert }: Props) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headers, setHeaders] = useState(true);

  if (!open) return null;

  const build = () => {
    const r = Math.max(1, Math.min(20, rows));
    const c = Math.max(1, Math.min(10, cols));
    const lines: string[] = [];
    if (headers) {
      lines.push(`| ${Array(c).fill("Header").join(" | ")} |`);
      lines.push(`| ${Array(c).fill("---").join(" | ")} |`);
    }
    for (let i = 0; i < (headers ? r - 1 : r); i++) {
      lines.push(`| ${Array(c).fill(" ").join(" | ")} |`);
    }
    onInsert(`\n${lines.join("\n")}\n`);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Insert table</h3>
          <button type="button" onClick={onClose}><X size={14} /></button>
        </div>
        <label className={styles.field}>
          Rows
          <input type="number" min={1} max={20} value={rows} onChange={(e) => setRows(+e.target.value)} />
        </label>
        <label className={styles.field}>
          Columns
          <input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(+e.target.value)} />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={headers} onChange={(e) => setHeaders(e.target.checked)} />
          Header row
        </label>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className={styles.primary} onClick={build}>Insert</button>
        </div>
      </div>
    </div>
  );
}
