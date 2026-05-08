# 🤝 Contributing to HabitQuest

First of all — **shukria** for wanting to contribute! Every PR, bug report, and suggestion makes HabitQuest better for thousands of users.

This guide explains how to contribute effectively.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Report a Bug](#how-to-report-a-bug)
- [How to Request a Feature](#how-to-request-a-feature)
- [Development Setup](#development-setup)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding Standards](#coding-standards)
- [Good First Issues](#good-first-issues)

---

## 🧑‍⚖️ Code of Conduct

Be respectful. Be helpful. This is a beginner-friendly project.  
No harassment, discrimination, or gatekeeping. Period.

---

## 🐛 How to Report a Bug

1. Check if the bug is already reported in [Issues](../../issues)
2. If not, open a **New Issue** with the label `bug`
3. Include:
   - Browser + OS (e.g., Chrome 124 / Windows 11)
   - Steps to reproduce
   - Expected vs actual behaviour
   - Screenshot if possible

---

## 💡 How to Request a Feature

1. Open a **New Issue** with the label `enhancement`
2. Describe the feature clearly
3. Explain the **use case** — why would users need this?

---

## 🛠️ Development Setup

HabitQuest is a **zero-build** project. No npm, no webpack, no compilation.

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/habitquest.git
cd habitquest

# 2. Open in your browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux

# 3. Or use VS Code Live Server extension for hot reload
code .
# then right-click index.html → "Open with Live Server"
```

That's it. Edit → save → refresh. No terminal needed.

---

## 🔀 Submitting a Pull Request

```bash
# 1. Create a feature branch
git checkout -b feat/my-feature-name

# 2. Make your changes (see Coding Standards below)

# 3. Commit with a clear message (use Conventional Commits)
git commit -m "feat: add weekly goal targets"
git commit -m "fix: streak not resetting at midnight"
git commit -m "docs: update README setup section"

# 4. Push and open a PR
git push origin feat/my-feature-name
```

**PR checklist before submitting:**
- [ ] Tested in Chrome, Firefox, and mobile
- [ ] No console errors
- [ ] New functions are commented (JSDoc style)
- [ ] README updated if adding a new feature
- [ ] CHANGELOG.md updated under `[Unreleased]`

---

## 📐 Coding Standards

### JavaScript
```js
/**
 * Brief description of what this function does.
 * @param {string} id    - The habit ID
 * @param {number} value - XP amount to award
 * @returns {void}
 */
function myNewFunction(id, value) {
  // Clear inline comment for any non-obvious logic
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  // ...
}
```

- Use `const` / `let`, never `var`
- Arrow functions for callbacks; named functions for top-level
- Keep functions **single-responsibility** (one job each)
- Always escape user input with `escapeHtml()` before rendering
- No jQuery, no external libraries beyond Chart.js

### HTML
- Tailwind utility classes for styling
- Custom CSS only for animations and things Tailwind can't do
- All interactive elements must be keyboard-accessible

### CSS
- Add new CSS to `style.css`, grouped under a clear comment block
- Use CSS custom properties (`--neon-cyan`) for any new colors
- Mobile-first: test at 375px width minimum

### Git Commits (Conventional Commits)
| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | CSS/visual changes |
| `refactor:` | Code restructure, no logic change |
| `chore:` | Maintenance (gitignore, deps) |

---

## 🌱 Good First Issues

New to open source? Start here:

- Add a **new achievement** (copy pattern in `ACHIEVEMENTS` array in `app.js`)
- Add a **new habit category** (add to `CATEGORIES` object + CSS class)
- Improve **mobile layout** of the analytics tab
- Add **keyboard shortcut** hints (e.g., `Enter` to add habit — already works!)
- Improve **accessibility** (ARIA labels, focus rings)
- Translate the UI to another language (Urdu, Arabic, etc.)

---

## 🙏 Recognition

All contributors are credited in the README Contributors section.  
PRs merged → you're in the changelog!

---

*Questions? Reach out via [WhatsApp Channel](https://whatsapp.com/channel/0029VbCNzQeISTkQR04DvX3r) or open a GitHub Discussion.*
