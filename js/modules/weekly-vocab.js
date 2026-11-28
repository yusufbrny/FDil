// Weekly Vocabulary Study Module — customizable study counts, ordering, self-test concealment, and 8 study techniques

const WEEKLY_PROGRESS_KEY = 'fdil_weekly_progress_v1';
const WEEKLY_CUSTOM_KEY = 'fdil_weekly_custom_v1';
const WEEKLY_PREFS_KEY = 'fdil_weekly_study_prefs_v1';

let weeklyProgress = (() => {
  try { return JSON.parse(localStorage.getItem(WEEKLY_PROGRESS_KEY) || '{}'); }
  catch (e) { return {}; }
})();

let _customWeeks = (() => {
  try { return JSON.parse(localStorage.getItem(WEEKLY_CUSTOM_KEY) || '[]'); }
  catch (e) { return []; }
})();

let _weeklyStudyPrefs = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(WEEKLY_PREFS_KEY) || '{}');
    const count = Number.isFinite(Number(raw.count)) && Number(raw.count) >= 0 ? Math.floor(Number(raw.count)) : 20;
    const order = ['shuffle', 'sequential', 'priority'].includes(raw.order) ? raw.order : 'shuffle';
    return { count, order };
  } catch (e) {
    return { count: 20, order: 'shuffle' };
  }
})();

let _activeWeekId = 'week-1';
let _activeWeekSetId = 'all';
let _weeklyStatusFilter = 'all'; // 'all' | 'unlearned' | 'learned'
let _weeklySearchQuery = '';
let _weeklyHideMeanings = false;
let _weeklyRevealedKeys = new Set();

function _normWeeklyWord(w) {
  return String(w || '').trim().toLowerCase();
}

function saveWeeklyProgress() {
  try { localStorage.setItem(WEEKLY_PROGRESS_KEY, JSON.stringify(weeklyProgress)); } catch (e) { }
}

function _saveCustomWeeks() {
  try { localStorage.setItem(WEEKLY_CUSTOM_KEY, JSON.stringify(_customWeeks)); } catch (e) { }
}

function _saveWeeklyPrefs() {
  try { localStorage.setItem(WEEKLY_PREFS_KEY, JSON.stringify(_weeklyStudyPrefs)); } catch (e) { }
}

function getWeeklyStudyPrefs() {
  return { count: _weeklyStudyPrefs.count, order: _weeklyStudyPrefs.order };
}

function setWeeklyStudyCount(val) {
  const n = Math.floor(Number(val));
  if (!Number.isFinite(n) || n < 0) return;
  _weeklyStudyPrefs.count = n === 0 ? 0 : Math.min(500, Math.max(1, n));
  _saveWeeklyPrefs();
  _refreshWeeklyConfigUI();
}

function setWeeklyStudyOrder(order) {
  if (!['shuffle', 'sequential', 'priority'].includes(order)) return;
  _weeklyStudyPrefs.order = order;
  _saveWeeklyPrefs();
  _refreshWeeklyConfigUI();
}

function _onCustomCountInput(rawVal) {
  const trimmed = String(rawVal || '').trim();
  if (!trimmed) return;
  const n = Math.floor(Number(trimmed));
  if (!Number.isFinite(n) || n < 1) return;
  _weeklyStudyPrefs.count = Math.min(500, n);
  _saveWeeklyPrefs();
  _refreshWeeklyConfigUI(true);
}

function _refreshWeeklyConfigUI(keepInputFocus = false) {
  const week = getWeekById(_activeWeekId);
  if (!week) return;
  const available = _buildWeeklyStudyCards(week, _activeWeekSetId, _weeklyStatusFilter).length
    || _buildWeeklyStudyCards(week, _activeWeekSetId, 'all').length;
  const prefs = getWeeklyStudyPrefs();
  const effective = prefs.count === 0 ? available : Math.min(prefs.count, available);
  const countLabel = prefs.count === 0 ? `Tümü (${available})` : `${effective}`;

  document.querySelectorAll('.wk-count-pill[data-wcount]').forEach(btn => {
    const v = Number(btn.dataset.wcount);
    btn.classList.toggle('active', v === prefs.count);
  });

  document.querySelectorAll('.wk-order-pill[data-worder]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.worder === prefs.order);
  });

  const inp = document.getElementById('wk-custom-count-inp');
  if (inp && !keepInputFocus) {
    inp.value = prefs.count > 0 ? String(prefs.count) : '';
  }

  const summary = document.getElementById('wk-config-summary');
  if (summary) {
    summary.textContent = `Havuz: ${available} kelime · Seçili: ${effective}`;
  }

  document.querySelectorAll('.wk-tech-count').forEach(el => {
    el.textContent = countLabel;
  });
}

