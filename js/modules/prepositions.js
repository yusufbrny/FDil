// Dedicated Preposition Patterns Study & Drill Module
(function (global) {
  'use strict';

  const PREP_PROGRESS_KEY = 'fdil_prep_progress_v1';
  const PREP_PREFS_KEY = 'fdil_prep_prefs_v1';

  const GROUPS = [
    { id: 'all', label: 'Tümü' },
    { id: 'on', label: 'on' },
    { id: 'in', label: 'in' },
    { id: 'to', label: 'to' },
    { id: 'of', label: 'of' },
    { id: 'for', label: 'for' },
    { id: 'from', label: 'from' },
    { id: 'with', label: 'with' },
    { id: 'at', label: 'at' },
    { id: 'into', label: 'into' },
    { id: 'other', label: 'Diğer' }
  ];

  let _learnedIds = (() => {
    try {
      const arr = JSON.parse(localStorage.getItem(PREP_PROGRESS_KEY) || '[]');
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (_) {
      return new Set();
    }
  })();

  let _prefs = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem(PREP_PREFS_KEY) || '{}');
      const count = Number.isFinite(Number(raw.count)) && Number(raw.count) >= 0 ? Math.floor(Number(raw.count)) : 20;
      const order = ['shuffle', 'sequential', 'priority'].includes(raw.order) ? raw.order : 'shuffle';
      return { count, order };
    } catch (_) {
      return { count: 20, order: 'shuffle' };
    }
  })();

  let _activeGroup = 'all';
  let _statusFilter = 'all'; // 'all' | 'unlearned' | 'learned'
  let _searchQuery = '';
  let _hidePrep = false;
  let _hideMeaning = false;
  let _revealedPrepIds = new Set();
  let _revealedMeaningIds = new Set();

  let _drill = null;
  let _keyBound = false;

  function _allItems() {
    return Array.isArray(global.PREPOSITION_PATTERNS) ? global.PREPOSITION_PATTERNS : [];
  }

  function _saveProgress() {
    try { localStorage.setItem(PREP_PROGRESS_KEY, JSON.stringify([..._learnedIds])); } catch (_) {}
  }

  function _savePrefs() {
    try { localStorage.setItem(PREP_PREFS_KEY, JSON.stringify(_prefs)); } catch (_) {}
  }

  function getPrepStats() {
    const all = _allItems();
    const total = all.length;
    let learned = 0;
    all.forEach(p => { if (_learnedIds.has(p.id)) learned++; });
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { total, learned, pct };
  }

  function markPrepLearned(id, learned = true, silent = false) {
    if (!id) return;
    const was = _learnedIds.has(id);
    if (learned) {
      _learnedIds.add(id);
      _saveProgress();
      if (!was && !silent) {
        if (typeof global.logActivity === 'function') global.logActivity();
        if (typeof global.earnXP === 'function') global.earnXP('mark_learned', null);
      }
    } else {
      _learnedIds.delete(id);
      _saveProgress();
    }
  }

  function _norm(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function _splitPrepVariants(prepStr) {
    return String(prepStr || '')
      .split('/')
      .map(s => _norm(s))
      .filter(Boolean);
  }

  function _isPrepAnswerMatch(userInput, correctPrep) {
    const u = _norm(userInput);
    if (!u) return false;
    if (u === _norm(correctPrep)) return true;
    const variants = _splitPrepVariants(correctPrep);
    return variants.includes(u);
  }

  function _formatPromptHtml(promptStr) {
    const parts = String(promptStr || '').split('____');
    if (parts.length < 2) return esc(promptStr);
    return parts.map(p => esc(p)).join('<span class="pr-blank">____</span>');
  }

  function _highlightPhraseHtml(item) {
    const phrase = item.phrase || '';
    const variants = _splitPrepVariants(item.prep);
    if (!variants.length) return esc(phrase);
    const fullEsc = item.prep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${fullEsc}|\\b${variants[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'i');
    const m = phrase.match(re);
    if (!m || m.index === undefined) return esc(phrase);
    const before = phrase.slice(0, m.index);
    const match = phrase.slice(m.index, m.index + m[0].length);
    const after = phrase.slice(m.index + m[0].length);
    const masked = _hidePrep && !_revealedPrepIds.has(item.id);
    return `${esc(before)}<span class="pr-prep-pill ${masked ? 'is-masked' : ''}">${masked ? '___' : esc(match)}</span>${esc(after)}`;
  }

  function _getFilteredItems() {
    const q = _searchQuery.trim().toLowerCase();
    return _allItems().filter(p => {
      if (_activeGroup !== 'all' && p.group !== _activeGroup) return false;
      const isL = _learnedIds.has(p.id);
      if (_statusFilter === 'learned' && !isL) return false;
      if (_statusFilter === 'unlearned' && isL) return false;
      if (q) {
        return p.phrase.toLowerCase().includes(q)
          || p.prep.toLowerCase().includes(q)
          || p.tr.toLowerCase().includes(q);
      }
      return true;
    });
  }

  function _buildStudyPool(countOverride = null) {
    let items = _getFilteredItems();
    if (!items.length && (_statusFilter !== 'all' || _searchQuery.trim())) {
      items = _allItems().filter(p => _activeGroup === 'all' || p.group === _activeGroup);
      if (items.length && typeof global.showToast === 'function') {
        global.showToast('Filtrede öğe kalmadı, gruptaki tüm kalıplar yükleniyor.');
      }
    }
    if (!items.length) return [];

    let ordered;
    if (_prefs.order === 'sequential') {
      ordered = [...items];
    } else if (_prefs.order === 'priority') {
      const errMap = (typeof global.errorBox !== 'undefined' && global.errorBox) ? global.errorBox : {};
      const errKeys = new Set(Object.keys(errMap).map(_norm));
      const tErr = [], tUn = [], tLr = [];
      items.forEach(p => {
        if (errKeys.has(_norm(p.phrase))) tErr.push(p);
        else if (!_learnedIds.has(p.id)) tUn.push(p);
        else tLr.push(p);
      });
      ordered = [...shuffle(tErr), ...shuffle(tUn), ...shuffle(tLr)];
    } else {
      ordered = shuffle(items);
    }

    const limit = countOverride !== null ? Number(countOverride) : _prefs.count;
    return (limit > 0 && ordered.length > limit) ? ordered.slice(0, limit) : ordered;
  }

  function setPrepCount(val) {
    const n = Math.floor(Number(val));
    if (!Number.isFinite(n) || n < 0) return;
    _prefs.count = n === 0 ? 0 : Math.min(400, Math.max(1, n));
    _savePrefs();
    _refreshConfigUI();
  }

  function setPrepOrder(order) {
    if (!['shuffle', 'sequential', 'priority'].includes(order)) return;
    _prefs.order = order;
    _savePrefs();
    _refreshConfigUI();
  }

  function _onPrepCustomCount(raw) {
    const n = Math.floor(Number(String(raw || '').trim()));
    if (!Number.isFinite(n) || n < 1) return;
    _prefs.count = Math.min(400, n);
    _savePrefs();
    _refreshConfigUI(true);
  }

  function _refreshConfigUI(keepInp = false) {
    const avail = _getFilteredItems().length || _allItems().length;
    const eff = _prefs.count === 0 ? avail : Math.min(_prefs.count, avail);
    const lbl = _prefs.count === 0 ? `Tümü (${avail})` : String(eff);

    document.querySelectorAll('#screen-prepositions .pr-count-pill').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.pcount) === _prefs.count);
    });
    document.querySelectorAll('#screen-prepositions .pr-order-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.porder === _prefs.order);
    });
    const inp = document.getElementById('pr-custom-count');
    if (inp && !keepInp) inp.value = _prefs.count > 0 ? String(_prefs.count) : '';
    const sum = document.getElementById('pr-config-summary');
    if (sum) sum.textContent = `Havuz: ${avail} kalıp · Seçili: ${eff}`;
    document.querySelectorAll('#screen-prepositions .wk-tech-count').forEach(el => {
      el.textContent = lbl;
    });
  }

  function showPrepositions() {
    renderPrepositions();
    showScreen('screen-prepositions', 'forward');
  }

  function selectPrepGroup(gId) {
    _activeGroup = gId;
    _revealedPrepIds.clear();
    _revealedMeaningIds.clear();
    renderPrepositions();
  }

  function setPrepStatusFilter(st) {
    _statusFilter = st;
    renderPrepositions();
  }

  function onPrepSearch(val) {
    _searchQuery = val || '';
    _renderPrepList();
  }

  function toggleHidePrep() {
    _hidePrep = !_hidePrep;
    _revealedPrepIds.clear();
    renderPrepositions();
  }

  function toggleHidePrepMeaning() {
    _hideMeaning = !_hideMeaning;
    _revealedMeaningIds.clear();
    renderPrepositions();
  }

  function revealPrepRow(id) {
    let changed = false;
    if (_hidePrep) {
      if (_revealedPrepIds.has(id)) _revealedPrepIds.delete(id);
      else _revealedPrepIds.add(id);
      changed = true;
    }
    if (_hideMeaning) {
      if (_revealedMeaningIds.has(id)) _revealedMeaningIds.delete(id);
      else _revealedMeaningIds.add(id);
      changed = true;
    }
    if (changed) _renderPrepList();
  }

  function togglePrepCheck(id) {
    const next = !_learnedIds.has(id);
    markPrepLearned(id, next, false);
    if (typeof global.playGameSFX === 'function') global.playGameSFX(next ? 'correct' : 'undo', 1);
    renderPrepositions();
  }

  function _renderPrepList() {
    const box = document.getElementById('pr-list-container');
    const cnt = document.getElementById('pr-visible-count');
    if (!box) return;
    const rows = _getFilteredItems();
    if (cnt) cnt.textContent = `${rows.length} kalıp gösteriliyor`;

    if (!rows.length) {
      box.innerHTML = `<div class="wk-empty"><p>Eşleşen preposition kalıbı bulunamadı.</p>
        <button type="button" class="pill active" onclick="selectPrepGroup('all');setPrepStatusFilter('all')">Filtreyi Sıfırla</button></div>`;
      return;
    }

    box.innerHTML = rows.map((item, idx) => {
      const isL = _learnedIds.has(item.id);
      const maskTr = _hideMeaning && !_revealedMeaningIds.has(item.id);
      return `
        <div class="wk-word-row ${isL ? 'is-learned' : ''}" data-pid="${escQ(item.id)}">
          <button type="button" class="wk-check-btn ${isL ? 'checked' : ''}" onclick="togglePrepCheck('${escQ(item.id)}')" aria-label="${isL ? 'Öğrenildi işaretini kaldır' : 'Öğrenildi olarak işaretle'}">
            ${isL ? icon('check', 13) : ''}
          </button>
          <span class="wk-num">${idx + 1}</span>
          <div class="wk-word-main" onclick="revealPrepRow('${escQ(item.id)}')">
            <div class="wk-en-line">
              <span class="wk-en">${_highlightPhraseHtml(item)}</span>
            </div>
            <div class="wk-tr ${maskTr ? 'is-hidden-meaning' : ''}">${maskTr ? 'Anlamı görmek için dokun' : esc(item.tr)}</div>
          </div>
          <button type="button" class="wk-speak-btn" onclick="speakWord('${escQ(item.phrase.replace(/\s*\/\s*.*/, ''))}')" aria-label="Dinle" title="Dinle">
            ${icon('volume', 15)}
          </button>
        </div>
      `;
    }).join('');
  }

  function renderPrepositions() {
    const s = document.getElementById('screen-prepositions');
    if (!s) return;
    const all = _allItems();
    const st = getPrepStats();
    const avail = _getFilteredItems().length || all.length;
    const eff = _prefs.count === 0 ? avail : Math.min(_prefs.count, avail);
    const badgeTxt = _prefs.count === 0 ? `Tümü (${avail})` : String(eff);

    const groupCounts = {};
    GROUPS.forEach(g => { groupCounts[g.id] = 0; });
    all.forEach(p => {
      groupCounts.all++;
      if (groupCounts[p.group] !== undefined) groupCounts[p.group]++;
      else groupCounts.other++;
    });

    const presets = [
      { val: 10, label: '10' },
      { val: 15, label: '15' },
      { val: 20, label: '20' },
      { val: 25, label: '25' },
      { val: 50, label: '50' },
      { val: 0, label: 'Tümü' }
    ];

    const modes = [
      { id: 'prep-mc', title: 'Edatı Bul (4 Şık)', desc: 'Boşluktaki doğru edatı seç', ic: 'target', tone: 'primary' },
      { id: 'prep-write', title: 'Edatı Yaz', desc: 'Eksik edatı yazarak hatırla', ic: 'penLine', tone: 'amber' },
      { id: 'prep-mastery', title: 'Ustalık Döngüsü', desc: 'Bul + Yaz 2 aşamalı tekrar', ic: 'brain', tone: 'green' },
      { id: 'meaning-mc', title: 'Anlam Testi', desc: 'Kalıptan Türkçe anlam seç', ic: 'checkCircle', tone: 'teal' },
      { id: 'flash', title: 'Flash Kartlar', desc: '3D kartlarla hızlı tekrar', ic: 'layers', tone: 'blue' },
      { id: 'match', title: 'Eşleştirme', desc: '5’li gruplarla hafıza oyunu', ic: 'grid', tone: 'teal' }
    ];

    s.innerHTML = `
      <div class="unit-header">
        <button type="button" class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
        <div>
          <div class="unit-title-h">${icon('link', 17)} Preposition Kalıpları</div>
          <div class="unit-sub">${st.learned}/${st.total} kalıp öğrenildi (%${st.pct})</div>
        </div>
      </div>

      <div class="wk-scroll">
        <div class="wk-overview-card">
          <div class="wk-overview-top">
            <div>
              <div class="wk-overview-eyebrow">YDT · YDS · YÖKDİL Edat Havuzu</div>
              <h2 class="wk-overview-title">Preposition Kalıpları (${st.total})</h2>
            </div>
            <div class="wk-overview-pct">%${st.pct}</div>
          </div>
          <div class="wk-progress-track"><div class="wk-progress-fill" style="width:${st.pct}%"></div></div>

          <div class="wk-config-box">
            <div class="wk-config-head">
              <span class="wk-config-title">${icon('sliders', 13)} Çalışma Ayarları</span>
              <span class="wk-config-summary" id="pr-config-summary">Havuz: ${avail} kalıp · Seçili: ${eff}</span>
            </div>
            <div class="wk-count-row">
              <span class="wk-config-lbl">Soru Sayısı:</span>
              <div class="wk-count-pills">
                ${presets.map(p => `
                  <button type="button" class="wk-count-pill pr-count-pill ${_prefs.count === p.val ? 'active' : ''}" data-pcount="${p.val}" onclick="setPrepCount(${p.val})">${p.label}</button>
                `).join('')}
                <label class="wk-custom-count-wrap" title="Özel sayı gir">
                  <input type="number" id="pr-custom-count" class="wk-custom-count-inp" min="1" max="400" placeholder="Özel" value="${_prefs.count > 0 ? _prefs.count : ''}" oninput="_onPrepCustomCount(this.value)" onchange="_onPrepCustomCount(this.value)" aria-label="Özel soru sayısı">
                </label>
              </div>
            </div>
            <div class="wk-order-row">
              <span class="wk-config-lbl">Sıra:</span>
              <div class="wk-order-pills">
                <button type="button" class="wk-order-pill pr-order-pill ${_prefs.order === 'shuffle' ? 'active' : ''}" data-porder="shuffle" onclick="setPrepOrder('shuffle')">${icon('shuffle', 12)} Karışık</button>
                <button type="button" class="wk-order-pill pr-order-pill ${_prefs.order === 'sequential' ? 'active' : ''}" data-porder="sequential" onclick="setPrepOrder('sequential')">${icon('listOrdered', 12)} Sıralı</button>
                <button type="button" class="wk-order-pill pr-order-pill ${_prefs.order === 'priority' ? 'active' : ''}" data-porder="priority" onclick="setPrepOrder('priority')">${icon('target', 12)} Öğrenilmemiş Önce</button>
              </div>
            </div>
          </div>

          <div class="pr-practice-grid">
            ${modes.map(m => `
              <button type="button" class="wk-tech-card is-${m.tone}" onclick="startPrepMode('${m.id}')">
                <div class="wk-tech-top">
                  <span class="wk-tech-icon">${icon(m.ic, 16)}</span>
                  <span class="wk-tech-count">${esc(badgeTxt)}</span>
                </div>
                <div class="wk-tech-title">${m.title}</div>
                <div class="wk-tech-desc">${m.desc}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="wk-toolbar">
          <div class="pr-group-pills">
            ${GROUPS.map(g => `
              <button type="button" class="pill ${_activeGroup === g.id ? 'active' : ''}" onclick="selectPrepGroup('${g.id}')">${esc(g.label)} (${groupCounts[g.id]})</button>
            `).join('')}
          </div>

          <div class="wk-controls-row">
            <div class="wk-search-box">
              ${icon('search', 14)}
              <input type="text" id="pr-search-inp" placeholder="Kalıp, edat veya Türkçe anlam ara..." value="${escQ(_searchQuery)}" oninput="onPrepSearch(this.value)" autocomplete="off" spellcheck="false">
            </div>
            <button type="button" class="wk-mask-btn ${_hidePrep ? 'active' : ''}" onclick="toggleHidePrep()">
              ${_hidePrep ? 'Edatı Göster' : 'Edatı Gizle'}
            </button>
            <button type="button" class="wk-mask-btn ${_hideMeaning ? 'active' : ''}" onclick="toggleHidePrepMeaning()">
              ${_hideMeaning ? 'Anlamı Göster' : 'Anlamı Gizle'}
            </button>
          </div>

          <div class="wk-filter-row">
            <div class="pills">
              <button type="button" class="pill ${_statusFilter === 'all' ? 'active' : ''}" onclick="setPrepStatusFilter('all')">Tümü</button>
              <button type="button" class="pill ${_statusFilter === 'unlearned' ? 'active' : ''}" onclick="setPrepStatusFilter('unlearned')">Çalışılacak</button>
              <button type="button" class="pill ${_statusFilter === 'learned' ? 'active' : ''}" onclick="setPrepStatusFilter('learned')">Öğrenildi</button>
            </div>
            <span class="wk-visible-count" id="pr-visible-count"></span>
          </div>
        </div>

        <div class="wk-word-list" id="pr-list-container"></div>
      </div>
    `;

    _renderPrepList();
  }

  /* ═══════════════════════════════════════════════════════════════
     DRILL ENGINE (#screen-prep-drill)
     ═══════════════════════════════════════════════════════════════ */
  function _cleanupPrepDrill() {
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch (_) {}
    }
  }

  function _bindDrillKeys() {
    if (_keyBound) return;
    _keyBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.isContentEditable || (e.target.closest && e.target.closest('#nb-drawer')))) return;
      const nbDrawer = document.getElementById('nb-drawer');
      if (nbDrawer && nbDrawer.classList.contains('is-fullscreen')) return;

      const scr = document.getElementById('screen-prep-drill');
      if (!scr || !scr.classList.contains('active') || !_drill) return;

      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        const nextBtn = document.getElementById('prd-next-btn');
        if (nextBtn && nextBtn.style.display !== 'none' && !nextBtn.disabled) {
          e.preventDefault();
          nextBtn.click();
          return;
        }
      }

      const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3 };
      const idx = keyMap[e.key];
      if (idx !== undefined) {
        const opts = scr.querySelectorAll('.wkd-opt:not(.disabled)');
        if (opts && opts[idx]) {
          e.preventDefault();
          opts[idx].click();
        }
      }
    });
  }

  function _pickPrepDistractors(item, count = 3) {
    const forbidden = new Set(_splitPrepVariants(item.prep));
    forbidden.add(_norm(item.prep));

    const allPreps = [];
    const seen = new Set();
    shuffle(_allItems()).forEach(x => {
      const pNorm = _norm(x.prep);
      if (!pNorm || seen.has(pNorm) || forbidden.has(pNorm)) return;
      const tokens = _splitPrepVariants(x.prep);
      if (tokens.some(t => forbidden.has(t))) return;
      seen.add(pNorm);
      allPreps.push(x.prep);
    });
    return allPreps.slice(0, count);
  }

  function _recordDrillOutcome(item, isCorrect, isMastered = true) {
    const errKey = 'pr_' + item.id;
    if (isCorrect) {
      _drill.combo = (_drill.combo || 0) + 1;
      if (isMastered) {
        _drill.correct++;
        markPrepLearned(item.id, true, true);
        if (typeof global.errorBox !== 'undefined' && global.errorBox[errKey]) {
          delete global.errorBox[errKey];
          if (typeof global.saveErrors === 'function') global.saveErrors();
        }
      }
      if (typeof global.earnXP === 'function') {
        const xp = global.earnXP('mc_correct', null, _drill.combo);
        _drill.earnedXP += Number(xp || 5);
      }
      if (typeof global.logActivity === 'function') global.logActivity();
      if (typeof global.playGameSFX === 'function') global.playGameSFX('correct', _drill.combo);
    } else {
      _drill.combo = 0;
      _drill.wrong++;
      if (!_drill.missedMap.has(item.id)) _drill.missedMap.set(item.id, item);
      markPrepLearned(item.id, false, true);
      if (typeof global.errorBox !== 'undefined') {
        global.errorBox[errKey] = { word: item.phrase, meaning: item.tr, unit: 'Preposition' };
        if (typeof global.saveErrors === 'function') global.saveErrors();
      }
      if (typeof global.playGameSFX === 'function') global.playGameSFX('wrong', 1);
    }
  }

  function _renderDrillHeader(pct, counterText, title) {
    return `
      <div class="unit-header wkd-header">
        <button type="button" class="back-btn" onclick="showPrepositions()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
        <div class="wkd-header-meta">
          <div class="unit-title-h">${esc(title)}</div>
          <div class="wkd-progress-track"><div class="wkd-progress-fill" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>
        </div>
        <div class="wkd-header-stats">
          ${_drill.combo >= 2 ? `<span class="wkd-combo-pill">${icon('flame', 12)} ${_drill.combo}x</span>` : ''}
          <span class="wkd-counter-pill">${esc(counterText)}</span>
        </div>
      </div>
    `;
  }

  function _renderDrillSummary() {
    _cleanupPrepDrill();
    const s = document.getElementById('screen-prep-drill');
    if (!s) return;
    const totalAttempts = _drill.correct + _drill.wrong;
    const acc = totalAttempts > 0 ? Math.round((_drill.correct / totalAttempts) * 100) : 100;
    const missed = Array.from(_drill.missedMap.values());
    if (typeof global.playGameSFX === 'function') global.playGameSFX('win', 1);

    s.innerHTML = `
      ${_renderDrillHeader(100, 'Tamamlandı', _drill.title)}
      <div class="wkd-wrap">
        <div class="wkd-result-card">
          <div class="wkd-res-badge">${icon(acc >= 80 ? 'trophy' : 'target', 34)}</div>
          <h2 class="wkd-res-title">${acc >= 90 ? 'Harika Edat Hakimiyeti!' : 'Güzel Çalışma!'}</h2>
          <div class="wkd-res-sub">${esc(_drill.title)}</div>

          <div class="wkd-res-stats">
            <div class="wkd-stat-box is-green"><span class="wkd-stat-val">%${acc}</span><span class="wkd-stat-lbl">Doğruluk</span></div>
            <div class="wkd-stat-box is-blue"><span class="wkd-stat-val">${_drill.correct}</span><span class="wkd-stat-lbl">Doğru</span></div>
            <div class="wkd-stat-box is-red"><span class="wkd-stat-val">${_drill.wrong}</span><span class="wkd-stat-lbl">Hata</span></div>
            <div class="wkd-stat-box is-amber"><span class="wkd-stat-val">+${_drill.earnedXP}</span><span class="wkd-stat-lbl">XP</span></div>
          </div>

          <div class="wkd-res-actions">
            ${missed.length > 0 ? `<button type="button" class="wkd-btn primary" id="prd-retry-missed">${icon('refresh', 15)} Hatalıları Tekrar Çalış (${missed.length})</button>` : ''}
            <button type="button" class="wkd-btn ${missed.length === 0 ? 'primary' : ''}" id="prd-retry-same">${icon('repeat', 15)} Tekrar Çöz</button>
            <button type="button" class="wkd-btn" onclick="showPrepositions()">${icon('arrowLeft', 15)} Listeye Dön</button>
          </div>
        </div>

        ${missed.length > 0 ? `
          <div class="wkd-missed-box">
            <div class="wkd-missed-head">${icon('alertTriangle', 15)} Gözden Geçirilecek Kalıplar (${missed.length})</div>
            <div class="wkd-missed-list">
              ${missed.map(m => `
                <div class="wkd-missed-row">
                  <div>
                    <div class="wkd-missed-en">${esc(m.phrase)}</div>
                    <div class="wkd-missed-tr">${esc(m.tr)}</div>
                  </div>
                  <button type="button" class="wk-speak-btn" onclick="speakWord('${escQ(m.phrase.replace(/\s*\/\s*.*/, ''))}')" aria-label="Dinle">${icon('volume', 15)}</button>
                </div>
              `).join('')}
            </div>
          </div>` : ''}
      </div>
    `;

    document.getElementById('prd-retry-same').onclick = () => _startPrepDrill(_drill.mode, shuffle(_drill.originPool));
    const rm = document.getElementById('prd-retry-missed');
    if (rm) rm.onclick = () => _startPrepDrill(_drill.mode, shuffle(missed));
  }

  function _startPrepDrill(mode, pool) {
    _cleanupPrepDrill();
    _bindDrillKeys();
    const titles = {
      'prep-mc': 'Prepositions · Edatı Bul (4 Şık)',
      'prep-write': 'Prepositions · Edatı Yaz',
      'prep-mastery': 'Prepositions · Ustalık Döngüsü'
    };
    _drill = {
      mode,
      title: titles[mode] || 'Preposition Çalışması',
      pool: [...pool],
      originPool: [...pool],
      index: 0,
      correct: 0,
      wrong: 0,
      combo: 0,
      earnedXP: 0,
      missedMap: new Map(),
      answered: false
    };

    if (mode === 'prep-mastery') {
      const items = pool.map(it => ({ item: it, stage: 0 }));
      _drill.masteryTotal = items.length;
      _drill.masteredCount = 0;
      _drill.activeQueue = items.slice(0, 5);
      _drill.waitingQueue = items.slice(5);
    }

    showScreen('screen-prep-drill', 'forward');
    if (mode === 'prep-mc') _renderPrepMC();
    else if (mode === 'prep-write') _renderPrepWrite();
    else if (mode === 'prep-mastery') _renderPrepMastery();
  }

  function _renderPrepMC() {
    const s = document.getElementById('screen-prep-drill');
    if (!s || !_drill) return;
    if (_drill.index >= _drill.pool.length) { _renderDrillSummary(); return; }

    _drill.answered = false;
    const item = _drill.pool[_drill.index];
    const opts = shuffle([item.prep, ..._pickPrepDistractors(item, 3)]);
    const pct = Math.round((_drill.index / _drill.pool.length) * 100);

    s.innerHTML = `
      ${_renderDrillHeader(pct, `${_drill.index + 1} / ${_drill.pool.length}`, _drill.title)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-eyebrow">Doğru Preposition’ı Seç · Tuşlar 1–4</div>
          <div class="pr-drill-prompt">${_formatPromptHtml(item.prompt)}</div>
          <div class="pr-drill-tr">${esc(item.tr)}</div>

          <div class="wkd-options">
            ${opts.map((op, i) => `
              <button type="button" class="wkd-opt" data-poidx="${i}">
                <span class="wkd-opt-key">${i + 1}</span>
                <span class="wkd-opt-text">${esc(op)}</span>
              </button>
            `).join('')}
          </div>

          <div id="prd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="prd-next-btn" style="display:none">
              <span>${_drill.index + 1 >= _drill.pool.length ? 'Sonucu Gör' : 'Sonraki'}</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById('prd-next-btn');
    nextBtn.onclick = () => { _drill.index++; _renderPrepMC(); };

    const optBtns = s.querySelectorAll('.wkd-opt');
    optBtns.forEach((btn, idx) => {
      btn.onclick = () => {
        if (_drill.answered) return;
        _drill.answered = true;
        const ok = _norm(opts[idx]) === _norm(item.prep);
        _recordDrillOutcome(item, ok, true);

        optBtns.forEach((b, bi) => {
          b.classList.add('disabled');
          if (_norm(opts[bi]) === _norm(item.prep)) b.classList.add('is-correct');
          else if (bi === idx && !ok) b.classList.add('is-wrong');
        });

        const fb = document.getElementById('prd-feedback');
        fb.innerHTML = `
          <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
            <span><b>${esc(item.phrase)}</b> — ${esc(item.tr)}</span>
            <button type="button" class="wk-speak-btn" onclick="speakWord('${escQ(item.phrase.replace(/\s*\/\s*.*/, ''))}')" aria-label="Dinle">${icon('volume', 15)}</button>
          </div>`;
        if (typeof global.speakWord === 'function') global.speakWord(item.phrase.replace(/\s*\/\s*.*/, ''));
        nextBtn.style.display = 'inline-flex';
      };
    });
  }

  function _renderPrepWrite() {
    const s = document.getElementById('screen-prep-drill');
    if (!s || !_drill) return;
    if (_drill.index >= _drill.pool.length) { _renderDrillSummary(); return; }

    _drill.answered = false;
    const item = _drill.pool[_drill.index];
    const pct = Math.round((_drill.index / _drill.pool.length) * 100);

    s.innerHTML = `
      ${_renderDrillHeader(pct, `${_drill.index + 1} / ${_drill.pool.length}`, _drill.title)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-eyebrow">Eksik Preposition’ı Yaz</div>
          <div class="pr-drill-prompt">${_formatPromptHtml(item.prompt)}</div>
          <div class="pr-drill-tr">${esc(item.tr)}</div>

          <div class="wkd-input-row">
            <input type="text" class="wkd-input" id="prd-write-inp" placeholder="Edatı yaz (ör. on, in, to, of, from...)" autocomplete="off" autocapitalize="none" spellcheck="false">
            <button type="button" class="wkd-btn primary" id="prd-write-chk">Kontrol Et</button>
          </div>

          <div class="wkd-helper-row">
            <button type="button" class="wkd-helper-btn" id="prd-hint-btn">${icon('sparkles', 14)} İlk Harf İpucu</button>
            <button type="button" class="wkd-helper-btn" id="prd-giveup-btn">${icon('x', 14)} Göster</button>
          </div>

          <div id="prd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="prd-next-btn" style="display:none">
              <span>${_drill.index + 1 >= _drill.pool.length ? 'Sonucu Gör' : 'Sonraki'}</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    const inp = document.getElementById('prd-write-inp');
    const chk = document.getElementById('prd-write-chk');
    const nextBtn = document.getElementById('prd-next-btn');
    setTimeout(() => inp && inp.focus(), 20);

    const finalize = (ok, userVal) => {
      if (_drill.answered) return;
      _drill.answered = true;
      inp.disabled = true;
      chk.disabled = true;
      _recordDrillOutcome(item, ok, true);

      document.getElementById('prd-feedback').innerHTML = `
        <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
          <span>${ok ? 'Doğru!' : (userVal ? `Yazdığın: <s>${esc(userVal)}</s> · ` : '') + 'Doğrusu:'} <b>${esc(item.phrase)}</b></span>
          <button type="button" class="wk-speak-btn" onclick="speakWord('${escQ(item.phrase.replace(/\s*\/\s*.*/, ''))}')" aria-label="Dinle">${icon('volume', 15)}</button>
        </div>`;
      if (typeof global.speakWord === 'function') global.speakWord(item.phrase.replace(/\s*\/\s*.*/, ''));
      nextBtn.style.display = 'inline-flex';
    };

    chk.onclick = () => {
      if (!inp.value.trim()) return;
      finalize(_isPrepAnswerMatch(inp.value, item.prep), inp.value.trim());
    };
    inp.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!_drill.answered) chk.click();
        else nextBtn.click();
      }
    };
    document.getElementById('prd-hint-btn').onclick = () => {
      if (_drill.answered) return;
      const first = _splitPrepVariants(item.prep)[0] || item.prep;
      inp.value = first.slice(0, 1);
      inp.focus();
    };
    document.getElementById('prd-giveup-btn').onclick = () => finalize(false, inp.value.trim());
    nextBtn.onclick = () => { _drill.index++; _renderPrepWrite(); };
  }

  function _renderPrepMastery() {
    const s = document.getElementById('screen-prep-drill');
    if (!s || !_drill) return;
    while (_drill.activeQueue.length < 5 && _drill.waitingQueue.length > 0) {
      _drill.activeQueue.push(_drill.waitingQueue.shift());
    }
    if (!_drill.activeQueue.length) { _renderDrillSummary(); return; }

    _drill.answered = false;
    const entry = _drill.activeQueue[0];
    const item = entry.item;
    const isStage2 = entry.stage === 1;
    const pct = Math.round((_drill.masteredCount / _drill.masteryTotal) * 100);
    const opts = isStage2 ? [] : shuffle([item.prep, ..._pickPrepDistractors(item, 3)]);

    s.innerHTML = `
      ${_renderDrillHeader(pct, `Usta: ${_drill.masteredCount}/${_drill.masteryTotal}`, _drill.title)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-mastery-top">
            <span class="wkd-stage-pill ${isStage2 ? 'is-stage2' : 'is-stage1'}">${isStage2 ? '2. Aşama · Edatı Yaz' : '1. Aşama · Edatı Seç'}</span>
            <span class="wkd-eyebrow">Aktif Grup: ${_drill.activeQueue.length} · Bekleyen: ${_drill.waitingQueue.length}</span>
          </div>

          <div class="pr-drill-prompt">${_formatPromptHtml(item.prompt)}</div>
          <div class="pr-drill-tr">${esc(item.tr)}</div>

          ${isStage2 ? `
            <div class="wkd-input-row">
              <input type="text" class="wkd-input" id="prd-m-inp" placeholder="Edatı yaz..." autocomplete="off" autocapitalize="none" spellcheck="false">
              <button type="button" class="wkd-btn primary" id="prd-m-chk">Onayla</button>
            </div>
          ` : `
            <div class="wkd-options">
              ${opts.map((op, i) => `
                <button type="button" class="wkd-opt" data-poidx="${i}">
                  <span class="wkd-opt-key">${i + 1}</span>
                  <span class="wkd-opt-text">${esc(op)}</span>
                </button>
              `).join('')}
            </div>
          `}

          <div id="prd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="prd-next-btn" style="display:none">
              <span>Devam Et</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById('prd-next-btn');
    let lastPassed = false;
    nextBtn.onclick = () => {
      const cur = _drill.activeQueue.shift();
      if (lastPassed) {
        cur.stage++;
        if (cur.stage >= 2) _drill.masteredCount++;
        else _drill.activeQueue.splice(Math.min(_drill.activeQueue.length, 2), 0, cur);
      } else {
        cur.stage = 0;
        _drill.activeQueue.splice(Math.min(_drill.activeQueue.length, 2), 0, cur);
      }
      _renderPrepMastery();
    };

    if (isStage2) {
      const inp = document.getElementById('prd-m-inp');
      const chk = document.getElementById('prd-m-chk');
      setTimeout(() => inp && inp.focus(), 20);
      const submitM = () => {
        if (_drill.answered || !inp.value.trim()) return;
        _drill.answered = true;
        inp.disabled = true;
        chk.disabled = true;
        const ok = _isPrepAnswerMatch(inp.value, item.prep);
        lastPassed = ok;
        _recordDrillOutcome(item, ok, ok);
        document.getElementById('prd-feedback').innerHTML = `
          <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
            <span>${ok ? 'Ustalaşıldı!' : 'Tekrar sorulacak · Doğrusu:'} <b>${esc(item.phrase)}</b></span>
          </div>`;
        nextBtn.style.display = 'inline-flex';
      };
      chk.onclick = submitM;
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!_drill.answered) submitM();
          else nextBtn.click();
        }
      };
    } else {
      const optBtns = s.querySelectorAll('.wkd-opt');
      optBtns.forEach((btn, idx) => {
        btn.onclick = () => {
          if (_drill.answered) return;
          _drill.answered = true;
          const ok = _norm(opts[idx]) === _norm(item.prep);
          lastPassed = ok;
          _recordDrillOutcome(item, ok, false);
          optBtns.forEach((b, bi) => {
            b.classList.add('disabled');
            if (_norm(opts[bi]) === _norm(item.prep)) b.classList.add('is-correct');
            else if (bi === idx && !ok) b.classList.add('is-wrong');
          });
          document.getElementById('prd-feedback').innerHTML = `
            <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
              <span><b>${esc(item.phrase)}</b> — ${ok ? '2. Aşamaya (Yazma) geçti!' : 'Tekrar sorulacak'}</span>
            </div>`;
          nextBtn.style.display = 'inline-flex';
        };
      });
    }
  }

  function startPrepMode(mode) {
    const pool = _buildStudyPool();
    if (!pool.length) {
      if (typeof global.showToast === 'function') global.showToast('Çalışılacak preposition bulunamadı.');
      return;
    }

    if (mode === 'prep-mc' || mode === 'prep-write' || mode === 'prep-mastery') {
      _startPrepDrill(mode, pool);
      return;
    }

    // Clear currentUnit so Flash/MC do not attribute items to a numbered vocabulary unit
    if (typeof global.currentUnit !== 'undefined') global.currentUnit = null;

    const cards = pool.map(p => {
      const c = [p.phrase, p.tr, ''];
      c._prepId = p.id;
      return c;
    });
    const allCards = _allItems().map(p => [p.phrase, p.tr, '']);
    const titleSuffix = _activeGroup === 'all' ? 'Preposition Kalıpları' : `Preposition (${_activeGroup})`;

    if (mode === 'flash' && typeof global.startFlash === 'function') {
      global.startFlash(cards, {
        backFn: 'showPrepositions()',
        title: `${titleSuffix} · Flash Kartlar`,
        unitTagFn: () => 'Preposition'
      });
    } else if (mode === 'meaning-mc' && typeof global.startMC === 'function') {
      global.startMC(cards, 'showPrepositions()', `${titleSuffix} · Anlam Testi`);
    } else if (mode === 'match' && typeof global.startWeeklyMatchDrill === 'function') {
      global.startWeeklyMatchDrill(cards, allCards, 'showPrepositions()', `${titleSuffix} · Eşleştirme`, null);
    }
  }

  function exportPrepProgress() {
    return [..._learnedIds];
  }

  function importPrepProgress(arr) {
    if (!Array.isArray(arr)) return;
    _learnedIds = new Set(arr);
    _saveProgress();
  }

  global.showPrepositions = showPrepositions;
  global.renderPrepositions = renderPrepositions;
  global.selectPrepGroup = selectPrepGroup;
  global.setPrepStatusFilter = setPrepStatusFilter;
  global.onPrepSearch = onPrepSearch;
  global.toggleHidePrep = toggleHidePrep;
  global.toggleHidePrepMeaning = toggleHidePrepMeaning;
  global.revealPrepRow = revealPrepRow;
  global.togglePrepCheck = togglePrepCheck;
  global.setPrepCount = setPrepCount;
  global.setPrepOrder = setPrepOrder;
  global._onPrepCustomCount = _onPrepCustomCount;
  global.startPrepMode = startPrepMode;
  global.getPrepStats = getPrepStats;
  global.markPrepLearned = markPrepLearned;
  global.exportPrepProgress = exportPrepProgress;
  global.importPrepProgress = importPrepProgress;
  global._cleanupPrepDrill = _cleanupPrepDrill;
  global._isPrepAnswerMatch = _isPrepAnswerMatch;
})(window);
