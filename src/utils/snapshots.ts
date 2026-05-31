export interface TabSnapshot {
  id: string;
  label: string;
  content: string;
  createdAt: number;
}

const PREFIX = "mdit-snapshots-";

export function listSnapshots(tabId: string): TabSnapshot[] {
  try {
    const raw = localStorage.getItem(PREFIX + tabId);
    if (!raw) return [];
    return JSON.parse(raw) as TabSnapshot[];
  } catch {
    return [];
  }
}

export function saveSnapshot(tabId: string, label: string, content: string): TabSnapshot {
  const snap: TabSnapshot = {
    id: crypto.randomUUID(),
    label,
    content,
    createdAt: Date.now(),
  };
  const list = [snap, ...listSnapshots(tabId)].slice(0, 20);
  localStorage.setItem(PREFIX + tabId, JSON.stringify(list));
  return snap;
}

export function deleteSnapshot(tabId: string, snapshotId: string) {
  const list = listSnapshots(tabId).filter((s) => s.id !== snapshotId);
  localStorage.setItem(PREFIX + tabId, JSON.stringify(list));
}
