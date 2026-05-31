import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { vi } from "vitest";

let uuidCounter = 0;
vi.stubGlobal("crypto", {
  ...globalThis.crypto,
  randomUUID: () => `00000000-0000-4000-8000-${String(++uuidCounter).padStart(12, "0")}`,
});

// CodeMirror layout measurement in jsdom
if (typeof Range !== "undefined") {
  const rect = { top: 0, left: 0, right: 100, bottom: 20, width: 100, height: 20, x: 0, y: 0, toJSON: () => ({}) };
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => [rect],
  });
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => rect,
  });
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
