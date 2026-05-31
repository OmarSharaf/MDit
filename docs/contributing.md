# Contributing

Thank you for your interest in contributing to MDit! This project is open source under the [MIT License](../LICENSE).

---

## How to contribute

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. Create a **feature branch**: `git checkout -b feature/my-change`
4. Make your changes with clear, focused commits
5. **Test** your changes (`npm run build`, and `npm run tauri dev` for desktop features)
6. **Push** and open a **pull request**

---

## Before you start

- Open an **issue** for large features or architectural changes
- Check existing issues to avoid duplicate work
- Read [Development setup](development/setup.md) and [Project structure](development/project-structure.md)

---

## Code guidelines

- Match existing code style and naming conventions
- Keep changes focused — one logical change per PR
- Prefer extending existing utilities over duplicating logic
- Add comments only for non-obvious business logic
- Do not commit secrets, `.env` files, or build artifacts

---

## Pull request checklist

- [ ] `npm run build` passes
- [ ] Desktop changes tested with `npm run tauri dev` (if applicable)
- [ ] No unrelated formatting or drive-by refactors
- [ ] Documentation updated if behavior or setup changed

---

## Reporting bugs

Include:

- MDit version (About dialog or `package.json`)
- Platform (web browser + version, or Windows desktop)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if helpful

---

## Feature requests

Describe the problem you're solving and how you'd expect MDit to behave. Mockups or examples from other tools are welcome.

---

## Code of conduct

Be respectful and constructive. We're all here to build a great Markdown editor.

---

## Author

**Omar S. M. Abdelfatah** · [omarsharaf.me](https://omarsharaf.me)
