# Project structure

Overview of the MDit repository layout and main modules.

---

## Repository tree

```
MDit/
├── docs/                    # Documentation (you are here)
│   ├── assets/              # Logos, diagrams, SVG illustrations
│   ├── getting-started/
│   ├── user-guide/
│   ├── reference/
│   └── development/
├── src/                     # React frontend
│   ├── components/          # UI components
│   ├── constants/           # Built-in docs, app info, downloads
│   ├── hooks/               # React hooks (theme, session, file actions)
│   ├── store/               # Zustand global state
│   ├── styles/              # Global CSS variables
│   └── utils/               # File system, export, markdown, git, etc.
├── src-tauri/               # Tauri desktop backend
│   ├── src/lib.rs           # Rust commands (fs, git, search, watch)
│   ├── tauri.conf.json      # App configuration
│   └── Cargo.toml           # Rust dependencies
├── dist/                    # Web production build (generated)
├── README.md
├── LICENSE
└── package.json
```

---

## Frontend (`src/`)

### Components

| Area | Path | Purpose |
| --- | --- | --- |
| Shell | `TitleBar`, `TabBar`, `Sidebar`, `StatusBar` | App chrome |
| Editor | `MarkdownEditor`, `EditorPane`, `PreviewPane` | Writing surface |
| Workspace | `workspace/WorkspaceTree`, `GitPanel`, `WorkspaceSearchPanel` | Folder tools |
| Dialogs | `SettingsPanel`, `AboutDialog`, `GitHubImportDialog` | Modals |
| Tools | `CommandPalette`, `SearchOverlay`, `SnapshotPanel` | Productivity |

### State

`store/useStore.ts` — Zustand store for tabs, settings, workspace, UI state. Settings persist to `localStorage`.

### Utilities

| Module | Role |
| --- | --- |
| `fileSystem.ts` | Tauri FS bridge + browser fallbacks |
| `browserWorkspace.ts` | File System Access API for web folder pick |
| `exportEnhanced.ts` | HTML, Word, ODT export |
| `publish.ts` | Static site generation |
| `gitStatus.ts` | Git repo status via Tauri |
| `githubImport.ts` | GitHub file/Gist import |
| `shortcuts.ts` | Keyboard shortcut bindings |

---

## Backend (`src-tauri/`)

Rust commands exposed to the frontend via Tauri `invoke`:

| Command | Purpose |
| --- | --- |
| `list_dir` | Directory listing |
| `read_file` / `write_binary_file` | File I/O |
| `create_dir` / `delete_path` / `rename_path` | FS operations |
| `search_in_directory` | Workspace text search |
| `git_repo_status` | Git branch and changed files |
| `watch_file_mtime` | External file change detection |
| `reveal_in_explorer` | Open file in OS explorer |

---

## Built-in documentation

In-app docs live as TypeScript constants (bundled at build time):

| File | Tab name |
| --- | --- |
| `constants/welcome.ts` | `welcome.md` |
| `constants/featuresGuide.ts` | `features-guide.md` |

---

## Related

- [Development setup](setup.md)
- [Building releases](building.md)
