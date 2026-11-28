// Weekly High-Retention Learning Techniques:
// 1. Reverse Quiz (TR -> EN)
// 2. Active Recall Writing (Write & Spelling with progressive hints)
// 3. Memory Match Arena (5-pair chunked rounds with stopwatch)
// 4. Listen & Recall (Audio MCQ + Dictation)
// 5. Mastery Loop (2-stage adaptive Leitner batching: Recognize -> Write)
(function (global) {
  'use strict';

  let _st = null;
  let _keyBound = false;

  function _norm(s) {
    return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function _cleanupWeeklyDrill() {
    if (_st && _st.matchTimer) {
      clearInterval(_st.matchTimer);
      _st.matchTimer = null;
    }
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch (_) {}
    }
  }

  function _speakRate(word, rate = 0.9) {
    if (!word || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US';
      u.rate = rate;
      u.pitch = 1;
      speechSynthesis.speak(u);
    } catch (_) {}
  }

  function _getFallbackDistractorPool() {
    const out = [];
    if (Array.isArray(_st?.allWords) && _st.allWords.length) {
      _st.allWords.forEach(w => { if (w && w[0] && w[1]) out.push(w); });
    }
    if (out.length < 12 && typeof global.getAllWeeklyWordsFlat === 'function') {
      global.getAllWeeklyWordsFlat().forEach(w => { if (w && w[0] && w[1]) out.push(w); });
    }
    if (out.length < 12 && typeof global.UNITS !== 'undefined') {
      for (let u = 1; u <= 3; u++) {
        if (global.UNITS[u]?.words) {
          global.UNITS[u].words.slice(0, 20).forEach(w => out.push(w));
        }
      }
    }
    return out;
  }

  function _pickDistractors(targetWord, count = 3) {
    const tEn = _norm(targetWord[0]);
    const tTr = _norm(targetWord[1]);
    const candidates = shuffle(_getFallbackDistractorPool());
    const chosen = [];
    const seenEn = new Set([tEn]);
    const seenTr = new Set([tTr]);

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c || !c[0] || !c[1]) continue;
      const cEn = _norm(c[0]);
      const cTr = _norm(c[1]);
      if (seenEn.has(cEn) || seenTr.has(cTr)) continue;
      seenEn.add(cEn);
      seenTr.add(cTr);
      chosen.push(c);
      if (chosen.length >= count) break;
    }
    return chosen;
  }

  function _recordOutcome(word, isCorrect, isMastered = true) {
    const key = _norm(word[0]);
    const weekId = _st.weekId || word._weekId || null;

    if (isCorrect) {
      _st.combo = (_st.combo || 0) + 1;
      if (isMastered) {
        _st.correct++;
        if (weekId && typeof global.markWeeklyWordLearned === 'function') {
          global.markWeeklyWordLearned(weekId, word[0], true, true);
        }
        if (typeof global.errorBox !== 'undefined' && global.errorBox[key]) {
          delete global.errorBox[key];
          if (typeof global.saveErrors === 'function') global.saveErrors();
        }
      }
      if (typeof global.earnXP === 'function') {
        const xp = global.earnXP('mc_correct', null, _st.combo);
        _st.earnedXP += Number(xp || 5);
      }
      if (typeof global.logActivity === 'function') global.logActivity();
      if (typeof global.playGameSFX === 'function') global.playGameSFX('correct', _st.combo);
    } else {
      _st.combo = 0;
      _st.wrong++;
      if (!_st.missedMap.has(key)) {
        _st.missedMap.set(key, word);
      }
      if (weekId && typeof global.markWeeklyWordLearned === 'function') {
        global.markWeeklyWordLearned(weekId, word[0], false, true);
      }
      if (typeof global.errorBox !== 'undefined') {
        global.errorBox[key] = { word: word[0], meaning: word[1], unit: word._weekLabel || 'Haftalık', weekId };
        if (typeof global.saveErrors === 'function') global.saveErrors();
      }
      if (typeof global.playGameSFX === 'function') global.playGameSFX('wrong', 1);
    }
  }

  function _goBack() {
    _cleanupWeeklyDrill();
    const fn = _st?.backFn || '';
    if (fn === 'goHome()' && typeof global.goHome === 'function') {
      global.goHome();
      return;
    }
    if (_st?.weekId && typeof global.showWeeklyVocab === 'function') {
      global.showWeeklyVocab(_st.weekId);
      return;
    }
    if (typeof global.goHome === 'function') global.goHome();
  }

  function _bindKeys() {
    if (_keyBound) return;
    _keyBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.isContentEditable || (e.target.closest && e.target.closest('#nb-drawer')))) return;
      const nbDrawer = document.getElementById('nb-drawer');
      if (nbDrawer && nbDrawer.classList.contains('is-fullscreen')) return;

      const scr = document.getElementById('screen-weekly-drill');
      if (!scr || !scr.classList.contains('active') || !_st) return;

      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        const nextBtn = document.getElementById('wkd-next-btn');
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

  function _renderHeaderHtml(progressPct, counterText) {
    return `
      <div class="unit-header wkd-header">
        <button type="button" class="back-btn" id="wkd-back-btn" aria-label="Geri">${icon('arrowLeft', 18)}</button>
        <div class="wkd-header-meta">
          <div class="unit-title-h">${esc(_st.title)}</div>
          <div class="wkd-progress-track"><div class="wkd-progress-fill" style="width:${Math.max(0, Math.min(100, progressPct))}%"></div></div>
        </div>
        <div class="wkd-header-stats">
          ${_st.combo >= 2 ? `<span class="wkd-combo-pill">${icon('flame', 12)} ${_st.combo}x</span>` : ''}
          <span class="wkd-counter-pill">${esc(counterText)}</span>
        </div>
      </div>`;
  }

  function _renderSummary() {
    _cleanupWeeklyDrill();
    const s = document.getElementById('screen-weekly-drill');
    if (!s) return;

    const totalAttempts = _st.correct + _st.wrong;
    const acc = totalAttempts > 0 ? Math.round((_st.correct / totalAttempts) * 100) : 100;
    const missedList = Array.from(_st.missedMap.values());
    const extraMeta = _st.mode === 'match' && _st.elapsedSec !== undefined
      ? `<div class="wkd-res-sub">Tamamlama Süresi: <b>${_formatSec(_st.elapsedSec)}</b></div>`
      : '';

    if (typeof global.playGameSFX === 'function') global.playGameSFX('win', 1);

    s.innerHTML = `
      ${_renderHeaderHtml(100, 'Tamamlandı')}
      <div class="wkd-wrap">
        <div class="wkd-result-card">
          <div class="wkd-res-badge">${icon(acc >= 80 ? 'trophy' : 'target', 34)}</div>
          <h2 class="wkd-res-title">${acc >= 90 ? 'Mükemmel Hakimiyet!' : acc >= 70 ? 'Güzel İlerleme!' : 'Harika Tekrar Oldu!'}</h2>
          <div class="wkd-res-sub">${esc(_st.title)}</div>
          ${extraMeta}

          <div class="wkd-res-stats">
            <div class="wkd-stat-box is-green">
              <span class="wkd-stat-val">%${acc}</span>
              <span class="wkd-stat-lbl">Doğruluk</span>
            </div>
            <div class="wkd-stat-box is-blue">
              <span class="wkd-stat-val">${_st.correct}</span>
              <span class="wkd-stat-lbl">Doğru</span>
            </div>
            <div class="wkd-stat-box is-red">
              <span class="wkd-stat-val">${_st.wrong}</span>
              <span class="wkd-stat-lbl">Hata</span>
            </div>
            <div class="wkd-stat-box is-amber">
              <span class="wkd-stat-val">+${_st.earnedXP}</span>
              <span class="wkd-stat-lbl">XP</span>
            </div>
          </div>

          <div class="wkd-res-actions">
            ${missedList.length > 0 ? `
              <button type="button" class="wkd-btn primary" id="wkd-retry-missed">
                ${icon('refresh', 15)} <span>Hatalıları Tekrar Çalış (${missedList.length})</span>
              </button>` : ''}
            <button type="button" class="wkd-btn ${missedList.length === 0 ? 'primary' : ''}" id="wkd-retry-same">
              ${icon('repeat', 15)} <span>Aynı Ayarla Tekrar</span>
            </button>
            <button type="button" class="wkd-btn" id="wkd-finish-back">
              ${icon('arrowLeft', 15)} <span>Listeye Dön</span>
            </button>
          </div>
        </div>

        ${missedList.length > 0 ? `
          <div class="wkd-missed-box">
            <div class="wkd-missed-head">${icon('alertTriangle', 15)} <span>Gözden Geçirilecek Kelimeler (${missedList.length})</span></div>
            <div class="wkd-missed-list">
              ${missedList.map((w, idx) => `
                <div class="wkd-missed-row">
                  <div>
                    <div class="wkd-missed-en">${esc(w[0])}</div>
                    <div class="wkd-missed-tr">${esc(w[1])}</div>
                  </div>
                  <button type="button" class="wk-speak-btn" data-speak-idx="${idx}" aria-label="Dinle">${icon('volume', 15)}</button>
                </div>
              `).join('')}
            </div>
          </div>` : ''}
      </div>
    `;

    document.getElementById('wkd-back-btn').onclick = _goBack;
    document.getElementById('wkd-finish-back').onclick = _goBack;
    document.getElementById('wkd-retry-same').onclick = () => _restartWithPool(_st.originPool);
    const retryMissed = document.getElementById('wkd-retry-missed');
    if (retryMissed) retryMissed.onclick = () => _restartWithPool(missedList);

    s.querySelectorAll('[data-speak-idx]').forEach(btn => {
      btn.onclick = () => {
        const w = missedList[Number(btn.dataset.speakIdx)];
        if (w) _speakRate(w[0], 0.9);
      };
    });
  }

  function _restartWithPool(newPool) {
    const p = shuffle(newPool);
    const { mode, allWords, backFn, title, weekId } = _st;
    if (mode === 'reverse') startWeeklyReverseQuiz(p, allWords, backFn, title, weekId);
    else if (mode === 'write') startWeeklyWriteDrill(p, allWords, backFn, title, weekId);
    else if (mode === 'match') startWeeklyMatchDrill(p, allWords, backFn, title, weekId);
    else if (mode === 'listen') startWeeklyListenDrill(p, allWords, backFn, title, weekId);
    else if (mode === 'mastery') startWeeklyMasteryDrill(p, allWords, backFn, title, weekId);
  }

  function _initBaseState(mode, pool, allWords, backFn, title, weekId) {
    _cleanupWeeklyDrill();
    _bindKeys();
    _st = {
      mode,
      pool: [...pool],
      originPool: [...pool],
      allWords: Array.isArray(allWords) && allWords.length ? allWords : [...pool],
      backFn: backFn || '',
      title: title || 'Kelime Çalışma',
      weekId: weekId || (pool[0] && pool[0]._weekId) || null,
      index: 0,
      correct: 0,
      wrong: 0,
      combo: 0,
      earnedXP: 0,
      missedMap: new Map(),
      answered: false
    };
    showScreen('screen-weekly-drill', 'forward');
  }

  /* ═══════════════════════════════════════════════════════════════
     1. REVERSE QUIZ (TR -> EN)
     ═══════════════════════════════════════════════════════════════ */
  function startWeeklyReverseQuiz(pool, allWords, backFn, title, weekId) {
    if (!pool || !pool.length) { showToast('Çalışılacak kelime bulunamadı.'); return; }
    _initBaseState('reverse', pool, allWords, backFn, title, weekId);
    _renderReverseQuestion();
  }

  function _renderReverseQuestion() {
    const s = document.getElementById('screen-weekly-drill');
    if (!s || !_st) return;
    if (_st.index >= _st.pool.length) { _renderSummary(); return; }

    _st.answered = false;
    const word = _st.pool[_st.index];
    const opts = shuffle([word, ..._pickDistractors(word, 3)]);
    const pct = Math.round((_st.index / _st.pool.length) * 100);

    s.innerHTML = `
      ${_renderHeaderHtml(pct, `${_st.index + 1} / ${_st.pool.length}`)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-eyebrow">Türkçe Anlamdan İngilizceye · Tuşlar 1–4</div>
          <div class="wkd-prompt-main">${esc(word[1])}</div>
          <div class="wkd-options" id="wkd-options">
            ${opts.map((o, idx) => `
              <button type="button" class="wkd-opt" data-oidx="${idx}">
                <span class="wkd-opt-key">${idx + 1}</span>
                <span class="wkd-opt-text">${esc(o[0])}</span>
              </button>
            `).join('')}
          </div>
          <div id="wkd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="wkd-next-btn" style="display:none">
              <span>${_st.index + 1 >= _st.pool.length ? 'Sonucu Gör' : 'Sonraki Soru'}</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wkd-back-btn').onclick = _goBack;
    const nextBtn = document.getElementById('wkd-next-btn');
    nextBtn.onclick = () => { _st.index++; _renderReverseQuestion(); };

    const optBtns = s.querySelectorAll('.wkd-opt');
    optBtns.forEach((btn, idx) => {
      btn.onclick = () => {
        if (_st.answered) return;
        _st.answered = true;
        const chosen = opts[idx];
        const isOk = _norm(chosen[0]) === _norm(word[0]);
        _recordOutcome(word, isOk, true);

        optBtns.forEach((b, bi) => {
          b.classList.add('disabled');
          if (_norm(opts[bi][0]) === _norm(word[0])) b.classList.add('is-correct');
          else if (bi === idx && !isOk) b.classList.add('is-wrong');
        });

        const fb = document.getElementById('wkd-feedback');
        fb.innerHTML = `
          <div class="wkd-fb-pill ${isOk ? 'is-ok' : 'is-err'}">
            <span>${isOk ? 'Doğru!' : `Doğru cevap: <b>${esc(word[0])}</b>`}</span>
            <button type="button" class="wk-speak-btn" id="wkd-fb-speak" title="Dinle">${icon('volume', 15)}</button>
          </div>`;
        document.getElementById('wkd-fb-speak').onclick = () => _speakRate(word[0], 0.9);
        _speakRate(word[0], 0.9);
        nextBtn.style.display = 'inline-flex';
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     2. ACTIVE RECALL WRITING (TR -> Type EN)
     ═══════════════════════════════════════════════════════════════ */
  function _buildPattern(wordStr, revealedIndices) {
    return Array.from(wordStr).map((ch, idx) => {
      if (ch === ' ' || ch === '-' || ch === "'") return ch === ' ' ? '   ' : ch;
      if (revealedIndices && revealedIndices.has(idx)) return ch;
      return '_';
    }).join(' ');
  }

  function startWeeklyWriteDrill(pool, allWords, backFn, title, weekId) {
    if (!pool || !pool.length) { showToast('Çalışılacak kelime bulunamadı.'); return; }
    _initBaseState('write', pool, allWords, backFn, title, weekId);
    _renderWriteQuestion();
  }

  function _renderWriteQuestion() {
    const s = document.getElementById('screen-weekly-drill');
    if (!s || !_st) return;
    if (_st.index >= _st.pool.length) { _renderSummary(); return; }

    _st.answered = false;
    _st.revealedIdx = new Set([0]); // Reveal first letter optionally or keep empty? Start clean empty!
    _st.revealedIdx = new Set();
    const word = _st.pool[_st.index];
    const pct = Math.round((_st.index / _st.pool.length) * 100);

    s.innerHTML = `
      ${_renderHeaderHtml(pct, `${_st.index + 1} / ${_st.pool.length}`)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-eyebrow">Aktif Hatırlama · İngilizce Karşılığını Yaz</div>
          <div class="wkd-prompt-main">${esc(word[1])}</div>
          <div class="wkd-pattern" id="wkd-pattern">${esc(_buildPattern(word[0], _st.revealedIdx))}</div>

          <div class="wkd-input-row">
            <input type="text" class="wkd-input" id="wkd-write-inp" placeholder="İngilizce kelimeyi yaz..." autocomplete="off" autocapitalize="none" spellcheck="false">
            <button type="button" class="wkd-btn primary" id="wkd-check-btn">Kontrol Et</button>
          </div>

          <div class="wkd-helper-row">
            <button type="button" class="wkd-helper-btn" id="wkd-hint-btn">${icon('sparkles', 14)} <span>Harf İpucu</span></button>
            <button type="button" class="wkd-helper-btn" id="wkd-speak-hint">${icon('volume', 14)} <span>Telaffuz Dinle</span></button>
            <button type="button" class="wkd-helper-btn" id="wkd-giveup-btn">${icon('x', 14)} <span>Bilmiyorum</span></button>
          </div>

          <div id="wkd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="wkd-next-btn" style="display:none">
              <span>${_st.index + 1 >= _st.pool.length ? 'Sonucu Gör' : 'Sonraki Kelime'}</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wkd-back-btn').onclick = _goBack;
    const inp = document.getElementById('wkd-write-inp');
    const checkBtn = document.getElementById('wkd-check-btn');
    const nextBtn = document.getElementById('wkd-next-btn');
    setTimeout(() => inp && inp.focus(), 20);

    const finalizeWrite = (isOk, userText) => {
      if (_st.answered) return;
      _st.answered = true;
      inp.disabled = true;
      checkBtn.disabled = true;
      _recordOutcome(word, isOk, true);
      document.getElementById('wkd-pattern').textContent = word[0];

      const fb = document.getElementById('wkd-feedback');
      fb.innerHTML = `
        <div class="wkd-fb-pill ${isOk ? 'is-ok' : 'is-err'}">
          <span>${isOk
            ? `Doğru! <b>${esc(word[0])}</b>`
            : `${userText ? `Yazdığın: <s>${esc(userText)}</s> · ` : ''}Doğrusu: <b>${esc(word[0])}</b>`}</span>
          <button type="button" class="wk-speak-btn" id="wkd-fb-speak" title="Dinle">${icon('volume', 15)}</button>
        </div>`;
      document.getElementById('wkd-fb-speak').onclick = () => _speakRate(word[0], 0.9);
      _speakRate(word[0], 0.9);
      nextBtn.style.display = 'inline-flex';
    };

    checkBtn.onclick = () => {
      const val = inp.value;
      if (!val.trim()) return;
      finalizeWrite(_norm(val) === _norm(word[0]), val.trim());
    };

    inp.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!_st.answered) checkBtn.click();
        else nextBtn.click();
      }
    };

    document.getElementById('wkd-hint-btn').onclick = () => {
      if (_st.answered) return;
      const chars = Array.from(word[0]);
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] !== ' ' && chars[i] !== '-' && !_st.revealedIdx.has(i)) {
          _st.revealedIdx.add(i);
          break;
        }
      }
      document.getElementById('wkd-pattern').textContent = _buildPattern(word[0], _st.revealedIdx);
      inp.focus();
    };

    document.getElementById('wkd-speak-hint').onclick = () => {
      _speakRate(word[0], 0.85);
      inp.focus();
    };

    document.getElementById('wkd-giveup-btn').onclick = () => finalizeWrite(false, inp.value.trim());
    nextBtn.onclick = () => { _st.index++; _renderWriteQuestion(); };
  }

  /* ═══════════════════════════════════════════════════════════════
     3. MEMORY MATCH ARENA (5-pair chunked rounds)
     ═══════════════════════════════════════════════════════════════ */
  function _formatSec(sec) {
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return `${m < 10 ? '0' + m : m}:${r < 10 ? '0' + r : r}`;
  }

  function startWeeklyMatchDrill(pool, allWords, backFn, title, weekId) {
    if (!pool || !pool.length) { showToast('Çalışılacak kelime bulunamadı.'); return; }
    _initBaseState('match', pool, allWords, backFn, title, weekId);

    const rounds = [];
    for (let i = 0; i < pool.length; i += 5) {
      rounds.push(pool.slice(i, i + 5));
    }
    _st.rounds = rounds;
    _st.roundIdx = 0;
    _st.elapsedSec = 0;
    _st.matchAudio = true;
    _st.matchTimer = setInterval(() => {
      if (!_st) return;
      _st.elapsedSec++;
      const el = document.getElementById('wkd-stopwatch');
      if (el) el.textContent = _formatSec(_st.elapsedSec);
    }, 1000);

    _renderMatchRound();
  }

  function _renderMatchRound() {
    const s = document.getElementById('screen-weekly-drill');
    if (!s || !_st) return;
    if (_st.roundIdx >= _st.rounds.length) { _renderSummary(); return; }

    const pairs = _st.rounds[_st.roundIdx];
    const leftItems = shuffle(pairs.map((w, i) => ({ id: i, text: w[0], word: w })));
    const rightItems = shuffle(pairs.map((w, i) => ({ id: i, text: w[1], word: w })));
    const matchedIds = new Set();
    const roundErrors = new Set();
    let selLeft = null;
    let selRight = null;
    let locking = false;

    const pct = Math.round((_st.roundIdx / _st.rounds.length) * 100);

    s.innerHTML = `
      ${_renderHeaderHtml(pct, `Tur ${_st.roundIdx + 1} / ${_st.rounds.length}`)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-match-top">
            <span class="wkd-eyebrow">İngilizce ve Türkçe Eşlerini Seç</span>
            <span class="wkd-stopwatch-pill" id="wkd-stopwatch">${_formatSec(_st.elapsedSec)}</span>
          </div>
          <div class="wkd-match-grid">
            <div class="wkd-match-col" id="wkd-col-en">
              ${leftItems.map(item => `
                <button type="button" class="wkd-match-tile" data-side="en" data-mid="${item.id}">${esc(item.text)}</button>
              `).join('')}
            </div>
            <div class="wkd-match-col" id="wkd-col-tr">
              ${rightItems.map(item => `
                <button type="button" class="wkd-match-tile" data-side="tr" data-mid="${item.id}">${esc(item.text)}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wkd-back-btn').onclick = _goBack;

    const tryResolve = () => {
      if (!selLeft || !selRight) return;
      const lId = Number(selLeft.dataset.mid);
      const rId = Number(selRight.dataset.mid);
      const lEl = selLeft;
      const rEl = selRight;
      selLeft = null;
      selRight = null;

      const word = pairs[lId];
      if (lId === rId) {
        matchedIds.add(lId);
        lEl.classList.remove('is-selected');
        rEl.classList.remove('is-selected');
        lEl.classList.add('is-matched');
        rEl.classList.add('is-matched');
        lEl.disabled = true;
        rEl.disabled = true;
        _recordOutcome(word, true, !roundErrors.has(lId));
        if (_st.matchAudio) _speakRate(word[0], 0.95);

        if (matchedIds.size >= pairs.length) {
          setTimeout(() => {
            if (!_st) return;
            _st.roundIdx++;
            _renderMatchRound();
          }, 420);
        }
      } else {
        locking = true;
        roundErrors.add(lId);
        roundErrors.add(rId);
        lEl.classList.remove('is-selected');
        rEl.classList.remove('is-selected');
        lEl.classList.add('is-wrong');
        rEl.classList.add('is-wrong');
        _recordOutcome(word, false, false);
        setTimeout(() => {
          lEl.classList.remove('is-wrong');
          rEl.classList.remove('is-wrong');
          locking = false;
        }, 420);
      }
    };

    s.querySelectorAll('.wkd-match-tile').forEach(btn => {
      btn.onclick = () => {
        if (locking || btn.disabled) return;
        const side = btn.dataset.side;
        if (side === 'en') {
          if (selLeft) selLeft.classList.remove('is-selected');
          selLeft = btn;
          btn.classList.add('is-selected');
        } else {
          if (selRight) selRight.classList.remove('is-selected');
          selRight = btn;
          btn.classList.add('is-selected');
        }
        tryResolve();
      };
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     4. LISTEN & RECALL (Audio MCQ or Dictation)
     ═══════════════════════════════════════════════════════════════ */
  function startWeeklyListenDrill(pool, allWords, backFn, title, weekId) {
    if (!pool || !pool.length) { showToast('Çalışılacak kelime bulunamadı.'); return; }
    _initBaseState('listen', pool, allWords, backFn, title, weekId);
    _st.listenSub = 'mc'; // 'mc' | 'dictation'
    _renderListenQuestion();
  }

  function _renderListenQuestion() {
    const s = document.getElementById('screen-weekly-drill');
    if (!s || !_st) return;
    if (_st.index >= _st.pool.length) { _renderSummary(); return; }

    _st.answered = false;
    const word = _st.pool[_st.index];
    const pct = Math.round((_st.index / _st.pool.length) * 100);
    const isDict = _st.listenSub === 'dictation';
    const opts = isDict ? [] : shuffle([word, ..._pickDistractors(word, 3)]);

    s.innerHTML = `
      ${_renderHeaderHtml(pct, `${_st.index + 1} / ${_st.pool.length}`)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-listen-top">
            <span class="wkd-eyebrow">Dinle &amp; Bil</span>
            <div class="wkd-submode-seg">
              <button type="button" class="wkd-submode-btn ${!isDict ? 'active' : ''}" data-lsub="mc">4 Şık (Anlam)</button>
              <button type="button" class="wkd-submode-btn ${isDict ? 'active' : ''}" data-lsub="dictation">Dikte (Yaz)</button>
            </div>
          </div>

          <div class="wkd-audio-hero">
            <button type="button" class="wkd-play-main" id="wkd-listen-play">
              ${icon('volume', 24)} <span>Dinle (1.0x)</span>
            </button>
            <button type="button" class="wkd-play-slow" id="wkd-listen-slow">
              ${icon('timer', 15)} <span>Yavaş (0.65x)</span>
            </button>
          </div>

          ${isDict ? `
            <div class="wkd-input-row">
              <input type="text" class="wkd-input" id="wkd-dict-inp" placeholder="Duyduğun İngilizce kelimeyi yaz..." autocomplete="off" autocapitalize="none" spellcheck="false">
              <button type="button" class="wkd-btn primary" id="wkd-dict-check">Kontrol Et</button>
            </div>
          ` : `
            <div class="wkd-options">
              ${opts.map((o, idx) => `
                <button type="button" class="wkd-opt" data-oidx="${idx}">
                  <span class="wkd-opt-key">${idx + 1}</span>
                  <span class="wkd-opt-text">${esc(o[1])}</span>
                </button>
              `).join('')}
            </div>
          `}

          <div id="wkd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="wkd-next-btn" style="display:none">
              <span>${_st.index + 1 >= _st.pool.length ? 'Sonucu Gör' : 'Sonraki'}</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wkd-back-btn').onclick = _goBack;
    document.getElementById('wkd-listen-play').onclick = () => _speakRate(word[0], 0.95);
    document.getElementById('wkd-listen-slow').onclick = () => _speakRate(word[0], 0.65);

    s.querySelectorAll('[data-lsub]').forEach(btn => {
      btn.onclick = () => {
        if (_st.answered) return;
        _st.listenSub = btn.dataset.lsub;
        _renderListenQuestion();
      };
    });

    const nextBtn = document.getElementById('wkd-next-btn');
    nextBtn.onclick = () => { _st.index++; _renderListenQuestion(); };

    setTimeout(() => _speakRate(word[0], 0.92), 120);

    if (isDict) {
      const inp = document.getElementById('wkd-dict-inp');
      const chk = document.getElementById('wkd-dict-check');
      setTimeout(() => inp && inp.focus(), 40);
      const submitDict = () => {
        if (_st.answered || !inp.value.trim()) return;
        _st.answered = true;
        inp.disabled = true;
        chk.disabled = true;
        const ok = _norm(inp.value) === _norm(word[0]);
        _recordOutcome(word, ok, true);
        document.getElementById('wkd-feedback').innerHTML = `
          <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
            <span>${ok ? 'Doğru!' : 'Doğrusu:'} <b>${esc(word[0])}</b> — ${esc(word[1])}</span>
          </div>`;
        nextBtn.style.display = 'inline-flex';
      };
      chk.onclick = submitDict;
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!_st.answered) submitDict();
          else nextBtn.click();
        }
      };
    } else {
      const optBtns = s.querySelectorAll('.wkd-opt');
      optBtns.forEach((btn, idx) => {
        btn.onclick = () => {
          if (_st.answered) return;
          _st.answered = true;
          const isOk = _norm(opts[idx][0]) === _norm(word[0]);
          _recordOutcome(word, isOk, true);
          optBtns.forEach((b, bi) => {
            b.classList.add('disabled');
            if (_norm(opts[bi][0]) === _norm(word[0])) b.classList.add('is-correct');
            else if (bi === idx && !isOk) b.classList.add('is-wrong');
          });
          document.getElementById('wkd-feedback').innerHTML = `
            <div class="wkd-fb-pill ${isOk ? 'is-ok' : 'is-err'}">
              <span><b>${esc(word[0])}</b> — ${esc(word[1])}</span>
            </div>`;
          nextBtn.style.display = 'inline-flex';
        };
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     5. ADAPTIVE MASTERY LOOP (2-Stage: Recognize -> Active Write)
     ═══════════════════════════════════════════════════════════════ */
  function startWeeklyMasteryDrill(pool, allWords, backFn, title, weekId) {
    if (!pool || !pool.length) { showToast('Çalışılacak kelime bulunamadı.'); return; }
    _initBaseState('mastery', pool, allWords, backFn, title, weekId);

    const items = pool.map(w => ({ word: w, stage: 0 }));
    _st.masteryTotal = items.length;
    _st.masteredCount = 0;
    _st.activeQueue = items.slice(0, 5);
    _st.waitingQueue = items.slice(5);
    _renderMasteryStep();
  }

  function _renderMasteryStep() {
    const s = document.getElementById('screen-weekly-drill');
    if (!s || !_st) return;

    while (_st.activeQueue.length < 5 && _st.waitingQueue.length > 0) {
      _st.activeQueue.push(_st.waitingQueue.shift());
    }
    if (_st.activeQueue.length === 0) {
      _renderSummary();
      return;
    }

    _st.answered = false;
    const item = _st.activeQueue[0];
    const word = item.word;
    const pct = Math.round((_st.masteredCount / _st.masteryTotal) * 100);
    const isStageWrite = item.stage === 1;
    const opts = isStageWrite ? [] : shuffle([word, ..._pickDistractors(word, 3)]);

    s.innerHTML = `
      ${_renderHeaderHtml(pct, `Usta: ${_st.masteredCount}/${_st.masteryTotal}`)}
      <div class="wkd-wrap">
        <div class="wkd-card">
          <div class="wkd-mastery-top">
            <span class="wkd-stage-pill ${isStageWrite ? 'is-stage2' : 'is-stage1'}">
              ${isStageWrite ? '2. Aşama · Aktif Yazma' : '1. Aşama · Anlam Tanıma'}
            </span>
            <span class="wkd-eyebrow">Aktif Grup: ${_st.activeQueue.length} · Bekleyen: ${_st.waitingQueue.length}</span>
          </div>

          ${isStageWrite ? `
            <div class="wkd-prompt-main">${esc(word[1])}</div>
            <div class="wkd-pattern" id="wkd-m-pattern">${esc(_buildPattern(word[0], new Set()))}</div>
            <div class="wkd-input-row">
              <input type="text" class="wkd-input" id="wkd-m-inp" placeholder="İngilizce karşılığını yaz..." autocomplete="off" autocapitalize="none" spellcheck="false">
              <button type="button" class="wkd-btn primary" id="wkd-m-check">Onayla</button>
            </div>
            <div class="wkd-helper-row">
              <button type="button" class="wkd-helper-btn" id="wkd-m-hint">${icon('sparkles', 14)} <span>Harf İpucu</span></button>
              <button type="button" class="wkd-helper-btn" id="wkd-m-speak">${icon('volume', 14)} <span>Telaffuz</span></button>
            </div>
          ` : `
            <div class="wkd-prompt-row">
              <div class="wkd-prompt-main">${esc(word[0])}</div>
              <button type="button" class="wk-speak-btn" id="wkd-m-play" aria-label="Dinle">${icon('volume', 16)}</button>
            </div>
            <div class="wkd-options">
              ${opts.map((o, idx) => `
                <button type="button" class="wkd-opt" data-oidx="${idx}">
                  <span class="wkd-opt-key">${idx + 1}</span>
                  <span class="wkd-opt-text">${esc(o[1])}</span>
                </button>
              `).join('')}
            </div>
          `}

          <div id="wkd-feedback" class="wkd-feedback"></div>
          <div class="wkd-foot-actions">
            <button type="button" class="wkd-btn primary" id="wkd-next-btn" style="display:none">
              <span>Devam Et</span> ${icon('arrowRight', 15)}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('wkd-back-btn').onclick = _goBack;
    const nextBtn = document.getElementById('wkd-next-btn');

    const advanceQueue = (passed) => {
      const cur = _st.activeQueue.shift();
      if (passed) {
        cur.stage++;
        if (cur.stage >= 2) {
          _st.masteredCount++;
        } else {
          const insertAt = Math.min(_st.activeQueue.length, 2);
          _st.activeQueue.splice(insertAt, 0, cur);
        }
      } else {
        cur.stage = 0;
        const insertAt = Math.min(_st.activeQueue.length, 2);
        _st.activeQueue.splice(insertAt, 0, cur);
      }
      _renderMasteryStep();
    };

    let lastPassed = false;
    nextBtn.onclick = () => advanceQueue(lastPassed);

    if (isStageWrite) {
      const inp = document.getElementById('wkd-m-inp');
      const chk = document.getElementById('wkd-m-check');
      const rev = new Set();
      setTimeout(() => inp && inp.focus(), 30);

      document.getElementById('wkd-m-hint').onclick = () => {
        if (_st.answered) return;
        const chars = Array.from(word[0]);
        for (let i = 0; i < chars.length; i++) {
          if (chars[i] !== ' ' && chars[i] !== '-' && !rev.has(i)) { rev.add(i); break; }
        }
        document.getElementById('wkd-m-pattern').textContent = _buildPattern(word[0], rev);
        inp.focus();
      };
      document.getElementById('wkd-m-speak').onclick = () => { _speakRate(word[0], 0.88); inp.focus(); };

      const submitWrite = () => {
        if (_st.answered || !inp.value.trim()) return;
        _st.answered = true;
        inp.disabled = true;
        chk.disabled = true;
        const ok = _norm(inp.value) === _norm(word[0]);
        lastPassed = ok;
        _recordOutcome(word, ok, ok);
        document.getElementById('wkd-m-pattern').textContent = word[0];
        document.getElementById('wkd-feedback').innerHTML = `
          <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
            <span>${ok ? `Ustalaşıldı! <b>${esc(word[0])}</b>` : `Tekrar sorulacak · Doğrusu: <b>${esc(word[0])}</b>`}</span>
          </div>`;
        _speakRate(word[0], 0.9);
        nextBtn.style.display = 'inline-flex';
      };
      chk.onclick = submitWrite;
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!_st.answered) submitWrite();
          else nextBtn.click();
        }
      };
    } else {
      document.getElementById('wkd-m-play').onclick = () => _speakRate(word[0], 0.9);
      const optBtns = s.querySelectorAll('.wkd-opt');
      optBtns.forEach((btn, idx) => {
        btn.onclick = () => {
          if (_st.answered) return;
          _st.answered = true;
          const ok = _norm(opts[idx][0]) === _norm(word[0]);
          lastPassed = ok;
          _recordOutcome(word, ok, false);
          optBtns.forEach((b, bi) => {
            b.classList.add('disabled');
            if (_norm(opts[bi][0]) === _norm(word[0])) b.classList.add('is-correct');
            else if (bi === idx && !ok) b.classList.add('is-wrong');
          });
          document.getElementById('wkd-feedback').innerHTML = `
            <div class="wkd-fb-pill ${ok ? 'is-ok' : 'is-err'}">
              <span>${ok ? '2. Aşamaya (Yazma) geçti!' : `Yanlış — Doğrusu: <b>${esc(word[1])}</b> (Tekrar sorulacak)`}</span>
            </div>`;
          nextBtn.style.display = 'inline-flex';
        };
      });
    }
  }

  global.startWeeklyReverseQuiz = startWeeklyReverseQuiz;
  global.startWeeklyWriteDrill = startWeeklyWriteDrill;
  global.startWeeklyMatchDrill = startWeeklyMatchDrill;
  global.startWeeklyListenDrill = startWeeklyListenDrill;
  global.startWeeklyMasteryDrill = startWeeklyMasteryDrill;
  global._cleanupWeeklyDrill = _cleanupWeeklyDrill;
})(window);
