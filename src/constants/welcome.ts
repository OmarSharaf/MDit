export const WELCOME_FILE_NAME = "welcome.md";

export const WELCOME_MD = `

# Welcome to MDit

**MDit** is a fast Markdown editor with live preview, workspace tools, and export.

> Built by **Omar S. M. Abdelfatah** · [omarsharaf.me](https://omarsharaf.me)

## Quick start

| Action | Shortcut |
| --- | --- |
| New file | **Ctrl+N** |
| Open file | **Ctrl+O** |
| Save | **Ctrl+S** |
| Command palette | **Ctrl+Shift+P** |
| Workspace search | **Ctrl+Shift+F** |
| Snapshots | **Ctrl+Shift+K** |
| Toggle sidebar | **Ctrl+\\\\** |

1. Use **Split view** (title bar) to write and preview side by side.
2. Select text in either pane — the other pane highlights the matching content.
3. Open a **folder** in the sidebar for the file tree, search, and Git panel.

## At a glance

- **Preview** — GFM, math, Mermaid, SVG, wiki links (\`[[page]]\`)
- **Workspace** — tree, search, Git, outline, GitHub import
- **Writing** — slash commands (\`/\`), lint, Vim keymap, snapshots
- **Export** — HTML, Word, ODT, publish folder, PDF

---

📖 **Full documentation:** open **features-guide.md** (pinned tab).

Happy writing.

*MDit · Markdown, done well.*
`;

/** @deprecated Use isBuiltInDoc from builtInDocs.ts */
export function isBuiltInWelcome(name: string, path: string | null): boolean {
  return name === WELCOME_FILE_NAME && path === null;
}
