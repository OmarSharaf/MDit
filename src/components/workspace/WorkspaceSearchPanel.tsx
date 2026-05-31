import { useState } from "react";
import { Search } from "lucide-react";
import { searchInDirectory } from "../../utils/fileSystem";
import type { WorkspaceSearchHit } from "../../utils/workspaceSearch";
import styles from "./WorkspaceSearchPanel.module.css";

interface Props {
  workspacePath: string | null;
  onOpenHit: (path: string, name: string, line?: number) => void;
}

export function WorkspaceSearchPanel({ workspacePath, onOpenHit }: Props) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<WorkspaceSearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!workspacePath || !query.trim()) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchInDirectory(workspacePath, query.trim());
      setHits(results);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.searchRow}>
        <Search size={13} className={styles.searchIcon} />
        <input
          className={styles.input}
          placeholder="Search in workspace…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void runSearch();
          }}
        />
        <button type="button" className={styles.go} onClick={() => void runSearch()} disabled={loading}>
          Go
        </button>
      </div>
      {!workspacePath && <p className={styles.hint}>Open a folder to search.</p>}
      <ul className={styles.results}>
        {hits.map((h, i) => (
          <li key={`${h.path}-${h.line}-${i}`}>
            <button
              type="button"
              className={styles.hit}
              onClick={() => onOpenHit(h.path, h.name, h.line)}
            >
              <span className={styles.file}>{h.name}:{h.line}</span>
              <span className={styles.excerpt}>{h.excerpt}</span>
            </button>
          </li>
        ))}
        {!loading && query && hits.length === 0 && workspacePath && (
          <li className={styles.empty}>No matches</li>
        )}
      </ul>
    </div>
  );
}
