# Development setup

Guide for contributors and developers building MDit from source.

<p align="center">
  <img src="../assets/tech-stack.svg" alt="MDit tech stack" width="600"/>
</p>

---

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Bundled with Node |
| Rust | Latest stable | `rustup` installer |
| VS Build Tools | 2022+ | Windows desktop builds only |

Install Rust:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

On Windows, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with **Desktop development with C++**.

---

## Clone & install

```bash
git clone https://github.com/OmarSharaf/MDit.git
cd MDit
npm install
```

---

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server → http://localhost:1420 |
| `npm run tauri dev` | Desktop app with hot reload |
| `npm run build` | Production web build → `dist/` |
| `npm run preview` | Preview production web build |
| `npm run tauri build` | Desktop installers → `src-tauri/target/release/bundle/` |

---

## Environment notes

- Vite watches `src/` and ignores `src-tauri/` during web dev
- Tauri dev runs `npm run dev` automatically before launching the shell
- WebView2 is required on Windows for the desktop runtime

---

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `link.exe` not found (Windows) | Install VS Build Tools with C++ workload |
| Port 1420 in use | Stop other Vite instances or change port in `vite.config.ts` |
| Tauri plugin errors | Ensure npm and Cargo Tauri versions match (`2.6.x`) |
| WebView2 missing | Install [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) |

---

## Related

- [Project structure](project-structure.md)
- [Building releases](building.md)
- [Contributing](../contributing.md)
