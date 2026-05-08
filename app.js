/**
 * ============================================================
 * HabitQuest — app.js
 * Core logic: habit management, gamification (XP/Levels),
 * analytics (Chart.js), persistence (localStorage)
 *
 * Author : Sami Bajwa | samioutic.com
 * Version: 1.0.0
 * License: MIT
 * ============================================================
 */

// ─── CONSTANTS ───────────────────────────────────────────────

/** LocalStorage key for all app data */
const STORAGE_KEY = 'habitquest_v1';

/** XP required to reach each level (starts at level 1) */
const XP_PER_LEVEL = 100;

/** Category metadata: emoji + CSS class */
const CATEGORIES = {
  health:  { emoji: '💪', cls: 'cat-health' },
  mind:    { emoji: '🧠', cls: 'cat-mind' },
  skills:  { emoji: '⚡', cls: 'cat-skills' },
  social:  { emoji: '🤝', cls: 'cat-social' },
  finance: { emoji: '💰', cls: 'cat-finance' },
  custom:  { emoji: '✨', cls: 'cat-custom' },
};

/** Achievements definition */
const ACHIEVEMENTS = [
  { id: 'first_habit',   icon: '🌱', name: 'First Quest',  desc: 'Add your first habit',          check: s => s.habits.length >= 1 },
  { id: 'first_check',   icon: '✅', name: 'First Strike', desc: 'Complete a habit',              check: s => s.totalXP >= 5 },
  { id: 'level_5',       icon: '🚀', name: 'Lift Off',     desc: 'Reach Level 5',                 check: s => s.level >= 5 },
  { id: 'level_10',      icon: '🌟', name: 'Star Player',  desc: 'Reach Level 10',                check: s => s.level >= 10 },
  { id: 'streak_3',      icon: '🔥', name: 'On Fire',      desc: '3-day streak',                  check: s => s.streak >= 3 },
  { id: 'streak_7',      icon: '💎', name: 'Diamond Week', desc: '7-day streak',                  check: s => s.streak >= 7 },
  { id: 'streak_30',     icon: '👑', name: 'Royalty',      desc: '30-day streak',                 check: s => s.streak >= 30 },
  { id: 'perfect_day',   icon: '🎯', name: 'Perfect Day',  desc: 'Complete all habits in one day',check: s => s.perfectDays >= 1 },
  { id: '1000xp',        icon: '⚡', name: 'XP Hunter',    desc: 'Earn 1000 total XP',            check: s => s.totalXP >= 1000 },
  { id: 'five_habits',   icon: '🧩', name: 'Habit Hoarder',desc: 'Track 5+ habits',               check: s => s.habits.length >= 5 },
];

/** Mood label map */
const MOOD_LABELS = { 1: '😫 Terrible', 2: '😕 Bad', 3: '😐 Okay', 4: '😊 Good', 5: '🤩 Amazing' };

// ─── STATE ───────────────────────────────────────────────────

/**
 * The central app state object.
 * Loaded from / saved to localStorage on every mutation.
 */
let state = {
  habits: [],          // Array<{ id, name, category, xp, createdAt }>
  history: {},         // { 'YYYY-MM-DD': { completed: [id,...], mood: 1-5, xpEarned: n } }
  totalXP: 0,          // Cumulative XP earned all-time
  level: 1,            // Current player level
  streak: 0,           // Current consecutive-day streak
  bestStreak: 0,       // All-time best streak
  perfectDays: 0,      // Days where ALL habits were completed
  unlockedAchievements: [], // Array of achievement IDs
};

// Chart instances (kept to allow destroy/re-init on tab switch)
let charts = {};

// ─── PERSISTENCE ─────────────────────────────────────────────

/** Load state from localStorage; falls back to defaults if missing. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('[HabitQuest] Failed to load state:', e);
  }
}

/** Persist current state to localStorage. */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[HabitQuest] Failed to save state:', e);
  }
}

// ─── DATE HELPERS ─────────────────────────────────────────────

/** Returns today's date as 'YYYY-MM-DD' string */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the date N days ago as 'YYYY-MM-DD' */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Returns readable date string e.g. "Friday, May 8 2026" */
function readableDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/** Get last N day keys as array */
function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => daysAgo(n - 1 - i));
}

