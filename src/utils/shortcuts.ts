export interface ShortcutBinding {
  id: string;
  label: string;
  defaultKeys: string;
  keys: string;
}

export const SHORTCUT_DEFINITIONS: ShortcutBinding[] = [
  { id: "new", label: "New file", defaultKeys: "Ctrl+N", keys: "Ctrl+N" },
  { id: "open", label: "Open file", defaultKeys: "Ctrl+O", keys: "Ctrl+O" },
  { id: "save", label: "Save", defaultKeys: "Ctrl+S", keys: "Ctrl+S" },
  { id: "saveAs", label: "Save As", defaultKeys: "Ctrl+Shift+S", keys: "Ctrl+Shift+S" },
  { id: "find", label: "Find & replace", defaultKeys: "Ctrl+F", keys: "Ctrl+F" },
  { id: "palette", label: "Command palette", defaultKeys: "Ctrl+Shift+P", keys: "Ctrl+Shift+P" },
  { id: "sidebar", label: "Toggle sidebar", defaultKeys: "Ctrl+\\", keys: "Ctrl+\\" },
  { id: "focus", label: "Focus mode", defaultKeys: "F11", keys: "F11" },
  { id: "workspaceSearch", label: "Workspace search", defaultKeys: "Ctrl+Shift+F", keys: "Ctrl+Shift+F" },
  { id: "snapshot", label: "Save snapshot", defaultKeys: "Ctrl+Shift+K", keys: "Ctrl+Shift+K" },
];

const STORAGE_KEY = "mdit-shortcuts";

export function loadShortcutOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveShortcutOverrides(overrides: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function resetShortcutOverrides() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getShortcutBindings(): ShortcutBinding[] {
  const overrides = loadShortcutOverrides();
  return SHORTCUT_DEFINITIONS.map((s) => ({
    ...s,
    keys: overrides[s.id] ?? s.defaultKeys,
  }));
}

export function parseShortcut(keys: string): { ctrl: boolean; shift: boolean; alt: boolean; key: string } {
  const parts = keys.split("+").map((p) => p.trim());
  return {
    ctrl: parts.some((p) => p.toLowerCase() === "ctrl" || p.toLowerCase() === "cmd"),
    shift: parts.some((p) => p.toLowerCase() === "shift"),
    alt: parts.some((p) => p.toLowerCase() === "alt"),
    key: parts.filter((p) => !["ctrl", "cmd", "shift", "alt"].includes(p.toLowerCase())).join(""),
  };
}

export function matchesShortcut(e: KeyboardEvent, keys: string): boolean {
  const p = parseShortcut(keys);
  const mod = e.ctrlKey || e.metaKey;
  if (p.ctrl !== mod) return false;
  if (p.shift !== e.shiftKey) return false;
  if (p.alt !== e.altKey) return false;
  const eventKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const targetKey = p.key.length === 1 ? p.key.toLowerCase() : p.key;
  if (targetKey === "\\") return e.key === "\\";
  if (targetKey === "F11") return e.key === "F11";
  return eventKey === targetKey || eventKey.toLowerCase() === targetKey.toLowerCase();
}
