# Export & publish

MDit offers multiple ways to share your Markdown — from clipboard copies to full static site generation.

---

## Export options

Access exports via the toolbar **Export** menu or **Ctrl+Shift+P**.

| Format | Description |
| --- | --- |
| **HTML** | Self-contained HTML with embedded styles (works offline) |
| **Markdown** | Save a copy of the source |
| **Plain text** | Rendered text without markup |
| **Word (.doc)** | HTML-based document compatible with Microsoft Word |
| **ODT** | OpenDocument text format |
| **Print / PDF** | Opens the system print dialog (Save as PDF) |
| **Copy HTML** | Rendered HTML to clipboard |
| **Copy Markdown** | Raw source to clipboard |

---

## Publish workspace *(desktop)*

Command palette → **Publish workspace as static site**

Exports all `.md` files in the open folder to HTML with a generated `index.html` — useful for documentation sites or sharing a notes vault.

---

## Custom preview CSS

Settings → **Custom preview CSS**

Paste CSS to style the preview and HTML export:

```css
.preview h1 {
  color: navy;
  border-bottom: 2px solid #3b5bdb;
}
```

---

## Presentation export

Use **Presentation** view for slide-style content separated by `---` on its own line. Export or print from preview for sharing.

---

## Tips

1. **Self-contained HTML** is best for emailing or archiving a single document.
2. Use **Print / PDF** when you need page layout control.
3. **Publish workspace** when exporting an entire documentation folder.
4. Apply **custom preview CSS** before HTML export for branded output.

---

## Related

- [Writing & formatting](writing.md)
- [Command palette](../reference/command-palette.md)
