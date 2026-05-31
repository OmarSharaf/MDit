export interface AppDownloadLink {
  id: "exe" | "msi";
  label: string;
  hint: string;
  /** Paste your public download URL here when ready. */
  url: string;
}

/**
 * Update the `url` fields below with your hosted installer links.
 * Leave empty until links are available — menu items stay visible but disabled.
 */
export const APP_DOWNLOAD_LINKS: AppDownloadLink[] = [
  {
    id: "exe",
    label: "Windows (.exe)",
    hint: "Portable executable",
    url: "",
  },
  {
    id: "msi",
    label: "Windows (.msi)",
    hint: "MSI installer package",
    url: "",
  },
];

export function isDownloadLinkReady(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.length > 0 && trimmed !== "#";
}
