# Workspace & files

Workspace features are available in the **MDit desktop app**. Open a folder to browse, search, and link documents together.

---

## Open a folder

1. Click the **folder icon** in the sidebar header, or
2. Command palette → **Open folder**

The file tree loads in the sidebar **Files** panel. Only markdown-related files (`.md`, `.markdown`, `.txt`, `.mdx`) and directories are shown.

---

## File tree actions

| Action | How |
| --- | --- |
| Open file | Click a file in the tree |
| Expand/collapse folder | Click the folder row |
| Refresh | Click **Refresh** in the tree toolbar |
| New file in folder | Right-click folder → **New file** |
| New subfolder | Right-click → **New folder** |
| Rename | Right-click → **Rename** |
| Delete | Right-click → **Delete** |
| Reveal in Explorer | Right-click → **Reveal in Explorer** |

---

## Workspace search

Switch to the **Search** sidebar tab or press **Ctrl+Shift+F**.

- Searches all markdown files in the open workspace
- Shows file name, line number, and excerpt
- Click a result to open the file

---

## Git panel

Switch to the **Git** sidebar tab when a folder is open.

| Display | Meaning |
| --- | --- |
| Branch name | Current Git branch |
| Clean | No uncommitted changes |
| Changed file list | Modified/staged files with status codes |

Requires **Git** installed on your system and a valid repository at the workspace root.

---

## Wiki links

Link between documents in the same workspace:

```markdown
See [[other-page]] or [[guide|Full guide title]] for details.
```

Click the link in **preview** to open the matching `.md` file.

---

## GitHub import

Import content without cloning manually:

| Source | How |
| --- | --- |
| Single file | Paste a GitHub raw or blob URL |
| Gist | Paste a Gist URL |
| Public repo | Paste repo URL — MDit downloads and extracts markdown files |

Access via sidebar **GitHub icon** or command palette → **Import from GitHub URL**.

---

## Tabs & organization

- **Pin** reference documents so they stay at the top
- **Split editor** (command palette) opens two documents side by side
- **Snapshots** (`Ctrl+Shift+K`) save restore points before major edits

---

## Images & assets

Drop an image onto the editor. When the document has a saved path, MDit copies the image to an `assets/` folder next to the file and inserts a relative link.

---

## Front matter

Enable **Show YAML front matter panel** in Settings to edit document metadata:

```yaml
---
title: My Document
author: Jane Doe
tags: [docs, mdit]
---
```

---

## Related

- [Web vs desktop](../getting-started/web-vs-desktop.md)
- [Export & publish](export.md)
