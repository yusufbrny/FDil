// Gamification engine: XP, levels, daily streak, freeze, combo, achievements, goals, and quests
/* ────────────────────────────────────────────────────────────────
   XP TABLOSU
   ─────────────────────────────────────────────────────────────── */
const XP_REWARDS = {
  flash_correct: 8,
  mc_correct: 10,
  fib_correct: 15,
  syn_correct: 10,
  ant_correct: 10,
  pv_flash_correct: 10,
  pv_quiz_correct: 12,
  mark_learned: 5,
};

/* ────────────────────────────────────────────────────────────────
   INFINITE LEVEL SYSTEM — formula-based, no hard-coded limits
   Level N requires: baseXP * growth^(N-1)
   baseXP = 100, growth = 1.25
   ─────────────────────────────────────────────────────────────── */
const LV_BASE = 100;
const LV_GROWTH = 1.25;

function _getXPForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(LV_BASE * Math.pow(LV_GROWTH, level - 1));
}

function _getLevelForXP(xp) {
  let lvl = 0;
  while (_getXPForLevel(lvl + 1) <= xp) lvl++;
  return lvl;
}

function _getXPProgress(xp) {
  const lvl = _getLevelForXP(xp);
  const cur = _getXPForLevel(lvl);
  const next = _getXPForLevel(lvl + 1);
  const diff = next - cur;
  const progress = Math.max(0, xp - cur);
  return {
    pct: diff > 0 ? Math.round((progress / diff) * 100) : 100,
    current: progress,
    needed: diff,
    lvl,
    nextXP: next
  };
}

/* ────────────────────────────────────────────────────────────────
   INFINITE LEVEL NAMES — cycles every 10 levels with theme tiers
   ─────────────────────────────────────────────────────────────── */
const LV_TIERS = [
  ['Çaylak', 'Meraklı', 'Öğrenci', 'Çalışkan', 'Başarılı', 'Uzman', 'Usta', 'Scholar', 'Akademik', 'Profesör'],
  ['Savaşçı', 'Knight', 'Paladin', 'Şövalye', 'Muhafız', 'Koruyucu', 'Kale', 'Zırh', 'Kalkan', 'Miğfer'],
  ['Büyücü', 'Wizard', 'Mage', 'Bjorn', 'Storm', 'Bolt', 'Aegis', 'Nova', 'Rune', 'Sage'],
  ['Efsane', 'Champion', 'Legend', 'Mythic', 'Titan', 'Colossus', 'Behemoth', 'Leviathan', 'Phoenix', 'Dragon'],
  ['Cosmos', 'Nebula', 'Quasar', 'Pulsar', 'Astro', 'Lunar', 'Solar', 'Zenith', 'Apex', 'Omega'],
  ['Infinity', 'Eternal', 'Boundless', 'Timeless', 'Infinite', 'Absolute', 'Supreme', 'Omni', 'Prime', 'Ultra'],
];

function _getLevelName(level) {
  const tierIdx = Math.floor(level / 10);
  const posIdx = level % 10;
  const tierName = LV_TIERS[tierIdx % LV_TIERS.length];
  const rankName = tierName[posIdx];
  const suffix = tierIdx > 0 ? ` ${_toRoman(tierIdx + 1)}` : '';
  return `${rankName}${suffix}`;
}

function _toRoman(n) {
  const romanMap = [
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let result = '';
  for (const [roman, value] of romanMap) {
    while (n >= value) {
      result += roman;
      n -= value;
    }
  }
  return result || '0';
}

/* ────────────────────────────────────────────────────────────────
   STREAK ROZETLERI
   ─────────────────────────────────────────────────────────────── */
const STREAK_BADGES = [
  { days: 3, icon: 'flame', label: '3 Günlük Seri', color: '#e67e22' },
  { days: 7, icon: 'zap', label: '1 Hafta Serisi', color: '#0f766e' },
  { days: 14, icon: 'diamond', label: '2 Hafta Serisi', color: '#3498db' },
  { days: 30, icon: 'crown', label: '30 Günlük Seri', color: '#f1c40f' },
  { days: 60, icon: 'sparkles', label: '60 Günlük Seri', color: '#1abc9c' },
  { days: 100, icon: 'trophy', label: '100 Gün!', color: '#e74c3c' },
];

/* ────────────────────────────────────────────────────────────────
   STATE (localStorage)
   ─────────────────────────────────────────────────────────────── */
let _xpData = JSON.parse(localStorage.getItem('ydt_xp_v1') || '{"xp":0,"level":0}');
let _streakData = JSON.parse(localStorage.getItem('ydt_streak_v1') || '{"streak":0,"lastDate":"","longest":0}');

function _saveXP() { localStorage.setItem('ydt_xp_v1', JSON.stringify(_xpData)); }
function _saveStreak() { localStorage.setItem('ydt_streak_v1', JSON.stringify(_streakData)); }

/* ────────────────────────────────────────────────────────────────
   COMBO SYSTEM
   ─────────────────────────────────────────────────────────────── */
let _comboCount = 0;
let _comboMultiplier = 1;
const COMBO_THRESHOLDS = [
  { count: 3, multiplier: 1.5, label: '1.5x', icon: 'flame' },
  { count: 5, multiplier: 2, label: '2x', icon: 'flame' },
  { count: 10, multiplier: 3, label: '3x', icon: 'sparkles' },
  { count: 20, multiplier: 5, label: '5x', icon: 'zap' },
];

function _getComboMultiplier() {
  let mult = 1;
  for (const t of COMBO_THRESHOLDS) {
    if (_comboCount >= t.count) mult = t.multiplier;
  }
  return mult;
}

function _updateComboUI() {
  let existing = document.getElementById('combo-indicator');
  if (_comboCount < 3) {
    if (existing) existing.remove();
    return;
  }
  const mult = _getComboMultiplier();
  const comboData = COMBO_THRESHOLDS.find(t => t.count === _comboCount) || COMBO_THRESHOLDS[COMBO_THRESHOLDS.length - 1];

  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'combo-indicator';
    document.getElementById('app').appendChild(existing);
  }
  existing.innerHTML = `<div class="combo-badge">${icon(comboData.icon, 15)} ${_comboCount} COMBO ${comboData.label}</div>`;
  existing.classList.add('combo-active');
}

function _incrementCombo() {
  _comboCount++;
  _comboMultiplier = _getComboMultiplier();
  _updateComboUI();
  if (_comboCount >= 5) {
    _trackQuestStat('combo5', true);
  }
}

function _resetCombo() {
  _comboCount = 0;
  _comboMultiplier = 1;
  _updateComboUI();
}

/* ────────────────────────────────────────────────────────────────
   ACHIEVEMENT SYSTEM
   ─────────────────────────────────────────────────────────────── */