function getAllWeeks() {
  const base = Array.isArray(window.WEEKLY_VOCAB) ? window.WEEKLY_VOCAB : [];
  const custom = Array.isArray(_customWeeks) ? _customWeeks : [];
  return [...base, ...custom];
}

function getWeekById(weekId) {
  const weeks = getAllWeeks();
  return weeks.find(w => w.id === weekId) || weeks[0] || null;
}

function getWeekLearnedSet(weekId) {
  const arr = weeklyProgress && Array.isArray(weeklyProgress[weekId]) ? weeklyProgress[weekId] : [];
  return new Set(arr.map(_normWeeklyWord));
}

function isWeeklyWordLearned(weekId, wordStr) {
  return getWeekLearnedSet(weekId).has(_normWeeklyWord(wordStr));
}

function markWeeklyWordLearned(weekId, wordStr, learned = true, silent = false) {
  if (!weekId || !wordStr) return;
  const norm = _normWeeklyWord(wordStr);
  if (!weeklyProgress[weekId]) weeklyProgress[weekId] = [];
  const cur = new Set(weeklyProgress[weekId].map(_normWeeklyWord));
  const wasLearned = cur.has(norm);

  if (learned) {
    cur.add(norm);
    weeklyProgress[weekId] = [...cur];
    saveWeeklyProgress();
    if (!wasLearned && !silent) {
      if (typeof logActivity === 'function') logActivity();
      if (typeof earnXP === 'function') earnXP('mark_learned', null);
    }
  } else {
    cur.delete(norm);
    weeklyProgress[weekId] = [...cur];
    saveWeeklyProgress();
  }
  if (typeof syncActiveUserStats === 'function') syncActiveUserStats();
}

function getWeekWords(week, setId = 'all') {
  if (!week || !Array.isArray(week.sets)) return [];
  const rows = [];
  week.sets.forEach((setObj, sIdx) => {
    if (setId !== 'all' && setObj.id !== setId) return;
    (setObj.words || []).forEach((pair, wIdx) => {
      if (!pair || !pair[0]) return;
      rows.push({
        en: pair[0],
        tr: pair[1] || '',
        num: wIdx + 1,
        setId: setObj.id,
        setLabel: setObj.label || `${sIdx + 1}. Liste`,
        key: `${week.id}:${setObj.id}:${wIdx}`
      });
    });
  });
  return rows;
}

function getWeekStats(weekId) {
  const week = getWeekById(weekId);
  if (!week) return { total: 0, uniqueTotal: 0, learned: 0, pct: 0, setCount: 0 };
  const rows = getWeekWords(week, 'all');
  const uniqueWords = new Set(rows.map(r => _normWeeklyWord(r.en)));
  const learnedSet = getWeekLearnedSet(week.id);
  let learned = 0;
  uniqueWords.forEach(w => { if (learnedSet.has(w)) learned++; });
  const total = rows.length;
  const uniqueTotal = uniqueWords.size;
  const pct = uniqueTotal > 0 ? Math.round((learned / uniqueTotal) * 100) : 0;
  return { total, uniqueTotal, learned, pct, setCount: (week.sets || []).length };
}

function getAllWeeklyStats() {
  const weeks = getAllWeeks();
  let totalWords = 0;
  let learnedWords = 0;
  weeks.forEach(w => {
    const st = getWeekStats(w.id);
    totalWords += st.uniqueTotal;
    learnedWords += st.learned;
  });
  const pct = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  return { weekCount: weeks.length, totalWords, learnedWords, pct };
}

function getAllWeeklyWordsFlat() {
  const out = [];
  const seen = new Set();
  getAllWeeks().forEach(w => {
    getWeekWords(w, 'all').forEach(r => {
      const k = _normWeeklyWord(r.en);
      if (seen.has(k)) return;
      seen.add(k);
      const card = [r.en, r.tr, ''];
      card._weekId = w.id;
      card._weekLabel = w.title;
      out.push(card);
    });
  });
  return out;
}

function _buildWeeklyStudyCards(week, setId, statusFilter = 'all') {
  const rows = getWeekWords(week, setId);
  const learnedSet = getWeekLearnedSet(week.id);
  const seen = new Set();
  const cards = [];
  const filterMode = statusFilter === true ? 'unlearned' : (statusFilter || 'all');

  rows.forEach(r => {
    const norm = _normWeeklyWord(r.en);
    if (seen.has(norm)) return;
    const isLearned = learnedSet.has(norm);
    if (filterMode === 'unlearned' && isLearned) return;
    if (filterMode === 'learned' && !isLearned) return;
    seen.add(norm);
    const card = [r.en, r.tr, ''];
    card._weekId = week.id;
    card._weekLabel = `${week.title}${setId !== 'all' ? ' · ' + r.setLabel : ''}`;
    cards.push(card);
  });
  return cards;
}

