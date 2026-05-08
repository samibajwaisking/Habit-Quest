# ⚡ HabitQuest — Gamified Habit Tracking System

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live_Demo-00f5ff?style=flat-square&logo=github)](https://appsfordailyuse.github.io/habitquest/)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffe500?style=flat-square)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-Vanilla-ff006e?style=flat-square&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-00f5ff?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-bf00ff?style=flat-square)](https://www.chartjs.org/)

> *Track your daily habits, earn XP, level up, and visualize your progress — no server required.*

---

## 📸 Preview

A fully dark-mode, cyberpunk-styled web app with:
- **Quest Board** with animated habit cards
- **XP + Level system** with real-time progress bar
- **Four Chart.js analytics panels**
- **30-day heatmap** + **Achievements gallery**
- **Zero backend** — all data lives in your browser

---

## 🚀 Quick Start

### Option 1: Run Locally
```bash
# Clone the repository
git clone https://github.com/appsfordailyuse/habitquest.git
cd habitquest

# Open in browser (no build step needed)
open index.html
# or on Windows:
start index.html
```

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to **Settings → Pages**
3. Set **Source** to `main` branch, `/` (root)
4. Click **Save** — your site is live at `https://<username>.github.io/habitquest/`

---

## 📁 Project Structure

```
habitquest/
├── index.html      ← Main UI (tabs, layout, all HTML structure)
├── style.css       ← Tailwind overrides, animations, dark-theme design tokens
├── app.js          ← All logic: habits, XP, charts, localStorage, exports
└── README.md       ← You are here
```

---

## ✨ Features

### 📋 Dashboard
| Feature | Details |
|---|---|
| Add Habits | Name + Category + XP difficulty (5/10/20/30 XP) |
| Delete Habits | Per-item × button (hover to reveal) |
| Check Off | Click checkbox to complete — triggers XP animation |
| Mood Logger | 5-level emoji mood tracker, logged per-day |
| Stat Cards | Total habits · Done today · Best streak · Total XP |

### 🎮 Game Board
| Feature | Details |
|---|---|
| Quest Cards | Visual cards for every habit — tap to complete |
| XP / Level Bar | Sticky header bar; levels up every 100 XP |
| 30-Day Heatmap | Color-coded completion density grid |
| Achievement Gallery | 10 unlockable badges with glow effects |
| Streak Tracking | Auto-calculated consecutive-day streak |

### 📊 Analytics
| Chart | Type | Shows |
|---|---|---|
| Mood vs Productivity | Line | Last 7 days: mood score vs completion ratio |
| Weekly Progress | Bar | Last 4 weeks: total habits completed |
| XP Over Time | Area | Last 14 days: cumulative XP earned |
| Category Breakdown | Doughnut | Habit distribution by category |

### 💾 Data Management
- **LocalStorage persistence** — data survives page refresh
- **JSON Export** — download a full backup file
- **JSON Import** — restore from backup
- **Full Reset** — clear everything (with confirmation dialog)

---

## 🎮 Gamification System

### XP & Levels
```
Level = floor(totalXP / 100) + 1

Habit Difficulties:
  Easy   →  5 XP
  Normal → 10 XP
  Hard   → 20 XP
  Epic   → 30 XP
```

### Achievements
| Badge | Icon | Requirement |
|---|---|---|
| First Quest | 🌱 | Add your first habit |
| First Strike | ✅ | Complete any habit |
| Lift Off | 🚀 | Reach Level 5 |
| Star Player | 🌟 | Reach Level 10 |
| On Fire | 🔥 | 3-day streak |
| Diamond Week | 💎 | 7-day streak |
| Royalty | 👑 | 30-day streak |
| Perfect Day | 🎯 | Complete ALL habits in one day |
| XP Hunter | ⚡ | Earn 1000 total XP |
| Habit Hoarder | 🧩 | Track 5+ habits simultaneously |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| HTML5 | — | Semantic markup, single-page layout |
| Tailwind CSS | CDN 3.x | Utility-first styling, dark mode |
| Vanilla JS (ES6+) | — | All app logic, no frameworks |
| Chart.js | 4.4.0 | Analytics visualizations |
| Google Fonts | — | Orbitron · Rajdhani · JetBrains Mono |
| LocalStorage API | — | Client-side data persistence |

> **Why no framework?** GitHub Pages serves static files. Vanilla JS means zero build steps, instant deploy, and maximum compatibility.

---

## 🔧 Customization Guide

### Add a New Category
In `app.js`, extend the `CATEGORIES` object:
```js
const CATEGORIES = {
  // ... existing categories
  yoga: { emoji: '🧘', cls: 'cat-yoga' },
};
```
Then add the corresponding CSS class in `style.css`:
```css
.cat-yoga { color: #ff9999; background: rgba(255,153,153,0.12); }
```

### Add a New Achievement
In `app.js`, push to the `ACHIEVEMENTS` array:
```js
{ id: 'my_ach', icon: '🎸', name: 'Rock Star', desc: 'Complete 100 habits total',
  check: s => Object.values(s.history).reduce((a, d) => a + d.completed.length, 0) >= 100 }
```

### Change XP Per Level
```js
const XP_PER_LEVEL = 150; // default: 100
```

### Change Level Thresholds
Modify the XP difficulty options in `index.html`:
```html
<option value="50">50 XP — Legendary</option>
```

---

## 📦 LocalStorage Schema

All data is stored under the key `habitquest_v1`:
```json
{
  "habits": [
    { "id": "h_1234", "name": "Morning Run", "category": "health", "xp": 20, "createdAt": "2026-05-08" }
  ],
  "history": {
    "2026-05-08": { "completed": ["h_1234"], "mood": 4, "xpEarned": 20 }
  },
  "totalXP": 340,
  "level": 4,
  "streak": 3,
  "bestStreak": 7,
  "perfectDays": 2,
  "unlockedAchievements": ["first_habit", "first_check", "streak_3"]
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repo
2. **Create** a branch: `git checkout -b feature/your-feature`
3. **Commit**: `git commit -m 'feat: add weekly goal targets'`
4. **Push**: `git push origin feature/your-feature`
5. Open a **Pull Request**

### Contribution Ideas
- [ ] Weekly/monthly goal targets
- [ ] Habit templates (Morning Routine, Study Mode, etc.)
- [ ] Social sharing (completion screenshots)
- [ ] PWA manifest for installable app
- [ ] Custom habit icons / colors
- [ ] Notification reminders via Service Worker

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

**Sami Bajwa**  
AI Educator · Freelance Web Developer · Digital Entrepreneur

- 🌐 Website: [samioutic.com](https://samioutic.com)
- 💬 WhatsApp: [Channel Link](https://whatsapp.com/channel/0029VbCNzQeISTkQR04DvX3r)
- 📘 Facebook: [@samibajwaisking](https://www.facebook.com/samibajwaisking)

---

<div align="center">
  <sub>Built with ⚡ by Sami Bajwa — Level Up Your Life</sub>
</div>