const ACHIEVEMENTS = [
  { id: 'first_word', icon: 'sparkles', name: 'İlk Adım', desc: 'İlk kelimeyi öğren', category: 'learning' },
  { id: 'word_10', icon: 'books', name: 'Koleksiyoncu', desc: '10 kelime öğren', category: 'learning' },
  { id: 'word_50', icon: 'bookOpen', name: 'Kelime Dünyası', desc: '50 kelime öğren', category: 'learning' },
  { id: 'word_100', icon: 'award', name: 'Sözlük Ustası', desc: '100 kelime öğren', category: 'learning' },
  { id: 'word_500', icon: 'graduationCap', name: 'Akademisyen', desc: '500 kelime öğren', category: 'learning' },
  { id: 'word_1000', icon: 'crown', name: 'Kelime Büyücüsü', desc: '1000 kelime öğren', category: 'learning' },
  { id: 'streak_3', icon: 'flame', name: 'Ateşli Başlangıç', desc: '3 gün streak yap', category: 'streak' },
  { id: 'streak_7', icon: 'zap', name: 'Haftalık', desc: '7 gün streak yap', category: 'streak' },
  { id: 'streak_14', icon: 'diamond', name: 'İki Hafta', desc: '14 gün streak yap', category: 'streak' },
  { id: 'streak_30', icon: 'crown', name: 'Aylık', desc: '30 gün streak yap', category: 'streak' },
  { id: 'streak_60', icon: 'sparkles', name: 'İkili Ay', desc: '60 gün streak yap', category: 'streak' },
  { id: 'streak_100', icon: 'trophy', name: 'Efsane', desc: '100 gün streak yap', category: 'streak' },
  { id: 'streak_365', icon: 'diamond', name: 'Yıllık', desc: '365 gün streak yap', category: 'streak' },
  { id: 'daily_goal_7', icon: 'target', name: 'Hedef Odaklı', desc: '7 gün hedefi tamamla', category: 'streak' },
  { id: 'daily_goal_30', icon: 'award', name: 'Azimli', desc: '30 gün hedefi tamamla', category: 'streak' },
  { id: 'level_5', icon: 'star', name: 'Yıldız', desc: 'Seviye 5\'e ulaş', category: 'level' },
  { id: 'level_10', icon: 'moon', name: 'Dolunay', desc: 'Seviye 10\'a ulaş', category: 'level' },
  { id: 'level_15', icon: 'sun', name: 'Güneş', desc: 'Seviye 15\'e ulaş', category: 'level' },
  { id: 'level_20', icon: 'rocket', name: 'Yörünge', desc: 'Seviye 20\'ye ulaş', category: 'level' },
  { id: 'level_30', icon: 'sparkles', name: 'Galaksi', desc: 'Seviye 30\'a ulaş', category: 'level' },
  { id: 'level_50', icon: 'crown', name: 'Kozmos', desc: 'Seviye 50\'ye ulaş', category: 'level' },
  { id: 'combo_5', icon: 'flame', name: 'Sıcak Seri', desc: '5\'li combo yap', category: 'combo' },
  { id: 'combo_10', icon: 'zap', name: 'Patlama', desc: '10\'lu combo yap', category: 'combo' },
  { id: 'combo_20', icon: 'rocket', name: 'Şimşek', desc: '20\'li combo yap', category: 'combo' },
  { id: 'perfect_unit', icon: 'checkCircle', name: 'Mükemmel', desc: 'Bir üniteyi %100 bitir', category: 'learning' },
  { id: 'all_units', icon: 'crown', name: 'YDT Şampiyonu', desc: 'Tüm üniteleri bitir', category: 'learning' },
  { id: 'first_custom', icon: 'edit', name: 'Kelime Ekleyen', desc: 'İlk özel kelime ekle', category: 'custom' },
  { id: 'custom_10', icon: 'fileText', name: 'Not Defteri', desc: '10 özel kelime ekle', category: 'custom' },
  { id: 'custom_50', icon: 'books', name: 'Defter', desc: '50 özel kelime ekle', category: 'custom' },
  { id: 'sr_review_100', icon: 'brain', name: 'Tekrar Ustası', desc: '100 tekrar yap', category: 'sr' },
  { id: 'freeze_first', icon: 'snowflake', name: 'Buz Kıran', desc: 'İlk streak freeze kullan', category: 'special' },
  { id: 'quest_complete_10', icon: 'listChecks', name: 'Görevli', desc: '10 görev tamamla', category: 'quest' },
];

let _achievementData = JSON.parse(localStorage.getItem('ydt_achievements_v1') || '{"earned":[],"shown":[]}');

function _saveAchievements() { localStorage.setItem('ydt_achievements_v1', JSON.stringify(_achievementData)); }

function _isAchievementEarned(id) {
  return _achievementData.earned.includes(id);
}

function _markAchievementShown(id) {
  if (!_achievementData.shown.includes(id)) {
    _achievementData.shown.push(id);
    _saveAchievements();
  }
}

function getTotalLearned() {
  let total = 0;
  Object.values(progressRaw).forEach(arr => total += arr.length);
  return total;
}

function _checkAchievements() {
  const earned = _achievementData.earned;
  const checks = {
    first_word: getTotalLearned() >= 1,
    word_10: getTotalLearned() >= 10,
    word_50: getTotalLearned() >= 50,
    word_100: getTotalLearned() >= 100,
    word_500: getTotalLearned() >= 500,
    word_1000: getTotalLearned() >= 1000,
    streak_3: _streakData.streak >= 3,
    streak_7: _streakData.streak >= 7,
    streak_14: _streakData.streak >= 14,
    streak_30: _streakData.streak >= 30,
    streak_60: _streakData.streak >= 60,
    streak_100: _streakData.streak >= 100,
    streak_365: _streakData.streak >= 365,
    daily_goal_7: (_goalData.streakDays || 0) >= 7,
    daily_goal_30: (_goalData.streakDays || 0) >= 30,
    level_5: _getLevelForXP(_xpData.xp) >= 5,
    level_10: _getLevelForXP(_xpData.xp) >= 10,
    level_15: _getLevelForXP(_xpData.xp) >= 15,
    level_20: _getLevelForXP(_xpData.xp) >= 20,
    level_30: _getLevelForXP(_xpData.xp) >= 30,
    level_50: _getLevelForXP(_xpData.xp) >= 50,
    combo_5: _comboCount >= 5,
    combo_10: _comboCount >= 10,
    combo_20: _comboCount >= 20,
    perfect_unit: Object.keys(UNITS).some(u => getProgressPct(parseInt(u)) === 100),
    all_units: Object.keys(UNITS).every(u => getProgressPct(parseInt(u)) === 100),
    first_custom: customVocab.length >= 1,
    custom_10: customVocab.length >= 10,
    custom_50: customVocab.length >= 50,
    sr_review_100: Object.values(_srData).reduce((sum, c) => sum + (c.reps || 0), 0) >= 100,
    freeze_first: _streakFreezeUsed > 0,
    quest_complete_10: (_questData?.completedCount || 0) >= 10,
  };

  for (const [id, isEarned] of Object.entries(checks)) {
    if (isEarned && !earned.includes(id)) {
      earned.push(id);
      const achievement = ACHIEVEMENTS.find(a => a.id === id);
      if (achievement && !_achievementData.shown.includes(id)) {
        _showAchievementToast(achievement);
      }
    }
  }
  _saveAchievements();
}