function _buildOrderedWeeklyPool(week, setId, countOverride = null, orderOverride = null, statusFilter = 'all', quiet = false) {
  let cards = _buildWeeklyStudyCards(week, setId, statusFilter);
  if (cards.length === 0 && statusFilter !== 'all') {
    cards = _buildWeeklyStudyCards(week, setId, 'all');
    if (!quiet && cards.length > 0 && typeof showToast === 'function') {
      showToast(statusFilter === 'unlearned'
        ? 'Bu bölümdeki tüm kelimeleri öğrendin! Tümü yükleniyor.'
        : 'Öğrenilen kelime bulunamadı, tüm liste yükleniyor.');
    }
  }
  if (cards.length === 0) return [];

  const order = orderOverride || _weeklyStudyPrefs.order || 'shuffle';
  let ordered;

  if (order === 'sequential') {
    ordered = [...cards];
  } else if (order === 'priority') {
    const learnedSet = getWeekLearnedSet(week.id);
    const errMap = (typeof errorBox !== 'undefined' && errorBox) ? errorBox : {};
    const errorWords = new Set(Object.keys(errMap).map(_normWeeklyWord));
    const tierError = [];
    const tierUnlearned = [];
    const tierLearned = [];
    cards.forEach(c => {
      const k = _normWeeklyWord(c[0]);
      if (errorWords.has(k)) tierError.push(c);
      else if (!learnedSet.has(k)) tierUnlearned.push(c);
      else tierLearned.push(c);
    });
    ordered = [...shuffle(tierError), ...shuffle(tierUnlearned), ...shuffle(tierLearned)];
  } else {
    ordered = shuffle(cards);
  }

  const limit = countOverride !== null && countOverride !== undefined
    ? Number(countOverride)
    : _weeklyStudyPrefs.count;

  if (limit > 0 && ordered.length > limit) {
    return ordered.slice(0, limit);
  }
  return ordered;
}

function showWeeklyVocab(weekId) {
  if (weekId) {
    _activeWeekId = weekId;
    _activeWeekSetId = 'all';
    _weeklyStatusFilter = 'all';
    _weeklySearchQuery = '';
    _weeklyRevealedKeys.clear();
  }
  const week = getWeekById(_activeWeekId);
  if (week) _activeWeekId = week.id;
  renderWeeklyVocab();
  showScreen('screen-weekly', 'forward');
}

function selectWeeklyWeek(weekId) {
  _activeWeekId = weekId;
  _activeWeekSetId = 'all';
  _weeklyStatusFilter = 'all';
  _weeklySearchQuery = '';
  _weeklyRevealedKeys.clear();
  renderWeeklyVocab();
}

function selectWeeklySet(setId) {
  _activeWeekSetId = setId;
  _weeklyRevealedKeys.clear();
  renderWeeklyVocab();
}

function setWeeklyStatusFilter(status) {
  _weeklyStatusFilter = status;
  renderWeeklyVocab();
}

function onWeeklySearchInput(val) {
  _weeklySearchQuery = val || '';
  _renderWeeklyListBody();
}

function toggleWeeklyHideMeanings() {
  _weeklyHideMeanings = !_weeklyHideMeanings;
  _weeklyRevealedKeys.clear();
  renderWeeklyVocab();
}

function toggleWeeklyRevealRow(rowKey) {
  if (!_weeklyHideMeanings) return;
  if (_weeklyRevealedKeys.has(rowKey)) _weeklyRevealedKeys.delete(rowKey);
  else _weeklyRevealedKeys.add(rowKey);
  const el = document.querySelector(`.wk-word-row[data-rkey="${CSS.escape(rowKey)}"]`);
  if (el) el.classList.toggle('is-revealed', _weeklyRevealedKeys.has(rowKey));
}

function toggleWeeklyWordCheck(weekId, rowIdx) {
  const week = getWeekById(weekId);
  if (!week) return;
  const rows = _getFilteredWeeklyRows(week);
  const row = rows[rowIdx];
  if (!row) return;
  const next = !isWeeklyWordLearned(week.id, row.en);
  markWeeklyWordLearned(week.id, row.en, next, false);
  if (typeof playGameSFX === 'function') playGameSFX(next ? 'correct' : 'undo', 1);
  renderWeeklyVocab();
}

function speakWeeklyRow(weekId, rowIdx) {
  const week = getWeekById(weekId);
  if (!week) return;
  const rows = _getFilteredWeeklyRows(week);
  const row = rows[rowIdx];
  if (row && row.en && typeof speakWord === 'function') speakWord(row.en);
}

