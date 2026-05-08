# Changelog

All notable changes to **HabitQuest** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

> Features in progress / planned for next release

- [ ] PWA manifest — installable as mobile app
- [ ] Weekly goal targets per habit
- [ ] Push notification reminders via Service Worker
- [ ] Habit templates (Morning Routine, Study Mode, Fitness)
- [ ] Custom habit colors and icons

---

## [1.0.0] — 2026-05-08

### 🎉 Initial Release

**Added**
- Dashboard tab with add/delete habits form
- Habit categories: Health, Mind, Skills, Social, Finance, Custom
- XP difficulty levels: Easy (5), Normal (10), Hard (20), Epic (30)
- Persistent XP + Level system (100 XP per level)
- Sticky header with live XP progress bar and streak counter
- Game Board tab with animated quest cards
- Toggle completion on Dashboard AND Game Board
- Floating `+XP` animation on habit completion
- Level-up pulse animation on the level badge
- Daily mood logger (5-level emoji scale)
- 30-day completion heatmap (GitHub-style)
- 10 unlockable achievements with glow badge UI
- Achievement unlock banner notification
- Analytics tab with 4 Chart.js charts:
  - Mood vs Productivity (line, 7 days)
  - Weekly Progress (bar, 4 weeks)
  - XP Over Time (area, 14 days)
  - Category Breakdown (doughnut)
- LocalStorage persistence (key: `habitquest_v1`)
- JSON export / import for data portability
- Full reset with confirmation dialog
- Toast notification system (success / error / info)
- Stat cards: Total Habits, Done Today, Best Streak, Total XP
- Streak auto-calculation from history
- "By Sami Bajwa" sticky footer with social popup
- Fully mobile-responsive layout
- Dark cyberpunk theme: Orbitron + Rajdhani + JetBrains Mono fonts
- Animated grid background + glow orbs
- XSS-safe HTML rendering via `escapeHtml()`
- Highly commented codebase for open-source contributors
- Professional README with badges, schema docs, customization guide
- MIT License
- CONTRIBUTING.md with coding standards + good first issues
- .gitignore for OS, editor, and Node artifacts

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🎉 | Major release |
| ✨ | New feature |
| 🐛 | Bug fix |
| ♻️ | Refactor |
| 📝 | Documentation |
| 🎨 | Style / UI |
| ⚡ | Performance |
| 🔒 | Security |
| 🗑️ | Removed |
| ⚠️ | Deprecated |
