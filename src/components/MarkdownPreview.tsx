import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkGemoji from "remark-gemoji";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { previewSanitizeSchema } from "../utils/previewSchema";
import { stripFrontMatter } from "../utils/frontmatter";
import { scrollEditorToLine } from "../utils/editorRef";
import { lineForHeadingId } from "../utils/headings";
import {
  editorLineToBodyLine,
  lineFromPreviewClick,
  rangeFromPreviewSelection,
  nearestHeadingId,
} from "../utils/sourceSync";
import { MermaidBlock } from "./MermaidBlock";
import { useStore } from "../store/useStore";
import { preprocessWikiLinks } from "../utils/wikiLinks";
import styles from "./MarkdownPreview.module.css";

interface Props {
  content: string;
  filePath?: string | null;
  onRangeSelect?: (fromLine: number, toLine: number) => void;
  onWikiLink?: (target: string) => void;
  syncSelection?: boolean;
}

export interface PreviewHandle {
  scrollToRatio: (ratio: number) => void;
  scrollToLine: (editorLine: number) => void;
  highlightRange: (fromLine: number, toLine: number) => void;
  clearHighlight: () => void;
}

interface MdNode {
  position?: { start: { line: number } };
}

function lineAttr(node?: MdNode) {
  const line = node?.position?.start.line;
  return line ? { "data-source-line": line } : {};
}

