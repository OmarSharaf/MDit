# MDit

**A sleek, distraction-free Markdown editor** — live preview, workspace tools, and export. Built with **Tauri 2** and **React**.

> Built by [Omar S. M. Abdelfatah](https://omarsharaf.me)

---

## Features

### Writing & preview

- **Live split preview** with GitHub Flavored Markdown (GFM)
- **Math** (KaTeX), **Mermaid** diagrams, syntax highlighting, emoji
- **Wiki links** (`[[page]]`) and bidirectional selection sync between editor and preview
- **Slash commands** (`/`), Markdown lint, optional **Vim** keymap
- **YAML front matter** panel, document outline, pinned tabs

### Workspace (desktop)

- Open a **project folder** with file tree, rename, and context actions
- **Workspace search** across all markdown files
- **Git status** panel for changed files in a repo
- **GitHub import** — paste a file URL, Gist, or clone a public repo as a zip

### Productivity

- Command palette, snippet templates, customizable keyboard shortcuts
- Auto-save, session restore, local snapshots
- Focus mode, light/dark theme, high-contrast and reduced-motion options

### Export & publish

- HTML (self-contained), Markdown, plain text, PDF (print)
- Word (`.doc`) and ODT export
- Publish workspace as a static HTML site folder

---

## Web vs desktop

| Capability | Web | Desktop (.exe / .msi) |
| --- | --- | --- |
| Edit & preview markdown | Yes | Yes |
| Open single files | Yes | Yes |
| GitHub URL import | Yes | Yes |
| Open folder / file tree | No | Yes |
| Workspace search | No | Yes |
| Git panel | No | Yes |
| Full filesystem integration | Limited | Yes |

The web build is great for trying MDit in the browser. Use the **desktop app** for full workspace and Git features.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (desktop build only)
- Windows: [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the **Desktop development with C++** workload (desktop build only)

### Install dependencies

```bash
npm install
```

### Run in the browser (development)

```bash
npm run dev
```

Open [http://localhost:1420](http://localhost:1420).

### Run the desktop app (development)

```bash
npm run tauri dev
```

### Build for production

**Web:**

```bash
npm run build
npm run preview
```

**Desktop installers:**

```bash
npm run tauri build
```

Installers are written to `src-tauri/target/release/bundle/` (`.msi`, `.exe` / NSIS on Windows).

---

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| New file | `Ctrl+N` |
| Open file | `Ctrl+O` |
| Save | `Ctrl+S` |
| Save as | `Ctrl+Shift+S` |
| Find & replace | `Ctrl+F` |
| Command palette | `Ctrl+Shift+P` |
| Workspace search | `Ctrl+Shift+F` (desktop) |
| Snapshots | `Ctrl+Shift+K` |
| Toggle sidebar | `Ctrl+\` |
| Focus mode | `F11` |

Shortcuts can be customized in **Settings → Keyboard shortcuts**.

---

## Project structure

```
MDit/
├── src/                 # React frontend (editor, preview, UI)
├── src-tauri/           # Tauri / Rust backend (fs, git, dialogs)
├── public/              # Static assets
├── dist/                # Production web build (generated)
└── package.json
```

---

## Tech stack

- **UI:** React 18, TypeScript, Zustand, CodeMirror 6
- **Markdown:** remark/rehype, GFM, KaTeX, Mermaid
- **Desktop:** Tauri 2, Rust

---

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Commit your changes
4. Push and open a pull request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Omar S. M. Abdelfatah**  
[omarsharaf.me](https://omarsharaf.me)
# MDit
