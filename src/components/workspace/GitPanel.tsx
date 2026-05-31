import { useEffect, useState } from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { getGitRepoStatus, type GitRepoStatus } from "../../utils/gitStatus";
import { isTauriApp } from "../../utils/fileSystem";
import { joinPath } from "../../utils/pathUtils";
import styles from "./GitPanel.module.css";

interface Props {
  workspacePath: string | null;
  onOpenFile: (path: string) => void;
}

export function GitPanel({ workspacePath, onOpenFile }: Props) {
  const [status, setStatus] = useState<GitRepoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const desktop = isTauriApp();

  const refresh = async () => {
    if (!workspacePath) return;
    setLoading(true);
    try {
      setStatus(await getGitRepoStatus(workspacePath));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [workspacePath]);

  if (!workspacePath) {
    return <p className={styles.hint}>Open a folder to view Git status.</p>;
  }

  if (!desktop) {
    return (
      <div className={styles.panel}>
        <p className={styles.hint}>
          Git status needs the MDit desktop app. In the browser you can still browse, edit, and save
          files in your opened folder.
        </p>
      </div>
    );
  }

  if (!status?.available) {
    return (
      <div className={styles.panel}>
        <p className={styles.hint}>{status?.error ?? "Git not available for this folder."}</p>
        <button type="button" className={styles.refresh} onClick={() => void refresh()} disabled={loading}>
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <GitBranch size={13} />
        <span>{status.branch}</span>
        <span className={status.clean ? styles.clean : styles.dirty}>
          {status.clean ? "Clean" : `${status.files.length} changed`}
        </span>
        <button type="button" className={styles.iconBtn} onClick={() => void refresh()} disabled={loading}>
          <RefreshCw size={12} />
        </button>
      </div>
      <ul className={styles.list}>
        {status.files.map((f) => (
          <li key={f.path}>
            <button
              type="button"
              className={styles.file}
              onClick={() => {
                const full = f.path.includes(":\\") || f.path.startsWith("/")
                  ? f.path
                  : joinPath(workspacePath, f.path) ?? f.path;
                onOpenFile(full);
              }}
            >
              <span className={styles.code}>{f.status || "?"}</span>
              <span>{f.path}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
