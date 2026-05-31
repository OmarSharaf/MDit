import { X } from "lucide-react";
import { useState } from "react";
import { useStore, ColorTheme, PreviewTheme } from "../store/useStore";
import {
  getShortcutBindings,
  loadShortcutOverrides,
  saveShortcutOverrides,
  resetShortcutOverrides,
  type ShortcutBinding,
} from "../utils/shortcuts";
import styles from "./SettingsPanel.module.css";

interface Props {
  onClose: () => void;
  onAbout: () => void;
}

export function SettingsPanel({ onClose, onAbout }: Props) {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={14} /></button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <div className={styles.field}>
              <label className={styles.label}>Theme</label>
              <div className={styles.themeRow}>
                {(["dark", "light"] as ColorTheme[]).map((theme) => (
                  <button
                    key={theme}
                    className={`${styles.themeBtn} ${settings.theme === theme ? styles.themeActive : ""}`}
                    onClick={() => update({ theme })}
                  >
                    {theme === "dark" ? "Dark" : "Light"}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Preview Style</label>
              <div className={styles.themeRow}>
                {(["default", "github", "solarized"] as PreviewTheme[]).map((pt) => (
                  <button
                    key={pt}
                    className={`${styles.themeBtn} ${settings.previewTheme === pt ? styles.themeActive : ""}`}
                    onClick={() => update({ previewTheme: pt })}
                  >
                    {pt.charAt(0).toUpperCase() + pt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Writing</h3>
            <div className={styles.field}>
              <label className={styles.label}>Link selection (split view)</label>
              <Toggle checked={settings.syncScroll} onChange={(v) => update({ syncScroll: v })} />
            </div>
            <p className={styles.hint}>
              Editor and preview scroll independently. When enabled, clicking or selecting in one pane jumps to the matching spot in the other.
            </p>
            <div className={styles.field}>
              <label className={styles.label}>Link scroll position (split view)</label>
              <Toggle checked={settings.syncScrollPosition} onChange={(v) => update({ syncScrollPosition: v })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Markdown lint warnings</label>
              <Toggle checked={settings.markdownLint} onChange={(v) => update({ markdownLint: v })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Typewriter mode</label>
              <Toggle checked={settings.typewriterMode} onChange={(v) => update({ typewriterMode: v })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Editor keymap</label>
              <div className={styles.themeRow}>
                {(["default", "vim", "emacs"] as const).map((km) => (
                  <button
                    key={km}
                    className={`${styles.themeBtn} ${settings.editorKeymap === km ? styles.themeActive : ""}`}
                    onClick={() => update({ editorKeymap: km })}
                  >
                    {km.charAt(0).toUpperCase() + km.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Daily word goal</label>
              <div className={styles.row}>
                <input
                  type="range" min={0} max={5000} step={100}
                  value={settings.wordGoal}
                  onChange={(e) => update({ wordGoal: +e.target.value })}
                  className={styles.slider}
                />
                <span className={styles.val}>
                  {settings.wordGoal === 0 ? "Off" : `${settings.wordGoal} words`}
                </span>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Show YAML front matter panel</label>
              <Toggle checked={settings.showFrontMatter} onChange={(v) => update({ showFrontMatter: v })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>High contrast</label>
              <Toggle checked={settings.highContrast} onChange={(v) => update({ highContrast: v })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Reduced motion</label>
              <Toggle checked={settings.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Custom preview CSS</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder=".preview h1 { color: navy; }"
                value={settings.customPreviewCss}
                onChange={(e) => update({ customPreviewCss: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Restore session on launch</label>
              <Toggle checked={settings.restoreSession} onChange={(v) => update({ restoreSession: v })} />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Editor</h3>
            <div className={styles.field}>
              <label className={styles.label}>Font Size</label>
              <div className={styles.row}>
                <input
                  type="range" min={11} max={22} step={1}
                  value={settings.fontSize}
                  onChange={(e) => update({ fontSize: +e.target.value })}
                  className={styles.slider}
                />
                <span className={styles.val}>{settings.fontSize}px</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Line Height</label>
              <div className={styles.row}>
                <input
                  type="range" min={1.2} max={2.4} step={0.05}
                  value={settings.lineHeight}
                  onChange={(e) => update({ lineHeight: +e.target.value })}
                  className={styles.slider}
                />
                <span className={styles.val}>{settings.lineHeight.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Line Numbers</label>
              <Toggle
                checked={settings.showLineNumbers}
                onChange={(v) => update({ showLineNumbers: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Word Wrap</label>
              <Toggle
                checked={settings.wordWrap}
                onChange={(v) => update({ wordWrap: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Spell Check</label>
              <Toggle
                checked={settings.spellCheck}
                onChange={(v) => update({ spellCheck: v })}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Auto-save</h3>
            <p className={styles.hint}>
              Saves automatically after you stop typing. Only works for files that already have a saved path.
            </p>
            <div className={styles.field}>
              <label className={styles.label}>Enable Auto-save</label>
              <Toggle
                checked={settings.autoSave}
                onChange={(v) => update({ autoSave: v })}
              />
            </div>
            {settings.autoSave && (
              <div className={styles.field}>
                <label className={styles.label}>Auto-save Delay</label>
                <div className={styles.row}>
                  <input
                    type="range" min={500} max={10000} step={500}
                    value={settings.autoSaveDelay}
                    onChange={(e) => update({ autoSaveDelay: +e.target.value })}
                    className={styles.slider}
                  />
                  <span className={styles.val}>{settings.autoSaveDelay / 1000}s</span>
                </div>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Keyboard Shortcuts</h3>
            <p className={styles.hint}>
              Click a shortcut to change it. Format: Ctrl+Shift+P, F11, Ctrl+\\
            </p>
            <ShortcutSettings />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>About</h3>
            <p className={styles.hint}>
              MDit is a fast Markdown editor with live preview, workspace support, and export tools.
            </p>
            <button type="button" className={styles.aboutBtn} onClick={onAbout}>
              About MDit &amp; Omar S. M. Abdelfatah
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${checked ? styles.on : ""}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className={styles.thumb} />
    </button>
  );
}

function ShortcutSettings() {
  const [bindings, setBindings] = useState<ShortcutBinding[]>(() => getShortcutBindings());
  const [editing, setEditing] = useState<string | null>(null);

  const refresh = () => setBindings(getShortcutBindings());

  const saveKey = (id: string, keys: string) => {
    const trimmed = keys.trim();
    if (!trimmed) return;
    const overrides = loadShortcutOverrides();
    const binding = bindings.find((b) => b.id === id);
    if (trimmed === binding?.defaultKeys) {
      delete overrides[id];
    } else {
      overrides[id] = trimmed;
    }
    saveShortcutOverrides(overrides);
    setEditing(null);
    refresh();
  };

  return (
    <>
      <div className={styles.shortcuts}>
        {bindings.map((b) => (
          <div key={b.id} className={styles.shortcut}>
            <span className={styles.shortcutDesc}>{b.label}</span>
            {editing === b.id ? (
              <input
                className={styles.shortcutInput}
                defaultValue={b.keys}
                autoFocus
                onBlur={(e) => saveKey(b.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveKey(b.id, e.currentTarget.value);
                  if (e.key === "Escape") setEditing(null);
                }}
              />
            ) : (
              <button
                type="button"
                className={styles.kbd}
                onClick={() => setEditing(b.id)}
                title="Click to customize"
              >
                {b.keys}
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className={styles.resetShortcuts}
        onClick={() => {
          resetShortcutOverrides();
          refresh();
        }}
      >
        Reset all shortcuts to defaults
      </button>
    </>
  );
}
