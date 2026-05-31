import { describe, expect, it, beforeEach } from "vitest";
import { deleteSnapshot, listSnapshots, saveSnapshot } from "./snapshots";

describe("snapshots", () => {
  beforeEach(() => localStorage.clear());

  it("saves, lists, and deletes snapshots", () => {
    const s1 = saveSnapshot("tab1", "Before", "content v1");
    expect(listSnapshots("tab1")).toHaveLength(1);
    saveSnapshot("tab1", "After", "content v2");
    expect(listSnapshots("tab1")).toHaveLength(2);
    deleteSnapshot("tab1", s1.id);
    expect(listSnapshots("tab1")).toHaveLength(1);
  });

  it("handles corrupt storage", () => {
    localStorage.setItem("mdit-snapshots-tab1", "bad");
    expect(listSnapshots("tab1")).toEqual([]);
  });
});
