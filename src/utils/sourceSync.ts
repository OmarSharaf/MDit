import { parseFrontMatter } from "./frontmatter";
import { extractHeadings } from "./headings";

export function getFrontMatterLineOffset(content: string): number {
  const { raw, body } = parseFrontMatter(content);
  if (!raw && body === content) return 0;
  return raw.split("\n").length + 2;
}

export function bodyLineToEditorLine(content: string, bodyLine: number): number {
  return getFrontMatterLineOffset(content) + bodyLine;
}

export function editorLineToBodyLine(content: string, editorLine: number): number {
  return Math.max(1, editorLine - getFrontMatterLineOffset(content));
}

export function editorLineFromPreviewNode(
  node: Node | null,
  content: string
): number | null {
  if (!node) return null;
  const el =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as HTMLElement | null);
  const block = el?.closest("[data-source-line]");
  if (!block) return null;
  const bodyLine = Number(block.getAttribute("data-source-line"));
  if (Number.isNaN(bodyLine)) return null;
  return bodyLineToEditorLine(content, bodyLine);
}

export function rangeFromPreviewSelection(
  previewRoot: HTMLElement | null,
  content: string
): { fromLine: number; toLine: number } | null {
  if (!previewRoot) return null;

  const selection = window.getSelection();
  if (selection && !selection.isCollapsed && selection.toString().trim()) {
    const fromLine = editorLineFromPreviewNode(selection.anchorNode, content);
    const toLine = editorLineFromPreviewNode(selection.focusNode, content);
    if (fromLine !== null && toLine !== null) {
      return { fromLine, toLine };
    }
  }

  return null;
}

export function lineFromPreviewTarget(
  previewRoot: HTMLElement | null,
  content: string
): number | null {
  if (!previewRoot) return null;

  const selection = window.getSelection();
  if (selection && !selection.isCollapsed && selection.toString().trim()) {
    const node = selection.anchorNode;
    const el =
      node?.nodeType === Node.TEXT_NODE
        ? node.parentElement
        : (node as HTMLElement | null);
    const block = el?.closest("[data-source-line]");
    if (block) {
      const bodyLine = Number(block.getAttribute("data-source-line"));
      if (!Number.isNaN(bodyLine)) {
        return bodyLineToEditorLine(content, bodyLine);
      }
    }
  }

  const active = previewRoot.querySelector("[data-source-line].syncActive");
  if (active) {
    const bodyLine = Number(active.getAttribute("data-source-line"));
    if (!Number.isNaN(bodyLine)) {
      return bodyLineToEditorLine(content, bodyLine);
    }
  }

  return null;
}

export function lineFromPreviewClick(
  target: EventTarget | null,
  content: string
): number | null {
  if (!(target instanceof HTMLElement)) return null;

  const heading = target.closest("h1,h2,h3,h4,h5,h6[id]");
  if (heading?.id) {
    const fromHeading = extractHeadings(content).find((h) => h.id === heading.id);
    if (fromHeading) return fromHeading.line;
  }

  const block = target.closest("[data-source-line]");
  if (block) {
    const bodyLine = Number(block.getAttribute("data-source-line"));
    if (!Number.isNaN(bodyLine)) {
      return bodyLineToEditorLine(content, bodyLine);
    }
  }

  return null;
}

export function nearestHeadingId(content: string, editorLine: number): string | null {
  const headings = extractHeadings(content);
  let id: string | null = null;
  for (const h of headings) {
    if (h.line <= editorLine) id = h.id;
    else break;
  }
  return id;
}