function _showAchievementToast(achievement) {
  _markAchievementShown(achievement.id);
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-icon">${icon(achievement.icon, 24)}</div>
    <div class="achievement-info">
      <div class="achievement-title">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function _renderAchievementsInStats(container) {
  const existing = container.querySelector('.gm-achievements-block');
  if (existing) existing.remove();

  const block = document.createElement('div');
  block.className = 'gm-achievements-block';

  const earned = _achievementData.earned;
  const total = ACHIEVEMENTS.length;
  const pct = Math.round((earned.length / total) * 100);

  const cats = ['learning', 'streak', 'level', 'combo', 'custom', 'sr', 'quest', 'special'];
  const catNames = { learning: 'Kelime', streak: 'Seri', level: 'Seviye', combo: 'Combo', custom: 'Özel', sr: 'SR', quest: 'Görev', special: 'Özel' };

  let html = `
    <div class="gm-achievements-header">
      <div class="gm-achievements-title">${icon('trophy', 16)} Başarılar</div>
      <div class="gm-achievements-progress">${earned.length}/${total} (${pct}%)</div>
    </div>
    <div class="gm-achievements-grid">
  `;

  for (const ach of ACHIEVEMENTS) {
    const isEarned = earned.includes(ach.id);
    html += `<div class="gm-achievement-chip ${isEarned ? 'earned' : 'locked'}" title="${ach.desc}">
      <span class="gm-achievement-icon">${icon(isEarned ? ach.icon : 'lock', 18)}</span>
      <span class="gm-achievement-name">${ach.name}</span>
    </div>`;
  }

  html += '</div>';
  block.innerHTML = html;
  container.insertBefore(block, container.lastElementChild);
}

/* ────────────────────────────────────────────────────────────────
   DAILY QUEST SYSTEM
   ─────────────────────────────────────────────────────────────── */
const QUEST_TEMPLATES = [
  { id: 'cards_15', icon: 'layers', name: '15 Kart Çevir', desc: '15 flash kart çevir', xp: 25, check: (d) => (d.cardsFlipped || 0) >= 15 },
  { id: 'cards_30', icon: 'flame', name: '30 Kart Çevir', desc: '30 flash kart çevir', xp: 50, check: (d) => (d.cardsFlipped || 0) >= 30 },
  { id: 'mc_10', icon: 'checkCircle', name: '10 Doğru Test', desc: '10 doğru cevap testte', xp: 40, check: (d) => (d.mcCorrect || 0) >= 10 },
  { id: 'streak_protect', icon: 'shield', name: 'Seriyi Koru', desc: 'Günlük hedefi tamamla', xp: 30, check: (d) => d.goalCompleted },
  { id: 'combo_5', icon: 'zap', name: '5\'li Combo', desc: '5 doğru üst üste', xp: 20, check: (d) => d.combo5 },
  { id: 'learn_mode', icon: 'bookOpen', name: 'Sözlükçü', desc: 'Sözlük modunda 20 kelime bak', xp: 20, check: (d) => (d.wordsViewed || 0) >= 20 },
  { id: 'custom_add', icon: 'edit', name: 'Kelime Ekle', desc: '1 özel kelime ekle', xp: 15, check: (d) => d.customAdded },
  { id: 'sr_review', icon: 'brain', name: 'Tekrar Zamanı', desc: '5 spaced repetition tekrarı yap', xp: 25, check: (d) => (d.srReviews || 0) >= 5 },
  { id: 'all_modes', icon: 'target', name: 'Çeşitli', desc: '3 farklı mod kullan', xp: 40, check: (d) => (d.modesUsed || 0) >= 3 },
  { id: 'fib_5', icon: 'penLine', name: 'Yazarlar', desc: '5 boşluk doldur doğru', xp: 30, check: (d) => (d.fibCorrect || 0) >= 5 },
];

let _questData = (() => {
  const d = JSON.parse(localStorage.getItem('ydt_quests_v1') || '{"date":"","active":[],"completed":[],"completedCount":0}');
  if (d.stats && Array.isArray(d.stats.modesUsed)) d.stats.modesUsed = new Set(d.stats.modesUsed);
  return d;
})();

function _todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function _initDailyQuests() {
  const today = _todayStr();
  if (_questData.date !== today) {
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    _questData = {
      date: today,
      active: shuffled.slice(0, 3),
      completed: [],
      completedCount: _questData.completedCount || 0,
      stats: { cardsFlipped: 0, mcCorrect: 0, wordsViewed: 0, srReviews: 0, fibCorrect: 0, modesUsed: new Set(), goalCompleted: false, combo5: false, customAdded: false }
    };
    _saveQuests();
  }
}

function _saveQuests() {
  const dataToSave = { ..._questData };
  if (dataToSave.stats?.modesUsed instanceof Set) {
    dataToSave.stats.modesUsed = [...dataToSave.stats.modesUsed];
  }
  localStorage.setItem('ydt_quests_v1', JSON.stringify(dataToSave));
}

function _checkQuests() {
  _initDailyQuests();
  for (const quest of _questData.active) {
    if (_questData.completed.includes(quest.id)) continue;
    const template = QUEST_TEMPLATES.find(t => t.id === quest.id);
    const checkFn = template ? template.check : quest.check;
    if (typeof checkFn !== 'function') continue;
    if (checkFn(_questData.stats)) {
      _questData.completed.push(quest.id);
      _questData.completedCount++;
      _xpData.xp += quest.xp;
      _saveXP();
      _saveQuests();
      _showQuestComplete(quest);
      _checkAchievements();
    }
  }
}

function _showQuestComplete(quest) {
  const toast = document.createElement('div');
  toast.className = 'quest-complete-toast';
  toast.innerHTML = `
    <div class="quest-complete-icon">${icon((QUEST_TEMPLATES.find(t => t.id === quest.id) || {}).icon || 'target', 22)}</div>
    <div class="quest-complete-info">
      <div class="quest-complete-title">Görev Tamamlandı!</div>
      <div class="quest-complete-name">${quest.name}</div>
      <div class="quest-complete-xp">+${quest.xp} XP</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function _getQuestProgressInfo(q) {
  const stats = _questData.stats || {};
  const isDone = (_questData.completed || []).includes(q.id);
  const modesCount = stats.modesUsed instanceof Set
    ? stats.modesUsed.size
    : Array.isArray(stats.modesUsed)
      ? stats.modesUsed.length
      : (Number(stats.modesUsed) || 0);

  let current = 0;
  let target = 1;
  switch (q.id) {
    case 'cards_15':
      current = stats.cardsFlipped || 0; target = 15; break;
    case 'cards_30':
      current = stats.cardsFlipped || 0; target = 30; break;
    case 'mc_10':
      current = stats.mcCorrect || 0; target = 10; break;
    case 'streak_protect':
      target = (_goalData && _goalData.target) ? _goalData.target : 20;
      current = (isDone || stats.goalCompleted) ? target : Math.min((_goalData && _goalData.count) || 0, target);
      break;
    case 'combo_5':
      target = 5;
      current = (isDone || stats.combo5) ? 5 : Math.min(typeof _comboCount !== 'undefined' ? _comboCount : 0, 5);
      break;
    case 'learn_mode':
      current = stats.wordsViewed || 0; target = 20; break;
    case 'custom_add':
      current = (isDone || stats.customAdded) ? 1 : 0; target = 1; break;
    case 'sr_review':
      current = stats.srReviews || 0; target = 5; break;
    case 'all_modes':
      current = modesCount; target = 3; break;
    case 'fib_5':
      current = stats.fibCorrect || 0; target = 5; break;
    default:
      current = isDone ? 1 : 0; target = 1;
  }

  const clamped = Math.min(isDone ? target : current, target);
  const pct = target > 0 ? Math.min(100, Math.round((clamped / target) * 100)) : 0;
  return { current: clamped, target, pct };
}

function runQuestAction(questId) {
  switch (questId) {
    case 'cards_15':
    case 'cards_30':
    case 'all_modes':
      if (typeof startMixFlash === 'function') startMixFlash();
      break;
    case 'mc_10':
    case 'combo_5':
      if (typeof startMixMC === 'function') startMixMC();
      break;
    case 'streak_protect':
      if (typeof startCoachDailyWorkout === 'function') startCoachDailyWorkout('flash');
      break;
    case 'learn_mode':
      if (typeof openUnit === 'function') {
        openUnit(currentUnit || 1);
        if (typeof startLearn === 'function') startLearn();
      }
      break;
    case 'custom_add':
      if (typeof showMyWords === 'function') showMyWords();
      break;
    case 'sr_review':
      if (typeof startSRSession === 'function') startSRSession();
      break;
    case 'fib_5':
      if (typeof startMixFIB === 'function') startMixFIB();
      else if (typeof openUnit === 'function') {
        openUnit(currentUnit || 1);
        if (typeof startFIB === 'function') startFIB('type');
      }
      break;
    default:
      if (typeof startCoachDailyWorkout === 'function') startCoachDailyWorkout('flash');
  }
}

function _renderQuestsInHome() {
  _initDailyQuests();
  const container = document.getElementById('quest-home-card');
  if (!container) return;

  const completed = _questData.completed.length;
  const total = _questData.active.length;

  container.innerHTML = `
    <div class="quest-header">
      <div>
        <div class="quest-title">${icon('listChecks', 16)} Günlük Görevler</div>
        <div class="quest-sub-hint">${completed === total && total > 0 ? 'Tüm görevler tamamlandı!' : 'Göreve dokun, hemen başla'}</div>
      </div>
      <div class="quest-progress">${completed}/${total}</div>
    </div>
    <div class="quest-list">
      ${_questData.active.map(q => {
    const tpl = QUEST_TEMPLATES.find(t => t.id === q.id) || q;
    const isDone = _questData.completed.includes(q.id);
    const prog = _getQuestProgressInfo(q);
    return `
      <button type="button" class="quest-item ${isDone ? 'done' : 'is-actionable'}" ${isDone ? 'disabled' : `onclick="runQuestAction('${escQ(q.id)}')"`}>
        <span class="quest-icon">${isDone ? icon('checkCircle', 18) : icon(tpl.icon || 'target', 18)}</span>
        <span class="quest-item-main">
          <span class="quest-name">${esc(q.name)}</span>
          <span class="quest-item-desc">${esc(tpl.desc || '')}</span>
          <span class="quest-item-bar"><span class="quest-item-bar-fill" style="width:${prog.pct}%"></span></span>
        </span>
        <span class="quest-item-meta">
          <span class="quest-prog-txt">${prog.current}/${prog.target}</span>
          <span class="quest-xp">+${q.xp} XP</span>
        </span>
      </button>`;
  }).join('')}
    </div>
  `;
}

function _trackQuestStat(key, value = 1) {
  _initDailyQuests();
  if (_questData.stats[key] instanceof Set) {
    _questData.stats[key].add(value);
  } else if (typeof _questData.stats[key] === 'number') {
    _questData.stats[key] += value;
  } else if (typeof value === 'boolean') {
    _questData.stats[key] = value;
  }
  _saveQuests();
  _checkQuests();
  if (typeof _renderQuestsInHome === 'function') _renderQuestsInHome();
}

/* ────────────────────────────────────────────────────────────────
   STREAK FREEZE SYSTEM
   ─────────────────────────────────────────────────────────────── */
let _streakFreezeAvailable = parseInt(localStorage.getItem('ydt_streak_freeze') || '0');
let _streakFreezeUsed = parseInt(localStorage.getItem('ydt_streak_freeze_used') || '0');

function _useStreakFreeze() {
  if (_streakFreezeAvailable <= 0) {
    showToast('Streak freeze hakkın yok!');
    return false;
  }
  _streakFreezeAvailable--;
  _streakFreezeUsed++;
  localStorage.setItem('ydt_streak_freeze', _streakFreezeAvailable);
  localStorage.setItem('ydt_streak_freeze_used', _streakFreezeUsed);
  _checkAchievements();
  return true;
}

function _earnStreakFreeze() {
  if (_streakData.streak > 0 && _streakData.streak % 30 === 0) {
    _streakFreezeAvailable++;
    localStorage.setItem('ydt_streak_freeze', _streakFreezeAvailable);
    showToast('+1 Streak Freeze kazandın!');
  }
}

function _canUseStreakFreeze() {
  return _streakFreezeAvailable > 0;
}

function _getStreakFreezeCount() {
  return _streakFreezeAvailable;
}

function _updateStreakWithFreeze() {
  const today = _todayStr();
  const last = _streakData.lastDate;

  if (last === today) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (last === yStr) {
    _streakData.streak++;
  } else if (last !== today) {
    if (_canUseStreakFreeze()) {
      _streakData.lastDate = today;
      _useStreakFreeze();
      showToast('Streak freeze kullanıldı! Serin korundu.');
      _saveStreak();
      return true;
    }
    _streakData.streak = 1;
  }

  _streakData.lastDate = today;
  if (_streakData.streak > (_streakData.longest || 0)) {
    _streakData.longest = _streakData.streak;
  }
  _saveStreak();
  _earnStreakFreeze();

  const badge = STREAK_BADGES.slice().reverse().find(b => _streakData.streak === b.days);
  if (badge) {
    setTimeout(() => _showStreakBadge(badge), 600);
  }
  return true;
}

/* ────────────────────────────────────────────────────────────────
   STREAK LOGIC
   ─────────────────────────────────────────────────────────────── */
function _updateStreak() {
  const today = _todayStr();
  const last = _streakData.lastDate;

  if (last === today) return false; // zaten güncellendi

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (last === yStr) {
    _streakData.streak++;
  } else if (last !== today) {
    _streakData.streak = 1;
  }

  _streakData.lastDate = today;
  if (_streakData.streak > (_streakData.longest || 0)) {
    _streakData.longest = _streakData.streak;
  }
  _saveStreak();

  // Rozet kontrolü
  const badge = STREAK_BADGES.slice().reverse().find(b => _streakData.streak === b.days);
  if (badge) {
    setTimeout(() => _showStreakBadge(badge), 600);
  }
  return true;
}

/* ────────────────────────────────────────────────────────────────
   XP KAZANMA  (ana entry point)
   ─────────────────────────────────────────────────────────────── */
function earnXP(type, anchorEl) {
  const baseAmount = XP_REWARDS[type] || 5;
  const prevLevel = _getLevelForXP(_xpData.xp);

  // Combo multiplier uygula
  const multiplier = _getComboMultiplier();
  const amount = Math.round(baseAmount * multiplier);
  const bonusXP = multiplier > 1 ? amount - baseAmount : 0;

  _xpData.xp += amount;
  const newLevel = _getLevelForXP(_xpData.xp);
  _saveXP();
  _updateStreakWithFreeze();
  _incrementGoal(type, amount);

  // +XP balonu (combo bonus göster)
  if (anchorEl) {
    _showXPBubble(anchorEl, amount, bonusXP);
  }

  // Level-up?
  if (newLevel > prevLevel) {
    setTimeout(() => _showLevelUp(newLevel), 700);
  }

  // Combo artır
  _incrementCombo();
  _checkQuests();
  _checkAchievements();

  if (typeof syncActiveUserStats === 'function') syncActiveUserStats();
  if (typeof renderHomeLeaderboardCard === 'function') renderHomeLeaderboardCard();

  // HUD güncelle
  _renderHUD();
}

/* ────────────────────────────────────────────────────────────────
   CEVAP ANİMASYONLARI  (doğru / yanlış)
   ─────────────────────────────────────────────────────────────── */
function _triggerCorrect(anchorEl, xpType) {
  _spawnConfetti();
  earnXP(xpType || 'mc_correct', anchorEl);
}

function _triggerWrong(anchorEl) {
  _resetCombo();
  _shakeElement(anchorEl || document.getElementById('app'));
}

/* ────────────────────────────────────────────────────────────────
   GÜNLÜK HEDEF & KOÇ SİSTEMİ
   ─────────────────────────────────────────────────────────────── */
let _goalData = JSON.parse(localStorage.getItem('ydt_goal_v1') || '{"target":20,"today":"","count":0,"quizTarget":15,"quizCount":0,"extraDone":false,"history":{},"streakDays":0,"weekKey":"","weeklyXP":0}');

function _getWeekKey(dateObj) {
  const d = new Date(dateObj || Date.now());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function _todayGoalSync() {
  const today = _todayStr();
  const wk = _getWeekKey();
  let changed = false;

  if (!_goalData.history) { _goalData.history = {}; changed = true; }
  if (!_goalData.quizTarget) { _goalData.quizTarget = Math.max(10, Math.round((_goalData.target || 20) * 0.75)); changed = true; }
  if (_goalData.weekKey !== wk) {
    _goalData.weekKey = wk;
    _goalData.weeklyXP = 0;
    changed = true;
  }

  if (_goalData.today !== today) {
    _goalData.today = today;
    _goalData.count = 0;
    _goalData.quizCount = 0;
    _goalData.extraDone = false;
    changed = true;
  }

  if (changed) _saveGoal();
}

function _saveGoal() {
  localStorage.setItem('ydt_goal_v1', JSON.stringify(_goalData));
}

function _recalcGoalStreakDays() {
  const hist = _goalData.history || {};
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().slice(0, 10);
    if (hist[key] && hist[key].met) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  _goalData.streakDays = streak;
}

function _incrementGoal(xpType, xpEarned = 0) {
  _todayGoalSync();
  const today = _todayStr();

  _goalData.count = Math.min((_goalData.count || 0) + 1, (_goalData.target || 20) * 3);
  if (xpEarned > 0) {
    _goalData.weeklyXP = (_goalData.weeklyXP || 0) + xpEarned;
  }

  const quizTypes = ['mc_correct', 'fib_correct', 'syn_correct', 'ant_correct', 'pv_quiz_correct'];
  if (quizTypes.includes(xpType)) {
    _goalData.quizCount = (_goalData.quizCount || 0) + 1;
  }
  if (xpType === 'pv_flash_correct' || xpType === 'pv_quiz_correct') {
    _goalData.extraDone = true;
  }

  const met = _goalData.count >= (_goalData.target || 20);
  _goalData.history[today] = {
    count: _goalData.count,
    target: _goalData.target || 20,
    met
  };
  _recalcGoalStreakDays();
  _saveGoal();
  _renderGoalCard();
  if (met) {
    _trackQuestStat('goalCompleted', true);
  }
}

function _getWeeklyCalendarDays() {
  const names = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const today = new Date();
  const todayStr = _todayStr();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const hist = _goalData.history || {};
  const fallbackTarget = _goalData.target || 20;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const key = cur.toISOString().slice(0, 10);
    const rec = hist[key];
    const isToday = key === todayStr;
    const isFuture = key > todayStr;
    const count = isToday ? (_goalData.count || 0) : (rec ? (rec.count || 0) : 0);
    const target = isToday ? fallbackTarget : (rec ? (rec.target || fallbackTarget) : fallbackTarget);
    const met = isToday ? (_goalData.count >= fallbackTarget) : !!(rec && rec.met);
    const partial = isToday ? (_goalData.count > 0 && !met) : !!(rec && rec.count > 0 && !rec.met);
    days.push({ label: names[i], key, isToday, isFuture, met, partial, count, target });
  }
  return days;
}

function _renderGoalCard() {
  const card = document.getElementById('gm-goal-card');
  if (!card) return;
  _todayGoalSync();

  const target = _goalData.target || 20;
  const count = _goalData.count || 0;
  const done = Math.min(count, target);
  const pct = Math.min(100, Math.round((done / target) * 100));
  const completed = count >= target;

  const quizTarget = _goalData.quizTarget || Math.max(10, Math.round(target * 0.75));
  const quizCount = Math.min(_goalData.quizCount || 0, quizTarget);
  const extraDone = !!_goalData.extraDone || (typeof _questData !== 'undefined' && (_questData.completed || []).length > 0);

  const profile = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
  const examBadge = typeof getExamDisplayBadge === 'function' ? getExamDisplayBadge(profile) : 'YÖKDİL · Hedef 70';
  const countdown = typeof getExamCountdownInfo === 'function' ? getExamCountdownInfo() : { label: '' };

  const mood = typeof getMascotMood === 'function' ? getMascotMood() : (completed ? 'celebrate' : 'cozy');
  const mascotSvg = typeof renderDonkeyMascot === 'function'
    ? renderDonkeyMascot(mood, 68, profile ? profile.avatar : 'classic')
    : '';
  const coachQuote = typeof getMascotCoachQuote === 'function'
    ? getMascotCoachQuote()
    : 'Düzenli kelime ve okuma çalışmasıyla hedef puanına ulaşacaksın!';

  const weekDays = _getWeeklyCalendarDays();

  // SVG dairesel progress
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const ringColor = completed ? 'var(--tone-green-solid)' : pct >= 60 ? 'var(--tone-amber-solid)' : 'var(--accent)';
  const textColor = completed ? 'var(--tone-green-fg)' : pct >= 60 ? 'var(--tone-amber-fg)' : 'var(--accent)';

  card.className = 'gm-goal-card-upgraded' + (completed ? ' is-completed' : '');
  card.innerHTML = `
    <div class="gm-coach-top">
      <button type="button" id="mascot-stage-box" class="gm-mascot-stage" onclick="cycleMascotTip()" title="Yeni koç ipucu için Badem'e tıkla">
        ${mascotSvg}
        <span class="gm-mascot-name-tag">Badem</span>
      </button>
      <div class="gm-coach-bubble-col">
        <div class="gm-coach-badges">
          <button type="button" class="gm-exam-pill" onclick="showExamCoach()">${icon('graduationCap', 12)} ${esc(examBadge)}</button>
          ${countdown.label ? `<span class="gm-countdown-pill">${icon('calendar', 11)} ${esc(countdown.label)}</span>` : ''}
        </div>
        <button type="button" class="gm-speech-bubble" onclick="cycleMascotTip()" title="Başka bir tavsiye gör">
          <span id="mascot-coach-bubble-text">${esc(coachQuote)}</span>
        </button>
      </div>
    </div>

    <div class="gm-goal-main-row">
      <div class="gm-goal-left">
        <svg class="gm-goal-ring" viewBox="0 0 64 64" width="66" height="66">
          <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--border2)" stroke-width="5"/>
          <circle cx="32" cy="32" r="${r}" fill="none" stroke="${ringColor}" stroke-width="5"
            stroke-dasharray="${circ.toFixed(1)}"
            stroke-dashoffset="${offset.toFixed(1)}"
            stroke-linecap="round"
            transform="rotate(-90 32 32)"
            style="transition:stroke-dashoffset 0.6s ease,stroke 0.4s ease"/>
          <text x="32" y="36" text-anchor="middle" font-size="13" font-weight="800" fill="${textColor}">${pct}%</text>
        </svg>
      </div>
      <div class="gm-goal-mid">
        <div class="gm-goal-title-row">
          <div class="gm-goal-title">${completed ? icon('checkCircle', 16) + ' Günlük Hedef Tamamlandı!' : icon('target', 16) + ' Günlük Çalışma Hedefi'}</div>
          <span class="gm-goal-ratio">${done} / ${target} kelime</span>
        </div>
        <div class="gm-goal-bar-wrap">
          <div class="gm-goal-bar-fill" style="width:${pct}%;background:${ringColor}"></div>
        </div>
        <div class="gm-micro-goals">
          <button type="button" class="gm-micro-chip ${done >= target ? 'done' : ''}" onclick="startCoachDailyWorkout('flash')" title="Kelime antrenmanını başlat">${icon('layers', 12)} Kelime ${done}/${target}</button>
          <button type="button" class="gm-micro-chip ${quizCount >= quizTarget ? 'done' : ''}" onclick="startCoachDailyWorkout('mc')" title="Test antrenmanını başlat">${icon('checkCircle', 12)} Test ${quizCount}/${quizTarget}</button>
          <button type="button" class="gm-micro-chip ${extraDone ? 'done' : ''}" onclick="showReading()" title="Günlük Reading pratiğine git">${icon('bookOpen', 12)} Ek Pratik ${extraDone ? 'Tamam' : '0/1'}</button>
        </div>
      </div>
      <button type="button" class="gm-goal-set-btn" onclick="openGoalModal()" title="Hedef ve Sınav Ayarları" aria-label="Hedef ve Sınav Ayarları">${icon('settings', 15)}</button>
    </div>

    <div class="gm-week-row">
      <div class="gm-week-dots">
        ${weekDays.map(d => `
          <div class="gm-week-day ${d.isToday ? 'today' : ''} ${d.met ? 'met' : d.partial ? 'partial' : d.isFuture ? 'future' : ''}" title="${d.label}: ${d.count}/${d.target} kelime">
            <span class="gm-wd-dot">${d.met ? icon('check', 10) : ''}</span>
            <span class="gm-wd-lbl">${d.label}</span>
          </div>
        `).join('')}
      </div>
      <div class="gm-week-badges">
        <span class="gm-week-xp">${icon('zap', 12)} ${_goalData.weeklyXP || 0} hafta XP</span>
        <span class="gm-week-streak">${icon('flame', 13)} ${_goalData.streakDays || 0}g seri</span>
      </div>
    </div>

    <div class="gm-goal-actions">
      <button type="button" class="gm-goal-act-btn primary" onclick="startCoachDailyWorkout('flash')">
        ${icon('layers', 14)} <span>Koç Kartları</span>
      </button>
      <button type="button" class="gm-goal-act-btn" onclick="startCoachDailyWorkout('mc')">
        ${icon('checkCircle', 14)} <span>Koç Testi</span>
      </button>
      <button type="button" class="gm-goal-act-btn" onclick="showExamCoach()">
        ${icon('graduationCap', 14)} <span>Sınav Koçu</span>
      </button>
    </div>
  `;
}

function openGoalModal() {
  let modal = document.getElementById('gm-goal-modal');
  if (modal) { modal.remove(); return; }
  _todayGoalSync();
  const profile = typeof getActiveProfile === 'function' ? getActiveProfile() : { examType: 'YOKDIL', examBranch: 'saglik', targetScore: 70, targetYdtNet: 65 };
  const isYdt = profile.examType === 'YDT';
  const curYdtNet = profile.targetYdtNet || 65;
  const curScore = profile.targetScore || 70;

  const presets = isYdt
    ? [
        { words: 15, quiz: 10, name: 'Temel', sub: '50+ YDT Net' },
        { words: 25, quiz: 18, name: 'Standart', sub: '60–65 YDT Net' },
        { words: 40, quiz: 25, name: 'Yoğun', sub: '70+ YDT Net' },
        { words: 60, quiz: 40, name: 'Derece', sub: '75+ YDT Net' }
      ]
    : [
        { words: 15, quiz: 10, name: 'Temel', sub: '55+ Puan' },
        { words: 25, quiz: 18, name: 'Standart', sub: '65–70 Puan' },
        { words: 40, quiz: 25, name: 'Yoğun', sub: '80+ Puan' },
        { words: 60, quiz: 40, name: 'Derece', sub: '90+ Puan' }
      ];

  modal = document.createElement('div');
  modal.id = 'gm-goal-modal';
  modal.className = 'gm-goal-modal-overlay';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  modal.innerHTML = `
    <div class="gm-goal-modal-card">
      <div class="gm-goal-modal-handle"></div>
      <div class="gm-goal-modal-title">${icon('target', 18)} Günlük Hedef &amp; Sınav Temposu</div>
      <div class="gm-goal-modal-sub">${isYdt ? 'Hedef YDT netine göre günlük tempo, hedef net ve sınav türünü seç' : 'Hedef puanına göre günlük tempo, hedef puan ve sınav türünü seç'}</div>

      <div class="gm-goal-exam-quick">
        <span style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase">Aktif Sınav &amp; Alan</span>
        <div class="gm-goal-exam-pills">
          <button type="button" class="gm-ex-pill ${profile.examType === 'YDT' ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick('YDT','ydt_dil');document.getElementById('gm-goal-modal')?.remove();openGoalModal();">YDT (YKS-Dil)</button>
          <button type="button" class="gm-ex-pill ${profile.examType === 'YDS' ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick('YDS','genel');document.getElementById('gm-goal-modal')?.remove();openGoalModal();">YDS</button>
          <button type="button" class="gm-ex-pill ${(profile.examType === 'YOKDIL' || profile.examType === 'BOTH') && profile.examBranch === 'saglik' ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick('YOKDIL','saglik');document.getElementById('gm-goal-modal')?.remove();openGoalModal();">YÖKDİL Sağlık</button>
          <button type="button" class="gm-ex-pill ${(profile.examType === 'YOKDIL' || profile.examType === 'BOTH') && profile.examBranch === 'fen' ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick('YOKDIL','fen');document.getElementById('gm-goal-modal')?.remove();openGoalModal();">YÖKDİL Fen</button>
          <button type="button" class="gm-ex-pill ${(profile.examType === 'YOKDIL' || profile.examType === 'BOTH') && profile.examBranch === 'sosyal' ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick('YOKDIL','sosyal');document.getElementById('gm-goal-modal')?.remove();openGoalModal();">YÖKDİL Sosyal</button>
        </div>
        <span style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-top:8px;display:block">${isYdt ? 'Hedef YDT Neti (/ 80 Soru)' : 'Hedef Sınav Puanı'}</span>
        <div class="gm-goal-exam-pills" style="margin-top:5px">
          ${isYdt
            ? [50, 60, 65, 72, 76].map(n => `<button type="button" class="gm-ex-pill ${curYdtNet === n ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick(null,null,${n});document.getElementById('gm-goal-modal')?.remove();openGoalModal();">${n}+ Net</button>`).join('')
            : [55, 65, 70, 80, 90].map(sc => `<button type="button" class="gm-ex-pill ${curScore === sc ? 'active' : ''}" onclick="if(typeof updateProfileExamQuick==='function')updateProfileExamQuick(null,null,${sc});document.getElementById('gm-goal-modal')?.remove();openGoalModal();">${sc}+ Puan</button>`).join('')
          }
        </div>
      </div>

      <div class="gm-goal-opts">
        ${presets.map(pr => `
          <button class="gm-goal-opt ${_goalData.target === pr.words ? 'active' : ''}" onclick="setGoalTarget(${pr.words}, ${pr.quiz})">
            <span class="gm-goal-opt-num">${pr.words}</span>
            <span class="gm-goal-opt-lbl">${pr.name}</span>
            <span class="gm-goal-opt-sub">${pr.sub}</span>
          </button>`).join('')}
      </div>
      <div class="gm-goal-custom-row">
        <span style="font-size:13px;color:var(--text3);font-weight:600">Özel:</span>
        <input class="gm-goal-custom-inp" id="gm-goal-custom" type="number" min="1" max="200"
          placeholder="${_goalData.target}" value="${_goalData.target}">
        <button class="gm-goal-custom-btn" onclick="setGoalTarget(parseInt(document.getElementById('gm-goal-custom').value)||20)">Ayarla</button>
      </div>
      <div class="gm-goal-progress-preview">
        <span style="font-size:12px;color:var(--text3)">Bugünkü ilerleme:</span>
        <span style="font-size:13px;font-weight:700;color:var(--accent)">${_goalData.count} kelime · ${_goalData.quizCount || 0} test doğrusu</span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
}

