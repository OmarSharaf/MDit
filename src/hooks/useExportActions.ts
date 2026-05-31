import { useCallback } from "react";
import { useStore, useActiveTab } from "../store/useStore";
import {
  buildExportHtml,
  copyHtmlToClipboard,
  copyMarkdownToClipboard,
  defaultExportName,
  getPreviewBodyHtml,
  markdownToPlainText,
  printHtml,
} from "../utils/export";
import {
  buildSelfContainedHtml,
  exportAsDocxBlob,
  exportAsOdtBlob,
} from "../utils/exportEnhanced";
import { saveExportFile } from "../utils/fileSystem";
import { promptPublishWorkspace } from "../utils/publish";

export function useExportActions() {
  const activeTab = useActiveTab();
  const settings = useStore((s) => s.settings);
  const theme = settings.theme;
  const workspacePath = useStore((s) => s.workspacePath);
  const setSaveStatus = useStore((s) => s.setSaveStatus);

  const notify = useCallback(
    (ok: boolean, success: string, fail = "Export failed") => {
      setSaveStatus(ok ? "saved" : "error", ok ? success : fail);
      setTimeout(() => setSaveStatus("idle"), 2500);
    },
    [setSaveStatus]
  );

  const exportHtml = useCallback(async () => {
    if (!activeTab) return;
    try {
      const bodyHtml = getPreviewBodyHtml();
      const html = buildSelfContainedHtml(
        activeTab.name,
        bodyHtml,
        theme,
        settings.customPreviewCss
      );
      const name = defaultExportName(activeTab.name, "html");
      const path = await saveExportFile(html, name, [
        { name: "HTML", extensions: ["html", "htm"] },
      ]);
      notify(!!path, "Exported self-contained HTML");
    } catch {
      notify(false, "", "HTML export failed");
    }
  }, [activeTab, theme, settings.customPreviewCss, notify]);

  const exportMarkdown = useCallback(async () => {
    if (!activeTab) return;
    try {
      const name = defaultExportName(activeTab.name, "md");
      const path = await saveExportFile(activeTab.content, name, [
        { name: "Markdown", extensions: ["md", "markdown"] },
      ]);
      notify(!!path, "Exported Markdown");
    } catch {
      notify(false, "", "Markdown export failed");
    }
  }, [activeTab, notify]);

  const exportPlainText = useCallback(async () => {
    if (!activeTab) return;
    try {
      const text = markdownToPlainText(activeTab.content);
      const name = defaultExportName(activeTab.name, "txt");
      const path = await saveExportFile(text, name, [
        { name: "Plain text", extensions: ["txt"] },
      ]);
      notify(!!path, "Exported plain text");
    } catch {
      notify(false, "", "Text export failed");
    }
  }, [activeTab, notify]);

  const exportDocx = useCallback(async () => {
    if (!activeTab) return;
    try {
      const bodyHtml = getPreviewBodyHtml();
      const blob = exportAsDocxBlob(activeTab.name, bodyHtml);
      const name = defaultExportName(activeTab.name, "doc");
      const path = await saveExportFile(await blob.text(), name, [
        { name: "Word", extensions: ["doc"] },
      ]);
      notify(!!path, "Exported Word document");
    } catch {
      notify(false, "", "DOCX export failed");
    }
  }, [activeTab, notify]);

  const exportOdt = useCallback(async () => {
    if (!activeTab) return;
    try {
      const text = markdownToPlainText(activeTab.content);
      const blob = exportAsOdtBlob(activeTab.name, text);
      const name = defaultExportName(activeTab.name, "odt");
      const path = await saveExportFile(await blob.text(), name, [
        { name: "OpenDocument", extensions: ["odt"] },
      ]);
      notify(!!path, "Exported ODT");
    } catch {
      notify(false, "", "ODT export failed");
    }
  }, [activeTab, notify]);

  const publishFolder = useCallback(async () => {
    if (!workspacePath) {
      notify(false, "", "Open a workspace folder first");
      return;
    }
    try {
      const count = await promptPublishWorkspace(workspacePath, theme);
      notify(!!count, count ? `Published ${count} files` : "Publish cancelled");
    } catch {
      notify(false, "", "Publish failed");
    }
  }, [workspacePath, theme, notify]);

  const copyHtml = useCallback(async () => {
    if (!activeTab) return;
    try {
      const bodyHtml = getPreviewBodyHtml();
      const html = buildExportHtml(activeTab.name, bodyHtml, theme);
      await copyHtmlToClipboard(html);
      notify(true, "HTML copied to clipboard");
    } catch {
      notify(false, "", "Copy failed");
    }
  }, [activeTab, theme, notify]);

  const copyMarkdown = useCallback(async () => {
    if (!activeTab) return;
    try {
      await copyMarkdownToClipboard(activeTab.content);
      notify(true, "Markdown copied to clipboard");
    } catch {
      notify(false, "", "Copy failed");
    }
  }, [activeTab, notify]);

  const exportPdf = useCallback(() => {
    if (!activeTab) return;
    try {
      const bodyHtml = getPreviewBodyHtml();
      printHtml(buildSelfContainedHtml(activeTab.name, bodyHtml, theme, settings.customPreviewCss));
      notify(true, "Opened print dialog");
    } catch {
      notify(false, "", "Print failed");
    }
  }, [activeTab, theme, settings.customPreviewCss, notify]);

  return {
    exportHtml,
    exportMarkdown,
    exportPlainText,
    exportDocx,
    exportOdt,
    publishFolder,
    exportPdf,
    copyHtml,
    copyMarkdown,
    hasActiveTab: !!activeTab,
  };
}
