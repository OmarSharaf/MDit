# Installation

MDit can run in the **browser** (web build) or as a **native desktop app** (Windows `.exe` / `.msi` via Tauri).

---

## Desktop app (recommended)

### Download

**[All releases](https://github.com/OmarSharaf/MDit/releases)** · [v1.0.0](https://github.com/OmarSharaf/MDit/releases/tag/v1.0.0)

| Platform | Format | Download |
| --- | --- | --- |
| Windows | Setup (`.exe`) | [MDit_1.0.0_x64-setup.exe](https://github.com/OmarSharaf/MDit/releases/download/v1.0.0/MDit_1.0.0_x64-setup.exe) |
| Windows | MSI installer | [MDit_1.0.0_x64_en-US.msi](https://github.com/OmarSharaf/MDit/releases/download/v1.0.0/MDit_1.0.0_x64_en-US.msi) |

The web app’s **Download** menu uses the same links.

### System requirements

- **Windows 10/11** (64-bit)
- [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 11)

---

## Web app

The web build runs in modern browsers. No install required.

| Browser | Support |
| --- | --- |
| Chrome / Edge | Full editing, open file, GitHub import |
| Firefox / Safari | Editing works; folder workspace not available |

> Folder workspaces, Git panel, and full filesystem integration require the **desktop app**.

---

## Build from source

### Prerequisites

| Tool | Version | Required for |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 18+ | Web & desktop |
| [Rust](https://www.rust-lang.org/tools/install) | Latest stable | Desktop only |
| [VS Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) | C++ workload | Desktop on Windows |

### Steps

```bash
git clone https://github.com/OmarSharaf/MDit.git
cd MDit
npm install
```

**Web development:**

```bash
npm run dev
# → http://localhost:1420
```

**Desktop development:**

```bash
npm run tauri dev
```

See [Development setup](../development/setup.md) for full details.

---

## File associations (desktop)

On Windows, MDit registers as an editor for:

- `.md`
- `.markdown`
- `.mdx`

Double-click a file to open it in MDit.

---

## Next steps

→ [Quick start](quick-start.md) · [Web vs desktop](web-vs-desktop.md)