// ─── TODAY'S HISTORY ACCESSOR ────────────────────────────────

/** Return today's history slot, creating it if needed. */
function todayHistory() {
  const key = today();
  if (!state.history[key]) {
    state.history[key] = { completed: [], mood: null, xpEarned: 0 };
  }
  return state.history[key];
}

// ─── HABIT MANAGEMENT ────────────────────────────────────────

/**
 * Add a new habit to the list.
 * Reads values from the form inputs, validates, then appends to state.
 */
function addHabit() {
  const nameEl = document.getElementById('habit-name');
  const name = nameEl.value.trim();
  if (!name) {
    showToast('Please enter a habit name!', 'error');
    nameEl.focus();
    return;
  }

  const category = document.getElementById('habit-category').value;
  const xp       = parseInt(document.getElementById('habit-xp').value, 10);

  const habit = {
    id:        `h_${Date.now()}`,
    name,
    category,
    xp,
    createdAt: today(),
  };

  state.habits.push(habit);
  nameEl.value = '';
  saveState();
  renderHabitList();
  renderGameBoard();
  updateStats();
  checkAchievements();
  showToast(`"${name}" added to your quest log!`, 'success');
}

/**
 * Delete a habit by ID.
 * Also removes it from today's completion list.
 * @param {string} id - Habit ID
 */
function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  // Remove from today's completions too
  const th = todayHistory();
  th.completed = th.completed.filter(hid => hid !== id);
  saveState();
  renderHabitList();
  renderGameBoard();
  updateStats();
  showToast('Habit removed.', 'info');
}

/**
 * Clear all habits (with confirmation).
 */
function clearAllHabits() {
  if (!state.habits.length) return;
  if (!confirm('Delete ALL habits? This cannot be undone.')) return;
  state.habits = [];
  // Clear today's completions
  const th = todayHistory();
  th.completed = [];
  saveState();
  renderHabitList();
  renderGameBoard();
  updateStats();
  showToast('All habits cleared.', 'info');
}

// ─── HABIT COMPLETION ────────────────────────────────────────

/**
 * Toggle completion state for a habit on today's date.
 * Awards / removes XP accordingly.
 * @param {string} id - Habit ID
 * @param {MouseEvent} event - Click event (for XP popup position)
 */
function toggleHabit(id, event) {
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;

  const th = todayHistory();
  const doneIdx = th.completed.indexOf(id);

  if (doneIdx === -1) {
    // ── Complete the habit ──
    th.completed.push(id);
    th.xpEarned += habit.xp;
    awardXP(habit.xp, event);

    // Check if all habits are done (perfect day)
    if (th.completed.length === state.habits.length && state.habits.length > 0) {
      state.perfectDays++;
      showToast('🎯 PERFECT DAY! All habits complete!', 'success');
    }
  } else {
    // ── Undo the habit ──
    th.completed.splice(doneIdx, 1);
    th.xpEarned = Math.max(0, th.xpEarned - habit.xp);
    deductXP(habit.xp);
  }

  recalcStreak();
  saveState();
  renderHabitList();
  renderGameBoard();
  updateStats();
  updateXPBar();
  checkAchievements();
}

// ─── XP & LEVELING ───────────────────────────────────────────

/**
 * Award XP and trigger visual effects.
 * @param {number} amount - XP to add
 * @param {MouseEvent|null} event - Optional click position for float text
 */
function awardXP(amount, event = null) {
  state.totalXP += amount;
  const newLevel = Math.floor(state.totalXP / XP_PER_LEVEL) + 1;

  if (newLevel > state.level) {
    state.level = newLevel;
    triggerLevelUp();
  }

  if (event) spawnXPFloat(`+${amount} XP`, event);
}

/**
 * Deduct XP when a habit is un-checked.
 * @param {number} amount
 */
function deductXP(amount) {
  state.totalXP = Math.max(0, state.totalXP - amount);
  state.level   = Math.floor(state.totalXP / XP_PER_LEVEL) + 1;
}

