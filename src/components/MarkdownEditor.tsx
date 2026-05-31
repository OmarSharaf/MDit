import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, lineNumbers, scrollPastEnd, keymap } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { useStore, FileTab } from "../store/useStore";
import { setEditorView, getEditorView } from "../utils/editorRef";
import { markdownLintExtension } from "../utils/markdownLint";
import { filterSlashCommands } from "../utils/slashCommands";
import styles from "./MarkdownEditor.module.css";

interface Props {
  tab: FileTab;
  onSelectionRange?: (fromLine: number, toLine: number) => void;
  onScrollRatio?: (ratio: number) => void;
}

export function MarkdownEditor({ tab, onSelectionRange, onScrollRatio }: Props) {
  const updateTabContent = useStore((s) => s.updateTabContent);
  const setEditorCursor = useStore((s) => s.setEditorCursor);
  const settings = useStore((s) => s.settings);
  const openSearch = useStore((s) => s.openSearch);
  const onSelectionRangeRef = useRef(onSelectionRange);
  const onScrollRatioRef = useRef(onScrollRatio);
  onSelectionRangeRef.current = onSelectionRange;
  onScrollRatioRef.current = onScrollRatio;

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  useEffect(() => () => setEditorView(null), []);

  const listenerExtension = useMemo(
    () =>
      EditorView.updateListener.of((update) => {
        if (update.selectionSet) {
          const main = update.state.selection.main;
          const fromLine = update.state.doc.lineAt(main.from).number;
          const toLine = update.state.doc.lineAt(main.to).number;
          setEditorCursor(
            update.state.doc.lineAt(main.head).number,
            main.head - update.state.doc.lineAt(main.head).from + 1
          );
          onSelectionRangeRef.current?.(fromLine, toLine);
        }
        if (update.docChanged) {
          const line = update.state.doc.lineAt(update.state.selection.main.head);
          const lineText = line.text;
          if (lineText.startsWith("/")) {
            setSlashOpen(true);
            setSlashQuery(lineText.slice(1));
            setSlashIndex(0);
          } else {
            setSlashOpen(false);
          }
        }
      }),
    [setEditorCursor]
  );

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      ...(settings.wordWrap ? [EditorView.lineWrapping] : []),
      scrollPastEnd(),
      ...(settings.showLineNumbers ? [lineNumbers()] : []),
      listenerExtension,
      ...markdownLintExtension(settings.markdownLint),
      ...(settings.editorKeymap === "emacs"
        ? [keymap.of([...defaultKeymap, ...historyKeymap])]
        : []),
      ...(settings.editorKeymap === "vim" ? [vim()] : []),
      EditorView.contentAttributes.of({ spellcheck: String(settings.spellCheck) }),
      EditorView.theme({
        "&": { height: "100%", fontSize: `${settings.fontSize}px` },
        ".cm-scroller": {
          fontFamily: "var(--font-mono)",
          lineHeight: String(settings.lineHeight),
          overflow: "auto",
        },
        ".cm-content": {
          caretColor: "var(--acc)",
          padding: "24px 32px",
          minHeight: "100%",
        },
        ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--acc)" },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
          backgroundColor: "var(--acc-dim) !important",
        },
        ".cm-gutters": {
          backgroundColor: "var(--bg-1)",
          color: "var(--txt-3)",
          border: "none",
        },
        ".cm-lintRange-warning": { backgroundImage: "none", borderBottom: "2px wavy var(--warn)" },
      }),
    ],
    [
      settings.wordWrap,
      settings.showLineNumbers,
      settings.fontSize,
      settings.lineHeight,
      settings.markdownLint,
      settings.editorKeymap,
      settings.spellCheck,
      listenerExtension,
    ]
  );

  const onChange = useCallback(
    (value: string) => updateTabContent(tab.id, value),
    [tab.id, updateTabContent]
  );

  const onCreateEditor = useCallback((view: EditorView) => {
    setEditorView(view);
    const onScroll = () => {
      const el = view.scrollDOM;
      const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      onScrollRatioRef.current?.(ratio);
    };
    view.scrollDOM.addEventListener("scroll", onScroll, { passive: true });
  }, []);

  const applySlash = (snippet: string) => {
    const view = getEditorView();
    if (!view) return;
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    view.dispatch({
      changes: { from: line.from, to: line.to, insert: snippet },
      selection: { anchor: line.from + snippet.length },
    });
    setSlashOpen(false);
    view.focus();
  };

  const slashItems = filterSlashCommands(slashQuery);

  return (
    <div
      className={`${styles.wrap} ${settings.typewriterMode ? styles.typewriter : ""}`}
      onKeyDown={(e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (mod && e.key.toLowerCase() === "f") {
          e.preventDefault();
          openSearch();
        }
        if (slashOpen && slashItems.length) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSlashIndex((i) => Math.min(i + 1, slashItems.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSlashIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            applySlash(slashItems[slashIndex]?.snippet ?? "");
          }
          if (e.key === "Escape") setSlashOpen(false);
        }
      }}
    >
      <CodeMirror
        key={`${tab.id}-${settings.fontSize}-${settings.editorKeymap}-${settings.markdownLint}`}
        value={tab.content}
        height="100%"
        theme={settings.theme === "dark" ? oneDark : "light"}
        extensions={extensions}
        onChange={onChange}
        onCreateEditor={onCreateEditor}
        basicSetup={{
          lineNumbers: false,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
        }}
      />
      {slashOpen && slashItems.length > 0 && (
        <div className={styles.slashMenu} role="listbox" aria-label="Slash commands">
          {slashItems.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              role="option"
              aria-selected={i === slashIndex}
              className={i === slashIndex ? styles.slashActive : ""}
              onClick={() => applySlash(cmd.snippet)}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
