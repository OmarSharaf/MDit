# Web vs desktop

MDit ships two targets from the same codebase: a **web app** and a **Tauri desktop app**. Both share the editor, preview, and export core; the desktop app adds native filesystem and Git integration.

---

## Comparison

| Capability | Web | Desktop |
| --- | :---: | :---: |
| Edit & preview Markdown | ✅ | ✅ |
| GFM, math, Mermaid, SVG | ✅ | ✅ |
| New / open single files | ✅ | ✅ |
| GitHub URL import | ✅ | ✅ |
| Command palette & templates | ✅ | ✅ |
| Auto-save & session restore | ✅ | ✅ |
| Snapshots | ✅ | ✅ |
| Export (HTML, PDF, Word, etc.) | ✅ | ✅ |
| Open folder / file tree | ❌ | ✅ |
| Workspace search | ❌ | ✅ |
| Git status panel | ❌ | ✅ |
| Reveal in Explorer | ❌ | ✅ |
| File associations (`.md`) | ❌ | ✅ |
| Publish workspace folder | ❌ | ✅ |

---

## When to use the web app

- Quick edits without installing software
- Trying MDit before downloading
- Environments where you cannot install desktop apps
- Importing a single file or GitHub document

The web sidebar shows a **Quick start** panel (New file, Open file, GitHub import) instead of folder workspace UI.

---

## When to use the desktop app

- Working inside a documentation repo or notes vault
- Searching across many `.md` files at once
- Viewing Git-changed files from the sidebar
- Saving directly to disk with full path control
- Opening `.md` files from Explorer via double-click

---

## Architecture

<p align="center">
  <img src="../assets/architecture.svg" alt="MDit architecture" width="640"/>
</p>

Both builds share the React frontend. The desktop shell adds Tauri commands for filesystem, Git, and native dialogs implemented in Rust.

---

## Related

- [Installation](installation.md)
- [Workspace & files](../user-guide/workspace.md)
- [Development setup](../development/setup.md)