/** Play level-up visual/notification. */
function triggerLevelUp() {
  showToast(`🎉 LEVEL UP! You are now Level ${state.level}!`, 'success');
  const badge = document.getElementById('level-badge');
  badge.classList.add('level-up-pulse');
  setTimeout(() => badge.classList.remove('level-up-pulse'), 900);
}

/** Update the XP progress bar and labels in the header. */
function updateXPBar() {
  const currentLevelXP = (state.level - 1) * XP_PER_LEVEL;
  const nextLevelXP    = state.level * XP_PER_LEVEL;
  const progress       = ((state.totalXP - currentLevelXP) / XP_PER_LEVEL) * 100;

  document.getElementById('xp-bar').style.width     = `${Math.min(100, progress)}%`;
  document.getElementById('xp-label').textContent   = `${state.totalXP - currentLevelXP} / ${XP_PER_LEVEL} XP`;
  document.getElementById('level-num').textContent  = state.level;
  document.getElementById('streak-label').textContent = `🔥 ${state.streak} day streak`;
}

/**
 * Spawn a floating "+XP" text at the click position.
 * @param {string} text
 * @param {MouseEvent} event
 */
function spawnXPFloat(text, event) {
  const el = document.getElementById('xp-popup');
  el.textContent = text;
  el.style.left  = `${event.clientX}px`;
  el.style.top   = `${event.clientY}px`;
  el.classList.remove('hidden');
  // Reset animation
  el.style.animation = 'none';
  // Force reflow
  void el.offsetWidth;
  el.style.animation = '';
  el.classList.add('xp-float');
  setTimeout(() => {
    el.classList.add('hidden');
    el.classList.remove('xp-float');
  }, 1300);
}

// ─── STREAK CALCULATION ──────────────────────────────────────

/**
 * Recalculate the current streak from history.
 * A day counts only if ≥1 habit was completed.
 */
function recalcStreak() {
  let streak = 0;
  const now  = new Date();

  // Walk backwards from today
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = state.history[key];

    if (entry && entry.completed && entry.completed.length > 0) {
      streak++;
    } else if (i > 0) {
      // Streak broken (skip today if nothing done yet)
      break;
    }
  }

  state.streak     = streak;
  state.bestStreak = Math.max(state.bestStreak, streak);
}

// ─── MOOD LOGGING ────────────────────────────────────────────

/**
 * Record today's mood score.
 * @param {number} value - 1–5
 */
function setMood(value) {
  const th  = todayHistory();
  th.mood   = value;
  saveState();

  // Update UI: highlight selected button
  document.querySelectorAll('.mood-btn').forEach((btn, i) => {
    btn.classList.toggle('mood-active', i + 1 === value);
  });
  document.getElementById('mood-status').textContent = MOOD_LABELS[value];
  showToast(`Mood logged: ${MOOD_LABELS[value]}`, 'info');

  // Refresh charts if on analytics tab
  if (!document.getElementById('tab-content-analytics').classList.contains('hidden')) {
    renderCharts();
  }
}

// ─── ACHIEVEMENTS ────────────────────────────────────────────

/**
 * Check and unlock any newly-achieved milestones.
 * Shows a banner notification for new unlocks.
 */
function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
      state.unlockedAchievements.push(ach.id);
      showAchievementBanner(`${ach.icon} ACHIEVEMENT UNLOCKED — ${ach.name}!`);
      saveState();
    }
  });
  renderAchievements();
}

/** Show the achievement banner on the Game Board tab. */
function showAchievementBanner(text) {
  const banner = document.getElementById('achievement-banner');
  document.getElementById('achievement-text').textContent = text;
  banner.classList.remove('hidden');
  setTimeout(() => banner.classList.add('hidden'), 4000);
}

// ─── RENDERING ───────────────────────────────────────────────

