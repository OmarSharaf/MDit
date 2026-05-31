# Interface overview

MDit uses a familiar editor layout: chrome at the top, sidebar on the left, editor and preview in the center, status bar at the bottom.

---

## Layout map

```
┌─────────────────────────────────────────────────────────────┐
│ Title bar    New · Open · Save · View modes · Search · ⚙    │
├─────────────────────────────────────────────────────────────┤
│ Tab bar      welcome.md │ features-guide.md │ +              │
├──────────┬──────────────────────────┬───────────────────────┤
│ Sidebar  │ Toolbar (formatting)     │                       │
│          ├──────────────────────────┤                       │
│ Files    │ Editor │ Preview         │  (split view)         │
│ Search   │        │                 │                       │
│ Git      │                          │                       │
├──────────┴──────────────────────────┴───────────────────────┤
│ Status bar   words · save state · cursor · view mode        │
└─────────────────────────────────────────────────────────────┘
```

---

## Title bar

| Control | Action |
| --- | --- |
| **MD** logo | Open About dialog |
| New / Open / Save | File operations |
| View mode buttons | Edit · Split · Preview · Present |
| Search | Find & replace in active document |
| Sidebar toggle | Show/hide sidebar |
| Theme | Toggle light/dark |
| Settings | Open settings panel |
| Download *(web only)* | Windows installer links |
| Window controls *(desktop)* | Minimize · Maximize · Close |

---

## Tab bar

- Click a tab to switch documents
- **Drag** tabs to reorder
- **Middle-click** to close
- **Pin** important tabs (pinned tabs sort to the top)
- **+** creates a new untitled document
- Unsaved changes show a **●** dot

---

## Sidebar

Three panels on **desktop** (Files · Search · Git). On **web**, only the explorer sections are shown.

### Files panel

- Workspace file tree *(desktop, when folder open)*
- Document **outline** (headings)
- **Open files** list
- **Recent folders** and **recent files**

### Search panel *(desktop)*

Full-text search across all markdown in the open workspace. See [Workspace & files](workspace.md).

### Git panel *(desktop)*

Shows branch name and changed files when Git is installed and the folder is a repository.

Resize the sidebar by dragging its right edge.

---

## Editor

Powered by **CodeMirror 6**:

- Syntax-aware Markdown editing
- Line numbers, word wrap, spell check (configurable)
- Slash commands (`/` at line start)
- Optional Vim or Emacs keymap
- Markdown lint underlines (configurable)

---

## Preview

Renders GitHub Flavored Markdown with:

- KaTeX math
- Mermaid diagrams
- Syntax-highlighted code blocks
- Sanitized inline HTML and SVG
- Wiki link resolution (`[[page]]`)

Preview styles: **Default**, **GitHub**, or **Solarized** (Settings → Appearance).

---

## Status bar

| Item | Meaning |
| --- | --- |
| View mode | Current edit/split/preview/present mode |
| Save state | Saving… / Saved / Error |
| Cursor | Line and column |
| Word count | Words and optional goal progress |
| Reading time | Estimated minutes |
| Focus mode | Toggle distraction-free writing (F11) |

Click the version label to open **About MDit**.

---

## Focus mode

Press **F11** to hide chrome and maximize the writing area. Press **Escape** or F11 again to exit.

---

## Related

- [Quick start](../getting-started/quick-start.md)
- [Settings](settings.md)
- [Keyboard shortcuts](../reference/keyboard-shortcuts.md)
