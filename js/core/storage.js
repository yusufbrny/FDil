// Core application state and localStorage persistence

// ===== RUNTIME & PERSISTED STATE =====
let currentUnit = null;
let currentCards = [];
let cardIndex = 0;
let known = [], unknown = [];
let mcScore = 0, mcTotal = 0;
let fibScore = 0, fibTotal = 0;
let fibMode = 'type';
let selectedFibChoice = null;
let errorBox = JSON.parse(localStorage.getItem('ydt_errors') || '{}');

// progressRaw -> { "1": ["abandon", "absolutely"], "2": [...] }
let progressRaw = JSON.parse(localStorage.getItem('ydt_progress2') || '{}');
let customVocab = JSON.parse(localStorage.getItem('ydt_vocab') || '[]');
let mixQuizCards = [];
let mixIndex = 0, mixScore = 0, mixTotal = 0;
let searchDebounceTimer = null;
let editingWordIndex = null;

// PWA Install Prompt
let deferredPrompt = null;
let pwaInstallable = false;

// Spaced Repetition State
let _srData = JSON.parse(localStorage.getItem('ydt_sr_v1') || '{}');

// User Meta Overrides, PV Errors, Reading & Dictionary caches
let userMeta = JSON.parse(localStorage.getItem('ydt_user_meta') || '{}');
let pvErrors = JSON.parse(localStorage.getItem('ydt_pv_errors') || '{}');
let readingLearnedWords = JSON.parse(localStorage.getItem('ydt_reading_words') || '{}');
let dictCache = JSON.parse(localStorage.getItem('ydt_dict_cache') || '{}');
let dictHistory = JSON.parse(localStorage.getItem('ydt_dict_history') || '[]');

// ===== PROGRESS & PERSISTENCE HELPERS =====
function getLearnedSet(unit) {
  return new Set(progressRaw[unit] || []);
}

function markLearned(unit, word) {
  if (!progressRaw[unit]) progressRaw[unit] = [];
  const s = new Set(progressRaw[unit]);
  s.add(word);
  progressRaw[unit] = [...s];
  saveProgress();
  logActivity();
  if (typeof earnXP === 'function') earnXP('mark_learned', null);
  if (getProgressPct(unit) === 100 && typeof _celebrateUnitComplete === 'function') {
    setTimeout(() => _celebrateUnitComplete(unit), 400);
  }
  if (typeof _srSyncWordLearned === 'function') _srSyncWordLearned(word);
}

function markUnlearned(unit, word) {
  if (!progressRaw[unit]) return;
  progressRaw[unit] = progressRaw[unit].filter(w => w !== word);
  saveProgress();
  if (typeof _srSyncWordUnlearned === 'function') _srSyncWordUnlearned(word);
}

function getProgressPct(unit) {
  const learned = getLearnedSet(unit).size;
  const total = UNITS[unit].words.length;
  return Math.round((learned / total) * 100);
}

function saveErrors() { localStorage.setItem('ydt_errors', JSON.stringify(errorBox)); updateErrorBadge(); }
function saveProgress() { localStorage.setItem('ydt_progress2', JSON.stringify(progressRaw)); }
function saveVocab() { localStorage.setItem('ydt_vocab', JSON.stringify(customVocab)); updateMyWordsBadge(); }
function saveUserMeta() { localStorage.setItem('ydt_user_meta', JSON.stringify(userMeta)); }
function savePVErrors() { localStorage.setItem('ydt_pv_errors', JSON.stringify(pvErrors)); updateErrorBadge(); }
function _saveReadingWords() { localStorage.setItem('ydt_reading_words', JSON.stringify(readingLearnedWords)); }
function _saveDictCache() { localStorage.setItem('ydt_dict_cache', JSON.stringify(dictCache)); }
function _saveDictHistory() { localStorage.setItem('ydt_dict_history', JSON.stringify(dictHistory)); }

function updateMyWordsBadge() {
  const badge = document.getElementById('my-words-count-badge');
  if (badge) {
    if (customVocab.length > 0) {
      badge.textContent = customVocab.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function updateErrorBadge() {
  const pvCount = (typeof pvErrors !== 'undefined') ? Object.keys(pvErrors).length : 0;
  const total = Object.keys(errorBox).length + pvCount;
  const badge = document.getElementById('error-badge-header');
  const cnt = document.getElementById('error-count-main');
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'inline-block' : 'none'; }
  if (cnt) { cnt.textContent = total; cnt.style.display = total > 0 ? 'inline-block' : 'none'; }
}



function logActivity() {
  if (typeof _updateStreakWithFreeze === 'function') _updateStreakWithFreeze();
  if (typeof _trackQuestStat === 'function') _trackQuestStat('modesUsed', 'activity');
  if (typeof _renderHUD === 'function') _renderHUD();
}

function getUserMeta(word) {
  const key = word.toLowerCase().trim();
  return userMeta[key] || null;
}

function getWordMetaFull(word) {
  const base = getWordMeta(word);
  const override = getUserMeta(word);
  if (!override) return base;
  return {
    synonyms: override.s !== undefined ? override.s : base.synonyms,
    antonyms: override.a !== undefined ? override.a : base.antonyms,
    family: override.f !== undefined ? override.f : base.family
  };
}