function startWeeklyMode(mode, countOverride = null) {
  const week = getWeekById(_activeWeekId);
  if (!week) return;

  const pool = _buildOrderedWeeklyPool(week, _activeWeekSetId, countOverride, null, _weeklyStatusFilter, false);
  if (pool.length === 0) {
    showToast('Çalışılacak kelime bulunamadı.');
    return;
  }

  const allWeekWords = _buildWeeklyStudyCards(week, 'all', 'all');
  const activeSet = (week.sets || []).find(s => s.id === _activeWeekSetId);
  const scopeTitle = activeSet ? `${week.title} · ${activeSet.label}` : week.title;
  const backExpr = `showWeeklyVocab('${week.id}')`;

  if (mode === 'flash') {
    startFlash(pool, {
      backFn: backExpr,
      title: `${scopeTitle} · Flash Kartlar`,
      unitTagFn: w => w._weekLabel || week.title
    });
  } else if (mode === 'mc') {
    startMC(pool, backExpr, `${scopeTitle} · Çoktan Seçmeli`);
  } else if (mode === 'speed') {
    startSpeedMode(pool, backExpr, `${scopeTitle} · Hız Modu`);
  } else if (mode === 'reverse' && typeof startWeeklyReverseQuiz === 'function') {
    startWeeklyReverseQuiz(pool, allWeekWords, backExpr, `${scopeTitle} · Ters Test (TR → EN)`, week.id);
  } else if (mode === 'write' && typeof startWeeklyWriteDrill === 'function') {
    startWeeklyWriteDrill(pool, allWeekWords, backExpr, `${scopeTitle} · Yazarak Öğren`, week.id);
  } else if (mode === 'match' && typeof startWeeklyMatchDrill === 'function') {
    startWeeklyMatchDrill(pool, allWeekWords, backExpr, `${scopeTitle} · Eşleştirme`, week.id);
  } else if (mode === 'listen' && typeof startWeeklyListenDrill === 'function') {
    startWeeklyListenDrill(pool, allWeekWords, backExpr, `${scopeTitle} · Dinle & Bil`, week.id);
  } else if (mode === 'mastery' && typeof startWeeklyMasteryDrill === 'function') {
    startWeeklyMasteryDrill(pool, allWeekWords, backExpr, `${scopeTitle} · Ustalık Döngüsü`, week.id);
  }
}

function _getFilteredWeeklyRows(week) {
  const rows = getWeekWords(week, _activeWeekSetId);
  const learnedSet = getWeekLearnedSet(week.id);
  const q = _weeklySearchQuery.trim().toLowerCase();

  return rows.filter(r => {
    const isLearned = learnedSet.has(_normWeeklyWord(r.en));
    if (_weeklyStatusFilter === 'learned' && !isLearned) return false;
    if (_weeklyStatusFilter === 'unlearned' && isLearned) return false;
    if (q) {
      return r.en.toLowerCase().includes(q) || r.tr.toLowerCase().includes(q) || String(r.num) === q;
    }
    return true;
  });
}

