import {
  Bold, Italic, Strikethrough, Code, Link, Image,
  List, ListOrdered, Quote, Minus, Table, FileCode,
  Heading1, Heading2, Heading3, CheckSquare
} from "lucide-react";
import { useActiveTab, useStore } from "../store/useStore";
import { wrapSelection, insertAtLine, insertSnippet, SNIPPETS } from "../utils/markdown";
import { applyEditorFormat } from "../utils/editorRef";
import { ExportMenu } from "./ExportMenu";
import styles from "./EditorToolbar.module.css";

function useFormat() {
  const activeTab = useActiveTab();
  const updateTabContent = useStore((s) => s.updateTabContent);

  const applyFormat = (
    fn: (val: string, start: number, end: number) => {
      value: string;
      selectionStart: number;
      selectionEnd: number;
    }
  ) => {
    if (!activeTab) return;
    const result = applyEditorFormat(fn);
    if (result !== null) updateTabContent(activeTab.id, result);
  };

  return {
    bold: () => applyFormat((v, s, e) => wrapSelection(v, s, e, "**", "**")),
    italic: () => applyFormat((v, s, e) => wrapSelection(v, s, e, "_", "_")),
    strikethrough: () => applyFormat((v, s, e) => wrapSelection(v, s, e, "~~", "~~")),
    inlineCode: () => applyFormat((v, s, e) => wrapSelection(v, s, e, "`", "`")),
    link: () => applyFormat((v, s, e) => wrapSelection(v, s, e, "[", "](https://)")),
    image: () => applyFormat((v, s, e) => wrapSelection(v, s, e, "![", "](image-url)")),
    h1: () => applyFormat((v, s) => insertAtLine(v, s, "# ")),
    h2: () => applyFormat((v, s) => insertAtLine(v, s, "## ")),
    h3: () => applyFormat((v, s) => insertAtLine(v, s, "### ")),
    ul: () => applyFormat((v, s) => insertAtLine(v, s, "- ")),
    ol: () => applyFormat((v, s) => insertAtLine(v, s, "1. ")),
    task: () => applyFormat((v, s) => insertAtLine(v, s, "- [ ] ")),
    quote: () => applyFormat((v, s) => insertAtLine(v, s, "> ")),
    hr: () => applyFormat((v, s) => insertSnippet(v, s, "\n---\n")),
    table: () => applyFormat((v, s) => insertSnippet(v, s, "\n" + SNIPPETS.table)),
    codeBlock: () => applyFormat((v, s) => insertSnippet(v, s, "\n```\n\n```", 5)),
  };
}

interface BtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  kbd?: string;
}

function Btn({ icon, label, onClick, kbd }: BtnProps) {
  return (
    <button
      className={styles.btn}
      onClick={onClick}
      title={kbd ? `${label} (${kbd})` : label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div className={styles.sep} />;
}

export function EditorToolbar({ onInsertTable }: { onInsertTable?: () => void }) {
  const fmt = useFormat();

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <Btn icon={<Heading1 size={13} />} label="Heading 1" onClick={fmt.h1} />
        <Btn icon={<Heading2 size={13} />} label="Heading 2" onClick={fmt.h2} />
        <Btn icon={<Heading3 size={13} />} label="Heading 3" onClick={fmt.h3} />
      </div>
      <Sep />
      <div className={styles.group}>
        <Btn icon={<Bold size={13} />} label="Bold" onClick={fmt.bold} kbd="Ctrl+B" />
        <Btn icon={<Italic size={13} />} label="Italic" onClick={fmt.italic} kbd="Ctrl+I" />
        <Btn icon={<Strikethrough size={13} />} label="Strikethrough" onClick={fmt.strikethrough} />
        <Btn icon={<Code size={13} />} label="Inline code" onClick={fmt.inlineCode} />
      </div>
      <Sep />
      <div className={styles.group}>
        <Btn icon={<List size={13} />} label="Bullet list" onClick={fmt.ul} />
        <Btn icon={<ListOrdered size={13} />} label="Numbered list" onClick={fmt.ol} />
        <Btn icon={<CheckSquare size={13} />} label="Task list" onClick={fmt.task} />
        <Btn icon={<Quote size={13} />} label="Blockquote" onClick={fmt.quote} />
      </div>
      <Sep />
      <div className={styles.group}>
        <Btn icon={<Link size={13} />} label="Link" onClick={fmt.link} kbd="Ctrl+K" />
        <Btn icon={<Image size={13} />} label="Image" onClick={fmt.image} />
        <Btn icon={<Table size={13} />} label="Table editor" onClick={onInsertTable ?? fmt.table} />
        <Btn icon={<FileCode size={13} />} label="Code block" onClick={fmt.codeBlock} />
        <Btn icon={<Minus size={13} />} label="Horizontal rule" onClick={fmt.hr} />
      </div>
      <ExportMenu />
    </div>
  );
}
