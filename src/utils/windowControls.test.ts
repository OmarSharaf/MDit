import { describe, expect, it, vi } from "vitest";
import { closeWindow, isTauri, isWindowMaximized, minimizeWindow, toggleMaximizeWindow } from "./windowControls";

describe("windowControls", () => {
  it("isTauri is false in tests", () => {
    expect(isTauri()).toBe(false);
  });

  it("no-ops outside tauri", async () => {
    await expect(minimizeWindow()).resolves.toBeUndefined();
    await expect(toggleMaximizeWindow()).resolves.toBeUndefined();
    await expect(closeWindow()).resolves.toBeUndefined();
    await expect(isWindowMaximized()).resolves.toBe(false);
  });

  it("calls tauri window apis when in tauri", async () => {
    vi.stubGlobal("__TAURI_INTERNALS__", {});
    const minimize = vi.fn();
    const toggleMaximize = vi.fn();
    const close = vi.fn();
    const isMaximized = vi.fn().mockResolvedValue(true);
    vi.doMock("@tauri-apps/api/window", () => ({
      getCurrentWindow: () => ({ minimize, toggleMaximize, close, isMaximized }),
    }));
    vi.resetModules();
    const wc = await import("./windowControls");
    await wc.minimizeWindow();
    await wc.toggleMaximizeWindow();
    await wc.closeWindow();
    expect(await wc.isWindowMaximized()).toBe(true);
    expect(minimize).toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.resetModules();
  });
});