export const MarkdownPreview = forwardRef<PreviewHandle, Props>(function MarkdownPreview(
  { content, filePath: _filePath = null, onRangeSelect, onWikiLink, syncSelection = false },
  ref
) {
  const outerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(content);
  const onRangeSelectRef = useRef(onRangeSelect);
  contentRef.current = content;
  onRangeSelectRef.current = onRangeSelect;

  const settings = useStore((s) => s.settings);
  const previewTheme = settings.previewTheme;
  const theme = settings.theme;
  const body = preprocessWikiLinks(stripFrontMatter(content));
  const onWikiLinkRef = useRef(onWikiLink);
  onWikiLinkRef.current = onWikiLink;

  const clearHighlight = useCallback(() => {
    outerRef.current
      ?.querySelectorAll(`.${styles.syncActive}`)
      .forEach((el) => el.classList.remove(styles.syncActive));
  }, []);

  const highlightRange = useCallback((editorFromLine: number, editorToLine: number) => {
    const el = outerRef.current;
    if (!el) return;
    clearHighlight();

    const bodyFrom = editorLineToBodyLine(contentRef.current, editorFromLine);
    const bodyTo = editorLineToBodyLine(contentRef.current, editorToLine);
    const min = Math.min(bodyFrom, bodyTo);
    const max = Math.max(bodyFrom, bodyTo);

    let firstBlock: HTMLElement | null = null;
    for (const block of el.querySelectorAll<HTMLElement>("[data-source-line]")) {
      const line = Number(block.getAttribute("data-source-line"));
      if (Number.isNaN(line) || line < min || line > max) continue;
      block.classList.add(styles.syncActive);
      if (!firstBlock) firstBlock = block;
    }

    if (firstBlock) {
      firstBlock.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const anchorLine = Math.min(editorFromLine, editorToLine);
    const headingId = nearestHeadingId(contentRef.current, anchorLine);
    const heading = headingId ? el.querySelector(`#${CSS.escape(headingId)}`) : null;
    if (heading) {
      heading.classList.add(styles.syncActive);
      heading.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const totalLines = contentRef.current.split("\n").length;
    const ratio = (anchorLine - 1) / Math.max(1, totalLines - 1);
    el.scrollTop = ratio * Math.max(0, el.scrollHeight - el.clientHeight);
  }, [clearHighlight]);

  useImperativeHandle(ref, () => ({
    scrollToRatio(ratio: number) {
      const el = outerRef.current;
      if (!el) return;
      el.scrollTop = ratio * Math.max(0, el.scrollHeight - el.clientHeight);
    },
    scrollToLine(editorLine: number) {
      highlightRange(editorLine, editorLine);
    },
    highlightRange,
    clearHighlight,
  }));

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const onClick = (e: MouseEvent) => {
      const wiki = (e.target as HTMLElement).closest('a[href^="wiki:"]');
      if (wiki) {
        e.preventDefault();
        const href = wiki.getAttribute("href");
        if (href?.startsWith("wiki:")) {
          onWikiLinkRef.current?.(decodeURIComponent(href.slice(5)));
        }
        return;
      }
      const target = (e.target as HTMLElement).closest("a[href^='#']");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href?.startsWith("#")) return;
      e.preventDefault();
      const id = href.slice(1);
      const line = lineForHeadingId(content, id);
      if (line) scrollEditorToLine(line);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [content]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el || !syncSelection) return;

    const syncFromPreview = (target: EventTarget | null, fromSelection: boolean) => {
      if (fromSelection) {
        const range = rangeFromPreviewSelection(el, contentRef.current);
        if (range) {
          onRangeSelectRef.current?.(range.fromLine, range.toLine);
          return;
        }
      }

      const line = lineFromPreviewClick(target, contentRef.current);
      if (line) onRangeSelectRef.current?.(line, line);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) return;
      syncFromPreview(e.target, false);
    };

    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.anchorNode || !el.contains(sel.anchorNode)) return;
      syncFromPreview(sel.anchorNode, true);
    };

    el.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      el.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [syncSelection, content]);

  useEffect(() => clearHighlight, [content, clearHighlight]);

  const wrapBlock =
    (Tag: keyof JSX.IntrinsicElements) =>
    ({ node, children, ...props }: { node?: MdNode; children?: React.ReactNode }) => (
      <Tag {...lineAttr(node)} {...props}>
        {children}
      </Tag>
    );

  return (
    <div
      ref={outerRef}
      className={`${styles.previewOuter} ${styles[`theme-${previewTheme}`] ?? ""} ${
        settings.focusMode ? styles.presentation : ""
      }`}
    >
      <div className={styles.preview} data-mdit-preview>
        {settings.customPreviewCss && (
          <style>{settings.customPreviewCss}</style>
        )}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkGemoji]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, previewSanitizeSchema],
            rehypeSlug,
            rehypeHighlight,
            rehypeKatex,
          ]}
          urlTransform={(url) => url}
          components={{
            h1: wrapBlock("h1"),
            h2: wrapBlock("h2"),
            h3: wrapBlock("h3"),
            h4: wrapBlock("h4"),
            h5: wrapBlock("h5"),
            h6: wrapBlock("h6"),
            p: wrapBlock("p"),
            blockquote: wrapBlock("blockquote"),
            ul: wrapBlock("ul"),
            ol: wrapBlock("ol"),
            pre: wrapBlock("pre"),
            table: wrapBlock("table"),
            hr: wrapBlock("hr"),
            input: ({ type, checked, ...props }) => {
              if (type === "checkbox") {
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    className={styles.checkbox}
                    {...props}
                  />
                );
              }
              return <input type={type} {...props} />;
            },
            a: ({ href, children, node, ...props }) => (
              <a
                {...lineAttr(node)}
                href={href}
                className={href?.startsWith("wiki:") ? styles.wikiLink : undefined}
                target={href?.startsWith("#") || href?.startsWith("wiki:") ? undefined : "_blank"}
                rel={href?.startsWith("#") || href?.startsWith("wiki:") ? undefined : "noopener noreferrer"}
                {...props}
              >
                {children}
              </a>
            ),
            img: ({ src, alt, node, ...props }) => (
              <img {...lineAttr(node)} src={src} alt={alt ?? ""} loading="lazy" {...props} />
            ),
            code: ({ className, children, node, ...props }) => {
              const lang = /language-(\w+)/.exec(className || "")?.[1];
              const code = String(children).replace(/\n$/, "");
              if (lang === "mermaid") {
                return <MermaidBlock code={code} theme={theme} />;
              }
              if (className) {
                return (
                  <code className={className} {...lineAttr(node)} {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <code {...lineAttr(node)} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    </div>
  );
});
