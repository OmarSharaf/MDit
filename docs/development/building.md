# Building releases

How to produce production builds for web hosting and desktop distribution.

---

## Web build

```bash
npm run build
```

Output: `dist/` — static files ready for any static host (GitHub Pages, Netlify, Vercel, etc.).

Preview locally:

```bash
npm run preview
```

### Deploy checklist

- [ ] Set download URLs in `src/constants/downloads.ts` if offering desktop installers from the web app
- [ ] Configure your host to serve `index.html` for SPA routes (if applicable)
- [ ] Enable HTTPS for production

---

## Desktop build

```bash
npm run tauri build
```

This runs `npm run build` first, then compiles the Rust backend and bundles installers.

### Output locations (Windows)

| Artifact | Path |
| --- | --- |
| Portable `.exe` | `src-tauri/target/release/mdit.exe` |
| NSIS installer | `src-tauri/target/release/bundle/nsis/` |
| MSI installer | `src-tauri/target/release/bundle/msi/` |

### Configuration

App metadata and bundle settings: `src-tauri/tauri.conf.json`

| Field | Value |
| --- | --- |
| Product name | MDit |
| Identifier | `io.mdit.app` |
| Version | Matches `package.json` |
| File associations | `.md`, `.markdown`, `.mdx` |

### Icons

App icons live in `src-tauri/icons/`. Regenerate from a source PNG using the Tauri icon tool if updating branding.

---

## Version bumps

Update version in sync:

1. `package.json` → `"version"`
2. `src-tauri/tauri.conf.json` → `"version"`
3. `src-tauri/Cargo.toml` → `version`
4. `src/constants/appInfo.ts` → `APP_VERSION`

---

## CI suggestions

A typical release pipeline:

1. `npm ci`
2. `npm run build` (web)
3. `npm run tauri build` (desktop, on Windows runner)
4. Upload `dist/` and `src-tauri/target/release/bundle/` as release artifacts

---

## Related

- [Development setup](setup.md)
- [Installation](../getting-started/installation.md)
