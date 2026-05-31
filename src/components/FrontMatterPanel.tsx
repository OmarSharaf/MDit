import { useMemo } from "react";
import { FileTab, useStore } from "../store/useStore";
import { parseFrontMatter, updateFrontMatter } from "../utils/frontmatter";
import styles from "./FrontMatterPanel.module.css";

interface Props {
  tab: FileTab;
}

export function FrontMatterPanel({ tab }: Props) {
  const updateTabContent = useStore((s) => s.updateTabContent);
  const { data } = useMemo(() => parseFrontMatter(tab.content), [tab.content]);
  const keys = Object.keys(data);

  if (!keys.length) return null;

  return (
    <div className={styles.panel}>
      <span className={styles.label}>Front matter</span>
      <div className={styles.fields}>
        {keys.map((key) => (
          <div key={key} className={styles.field}>
            <span className={styles.key}>{key}</span>
            <input
              className={styles.input}
              value={String(data[key] ?? "")}
              onChange={(e) => {
                const next = { ...data, [key]: e.target.value };
                updateTabContent(tab.id, updateFrontMatter(tab.content, next));
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
