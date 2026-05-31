import { useEffect, useRef } from "react";
import { X, ChevronUp, ChevronDown, Replace, ReplaceAll } from "lucide-react";
import { useStore, useActiveTab } from "../store/useStore";
import { searchText, replaceTextAll, replaceTextOne } from "../utils/markdown";
import { EditorView } from "@codemirror/view";
import { getEditorView } from "../utils/editorRef";
import styles from "./SearchOverlay.module.css";

export function SearchOverlay() {
  const search = useStore((s) => s.search);
  const activeTab = useActiveTab();
  const closeSearch = useStore((s) => s.closeSearch);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const setReplaceQuery = useStore((s) => s.setReplaceQuery);
  const setSearchMatches = useStore((s) => s.setSearchMatches);
  const nextMatch = useStore((s) => s.nextMatch);
  const prevMatch = useStore((s) => s.prevMatch);
  const toggleCaseSensitive = useStore((s) => s.toggleCaseSensitive);
  const toggleRegex = useStore((s) => s.toggleRegex);
  const updateTabContent = useStore((s) => s.updateTabContent);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on open
  useEffect(() => {
    if (search.isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [search.isOpen]);

  // Run search when query/content/options change
  useEffect(() => {
    if (!search.query || !activeTab) {
      setSearchMatches([], 0);
      return;
    }
    const matches = searchText(
      activeTab.content,
      search.query,
      search.caseSensitive,
      search.useRegex
    );
    setSearchMatches(matches, 0);
  }, [search.query, search.caseSensitive, search.useRegex, activeTab?.content]);

  // Highlight in editor
  useEffect(() => {
    const view = getEditorView();
    if (!view || !search.matches.length) return;
    const pos = search.matches[search.currentMatch];
    const end = pos + search.query.length;
    view.dispatch({
      selection: { anchor: pos, head: end },
      effects: EditorView.scrollIntoView(pos, { y: "center" }),
    });
    view.focus();
  }, [search.currentMatch, search.matches, search.query]);

  const handleReplaceOne = () => {
    if (!activeTab) return;
    const newContent = replaceTextOne(
      activeTab.content,
      search.query,
      search.replaceQuery,
      search.currentMatch,
      search.caseSensitive,
      search.useRegex
    );
    updateTabContent(activeTab.id, newContent);
  };

  const handleReplaceAll = () => {
    if (!activeTab) return;
    const newContent = replaceTextAll(
      activeTab.content,
      search.query,
      search.replaceQuery,
      search.caseSensitive,
      search.useRegex
    );
    updateTabContent(activeTab.id, newContent);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { closeSearch(); return; }
    if (e.key === "Enter") {
      e.shiftKey ? prevMatch() : nextMatch();
    }
  };

  if (!search.isOpen) return null;

  const total = search.matches.length;
  const current = total ? search.currentMatch + 1 : 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.row}>
        <div className={styles.inputWrap}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder="Find..."
            value={search.query}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
          />
          <div className={styles.inputOpts}>
            <button
              className={`${styles.optBtn} ${search.caseSensitive ? styles.active : ""}`}
              onClick={toggleCaseSensitive}
              title="Case sensitive"
            >Aa</button>
            <button
              className={`${styles.optBtn} ${search.useRegex ? styles.active : ""}`}
              onClick={toggleRegex}
              title="Use regex"
            >.*</button>
          </div>
        </div>
        <span className={styles.counter}>{total ? `${current}/${total}` : "0/0"}</span>
        <button className={styles.navBtn} onClick={prevMatch} title="Previous (Shift+Enter)">
          <ChevronUp size={13} />
        </button>
        <button className={styles.navBtn} onClick={nextMatch} title="Next (Enter)">
          <ChevronDown size={13} />
        </button>
        <button className={styles.closeBtn} onClick={closeSearch} title="Close (Esc)">
          <X size={13} />
        </button>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Replace with..."
          value={search.replaceQuery}
          onChange={(e) => setReplaceQuery(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
        />
        <button className={styles.replaceBtn} onClick={handleReplaceOne} title="Replace one">
          <Replace size={12} /> <span>Replace</span>
        </button>
        <button className={styles.replaceBtn} onClick={handleReplaceAll} title="Replace all">
          <ReplaceAll size={12} /> <span>All</span>
        </button>
      </div>
    </div>
  );
}
