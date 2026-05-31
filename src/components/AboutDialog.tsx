import { ExternalLink, X } from "lucide-react";
import { APP_FEATURES, APP_NAME, APP_TAGLINE, APP_VERSION, AUTHOR } from "../constants/appInfo";
import { openExternalUrl } from "../utils/openUrl";
import { isTauri } from "../utils/windowControls";
import { DownloadMenu } from "./DownloadMenu";
import styles from "./AboutDialog.module.css";

interface Props {
  onClose: () => void;
}

export function AboutDialog({ onClose }: Props) {
  const desktopApp = isTauri();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>MD</div>
            <div className={styles.brandText}>
              <div className={styles.appName}>{APP_NAME}</div>
              <div className={styles.tagline}>{APP_TAGLINE}</div>
              <div className={styles.version}>Version {APP_VERSION}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.sectionTitle}>Features</div>
          <ul className={styles.features}>
            {APP_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          {!desktopApp && (
            <div className={styles.downloadSection}>
              <div className={styles.sectionTitle}>Download MDit</div>
              <p className={styles.downloadHint}>
                Get the latest Windows build for your desktop.
              </p>
              <DownloadMenu variant="about" />
            </div>
          )}

          <div className={styles.authorBlock}>
            <div className={styles.authorLabel}>Created by</div>
            <div className={styles.authorName}>{AUTHOR.name}</div>
            <button
              type="button"
              className={styles.authorLink}
              onClick={() => void openExternalUrl(AUTHOR.website)}
            >
              <ExternalLink size={13} />
              {AUTHOR.websiteLabel}
            </button>
          </div>

          <div className={styles.footer}>
            Built with Tauri, React, and CodeMirror
          </div>
        </div>
      </div>
    </div>
  );
}
