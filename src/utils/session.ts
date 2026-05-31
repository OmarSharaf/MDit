import type { ViewMode } from "../store/useStore";

const SESSION_KEY = "mdit-session";

export interface SessionTab {
  name: string;
  path: string | null;
  pinned: boolean;
}

export interface SessionData {
  tabs: SessionTab[];
  activeTabId: string | null;
  activeTabPath: string | null;
  viewMode: ViewMode;
  workspacePath: string | null;
  sidebarOpen: boolean;
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function saveSession(data: SessionData) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