/** Render the habit list on the Dashboard tab. */
function renderHabitList() {
  const container  = document.getElementById('habit-list');
  const emptyState = document.getElementById('empty-state');
  const th         = todayHistory();

  if (!state.habits.length) {
    emptyState.classList.remove('hidden');
    // Remove all habit items except the empty state
    Array.from(container.children).forEach(c => {
      if (c.id !== 'empty-state') c.remove();
    });
    return;
  }
  emptyState.classList.add('hidden');

  // Build HTML for each habit
  const fragment = document.createDocumentFragment();
  // Remove old items
  Array.from(container.children).forEach(c => {
    if (c.id !== 'empty-state') c.remove();
  });

  state.habits.forEach(habit => {
    const isDone = th.completed.includes(habit.id);
    const cat    = CATEGORIES[habit.category] || CATEGORIES.custom;

    const item = document.createElement('div');
    item.className = `habit-item${isDone ? ' completed' : ''}`;
    item.innerHTML = `
      <div class="habit-checkbox ${isDone ? 'checked' : ''}"
           onclick="toggleHabit('${habit.id}', event)">${isDone ? '✓' : ''}</div>
      <span class="habit-name ${isDone ? 'done' : ''}">${escapeHtml(habit.name)}</span>
      <span class="habit-badge ${cat.cls}">${cat.emoji} ${habit.category}</span>
      <span class="habit-badge cat-skills">⚡ ${habit.xp} XP</span>
      <button class="delete-btn" onclick="deleteHabit('${habit.id}')" title="Delete habit">×</button>
    `;
    fragment.appendChild(item);
  });
  container.appendChild(fragment);
}

/** Render the game board grid with quest cards. */
function renderGameBoard() {
  const grid = document.getElementById('gameboard-grid');
  const th   = todayHistory();

  // Date label
  document.getElementById('todays-date-label').textContent = readableDate(today());

  if (!state.habits.length) {
    grid.innerHTML = `
      <div class="col-span-3 text-center py-16 text-gray-600">
        <div class="text-5xl mb-3">🗺️</div>
        <div class="font-orbitron text-sm tracking-widest">NO QUESTS AVAILABLE</div>
        <div class="text-xs font-mono mt-1">Add habits on the Dashboard to populate your Quest Board</div>
      </div>`;
    renderHeatmap();
    return;
  }

  grid.innerHTML = state.habits.map(habit => {
    const isDone = th.completed.includes(habit.id);
    const cat    = CATEGORIES[habit.category] || CATEGORIES.custom;
    return `
      <div class="quest-card ${isDone ? 'quest-done' : ''}" onclick="toggleHabit('${habit.id}', event)">
        <div class="quest-check">${isDone ? '✓' : ''}</div>
        <div class="quest-card-icon">${cat.emoji}</div>
        <div class="quest-card-name">${escapeHtml(habit.name)}</div>
        <div class="quest-xp-badge">⚡ ${habit.xp} XP</div>
        ${isDone ? '<div class="text-neon-green text-xs font-mono mt-2">QUEST COMPLETE!</div>' : ''}
      </div>`;
  }).join('');

  renderHeatmap();
  renderAchievements();
}

/** Render 30-day completion heatmap. */
function renderHeatmap() {
  const container = document.getElementById('heatmap-grid');
  const days      = lastNDays(30);
  const total     = state.habits.length || 1;

  container.innerHTML = days.map(day => {
    const entry = state.history[day];
    const done  = entry ? entry.completed.length : 0;
    const ratio = done / total;

    let bg;
    if (ratio === 0)        bg = '#1e293b';
    else if (ratio < 0.25)  bg = 'rgba(0,255,136,0.2)';
    else if (ratio < 0.5)   bg = 'rgba(0,255,136,0.5)';
    else if (ratio < 0.75)  bg = 'rgba(0,255,136,0.8)';
    else                    bg = '#00ff88';

    return `<div class="heatmap-cell" style="background:${bg}" title="${day}: ${done} habits done"></div>`;
  }).join('');
}

/** Render the achievements gallery. */
function renderAchievements() {
  const gallery = document.getElementById('achievements-gallery');
  gallery.innerHTML = ACHIEVEMENTS.map(ach => {
    const unlocked = state.unlockedAchievements.includes(ach.id);
    return `
      <div class="achievement-badge ${unlocked ? 'unlocked' : ''}" title="${ach.desc}">
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-name ${unlocked ? 'text-neon-yellow' : 'text-gray-600'}">${ach.name}</div>
      </div>`;
  }).join('');
}

