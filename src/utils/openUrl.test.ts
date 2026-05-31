import { describe, expect, it, vi, beforeEach } from "vitest";

const shellOpen = vi.fn();
vi.mock("@tauri-apps/plugin-shell", () => ({
  open: (...args: unknown[]) => shellOpen(...args),
}));

import { openExternalUrl } from "./openUrl";

describe("openUrl", () => {
  beforeEach(() => {
    shellOpen.mockClear();
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
  });

  it("opens in browser when not tauri", async () => {
    const open = vi.fn();
    vi.spyOn(window, "open").mockImplementation(open);
    await openExternalUrl("https://example.com");
    expect(open).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer");
    vi.mocked(window.open).mockRestore();
  });

  it("uses tauri shell when available", async () => {
    vi.stubGlobal("__TAURI_INTERNALS__", {});
    await openExternalUrl("https://example.com");
    expect(shellOpen).toHaveBeenCalledWith("https://example.com");
    vi.unstubAllGlobals();
  });
});
