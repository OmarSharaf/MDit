import { useActiveTab } from "../store/useStore";
import { getReadingTime } from "../utils/markdown";
import { useStore } from "../store/useStore";
import { APP_NAME, APP_VERSION } from "../constants/appInfo";
import { VIEW_MODE_LABELS } from "../utils/viewMode";
import styles from "./StatusBar.module.css";

interface Props {
  onAbout: () => void;
}

export function StatusBar({ onAbout }: Props) {
  const activeTab = useActiveTab();
  const viewMode = useStore((s) => s.viewMode);
  const settings = useStore((s) => s.settings);
  const saveStatus = useStore((s) => s.saveStatus);
  const saveMessage = useStore((s) => s.saveMessage);
  const editorCursor = useStore((s) => s.editorCursor);
  const toggleFocusMode = useStore((s) => s.toggleFocusMode);

  if (!activeTab) return null;

  const saveLabel =
    saveStatus === "saving"
      ? saveMessage || "Saving…"
      : saveStatus === "saved"
        ? saveMessage || "Saved"
        : saveStatus === "error"
          ? saveMessage || "Save failed"
          : activeTab.isDirty
            ? "Unsaved changes"
            : "Saved";

  const saveClass =
    saveStatus === "saving"
      ? styles.saving
      : saveStatus === "saved"
        ? styles.saved
        : saveStatus === "error"
          ? styles.error
          : activeTab.isDirty
            ? styles.unsaved
            : styles.saved;

  const wordGoal = settings.wordGoal;
  const goalProgress =
    wordGoal > 0 ? Math.min(100, (activeTab.wordCount / wordGoal) * 100) : 0;
  const goalMet = wordGoal > 0 && activeTab.wordCount >= wordGoal;

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.modeBadge} title={`View mode: ${VIEW_MODE_LABELS[viewMode]}`}>
          {VIEW_MODE_LABELS[viewMode]}
        </span>
        <span className={styles.sep} />
        <span className={`${styles.item} ${saveClass}`} title={saveLabel}>
          {saveLabel}
        </span>
        {editorCursor && (
          <>
            <span className={styles.sep} />
            <span className={styles.item} title="Cursor position">
              Ln {editorCursor.line}, Col {editorCursor.col}
            </span>
          </>
        )}
        <span className={styles.sep} />
        <span className={styles.item}>{activeTab.lineCount} lines</span>
        <span className={styles.sep} />
        <span className={styles.item}>{activeTab.wordCount.toLocaleString()} words</span>
        {wordGoal > 0 && (
          <>
            <span className={styles.sep} />
            <span
              className={`${styles.item} ${styles.goalWrap}`}
              title={`Word goal: ${activeTab.wordCount.toLocaleString()} / ${wordGoal.toLocaleString()}`}
            >
              <span className={styles.goalBar}>
                <span
                  className={`${styles.goalFill} ${goalMet ? styles.goalFillDone : ""}`}
                  style={{ width: `${goalProgress}%` }}
                />
              </span>
              <span className={goalMet ? styles.goalMet : ""}>
                {Math.round(goalProgress)}%
              </span>
            </span>
          </>
        )}
        <span className={styles.sep} />
        <span className={styles.item}>{activeTab.charCount.toLocaleString()} chars</span>
        <span className={styles.sep} />
        <span className={styles.item}>{getReadingTime(activeTab.content)}</span>
      </div>

      <div className={styles.right}>
        {settings.autoSave && (
          <>
            <span className={styles.item} title="Auto-save enabled for saved files">
              Auto-save
            </span>
            <span className={styles.sep} />
          </>
        )}
        {activeTab.path && (
          <span className={styles.item} style={{ color: "var(--txt-3)" }} title={activeTab.path}>
            {activeTab.path.replace(/\\/g, "/").split("/").slice(-3).join("/")}
          </span>
        )}
        <span className={styles.sep} />
        <span className={styles.item}>Markdown</span>
        <span className={styles.sep} />
        <span className={styles.item}>UTF-8</span>
        <span className={styles.sep} />
        <span
          className={`${styles.item} ${styles.focusBtn}`}
          onClick={toggleFocusMode}
          title="Toggle focus mode (F11)"
        >
          {settings.focusMode ? "Exit Focus" : "Focus"}
        </span>
        <span className={styles.sep} />
        <span
          className={`${styles.item} ${styles.aboutBtn}`}
          onClick={onAbout}
          title={`About ${APP_NAME}`}
        >
          {APP_NAME} {APP_VERSION}
        </span>
      </div>
    </div>
  );
}