/** Update the stat cards on the Dashboard. */
function updateStats() {
  const th = todayHistory();
  document.getElementById('stat-total').textContent  = state.habits.length;
  document.getElementById('stat-done').textContent   = th.completed.length;
  document.getElementById('stat-streak').textContent = state.bestStreak;
  document.getElementById('stat-xp').textContent     = state.totalXP;
  updateXPBar();
}

/** Restore today's mood button state on load. */
function restoreMoodUI() {
  const th = todayHistory();
  if (th.mood) {
    document.querySelectorAll('.mood-btn').forEach((btn, i) => {
      btn.classList.toggle('mood-active', i + 1 === th.mood);
    });
    document.getElementById('mood-status').textContent = MOOD_LABELS[th.mood];
  }
}

// ─── CHARTS ──────────────────────────────────────────────────

/** Chart.js shared defaults for dark theme. */
const chartDefaults = {
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } } },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    }
  },
  animation: { duration: 600, easing: 'easeInOutQuart' },
};

/** Initialise or re-render all four charts. */
function renderCharts() {
  destroyCharts();
  renderMoodChart();
  renderWeeklyChart();
  renderXPChart();
  renderCategoryChart();
}

/** Destroy all existing chart instances. */
function destroyCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch(_) {} });
  charts = {};
}

/** Chart 1 — Mood vs Productivity (last 7 days) */
function renderMoodChart() {
  const days   = lastNDays(7);
  const labels = days.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }));
  const moods  = days.map(d => (state.history[d]?.mood || 0));
  const total  = state.habits.length || 1;
  const prod   = days.map(d => {
    const done = state.history[d]?.completed?.length || 0;
    return parseFloat(((done / total) * 5).toFixed(2));
  });

  const ctx = document.getElementById('mood-chart').getContext('2d');
  charts.mood = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Mood',
          data: moods,
          borderColor: '#ff006e',
          backgroundColor: 'rgba(255,0,110,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ff006e',
          pointRadius: 5,
        },
        {
          label: 'Productivity',
          data: prod,
          borderColor: '#00f5ff',
          backgroundColor: 'rgba(0,245,255,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00f5ff',
          pointRadius: 5,
        },
      ],
    },
    options: {
      ...chartDefaults,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, min: 0, max: 5, ticks: { ...chartDefaults.scales.y.ticks, stepSize: 1 } },
      },
    },
  });
}

/** Chart 2 — Weekly completion progress (last 4 weeks) */
function renderWeeklyChart() {
  const weeks  = [];
  const counts = [];
  for (let w = 3; w >= 0; w--) {
    const start = w * 7;
    const days  = Array.from({ length: 7 }, (_, i) => daysAgo(start + 6 - i));
    const done  = days.reduce((sum, d) => sum + (state.history[d]?.completed?.length || 0), 0);
    weeks.push(`W-${w === 0 ? 'Now' : w}`);
    counts.push(done);
  }

  const ctx = document.getElementById('weekly-chart').getContext('2d');
  charts.weekly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeks,
      datasets: [{
        label: 'Habits Completed',
        data: counts,
        backgroundColor: ['rgba(191,0,255,0.4)', 'rgba(0,245,255,0.4)', 'rgba(0,255,136,0.4)', 'rgba(0,245,255,0.8)'],
        borderColor:     ['rgba(191,0,255,0.8)', 'rgba(0,245,255,0.8)', 'rgba(0,255,136,0.8)', '#00f5ff'],
        borderWidth: 1.5,
        borderRadius: 8,
      }],
    },
    options: {
      ...chartDefaults,
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

/** Chart 3 — Cumulative XP over last 14 days */
function renderXPChart() {
  const days   = lastNDays(14);
  const labels = days.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

  let cumXP = 0;
  const data = days.map(d => {
    cumXP += state.history[d]?.xpEarned || 0;
    return cumXP;
  });

  const ctx = document.getElementById('xp-chart').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(255,229,0,0.3)');
  gradient.addColorStop(1, 'rgba(255,229,0,0)');

  charts.xp = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Cumulative XP',
        data,
        borderColor: '#ffe500',
        backgroundColor: gradient,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#ffe500',
        pointRadius: 4,
        pointHoverRadius: 7,
      }],
    },
    options: {
      ...chartDefaults,
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

/** Chart 4 — Habit category donut breakdown */
function renderCategoryChart() {
  const catCount = {};
  state.habits.forEach(h => {
    catCount[h.category] = (catCount[h.category] || 0) + 1;
  });

  const labels = Object.keys(catCount);
  const data   = Object.values(catCount);
  const colors = {
    health: '#00ff88', mind: '#00f5ff', skills: '#ffe500',
    social: '#ff9500', finance: '#bf00ff', custom: '#ff006e',
  };

  const ctx = document.getElementById('category-chart').getContext('2d');
  charts.category = new Chart(ctx, {
    type: labels.length ? 'doughnut' : 'bar',
    data: labels.length ? {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map(l => colors[l] + '99'),
        borderColor:     labels.map(l => colors[l]),
        borderWidth: 2,
        hoverOffset: 8,
      }],
    } : {
      labels: ['No habits yet'],
      datasets: [{ data: [1], backgroundColor: ['#1e293b'], borderWidth: 0 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 }, padding: 14 },
        },
      },
      animation: { duration: 600 },
    },
  });
}