function setGoalTarget(n, quizTarget) {
  if (!n || n < 1) return;
  _goalData.target = n;
  _goalData.quizTarget = quizTarget || Math.max(10, Math.round(n * 0.75));
  _saveGoal();
  if (typeof syncActiveUserStats === 'function') syncActiveUserStats();
  const modal = document.getElementById('gm-goal-modal');
  if (modal) modal.remove();
  _renderGoalCard();
  showToast(`Günlük hedef: ${n} kelime`);
}

/* ────────────────────────────────────────────────────────────────
   HUD  — artık header'a entegre, floating değil
   ─────────────────────────────────────────────────────────────── */
function _renderHUD() {
  // Eski floating HUD varsa kaldır
  const old = document.getElementById('gm-hud');
  if (old) old.remove();

  // Header info bar'ı güncelle (screen-home header'ındaki slot)
  _renderHeaderBar();
  // Hedef kartını güncelle
  _renderGoalCard();
}

function _renderHeaderBar() {
  let bar = document.getElementById('gm-header-bar');
  if (!bar) return; // HTML'de yok, çıkış

  const lvl = _getLevelForXP(_xpData.xp);
  const prog = _getXPProgress(_xpData.xp);
  const streak = _streakData.streak || 0;
  const streakHot = streak >= 3;

  bar.innerHTML = `
    <div class="gm-hb-streak ${streakHot ? 'hot' : ''}">
      <span class="gm-hb-streak-icon">${icon(streakHot ? 'flame' : 'calendar', 14)}</span>
      <span class="gm-hb-streak-num">${streak}</span>
    </div>
    <div class="gm-hb-xp">
      <div class="gm-hb-xp-top">
        <span class="gm-hb-lvl">Sv ${lvl}</span>
        <span class="gm-hb-xpnum">${_xpData.xp} XP</span>
      </div>
      <div class="gm-hb-bar-wrap">
        <div class="gm-hb-bar-fill" style="width:${prog.pct}%"></div>
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────────────────────────────
   +XP BALONU
   ─────────────────────────────────────────────────────────────── */
function _showXPBubble(anchorEl, amount, bonusXP = 0) {
  const bubble = document.createElement('div');
  bubble.className = 'gm-xp-bubble';
  bubble.innerHTML = `+${amount} XP${bonusXP > 0 ? `<span class="xp-bonus">(+${bonusXP} combo)</span>` : ''}`;

  let rect;
  try { rect = anchorEl.getBoundingClientRect(); } catch (e) { return; }
  bubble.style.left = (rect.left + rect.width / 2) + 'px';
  bubble.style.top = (rect.top + window.scrollY - 10) + 'px';

  document.body.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add('launch'));
  setTimeout(() => bubble.remove(), 1100);
}

/* ────────────────────────────────────────────────────────────────
   LEVEL-UP KUTLAMASI
   ─────────────────────────────────────────────────────────────── */
function _showLevelUp(level) {
  _spawnConfetti(80);

  const overlay = document.createElement('div');
  overlay.className = 'gm-levelup-overlay';
  overlay.innerHTML = `
      <div class="gm-levelup-card">
        <div class="gm-levelup-stars">${icon('star', 18)} ${icon('star', 24)} ${icon('star', 18)}</div>
        <div class="gm-levelup-label">SEVİYE ATLANDI!</div>
        <div class="gm-levelup-num">Seviye ${level}</div>
        <div class="gm-levelup-name">${_getLevelName(level)}</div>
        <div class="gm-levelup-xp">${_xpData.xp} XP</div>
        <button class="gm-levelup-btn" onclick="this.closest('.gm-levelup-overlay').remove()">Harika!</button>
      </div>
    `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 5000);
}

/* ────────────────────────────────────────────────────────────────
   STREAK ROZET BILDIRIMI
   ─────────────────────────────────────────────────────────────── */
function _showStreakBadge(badge) {
  const el = document.createElement('div');
  el.className = 'gm-streak-badge-toast';
  el.innerHTML = `
      <span class="gm-sb-icon" style="color:${badge.color}">${icon(badge.icon, 22)}</span>
      <div>
        <div class="gm-sb-title">Seri Rozeti!</div>
        <div class="gm-sb-label">${badge.label}</div>
      </div>
    `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 500); }, 3500);
}

/* ────────────────────────────────────────────────────────────────
   CONFETTI
   ─────────────────────────────────────────────────────────────── */
function _spawnConfetti(count) {
  count = count || 40;
  const colors = ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#0f766e', '#1abc9c', '#e67e22'];
  const container = document.getElementById('gm-confetti-layer') || (() => {
    const c = document.createElement('div');
    c.id = 'gm-confetti-layer';
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden';
    document.body.appendChild(c);
    return c;
  })();

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 8;
    const left = Math.random() * 100;
    const delay = Math.random() * 400;
    const rot = Math.random() * 360;
    const shape = Math.random() > 0.5 ? '50%' : '2px';

    p.style.cssText = `
          position:absolute;
          left:${left}vw;
          top:-16px;
          width:${size}px;
          height:${size}px;
          background:${color};
          border-radius:${shape};
          opacity:1;
          transform:rotate(${rot}deg);
          animation: gm-fall ${0.8 + Math.random() * 0.8}s ${delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards;
        `;
    container.appendChild(p);
    setTimeout(() => p.remove(), delay + 1600);
  }
}

/* ────────────────────────────────────────────────────────────────
   SHAKE  (yanlış cevap)
   ─────────────────────────────────────────────────────────────── */
function _shakeElement(el) {
  if (!el) return;
  el.classList.remove('gm-shake');
  void el.offsetWidth;
  el.classList.add('gm-shake');
  setTimeout(() => el.classList.remove('gm-shake'), 500);
}

/* ────────────────────────────────────────────────────────────────
   ÜNİTE BİTİŞ KUTLAMASI
   ─────────────────────────────────────────────────────────────── */
function _celebrateUnitComplete(unitNum) {
  _spawnConfetti(60);
  const el = document.createElement('div');
  el.className = 'gm-levelup-overlay';
  el.innerHTML = `
      <div class="gm-levelup-card" style="border-color:rgba(46,204,113,0.5)">
        <div class="gm-levelup-stars" style="color:#2ecc71">${icon('star', 18)} ${icon('star', 24)} ${icon('star', 18)}</div>
        <div class="gm-levelup-label" style="color:#2ecc71">ÜNİTE TAMAMLANDI!</div>
        <div class="gm-levelup-num" style="font-size:28px">Ünite ${unitNum} Tamamlandı</div>
        <div class="gm-levelup-name">Tüm kelimeler öğrenildi</div>
        <button class="gm-levelup-btn" style="background:#2ecc71" onclick="this.closest('.gm-levelup-overlay').remove()">Devam Et</button>
      </div>
    `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
}

/* ────────────────────────────────────────────────────────────────
   STATS PANELİNE XP/STREAK BÖLÜMÜ EKLE
   ─────────────────────────────────────────────────────────────── */
function _injectXPStats() {
  const container = document.getElementById('stats-content');
  if (!container) return;

  // Daha önce eklendiyse atlat
  if (container.querySelector('.gm-stats-block')) return;

  const lvl = _getLevelForXP(_xpData.xp);
  const prog = _getXPProgress(_xpData.xp);
  const streak = _streakData.streak || 0;
  const longest = _streakData.longest || 0;

  const badgesHtml = STREAK_BADGES.map(b => {
    const earned = longest >= b.days || streak >= b.days;
    return `<div class="gm-badge-chip ${earned ? 'earned' : ''}" title="${b.label}">
          <span>${icon(b.icon, 16)}</span>
          <span class="gm-badge-days">${b.days}g</span>
        </div>`;
  }).join('');

  const block = document.createElement('div');
  block.className = 'gm-stats-block';
  block.innerHTML = `
      <div class="gm-stats-divider"></div>
      <div class="gm-stats-section-title">${icon('zap', 15)} XP & Seviye</div>
      <div class="gm-stats-xp-row">
        <div class="gm-stats-xp-card">
          <div class="gm-stats-xp-level">Seviye ${lvl}</div>
          <div class="gm-stats-xp-name">${_getLevelName(lvl)}</div>
          <div class="gm-stats-xp-total">${_xpData.xp} XP</div>
          <div class="gm-stats-bar-wrap">
            <div class="gm-stats-bar-fill" style="width:${prog.pct}%"></div>
          </div>
          <div class="gm-stats-bar-label">${prog.current} / ${prog.needed || '—'} XP</div>
        </div>
        <div class="gm-stats-streak-card">
          <div class="gm-stats-streak-num ${streak >= 3 ? 'hot' : ''}">${icon(streak >= 3 ? 'flame' : 'calendar', 18)} ${streak}</div>
          <div class="gm-stats-streak-label">günlük seri</div>
          <div class="gm-stats-streak-best">En uzun: ${longest} gün</div>
        </div>
      </div>
      <div class="gm-stats-section-title" style="margin-top:16px">${icon('award', 15)} Seri Rozetleri</div>
      <div class="gm-badge-row">${badgesHtml}</div>
    `;
  container.insertBefore(block, container.lastElementChild);
}

/* ── INITIALIZATION ──────────────────────────────────────────────── */

function _initGamification() {
  _updateStreakWithFreeze();
  _todayGoalSync();
  _initDailyQuests();
  _renderHUD();

  const today = _todayStr();
  const lastShownStreak = localStorage.getItem('ydt_streak_shown');
  if (_streakData.streak >= 3 && lastShownStreak !== today) {
    localStorage.setItem('ydt_streak_shown', today);
    setTimeout(() => {
      const badge = STREAK_BADGES.slice().reverse().find(b => _streakData.streak >= b.days);
      if (badge) _showStreakBadge(badge);
    }, 1500);
  }
}
