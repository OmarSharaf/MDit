import { useEffect } from "react";
import { useStore, useActiveTab } from "../store/useStore";
import { readTextFilePath, watchFileMtime } from "../utils/fileSystem";

export function useFileWatch() {
  const activeTab = useActiveTab();
  const reloadTabFromDisk = useStore((s) => s.reloadTabFromDisk);

  useEffect(() => {
    if (!activeTab?.path) return;

    let lastMtime = activeTab.fileModifiedAt ?? 0;

    const interval = setInterval(async () => {
      if (activeTab.isDirty) return;

      const watch = await watchFileMtime(activeTab.path!, lastMtime);
      if (watch?.changed) {
        const content = await readTextFilePath(activeTab.path!);
        if (content !== null && content !== activeTab.content) {
          const reload = confirm(`"${activeTab.name}" changed on disk. Reload?`);
          if (reload) {
            reloadTabFromDisk(activeTab.id, content, watch.modified);
            lastMtime = watch.modified;
          }
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTab?.id, activeTab?.path, activeTab?.isDirty, activeTab?.content, activeTab?.fileModifiedAt, reloadTabFromDisk]);
}