// ─── TAB NAVIGATION ──────────────────────────────────────────

/**
 * Switch between Dashboard, Game Board, and Analytics tabs.
 * @param {string} name - 'dashboard' | 'gameboard' | 'analytics'
 */
function switchTab(name) {
  ['dashboard', 'gameboard', 'analytics'].forEach(tab => {
    document.getElementById(`tab-content-${tab}`).classList.add('hidden');
    document.getElementById(`tab-${tab}`).classList.remove('active-tab');
  });
  document.getElementById(`tab-content-${name}`).classList.remove('hidden');
  document.getElementById(`tab-${name}`).classList.add('active-tab');

  if (name === 'gameboard') {
    renderGameBoard();
    renderAchievements();
  }
  if (name === 'analytics') {
    // Small delay to ensure canvas is visible before drawing
    setTimeout(renderCharts, 50);
  }
}

// ─── TOAST NOTIFICATIONS ─────────────────────────────────────

let toastTimer = null;

/**
 * Display a toast notification.
 * @param {string} msg    - Message text
 * @param {'success'|'error'|'info'} type - Visual style
 */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.className = `fixed bottom-16 right-4 z-50 toast-${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

// ─── DATA EXPORT / IMPORT ────────────────────────────────────

/** Export state as a JSON file download. */
function exportData() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `habitquest-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported successfully!', 'success');
}

/**
 * Import state from a JSON file.
 * @param {Event} event - File input change event
 */
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.habits || !imported.history) throw new Error('Invalid format');
      state = { ...state, ...imported };
      saveState();
      renderHabitList();
      renderGameBoard();
      updateStats();
      checkAchievements();
      showToast('Data imported successfully!', 'success');
    } catch {
      showToast('Import failed: invalid file.', 'error');
    }
  };
  reader.readAsText(file);
}

/** Reset all data (with confirmation). */
function resetAllData() {
  if (!confirm('RESET EVERYTHING? All habits, XP, and history will be permanently deleted.')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ─── FOOTER POPUP ────────────────────────────────────────────

/** Toggle the "By Sami Bajwa" social links popup. */
function toggleFooterPopup() {
  const popup = document.getElementById('footer-popup');
  popup.classList.toggle('hidden');
  popup.classList.toggle('flex');
}

// Close footer popup when clicking outside
document.addEventListener('click', e => {
  const popup  = document.getElementById('footer-popup');
  const footer = document.getElementById('sami-footer');
  if (!popup.contains(e.target) && !footer.contains(e.target)) {
    popup.classList.add('hidden');
    popup.classList.remove('flex');
  }
});

// ─── UTILITY ─────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── INITIALIZATION ──────────────────────────────────────────

/** Boot sequence — called once on page load. */
function init() {
  loadState();
  recalcStreak();
  renderHabitList();
  updateStats();
  restoreMoodUI();

  // Allow pressing Enter to add a habit
  document.getElementById('habit-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') addHabit();
  });

  console.log(
    '%c⚡ HabitQuest v1.0.0 — Ready!',
    'color:#00f5ff; font-family:monospace; font-size:14px; font-weight:bold;'
  );
}

// Boot when DOM is ready
document.addEventListener('DOMContentLoaded', init);
