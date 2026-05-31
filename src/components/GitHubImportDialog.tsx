import { useEffect, useRef, useState } from "react";
import { X, Github, Loader2 } from "lucide-react";
import { importFromGitHubUrl, GitHubImportError } from "../utils/githubImport";
import { importGitHubRepoAsZip, isGitHubRepoUrl, GitHubRepoImportError } from "../utils/githubRepoImport";
import styles from "./GitHubImportDialog.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: (name: string, content: string) => void;
}

export function GitHubImportDialog({ open, onClose, onImported }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setUrl("");
    setError("");
    setLoading(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isGitHubRepoUrl(url)) {
        const { files } = await importGitHubRepoAsZip(url);
        for (const file of files) {
          onImported(file.path.split("/").pop() ?? file.path, file.content);
        }
      } else {
        const result = await importFromGitHubUrl(url);
        onImported(result.name, result.content);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof GitHubImportError || err instanceof GitHubRepoImportError
          ? err.message
          : "Import failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Github size={16} />
            Import from GitHub
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.hint}>
            Paste a public GitHub file, Gist, or repository URL. Files open in new tabs — use{" "}
            <strong>Save As</strong> to store locally.
          </p>

          <input
            ref={inputRef}
            className={styles.input}
            type="url"
            placeholder="https://github.com/user/repo or …/blob/main/README.md"
            value={url}
            disabled={loading}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
              if (e.key === "Escape") onClose();
            }}
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.examples}>
            <span>github.com/…/blob/main/docs/guide.md</span>
            <span>raw.githubusercontent.com/…/README.md</span>
            <span>gist.github.com/user/abc123…</span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className={styles.btnPrimary} onClick={() => void submit()} disabled={loading}>
              {loading ? <Loader2 size={14} className={styles.spin} /> : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
