export const FEATURES_GUIDE_FILE_NAME = "features-guide.md";

export const FEATURES_GUIDE_MD = `---
title: MDit Features Guide
description: Complete reference for MDit capabilities
author: Omar S. M. Abdelfatah
---

# MDit Features Guide

Complete reference for everything MDit can do. For a short introduction, see **welcome.md**.

> Built by **Omar S. M. Abdelfatah** · [omarsharaf.me](https://omarsharaf.me)

---

## Interface overview

| Area | Purpose |
| --- | --- |
| **Title bar** | New, Open, Save, view modes, search, sidebar, theme, settings |
| **Tab bar** | Switch documents, pin tabs, reorder by drag, middle-click to close, **+** for new tab |
| **Toolbar** | Headings, emphasis, lists, links, tables, code blocks, **Export** menu |
| **Sidebar** | Files tree, workspace search, Git status, outline, open files |
| **Editor** | CodeMirror-based writing surface with syntax-aware editing |
| **Preview** | Rendered Markdown with GFM, math, Mermaid graphs, inline SVG, and sanitized HTML |
| **Status bar** | View mode, save state, cursor position, word count, reading time, focus mode |

Click the **MD** logo, the info icon, or the version label in the status bar to open **About MDit**.

---

## View modes

| Mode | Best for |
| --- | --- |
| **Edit** | Writing without preview |
| **Split** | Live editing with rendered preview (recommended) |
| **Preview** | Reading or reviewing the final output |
| **Present** | Full-screen preview for demos and presentations |

In **Split view**, drag the divider between panes to resize. Editor and preview scroll **independently** by default.

**Link selection** (Settings → Writing, on by default) highlights matching content in the other pane when you select text.

**Link scroll position** (Settings → Writing) keeps editor and preview scrolled to the same ratio while you edit.

---

## Writing and formatting

| Shortcut | Action |
| --- | --- |
| **Ctrl+B** | Bold |
| **Ctrl+I** | Italic |
| **Ctrl+K** | Insert link |
| **Ctrl+F** | Find and replace |

**Examples:**

- **Bold**, *italic*, ~~strikethrough~~, and \`inline code\`
- Blockquotes, horizontal rules, and task lists:

- [x] Explore the sidebar outline
- [ ] Write your first document
- [ ] Export to HTML or PDF

### Tables

| Feature | Supported |
| --- | --- |
| GitHub Flavored Markdown | Yes |
| Footnotes | Yes |
| Syntax highlighting | Yes |
| Emoji shortcodes | Yes |

### Code blocks

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Math (KaTeX)

Inline: $E = mc^2$ · Display:

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$

---

## Visuals, SVG & graphs

MDit renders **Mermaid** diagrams and **inline SVG** in the preview.

### Workflow (Mermaid flowchart)

\`\`\`mermaid
flowchart LR
  A[Write in MDit] --> B[Live preview]
  B --> C[Export HTML / PDF]
  C --> D[Share or publish]
  style A fill:#3b5bdb,color:#fff
  style D fill:#0ca678,color:#fff
\`\`\`

### Document lifecycle (Mermaid state diagram)

\`\`\`mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Review: Edit & refine
  Review --> Draft: Needs changes
  Review --> Ready: Approve
  Ready --> Published: Export
  Published --> [*]
\`\`\`

### Editor ↔ Preview (Mermaid sequence)

\`\`\`mermaid
sequenceDiagram
  participant You
  participant Editor
  participant Preview
  participant Export
  You->>Editor: Type Markdown
  Editor->>Preview: Render GFM, math, diagrams
  Preview-->>You: Formatted output
  You->>Export: HTML, PDF, or copy
  Export-->>You: Share-ready file
\`\`\`

### Feature mix (Mermaid pie chart)

\`\`\`mermaid
pie showData
  title Typical MDit session
  "Writing" : 42
  "Preview" : 28
  "Organizing files" : 18
  "Export" : 12
\`\`\`

### Project timeline (Mermaid Gantt)

\`\`\`mermaid
gantt
  title Sample documentation schedule
  dateFormat YYYY-MM-DD
  section Plan
  Outline           :done, plan1, 2026-05-01, 2d
  Research          :done, plan2, after plan1, 3d
  section Write
  First draft       :active, write1, after plan2, 5d
  Review            :write2, after write1, 3d
  section Ship
  Export & publish  :milestone, ship1, after write2, 1d
\`\`\`

### Architecture sketch (Mermaid)

\`\`\`mermaid
graph TB
  subgraph MDit
    TB[Title bar & tabs]
    ED[Editor]
    PV[Preview]
    SB[Sidebar]
  end
  TB --> ED
  TB --> PV
  SB --> ED
  ED <-->|Link selection| PV
\`\`\`

### Inline SVG — split view

<div class="svg-panel">

<svg viewBox="0 0 520 160" width="520" height="160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="MDit split-view diagram">
  <defs>
    <linearGradient id="mdit-split-acc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b5bdb"/>
      <stop offset="100%" stop-color="#7048e8"/>
    </linearGradient>
  </defs>
  <rect x="8" y="20" width="150" height="120" rx="12" fill="#eef0f6" stroke="#dde1ec" stroke-width="2"/>
  <text x="83" y="52" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1d2e">Editor</text>
  <text x="83" y="78" text-anchor="middle" font-size="11" fill="#7a819c">Markdown source</text>
  <rect x="83" y="92" width="54" height="8" rx="4" fill="#d5dae8"/>
  <rect x="83" y="106" width="72" height="8" rx="4" fill="#d5dae8"/>
  <rect x="83" y="120" width="48" height="8" rx="4" fill="#d5dae8"/>
  <path d="M168 80 H340" stroke="url(#mdit-split-acc)" stroke-width="3" stroke-linecap="round"/>
  <polygon points="352,80 340,74 340,86" fill="#3b5bdb"/>
  <rect x="362" y="20" width="150" height="120" rx="12" fill="#eef0f6" stroke="#dde1ec" stroke-width="2"/>
  <text x="437" y="52" text-anchor="middle" font-size="13" font-weight="700" fill="#1a1d2e">Preview</text>
  <text x="437" y="78" text-anchor="middle" font-size="11" fill="#7a819c">Rendered output</text>
  <rect x="382" y="92" width="110" height="10" rx="3" fill="#3b5bdb" opacity="0.85"/>
  <rect x="382" y="108" width="88" height="8" rx="3" fill="#0ca678" opacity="0.75"/>
  <rect x="382" y="122" width="96" height="8" rx="3" fill="#7048e8" opacity="0.65"/>
  <text x="260" y="14" text-anchor="middle" font-size="12" font-weight="600" fill="#3b5bdb">Split view</text>
</svg>

<p class="svg-caption">Write on the left, preview on the right — independently scrollable panes.</p>

</div>

### Inline SVG — writing activity chart

<div class="svg-panel">

<svg viewBox="0 0 480 240" width="480" height="240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Weekly word count bar chart">
  <line x1="48" y1="200" x2="440" y2="200" stroke="#c8cede" stroke-width="2"/>
  <line x1="48" y1="40" x2="48" y2="200" stroke="#c8cede" stroke-width="2"/>
  <text x="24" y="125" transform="rotate(-90 24 125)" text-anchor="middle" font-size="11" fill="#7a819c">Words</text>
  <rect x="72" y="120" width="40" height="80" rx="6" fill="#3b5bdb" opacity="0.85"/>
  <rect x="132" y="90" width="40" height="110" rx="6" fill="#3b5bdb" opacity="0.85"/>
  <rect x="192" y="70" width="40" height="130" rx="6" fill="#7048e8" opacity="0.85"/>
  <rect x="252" y="100" width="40" height="100" rx="6" fill="#3b5bdb" opacity="0.85"/>
  <rect x="312" y="55" width="40" height="145" rx="6" fill="#0ca678" opacity="0.85"/>
  <rect x="372" y="80" width="40" height="120" rx="6" fill="#3b5bdb" opacity="0.85"/>
  <text x="92" y="218" text-anchor="middle" font-size="11" fill="#7a819c">Mon</text>
  <text x="152" y="218" text-anchor="middle" font-size="11" fill="#7a819c">Tue</text>
  <text x="212" y="218" text-anchor="middle" font-size="11" fill="#7a819c">Wed</text>
  <text x="272" y="218" text-anchor="middle" font-size="11" fill="#7a819c">Thu</text>
  <text x="332" y="218" text-anchor="middle" font-size="11" fill="#7a819c">Fri</text>
  <text x="392" y="218" text-anchor="middle" font-size="11" fill="#7a819c">Sat</text>
  <text x="240" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#1a1d2e">Weekly writing activity</text>
  <text x="240" y="46" text-anchor="middle" font-size="11" fill="#7a819c">Track progress with the status bar word goal</text>
</svg>

<p class="svg-caption">Example bar chart built with raw SVG.</p>

</div>

### Inline SVG — export options wheel

<div class="svg-panel">

<svg viewBox="0 0 360 360" width="320" height="320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Export options diagram">
  <defs>
    <linearGradient id="mdit-wheel-acc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b5bdb"/>
      <stop offset="100%" stop-color="#7048e8"/>
    </linearGradient>
  </defs>
  <circle cx="180" cy="180" r="150" fill="#f6f7fb" stroke="#dde1ec" stroke-width="2"/>
  <circle cx="180" cy="180" r="42" fill="url(#mdit-wheel-acc)"/>
  <text x="180" y="176" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">Export</text>
  <text x="180" y="192" text-anchor="middle" font-size="10" fill="#ffffff">menu</text>
  <path d="M180 38 A142 142 0 0 1 322 180 L180 180 Z" fill="#3b5bdb" opacity="0.9"/>
  <path d="M322 180 A142 142 0 0 1 180 322 L180 180 Z" fill="#7048e8" opacity="0.9"/>
  <path d="M180 322 A142 142 0 0 1 38 180 L180 180 Z" fill="#0ca678" opacity="0.9"/>
  <path d="M38 180 A142 142 0 0 1 180 38 L180 180 Z" fill="#f08c00" opacity="0.9"/>
  <text x="248" y="108" text-anchor="middle" font-size="12" font-weight="600" fill="#ffffff">HTML</text>
  <text x="248" y="268" text-anchor="middle" font-size="12" font-weight="600" fill="#ffffff">PDF</text>
  <text x="112" y="268" text-anchor="middle" font-size="12" font-weight="600" fill="#ffffff">Markdown</text>
  <text x="112" y="108" text-anchor="middle" font-size="12" font-weight="600" fill="#ffffff">Copy</text>
</svg>

<p class="svg-caption">Use the toolbar Export menu or command palette.</p>

</div>

> **Tip:** Use \`\`\`mermaid\`\`\` fenced blocks or paste inline SVG for charts and diagrams.

---

## Files, workspace, and tabs

### Sidebar panels (Ctrl+\\)

Three tabs at the top of the sidebar:

| Tab | Purpose |
| --- | --- |
| **Files** | Collapsible workspace tree, outline, open files, recent folders/files |
| **Search** | Full-text search across all markdown in the workspace (**Ctrl+Shift+F**) |
| **Git** | Branch name and changed files (requires Git installed; desktop app) |

**Files tab**

- **Open folder** to load a project
- **Collapsible tree** — expand folders, click files to open
- **Right-click** folders/files: new file, new folder, rename, reveal in Explorer, delete
- **Import from GitHub** — single file, Gist, or whole public repo (sidebar icon or command palette)
- **Outline** — click a heading to jump in the editor
- Drag the sidebar edge to resize

### Wiki links

Link between documents in a workspace with double-bracket syntax:

\`\`\`markdown
See [[other-page]] or [[guide|Full guide]] for details.
\`\`\`

Click the link in **preview** to open the matching \`.md\` file in the workspace.

### Tabs

- **Pin** important tabs (this guide is pinned by default)
- **Drag** to reorder · **Middle-click** to close
- Unsaved changes show a **●** indicator
- **Split editor** — command palette → *Split editor (two documents)* opens two editors side by side

### Snapshots

Save a restore point before big edits:

- **Ctrl+Shift+K** or command palette → *Snapshots*
- Save labeled snapshots per tab; restore or delete from the panel

### Front matter & auto-save

- Enable **YAML front matter panel** in Settings for document metadata
- **Auto-save** writes to disk after you pause typing (saved files only)

### Images & assets

Drop an image onto the editor. When the document has a saved path, MDit copies it to an \`assets/\` folder next to the file and inserts a relative link.

---

## Writing tools

### Slash commands

Type \`/\` at the start of a line in the editor to insert:

- Headings, tables, code blocks, Mermaid diagrams
- Blockquotes, task lists, front matter, slide breaks (\`---\`)
- Wiki link snippet

Use **↑/↓** and **Enter** to pick from the menu.

### Markdown lint

Enable **Markdown lint warnings** in Settings. The editor underlines:

- Trailing whitespace
- Skipped heading levels (e.g. H1 → H3)
- Images missing alt text
- List items indented with tabs

### Editor keymaps

Settings → **Editor keymap**: Default, **Vim**, or **Emacs**.

### Table editor

Toolbar **Table** button opens a dialog to set rows, columns, and header row before inserting.

### Presentation slides

1. Switch to **Presentation** view (title bar or command palette)
2. Split slides with a horizontal rule on its own line: \`---\`
3. Navigate with **← / →**, **Space**, **Home**, **End**

---

## Command palette

Press **Ctrl+Shift+P** to run any action: files, view modes, templates, export, publish, snapshots, split editor, workspace search, GitHub import, and search open tabs by name.

---

## Export & publish

| Option | Description |
| --- | --- |
| **Export as HTML** | Self-contained HTML with embedded styles (works offline) |
| **Export as Markdown** | Save a copy of the source |
| **Export as plain text** | Rendered text without markup |
| **Export as Word (.doc)** | HTML-based document for Word |
| **Export as ODT** | OpenDocument text format |
| **Publish workspace site** | Export all \`.md\` files in the open folder to HTML + \`index.html\` |
| **Print / PDF** | System print dialog |
| **Copy rendered HTML** | Clipboard-ready HTML |
| **Copy Markdown** | Copy the raw source |

**Custom preview CSS** — Settings → paste CSS to style preview and HTML export (e.g. \`.preview h1 { color: navy; }\`).

---

## Settings

**Appearance** — Light/dark theme; preview style (Default, GitHub, Solarized)

**Writing** — Link selection, link scroll position, markdown lint, typewriter mode, editor keymap, front matter, word goal, session restore, custom preview CSS, high contrast, reduced motion

**Editor** — Font size, line height, line numbers, word wrap, spell check

**Auto-save** — Enable/disable and adjust delay

**Keyboard shortcuts** — View and customize global shortcuts; reset to defaults

**Focus mode (F11)** hides chrome for distraction-free writing.

---

## Keyboard reference

| Shortcut | Action |
| --- | --- |
| **Ctrl+N** | New file |
| **Ctrl+O** | Open file |
| **Ctrl+S** | Save |
| **Ctrl+Shift+S** | Save As |
| **Ctrl+F** | Find & replace |
| **Ctrl+Shift+P** | Command palette |
| **Ctrl+Shift+F** | Workspace search |
| **Ctrl+Shift+K** | Snapshots |
| **Ctrl+\\\\** | Toggle sidebar |
| **F11** | Focus mode |
| **Escape** | Exit focus mode |
| **/** | Slash command menu (start of line) |

---

## Tips

1. Use **Split view** while drafting; enable **link scroll** for long documents.
2. Navigate with the **outline** or **workspace search**.
3. Link docs with **\`[[wiki-links]]\`** inside a folder workspace.
4. Set a **word goal** in Settings to track progress.
5. **Pin** reference docs; use **snapshots** before major rewrites.
6. Drop images to auto-save into \`assets/\` when the file is saved.
7. Import a public **GitHub repo** URL to browse all markdown files at once.

---

*MDit · Markdown, done well.*
`;
