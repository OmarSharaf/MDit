export interface AppDownloadLink {
  id: "exe" | "msi";
  label: string;
  hint: string;
  /** Paste your public download URL here when ready. */
  url: string;
}

/** GitHub Release v1.0.0 — https://github.com/OmarSharaf/MDit/releases/tag/v1.0.0 */
export const APP_DOWNLOAD_LINKS: AppDownloadLink[] = [
  {
    id: "exe",
    label: "Windows (.exe)",
    hint: "Setup installer (NSIS)",
    url: "https://github.com/OmarSharaf/MDit/releases/download/v1.0.0/MDit_1.0.0_x64-setup.exe",
  },
  {
    id: "msi",
    label: "Windows (.msi)",
    hint: "MSI installer package",
    url: "https://github.com/OmarSharaf/MDit/releases/download/v1.0.0/MDit_1.0.0_x64_en-US.msi",
  },
];

export function isDownloadLinkReady(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.length > 0 && trimmed !== "#";
}
