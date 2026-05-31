import { linter, Diagnostic } from "@codemirror/lint";
import type { EditorView } from "@codemirror/view";

function lineDiagnostics(doc: string): Diagnostic[] {
  const lines = doc.split("\n");
  const diags: Diagnostic[] = [];
  let prevLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const from = doc.split("\n").slice(0, i).join("\n").length + (i > 0 ? 1 : 0);

    if (/\s+$/.test(line) && line.trim()) {
      diags.push({
        from,
        to: from + line.length,
        severity: "warning",
        message: "Trailing whitespace",
      });
    }

    const heading = line.match(/^(#{1,6})\s/);
    if (heading) {
      const level = heading[1].length;
      if (level > prevLevel + 1 && prevLevel > 0) {
        diags.push({
          from,
          to: from + line.length,
          severity: "warning",
          message: `Heading skips level (H${prevLevel} → H${level})`,
        });
      }
      prevLevel = level;
    }

    const img = line.match(/!\[([^\]]*)\]\([^)]+\)/);
    if (img && !img[1].trim()) {
      diags.push({
        from,
        to: from + line.length,
        severity: "warning",
        message: "Image missing alt text",
      });
    }

    if (/^(\t|  )+[-*+]/.test(line) && !/^(\s{0,3}[-*+]|\s*\d+\.)/.test(line)) {
      diags.push({
        from,
        to: from + line.length,
        severity: "warning",
        message: "List item should use spaces, not tabs",
      });
    }
  }

  return diags;
}

export function markdownLintExtension(enabled: boolean) {
  if (!enabled) return [];
  return [linter((view: EditorView) => lineDiagnostics(view.state.doc.toString()))];
}