function _renderWeeklyListBody() {
  const container = document.getElementById('weekly-word-list');
  const countEl = document.getElementById('weekly-visible-count');
  const week = getWeekById(_activeWeekId);
  if (!container || !week) return;

  const rows = _getFilteredWeeklyRows(week);
  const learnedSet = getWeekLearnedSet(week.id);
  if (countEl) countEl.textContent = `${rows.length} kelime gösteriliyor`;

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="wk-empty">
        <p>Bu filtreye uyan kelime bulunamadı.</p>
        <button type="button" class="pill active" onclick="setWeeklyStatusFilter('all')">Tümünü Göster</button>
      </div>`;
    return;
  }

  container.innerHTML = rows.map((r, idx) => {
    const isLearned = learnedSet.has(_normWeeklyWord(r.en));
    const isRevealed = _weeklyRevealedKeys.has(r.key);
    const hideTr = _weeklyHideMeanings && !isRevealed;
    return `
      <div class="wk-word-row ${isLearned ? 'is-learned' : ''} ${_weeklyHideMeanings ? 'is-masked-mode' : ''} ${isRevealed ? 'is-revealed' : ''}" data-rkey="${escQ(r.key)}">
        <button type="button" class="wk-check-btn ${isLearned ? 'checked' : ''}" onclick="toggleWeeklyWordCheck('${escQ(week.id)}',${idx})" aria-label="${isLearned ? 'Öğrenildi işaretini kaldır' : 'Öğrenildi olarak işaretle'}">
          ${isLearned ? icon('check', 13) : ''}
        </button>
        <span class="wk-num">${r.num}</span>
        <div class="wk-word-main" onclick="toggleWeeklyRevealRow('${escQ(r.key)}')">
          <div class="wk-en-line">
            <span class="wk-en">${esc(r.en)}</span>
            ${_activeWeekSetId === 'all' && week.sets.length > 1 ? `<span class="wk-set-tag">${esc(r.setLabel)}</span>` : ''}
          </div>
          <div class="wk-tr ${hideTr ? 'is-hidden-meaning' : ''}">${hideTr ? 'Anlamı görmek için dokun' : esc(r.tr)}</div>
        </div>
        <button type="button" class="wk-speak-btn" onclick="speakWeeklyRow('${escQ(week.id)}',${idx})" aria-label="Telaffuz dinle" title="Dinle">
          ${icon('volume', 15)}
        </button>
      </div>`;
  }).join('');
}

function renderWeeklyVocab() {
  const s = document.getElementById('screen-weekly');
  if (!s) return;

  const weeks = getAllWeeks();
  const week = getWeekById(_activeWeekId);
  if (!week) return;

  const st = getWeekStats(week.id);
  const allRowsInSet = getWeekWords(week, _activeWeekSetId);
  const learnedSet = getWeekLearnedSet(week.id);
  const uniqueInSet = new Set(allRowsInSet.map(r => _normWeeklyWord(r.en)));
  let learnedInSet = 0;
  uniqueInSet.forEach(w => { if (learnedSet.has(w)) learnedInSet++; });
  const unlearnedInSet = Math.max(0, uniqueInSet.size - learnedInSet);

  const prefs = getWeeklyStudyPrefs();
  const availablePoolLen = _buildWeeklyStudyCards(week, _activeWeekSetId, _weeklyStatusFilter).length
    || uniqueInSet.size;
  const effectiveCount = prefs.count === 0 ? availablePoolLen : Math.min(prefs.count, availablePoolLen);
  const countBadgeTxt = prefs.count === 0 ? `Tümü (${availablePoolLen})` : `${effectiveCount}`;

  const presets = [
    { val: 10, label: '10' },
    { val: 15, label: '15' },
    { val: 20, label: '20' },
    { val: 25, label: '25' },
    { val: 50, label: '50' },
    { val: 0, label: 'Tümü' }
  ];

  const techniques = [
    { id: 'flash', title: 'Flash Kartlar', desc: '3D kart & sağa/sola kaydırma', ic: 'layers', tone: 'primary' },
    { id: 'mc', title: 'Test (EN → TR)', desc: '4 şıklı anlam tanıma', ic: 'checkCircle', tone: 'teal' },
    { id: 'reverse', title: 'Ters Test (TR → EN)', desc: 'Türkçe’den İngilizce’ye aktif seçim', ic: 'repeat', tone: 'blue' },
    { id: 'write', title: 'Yazarak Öğren', desc: 'Aktif hatırlama, harf & ses ipucu', ic: 'penLine', tone: 'amber' },
    { id: 'match', title: 'Eşleştirme', desc: '5’li gruplarla hızlı hafıza oyunu', ic: 'grid', tone: 'teal' },
    { id: 'listen', title: 'Dinle & Bil', desc: 'Sesli telaffuz & dikte çalışması', ic: 'volume', tone: 'blue' },
    { id: 'mastery', title: 'Ustalık Döngüsü', desc: 'Yanlışı tekrar soran 2 aşamalı sistem', ic: 'brain', tone: 'green' },
    { id: 'speed', title: 'Hız Modu', desc: '10 sn zamana karşı seri', ic: 'timer', tone: 'red' }
  ];

  s.innerHTML = `
    <div class="unit-header">
      <button type="button" class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">Kelime Çalışma</div>
        <div class="unit-sub">${esc(week.title)} · ${st.learned}/${st.uniqueTotal} kelime öğrenildi (%${st.pct})</div>
      </div>
      <button type="button" class="wk-add-week-btn" onclick="openAddWeekModal()" title="Yeni hafta ekle">
        ${icon('plus', 15)} <span>Hafta Ekle</span>
      </button>
    </div>

    <div class="wk-scroll">
      <div class="wk-week-tabs" role="tablist" aria-label="Hafta seçimi">
        ${weeks.map(w => {
    const wst = getWeekStats(w.id);
    const active = w.id === week.id;
    return `
            <button type="button" class="wk-week-tab ${active ? 'active' : ''}" onclick="selectWeeklyWeek('${escQ(w.id)}')">
              <span class="wk-tab-title">${esc(w.title)}</span>
              <span class="wk-tab-meta">${wst.learned}/${wst.uniqueTotal}</span>
            </button>`;
  }).join('')}
      </div>

      <div class="wk-overview-card">
        <div class="wk-overview-top">
          <div>
            <div class="wk-overview-eyebrow">${esc(week.dateLabel || 'Haftalık Program')}</div>
            <h2 class="wk-overview-title">${esc(week.title)} — ${esc(week.subtitle || 'Kelime Listesi')}</h2>
          </div>
          <div class="wk-overview-pct">%${st.pct}</div>
        </div>
        <div class="wk-progress-track"><div class="wk-progress-fill" style="width:${st.pct}%"></div></div>

        <div class="wk-config-box">
          <div class="wk-config-head">
            <span class="wk-config-title">${icon('sliders', 13)} Çalışma Ayarları</span>
            <span class="wk-config-summary" id="wk-config-summary">Havuz: ${availablePoolLen} kelime · Seçili: ${effectiveCount}</span>
          </div>
          <div class="wk-count-row">
            <span class="wk-config-lbl">Soru Sayısı:</span>
            <div class="wk-count-pills">
              ${presets.map(p => `
                <button type="button" class="wk-count-pill ${prefs.count === p.val ? 'active' : ''}" data-wcount="${p.val}" onclick="setWeeklyStudyCount(${p.val})">${p.label}</button>
              `).join('')}
              <label class="wk-custom-count-wrap" title="Özel sayı gir">
                <input type="number" id="wk-custom-count-inp" class="wk-custom-count-inp" min="1" max="500" placeholder="Özel" value="${prefs.count > 0 ? prefs.count : ''}" oninput="_onCustomCountInput(this.value)" onchange="_onCustomCountInput(this.value)" aria-label="Özel soru sayısı">
              </label>
            </div>
          </div>
          <div class="wk-order-row">
            <span class="wk-config-lbl">Sıra:</span>
            <div class="wk-order-pills">
              <button type="button" class="wk-order-pill ${prefs.order === 'shuffle' ? 'active' : ''}" data-worder="shuffle" onclick="setWeeklyStudyOrder('shuffle')">${icon('shuffle', 12)} Karışık</button>
              <button type="button" class="wk-order-pill ${prefs.order === 'sequential' ? 'active' : ''}" data-worder="sequential" onclick="setWeeklyStudyOrder('sequential')">${icon('listOrdered', 12)} Sıralı</button>
              <button type="button" class="wk-order-pill ${prefs.order === 'priority' ? 'active' : ''}" data-worder="priority" onclick="setWeeklyStudyOrder('priority')">${icon('target', 12)} Zor &amp; Öğrenilmemiş Önce</button>
            </div>
          </div>
        </div>

        <div class="wk-practice-grid">
          ${techniques.map(t => `
            <button type="button" class="wk-tech-card is-${t.tone}" onclick="startWeeklyMode('${t.id}')">
              <div class="wk-tech-top">
                <span class="wk-tech-icon">${icon(t.ic, 16)}</span>
                <span class="wk-tech-count">${esc(countBadgeTxt)}</span>
              </div>
              <div class="wk-tech-title">${t.title}</div>
              <div class="wk-tech-desc">${t.desc}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="wk-toolbar">
        ${week.sets.length > 1 ? `
          <div class="wk-set-pills">
            <button type="button" class="pill ${_activeWeekSetId === 'all' ? 'active' : ''}" onclick="selectWeeklySet('all')">Tümü (${getWeekWords(week, 'all').length})</button>
            ${week.sets.map(setObj => `
              <button type="button" class="pill ${_activeWeekSetId === setObj.id ? 'active' : ''}" onclick="selectWeeklySet('${escQ(setObj.id)}')">${esc(setObj.label)} (${setObj.words.length})</button>
            `).join('')}
          </div>
        ` : ''}

        <div class="wk-controls-row">
          <div class="wk-search-box">
            ${icon('search', 14)}
            <input type="text" id="weekly-search-inp" placeholder="Hafta içinde kelime veya anlam ara..." value="${escQ(_weeklySearchQuery)}" oninput="onWeeklySearchInput(this.value)" autocomplete="off" spellcheck="false">
          </div>
          <button type="button" class="wk-mask-btn ${_weeklyHideMeanings ? 'active' : ''}" onclick="toggleWeeklyHideMeanings()">
            ${_weeklyHideMeanings ? 'Anlamları Göster' : 'Anlamları Gizle'}
          </button>
        </div>

        <div class="wk-filter-row">
          <div class="pills">
            <button type="button" class="pill ${_weeklyStatusFilter === 'all' ? 'active' : ''}" onclick="setWeeklyStatusFilter('all')">Tümü</button>
            <button type="button" class="pill ${_weeklyStatusFilter === 'unlearned' ? 'active' : ''}" onclick="setWeeklyStatusFilter('unlearned')">Çalışılacak (${unlearnedInSet})</button>
            <button type="button" class="pill ${_weeklyStatusFilter === 'learned' ? 'active' : ''}" onclick="setWeeklyStatusFilter('learned')">Öğrenildi (${learnedInSet})</button>
          </div>
          <span class="wk-visible-count" id="weekly-visible-count"></span>
        </div>
      </div>

      <div class="wk-word-list" id="weekly-word-list"></div>
    </div>
  `;

  _renderWeeklyListBody();
}

function startWeeklyQuickFromHome(weekId, mode) {
  _activeWeekId = weekId;
  _activeWeekSetId = 'all';
  _weeklyStatusFilter = 'all';
  if (mode === 'open') {
    showWeeklyVocab(weekId);
    return;
  }
  const week = getWeekById(weekId);
  if (!week) return;
  const pool = _buildOrderedWeeklyPool(week, 'all', null, null, 'all', true);
  if (pool.length === 0) { showToast('Çalışılacak kelime bulunamadı.'); return; }
  const allWeekWords = _buildWeeklyStudyCards(week, 'all', 'all');

  if (mode === 'flash') {
    startFlash(pool, { backFn: 'goHome()', title: `${week.title} · Flash Kartlar`, unitTagFn: () => week.title });
  } else if (mode === 'mc') {
    startMC(pool, 'goHome()', `${week.title} · Çoktan Seçmeli`);
  } else if (mode === 'speed') {
    startSpeedMode(pool, 'goHome()', `${week.title} · Hız Modu`);
  } else if (mode === 'mastery' && typeof startWeeklyMasteryDrill === 'function') {
    startWeeklyMasteryDrill(pool, allWeekWords, 'goHome()', `${week.title} · Ustalık Döngüsü`, week.id);
  }
}

function renderHomeWeeklySection() {
  const sec = document.getElementById('weekly-home-section');
  if (!sec) return;
  const weeks = getAllWeeks();
  const totalStats = getAllWeeklyStats();
  const prefs = getWeeklyStudyPrefs();
  const countTxt = prefs.count === 0 ? 'Tümü' : String(prefs.count);

  sec.innerHTML = `
    <div class="section-header-row">
      <span class="section-label">Kelime Çalışma · Haftalık</span>
      <div class="wk-home-head-right">
        <span class="bookshelf-count-note">${weeks.length} Hafta · ${totalStats.learnedWords}/${totalStats.totalWords}</span>
        <button type="button" class="wk-home-add-btn" onclick="openAddWeekModal()">${icon('plus', 13)} Hafta Ekle</button>
      </div>
    </div>
    <div class="wk-home-grid count-${Math.min(weeks.length, 3)}">
      ${weeks.map((w, idx) => {
    const st = getWeekStats(w.id);
    const listSummary = (w.sets || []).map(s => `${s.label} (${s.words.length})`).join(' · ');
    return `
          <div class="wk-home-card" onclick="showWeeklyVocab('${escQ(w.id)}')">
            <div class="wk-home-card-top">
              <div>
                <div class="wk-home-eyebrow"><span class="status-dot accent"></span>${esc(w.dateLabel || `Week ${idx + 1}`)}</div>
                <div class="wk-home-title">${esc(w.title)}</div>
                <div class="wk-home-sub">${esc(listSummary || w.subtitle || '')}</div>
              </div>
              <div class="wk-home-pct-wrap">
                <span class="wk-home-pct">%${st.pct}</span>
                <span class="wk-home-ratio">${st.learned}/${st.uniqueTotal}</span>
              </div>
            </div>
            <div class="wk-progress-track"><div class="wk-progress-fill" style="width:${st.pct}%"></div></div>
            <div class="wk-home-actions" onclick="event.stopPropagation()">
              <button type="button" class="wk-home-act primary" onclick="showWeeklyVocab('${escQ(w.id)}')">${icon('bookOpen', 13)} Kelimeler (${st.total})</button>
              <button type="button" class="wk-home-act" onclick="startWeeklyQuickFromHome('${escQ(w.id)}','flash')">${icon('layers', 13)} Flash (${esc(countTxt)})</button>
              <button type="button" class="wk-home-act" onclick="startWeeklyQuickFromHome('${escQ(w.id)}','mc')">${icon('checkCircle', 13)} Test (${esc(countTxt)})</button>
              <button type="button" class="wk-home-act" onclick="startWeeklyQuickFromHome('${escQ(w.id)}','speed')">${icon('timer', 13)} Hız</button>
            </div>
          </div>`;
  }).join('')}
    </div>
  `;
}

function openAddWeekModal() {
  const old = document.getElementById('wk-add-modal');
  if (old) old.remove();

  const nextNum = getAllWeeks().length + 1;
  const overlay = document.createElement('div');
  overlay.id = 'wk-add-modal';
  overlay.className = 'auth-modal-overlay';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="auth-modal-card" style="max-width:460px">
      <button type="button" class="auth-close-x" onclick="document.getElementById('wk-add-modal')?.remove()" aria-label="Kapat">${icon('x', 18)}</button>
      <div style="margin-bottom:14px">
        <div class="auth-hero-title">Yeni Hafta Ekle</div>
        <div class="auth-hero-sub">Her satıra bir kelime yaz: <b>kelime - Türkçe anlam</b></div>
      </div>
      <form class="auth-form" onsubmit="event.preventDefault(); submitNewWeekModal();">
        <div class="auth-row-2">
          <div class="auth-field">
            <label>Hafta Başlığı</label>
            <input id="wk-new-title" type="text" value="Week ${nextNum}" required>
          </div>
          <div class="auth-field">
            <label>Alt Başlık</label>
            <input id="wk-new-sub" type="text" value="Haftalık Kelime Listesi">
          </div>
        </div>
        <div class="auth-field">
          <label>Kelimeler (her satır: ingilizce - türkçe)</label>
          <textarea id="wk-new-lines" rows="7" placeholder="abundant - bol, bereketli&#10;scrutinize - dikkatle incelemek&#10;inevitable - kaçınılmaz" style="background:var(--bg);border:1.5px solid var(--border2);border-radius:11px;padding:10px 12px;font-size:13px;color:var(--text);resize:vertical;width:100%;font-family:inherit"></textarea>
        </div>
        <button type="submit" class="auth-submit-btn">${icon('save', 15)} Haftayı Kaydet</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
}

function submitNewWeekModal() {
  const title = (document.getElementById('wk-new-title')?.value || '').trim();
  const subtitle = (document.getElementById('wk-new-sub')?.value || '').trim() || 'Haftalık Kelime Listesi';
  const rawLines = (document.getElementById('wk-new-lines')?.value || '').split(/\r?\n/);

  const words = [];
  rawLines.forEach(line => {
    const clean = line.replace(/^\s*\d+[\.\)\-\s]+/, '').trim();
    if (!clean) return;
    const parts = clean.split(/\s*[-–—:=|\t]\s*/);
    if (parts.length >= 2) {
      const en = parts[0].trim();
      const tr = parts.slice(1).join(' - ').trim();
      if (en && tr) words.push([en, tr]);
    }
  });

  if (!title) { showToast('Hafta başlığı girin.'); return; }
  if (words.length === 0) { showToast('En az bir geçerli satır girin (örn: word - anlam).'); return; }

  const nextNum = getAllWeeks().length + 1;
  const newId = 'week-custom-' + Date.now().toString(36);
  _customWeeks.push({
    id: newId,
    week: nextNum,
    title,
    subtitle,
    dateLabel: `${nextNum}. Hafta`,
    isCustom: true,
    sets: [{ id: newId + '-s1', label: '1. Liste', rangeLabel: `1–${words.length}`, words }]
  });
  _saveCustomWeeks();
  if (typeof syncActiveUserStats === 'function') syncActiveUserStats();

  document.getElementById('wk-add-modal')?.remove();
  _activeWeekId = newId;
  _activeWeekSetId = 'all';
  _weeklyStatusFilter = 'all';
  if (typeof renderHomeWeeklySection === 'function') renderHomeWeeklySection();
  const weeklyScreen = document.getElementById('screen-weekly');
  if (weeklyScreen && weeklyScreen.classList.contains('active')) renderWeeklyVocab();
  showToast(`${title} (${words.length} kelime) eklendi!`);
}

window.weeklyProgress = weeklyProgress;
window.saveWeeklyProgress = saveWeeklyProgress;
window.getWeeklyStudyPrefs = getWeeklyStudyPrefs;
window.setWeeklyStudyCount = setWeeklyStudyCount;
window.setWeeklyStudyOrder = setWeeklyStudyOrder;
window._onCustomCountInput = _onCustomCountInput;
window._buildOrderedWeeklyPool = _buildOrderedWeeklyPool;
window.getAllWeeks = getAllWeeks;
window.getWeekById = getWeekById;
window.getWeekStats = getWeekStats;
window.getAllWeeklyStats = getAllWeeklyStats;
window.getAllWeeklyWordsFlat = getAllWeeklyWordsFlat;
window.isWeeklyWordLearned = isWeeklyWordLearned;
window.markWeeklyWordLearned = markWeeklyWordLearned;
window.renderHomeWeeklySection = renderHomeWeeklySection;
window.startWeeklyQuickFromHome = startWeeklyQuickFromHome;
window.showWeeklyVocab = showWeeklyVocab;
window.selectWeeklyWeek = selectWeeklyWeek;
window.selectWeeklySet = selectWeeklySet;
window.setWeeklyStatusFilter = setWeeklyStatusFilter;
window.onWeeklySearchInput = onWeeklySearchInput;
window.toggleWeeklyHideMeanings = toggleWeeklyHideMeanings;
window.toggleWeeklyRevealRow = toggleWeeklyRevealRow;
window.toggleWeeklyWordCheck = toggleWeeklyWordCheck;
window.speakWeeklyRow = speakWeeklyRow;
window.startWeeklyMode = startWeeklyMode;
window.openAddWeekModal = openAddWeekModal;
window.submitNewWeekModal = submitNewWeekModal;
