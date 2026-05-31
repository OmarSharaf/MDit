import { useEffect, useRef } from "react";
import { useStore, useActiveTab } from "../store/useStore";
import { useFileActions } from "./useFileActions";

export function useAutoSave() {
  const settings = useStore((s) => s.settings);
  const activeTab = useActiveTab();
  const { saveQuietly } = useFileActions();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!settings.autoSave || !activeTab?.isDirty || !activeTab.path) return;

    timerRef.current = setTimeout(() => {
      void saveQuietly();
    }, settings.autoSaveDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    activeTab?.content,
    activeTab?.isDirty,
    activeTab?.path,
    activeTab?.id,
    settings.autoSave,
    settings.autoSaveDelay,
    saveQuietly,
  ]);
}
