// Quiz modes: Multiple Choice, Fill-in-the-Blank, Synonym, Antonym, and Speed Mode
let _mcDirection = 'en-tr'; // 'en-tr' | 'tr-en' | 'mix'
let _mcWrong = 0;
let _mcWrongWords = [];
let _mcPoolOrigin = null;
let _mcBackFn = null;
let _mcTitle = null;
let _mcUnitContext = null;
let _mcCurrentQ = null;
let _fibCurrentOpts = [];
let _synCurrentQ = null;
let _antCurrentQ = null;
let _speedCurrentQ = null;
let _quizNextTimer = null;
let _quizKeyBound = false;

function _clearQuizTimer() {
  if (_quizNextTimer) {
    clearTimeout(_quizNextTimer);
    _quizNextTimer = null;
  }
}

function _normQuizText(str) {
  return String(str || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function _getAllGlobalWords() {
  const all = [];
  if (typeof UNITS !== 'undefined') {
    Object.values(UNITS).forEach(u => {
      if (u && Array.isArray(u.words)) all.push(...u.words);
    });
  }
  if (typeof getAllWeeklyWordsFlat === 'function') {
    all.push(...getAllWeeklyWordsFlat());
  }
  return all;
}

function _getDistractorSource(unit, poolOrigin) {
  if (Array.isArray(poolOrigin) && poolOrigin.length >= 4) return poolOrigin;
  const base = unit && UNITS[unit] && UNITS[unit].words ? UNITS[unit].words : [];
  if (base.length >= 4) return base;
  return _getAllGlobalWords();
}

function _pickDistinctDistractors(targetWord, sourceWords, count = 3) {
  const targetEn = _normQuizText(targetWord && targetWord[0]);
  const targetTr = _normQuizText(targetWord && targetWord[1]);
  const seenEn = new Set([targetEn]);
  const seenTr = new Set([targetTr]);
  const picked = [];

  const tryFromPool = (pool) => {
    if (!Array.isArray(pool) || picked.length >= count) return;
    const shuffled = shuffle(pool);
    for (const w of shuffled) {
      if (picked.length >= count) break;
      if (!w || !w[0] || !w[1]) continue;
      const en = _normQuizText(w[0]);
      const tr = _normQuizText(w[1]);
      if (!en || !tr || seenEn.has(en) || seenTr.has(tr)) continue;
      seenEn.add(en);
      seenTr.add(tr);
      picked.push(w);
    }
  };

  tryFromPool(sourceWords);
  if (picked.length < count) {
    tryFromPool(_getAllGlobalWords());
  }
  return picked;
}

function _runBackHandler(expr, fallbackUnit) {
  _clearQuizTimer();
  if (typeof _clearSpeedTimer === 'function') _clearSpeedTimer();
  const target = expr || (fallbackUnit && UNITS[fallbackUnit] ? `openUnit(${fallbackUnit})` : 'goHome()');
  try {
    if (typeof target === 'function') {
      target();
    } else if (typeof target === 'string' && target.trim()) {
      (new Function(target))();
    } else {
      goHome();
    }
  } catch (e) {
    goHome();
  }
}

function _runMCBack() {
  _runBackHandler(_mcBackFn, _mcUnitContext || currentUnit);
}

function _speakCurrentMCWord() {
  if (_mcCurrentQ && _mcCurrentQ.word && _mcCurrentQ.word[0] && typeof speakWord === 'function') {
    speakWord(_mcCurrentQ.word[0]);
  }
}

function _bindQuizKeys() {
  if (_quizKeyBound) return;
  _quizKeyBound = true;
  document.addEventListener('keydown', e => {
    const tag = (e.target && e.target.tagName) || '';
    if (document.querySelector('.word-modal-overlay[style*="flex"], .stats-overlay[style*="flex"], #gm-goal-modal, #auth-modal-overlay')) return;

    const fibScreen = document.getElementById('screen-fib');
    if (fibScreen && fibScreen.classList.contains('active')) {
      const nextBtn = document.getElementById('fib-next-btn');
      if (e.key === 'Enter' && nextBtn && nextBtn.style.display !== 'none') {
        e.preventDefault();
        nextBtn.click();
        return;
      }
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    }

    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const activeQuizScreen = ['screen-mc', 'screen-syn-quiz', 'screen-ant-quiz', 'screen-speed', 'screen-fib']
      .map(id => document.getElementById(id))
      .find(el => el && el.classList.contains('active'));
    if (!activeQuizScreen) return;

    const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
    const idx = keyMap[String(e.key || '').toLowerCase()];
    if (idx !== undefined) {
      const opts = activeQuizScreen.querySelectorAll('.mc-opt:not(.disabled)');
      if (opts && opts[idx]) {
        e.preventDefault();
        opts[idx].click();
      }
    }
  });
}

function _maskSentenceWord(sentence, targetWord) {
  if (!sentence || !targetWord) return '';
  const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return esc(sentence).replace(new RegExp('\\b' + escaped + "[a-zA-Z']*\\b", 'gi'), '<span class="mc-blank">_____</span>');
}

function setMCDirection(dir) {
  _mcDirection = dir || 'en-tr';
  _clearQuizTimer();
  cardIndex = 0;
  mcScore = 0;
  _mcWrong = 0;
  _mcWrongWords = [];
  if (_mcPoolOrigin && _mcPoolOrigin.length) {
    currentCards = shuffle(_mcPoolOrigin);
    mcTotal = currentCards.length;
  }
  renderMC(_mcBackFn, _mcTitle);
}

function startMC(pool, backFn, title) {
  _clearQuizTimer();
  _bindQuizKeys();
  let chosenPool = pool;
  let fromUnit = null;
  if (!chosenPool) {
    fromUnit = currentUnit;
    if (typeof getUnitStudyPool === 'function') {
      chosenPool = shuffle(getUnitStudyPool(currentUnit));
      if (chosenPool.length === 0 && UNITS[currentUnit] && UNITS[currentUnit].words.length > 0) {
        showToast('Tüm kelimeleri zaten öğrendin! Tüm ünite yükleniyor.');
        chosenPool = shuffle(UNITS[currentUnit].words);
      }
    } else if (UNITS[currentUnit] && UNITS[currentUnit].words) {
      chosenPool = shuffle(UNITS[currentUnit].words);
    }
  }
  const sanitized = Array.isArray(chosenPool)
    ? chosenPool.filter(w => Array.isArray(w) && w[0] && w[1])
    : [];
  if (sanitized.length === 0) { showToast('Test için kelime bulunamadı!'); return; }

  currentCards = sanitized;
  _mcPoolOrigin = [...sanitized];
  _mcBackFn = backFn || (fromUnit ? `openUnit(${fromUnit})` : null);
  _mcTitle = title || null;
  _mcUnitContext = fromUnit;
  _mcCurrentQ = null;
  cardIndex = 0;
  mcScore = 0;
  _mcWrong = 0;
  _mcWrongWords = [];
  mcTotal = currentCards.length;
  showScreen('screen-mc');
  renderMC(_mcBackFn, _mcTitle);
}

function renderMC(backFn, titleOverride) {
  _clearQuizTimer();
  _bindQuizKeys();
  const s = document.getElementById('screen-mc');
  if (!s) return;
  if (backFn !== undefined && backFn !== null && backFn !== '') _mcBackFn = backFn;
  if (titleOverride !== undefined && titleOverride !== null && titleOverride !== '') _mcTitle = titleOverride;

  while (cardIndex < currentCards.length && (!currentCards[cardIndex] || !currentCards[cardIndex][0] || !currentCards[cardIndex][1])) {
    cardIndex++;
  }
  if (!currentCards || cardIndex >= currentCards.length) {
    renderMCResult(_mcBackFn, _mcTitle);
    return;
  }

  const word = currentCards[cardIndex];
  const unit = word._unit || (_mcUnitContext && UNITS[_mcUnitContext] ? _mcUnitContext : null);
  const weekId = word._weekId || null;
  const sourceWords = _getDistractorSource(unit, _mcPoolOrigin);
  const wrong = _pickDistinctDistractors(word, sourceWords, 3);
  const opts = shuffle([word, ...wrong]);
  const correctIdx = opts.findIndex(o => _normQuizText(o[0]) === _normQuizText(word[0]));
  const pct = mcTotal > 0 ? Math.round((cardIndex / mcTotal) * 100) : 0;
  const title = _mcTitle || 'Çoktan Seçmeli';

  const useEnToTr = _mcDirection === 'en-tr' || (_mcDirection === 'mix' && cardIndex % 2 === 0);
  const comboVal = typeof _comboCount !== 'undefined' ? _comboCount : 0;
  const keys = ['A', 'B', 'C', 'D'];
  const subLabel = weekId
    ? (word._weekLabel || 'Haftalık Kelime')
    : (unit && UNITS[unit] ? 'Ünite ' + unit : 'Özel Liste');

  _mcCurrentQ = {
    word,
    opts,
    correctIdx,
    unit,
    weekId,
    useEnToTr,
    answered: false
  };

  s.innerHTML = `
  <div class="unit-header">
    <button type="button" class="back-btn" onclick="_runMCBack()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div><div class="unit-title-h">${esc(title)}</div><div class="unit-sub">${esc(subLabel)} · ${cardIndex + 1}/${mcTotal}</div></div>
  </div>
  <div class="mc-wrap">
    <div class="quiz-status-bar">
      <div class="quiz-stat-group">
        <span class="fc-stat-pill is-ok">${icon('check', 12)} ${mcScore}</span>
        <span class="fc-stat-pill is-err">${icon('x', 12)} ${_mcWrong}</span>
        ${comboVal >= 2 ? `<span class="fc-stat-pill is-combo">${icon('flame', 12)} ${comboVal}x</span>` : ''}
      </div>
      <div class="quiz-dir-pills">
        <button type="button" class="quiz-dir-pill ${_mcDirection === 'en-tr' ? 'active' : ''}" onclick="setMCDirection('en-tr')">EN→TR</button>
        <button type="button" class="quiz-dir-pill ${_mcDirection === 'tr-en' ? 'active' : ''}" onclick="setMCDirection('tr-en')">TR→EN</button>
        <button type="button" class="quiz-dir-pill ${_mcDirection === 'mix' ? 'active' : ''}" onclick="setMCDirection('mix')">Karışık</button>
      </div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="mc-question">
      <div class="mc-q-label">${useEnToTr ? 'Aşağıdaki Kelimenin Anlamı Nedir?' : 'Bu Anlama Karşılık Gelen Kelime Hangisi?'}</div>
      <div class="mc-q-word-row">
        <div class="mc-q-word ${useEnToTr ? '' : 'is-tr'}">${esc(useEnToTr ? word[0] : word[1])}</div>
        ${useEnToTr ? `<button type="button" class="pronounce-btn" onclick="_speakCurrentMCWord()" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 17)}</button>` : ''}
      </div>
      ${word[2] ? `<div class="mc-q-example" id="mc-q-example">${_maskSentenceWord(word[2], word[0])}</div>` : ''}
    </div>
    <div class="mc-options" id="mc-options">
      ${opts.map((o, idx) => `
        <button type="button" class="mc-opt" data-idx="${idx}" onclick="checkMC(this,${idx})">
          <span class="mc-opt-key">${keys[idx] || (idx + 1)}</span>
          <span class="mc-opt-text">${esc(useEnToTr ? o[1] : o[0])}</span>
          <span class="mc-opt-status"></span>
        </button>`).join('')}
    </div>
  </div>`;
}

function checkMC(btn, chosenIdx) {
  const optsWrap = document.getElementById('mc-options');
  const q = _mcCurrentQ;
  if (!optsWrap || !q || q.answered || optsWrap.dataset.answered === '1') return;
  q.answered = true;
  optsWrap.dataset.answered = '1';

  const word = q.word;
  const chosenWord = q.opts[chosenIdx];
  const isCorrect = chosenIdx === q.correctIdx ||
    (chosenWord && _normQuizText(chosenWord[0]) === _normQuizText(word[0])) ||
    (chosenWord && _normQuizText(chosenWord[1]) === _normQuizText(word[1]));

  const exEl = document.getElementById('mc-q-example');
  if (exEl && word && word[2]) {
    exEl.innerHTML = typeof highlightTargetWord === 'function' ? highlightTargetWord(word[2], word[0]) : esc(word[2]);
  }

  optsWrap.querySelectorAll('.mc-opt').forEach(b => b.classList.add('disabled'));
  const statusEl = btn.querySelector('.mc-opt-status');

  const unit = q.unit;
  const weekId = q.weekId;
  const errKey = weekId ? ('w_' + weekId + '_' + word[0]) : (unit ? ('u' + unit + '_' + word[0]) : null);

  if (isCorrect) {
    const nextCombo = (typeof _comboCount !== 'undefined' ? _comboCount : 0) + 1;
    if (typeof playGameSFX === 'function') playGameSFX('correct', nextCombo);
    if (typeof _triggerCorrect === 'function') _triggerCorrect(btn, 'mc_correct');
    if (typeof _trackQuestStat === 'function') _trackQuestStat('mcCorrect');
    btn.classList.add('correct');
    if (statusEl) statusEl.innerHTML = icon('check', 16);
    mcScore++;
    if (weekId && typeof markWeeklyWordLearned === 'function') {
      markWeeklyWordLearned(weekId, word[0], true, true);
    } else if (unit && UNITS[unit]) {
      markLearned(unit, word[0]);
    }
    if (errKey && errorBox[errKey]) {
      delete errorBox[errKey];
      saveErrors();
    }
    _quizNextTimer = setTimeout(() => {
      const scr = document.getElementById('screen-mc');
      if (!scr || !scr.classList.contains('active')) return;
      cardIndex++;
      renderMC();
    }, 900);
  } else {
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _triggerWrong === 'function') _triggerWrong(btn);
    btn.classList.add('wrong');
    if (statusEl) statusEl.innerHTML = icon('x', 16);
    _mcWrong++;
    if (word && !_mcWrongWords.some(w => _normQuizText(w[0]) === _normQuizText(word[0]))) _mcWrongWords.push(word);
    const correctBtn = optsWrap.querySelector(`.mc-opt[data-idx="${q.correctIdx}"]`);
    if (correctBtn) {
      correctBtn.classList.add('correct');
      const st = correctBtn.querySelector('.mc-opt-status');
      if (st) st.innerHTML = icon('check', 16);
    }
    if (weekId && typeof markWeeklyWordLearned === 'function') {
      markWeeklyWordLearned(weekId, word[0], false, true);
    } else if (unit && UNITS[unit]) {
      markUnlearned(unit, word[0]);
    }
    if (errKey) {
      errorBox[errKey] = { word: word[0], meaning: word[1], unit: unit || (word._weekLabel || 'Haftalık'), weekId: weekId || undefined };
      saveErrors();
    }
    _quizNextTimer = setTimeout(() => {
      const scr = document.getElementById('screen-mc');
      if (!scr || !scr.classList.contains('active')) return;
      cardIndex++;
      renderMC();
    }, 1450);
  }
}

function renderMCResult(backFn, titleOverride) {
  _clearQuizTimer();
  const pct = mcTotal > 0 ? Math.round((mcScore / mcTotal) * 100) : 0;
  const s = document.getElementById('screen-mc');
  if (!s) return;
  if (backFn) _mcBackFn = backFn;
  if (titleOverride) _mcTitle = titleOverride;
  if (pct >= 70 && typeof playGameSFX === 'function') playGameSFX('win');

  window._retryMCWrong = function () {
    startMC(shuffle(_mcWrongWords), _mcBackFn, _mcTitle);
  };
  window._restartMCAll = function () {
    startMC(_mcPoolOrigin ? shuffle(_mcPoolOrigin) : null, _mcBackFn, _mcTitle);
  };

  s.innerHTML = `
  <div class="result-wrap">
    <div class="result-emoji">${pct >= 80 ? icon('target', 48) : pct >= 50 ? icon('thumbsUp', 48) : icon('info', 48)}</div>
    <div class="result-title">${pct}% Başarı</div>
    <div class="result-sub">${mcTotal} sorudan ${mcScore} tanesi doğru</div>
    <div class="stat-row">
      <div class="stat-box"><div class="stat-num" style="color:var(--success)">${mcScore}</div><div class="stat-lbl">Doğru</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--error)">${mcTotal - mcScore}</div><div class="stat-lbl">Yanlış</div></div>
    </div>
    ${_mcWrongWords.length > 0 ? `<button type="button" class="result-btn" onclick="window._retryMCWrong()">${icon('repeat', 16)} Yanlışları Tekrar Çöz (${_mcWrongWords.length})</button>` : ''}
    <button type="button" class="result-btn ${_mcWrongWords.length > 0 ? 'outline' : ''}" onclick="window._restartMCAll()">${icon('shuffle', 16)} Yeniden Başla</button>
    <button type="button" class="result-btn outline" onclick="_runMCBack()">${icon('arrowLeft', 16)} Geri Dön</button>
  </div>`;
}

// -- FIB Mode (Type & Word Bank) --
let _fibMode = 'type';
let _fibWrong = 0;
let _fibWrongWords = [];
let _fibHintLevel = 0;
let _fibPoolOrigin = [];
let _fibBackFn = '';
let _fibTitle = '';

function setFIBMode(mode) {
  _fibMode = mode === 'bank' ? 'bank' : 'type';
  fibMode = _fibMode;
  renderFIB();
}

function _buildBlankDisplay(targetWord, revealedCount) {
  const clean = (targetWord || '').trim();
  if (!clean) return '_____';
  const chars = [...clean].map((ch, idx) => {
    if (ch === ' ') return ' &nbsp; ';
    if (idx < revealedCount) return esc(ch);
    return '_';
  });
  return `${chars.join(' ')} <span class="fib-len-badge">(${clean.replace(/\s+/g, '').length})</span>`;
}

function giveFIBHint() {
  const inp = document.getElementById('fib-inp');
  const word = currentCards && currentCards[cardIndex];
  if (!word || (inp && inp.disabled)) return;
  const target = word[0];
  _fibHintLevel = Math.min(target.length, _fibHintLevel + 1);
  const partial = target.slice(0, _fibHintLevel);
  if (inp) {
    inp.value = partial;
    inp.focus();
  }
  const blank = document.getElementById('fib-blank-slot');
  if (blank) blank.innerHTML = _buildBlankDisplay(target, _fibHintLevel);
  if (typeof playGameSFX === 'function') playGameSFX('flip');
}

function startFIB(mode, pool, backFn, titleOverride) {
  _clearQuizTimer();
  _bindQuizKeys();
  _fibMode = mode === 'bank' ? 'bank' : 'type';
  fibMode = _fibMode;
  _fibBackFn = backFn || '';
  _fibTitle = titleOverride || '';
  const src = pool || (UNITS[currentUnit] ? UNITS[currentUnit].words.filter(w => w[2]) : []);
  currentCards = shuffle(src);
  if (currentCards.length === 0) { showToast('Bu ünitede örnek cümle yok!'); return; }
  _fibPoolOrigin = [...currentCards];
  cardIndex = 0;
  fibScore = 0;
  _fibWrong = 0;
  _fibWrongWords = [];
  _fibHintLevel = 0;
  fibTotal = currentCards.length;
  renderFIB();
  showScreen('screen-fib');
}

function renderFIB() {
  _clearQuizTimer();
  _bindQuizKeys();
  const s = document.getElementById('screen-fib');
  if (!s) return;
  if (cardIndex >= fibTotal) { renderFIBResult(); return; }

  const word = currentCards[cardIndex];
  _fibHintLevel = 0;
  const escaped = word[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sentence = esc(word[2]).replace(
    new RegExp('\\b' + escaped + "[a-zA-Z']*\\b", 'gi'),
    `<span class="fib-blank" id="fib-blank-slot">${_buildBlankDisplay(word[0], 0)}</span>`
  );
  const pct = Math.round((cardIndex / fibTotal) * 100);
  const comboVal = typeof _comboCount !== 'undefined' ? _comboCount : 0;

  let inputAreaHtml = '';
  if (_fibMode === 'bank') {
    const unit = word._unit || currentUnit || 1;
    const sourceWords = _getDistractorSource(unit, _fibPoolOrigin);
    const wrong = shuffle(sourceWords.filter(w => w[0] !== word[0])).slice(0, 3);
    const opts = shuffle([word, ...wrong]);
    const keys = ['A', 'B', 'C', 'D'];
    inputAreaHtml = `
      <div class="mc-options" id="fib-bank-opts">
        ${opts.map((o, idx) => `
          <button type="button" class="mc-opt" data-word="${escQ(o[0])}" onclick="checkFIBBank(this,'${escQ(o[0])}')">
            <span class="mc-opt-key">${keys[idx]}</span>
            <span class="mc-opt-text">${esc(o[0])}</span>
            <span class="mc-opt-status"></span>
          </button>`).join('')}
      </div>
      <div id="fib-feedback"></div>
    `;
  } else {
    inputAreaHtml = `
      <div class="fib-input-area">
        <div class="fib-input-row">
          <input class="fib-input" id="fib-inp" placeholder="Kelimeyi buraya yaz..." autocomplete="off" autocapitalize="none" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();checkFIB();}">
          <button type="button" class="fib-submit" onclick="checkFIB()">Kontrol Et</button>
        </div>
        <div class="fib-helper-row">
          <button type="button" class="fib-helper-btn" onclick="giveFIBHint()">${icon('sparkles', 14)} Harf İpucu</button>
          <button type="button" class="fib-helper-btn" onclick="speakWord('${escQ(word[0])}')">${icon('volume', 14)} Kelimeyi Dinle</button>
        </div>
        <div id="fib-feedback"></div>
        <button type="button" id="fib-next-btn" class="fib-submit" style="display:none; width:100%; background:var(--text); color:var(--bg)" onclick="cardIndex++;renderFIB()">Sonraki Soru ${icon('arrowRight', 15)}</button>
      </div>`;
  }

  const backHandler = _fibBackFn || (currentUnit ? `openUnit(${currentUnit})` : 'goHome()');
  const titleText = _fibTitle || 'Boşluk Doldur';
  const unitLabel = _fibTitle
    ? (word._unit ? `Ünite ${word._unit}` : 'Karışık Mod')
    : (currentUnit ? `Ünite ${currentUnit}` : 'Karışık Mod');

  s.innerHTML = `
  <div class="unit-header">
    <button class="back-btn" onclick="_clearQuizTimer();${backHandler}" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div><div class="unit-title-h">${esc(titleText)}</div><div class="unit-sub">${unitLabel} · ${cardIndex + 1}/${fibTotal}</div></div>
  </div>
  <div class="fib-wrap">
    <div class="quiz-status-bar">
      <div class="quiz-stat-group">
        <span class="fc-stat-pill is-ok">${icon('check', 12)} ${fibScore}</span>
        <span class="fc-stat-pill is-err">${icon('x', 12)} ${_fibWrong}</span>
        ${comboVal >= 2 ? `<span class="fc-stat-pill is-combo">${icon('flame', 12)} ${comboVal}x</span>` : ''}
      </div>
      <div class="quiz-dir-pills">
        <button type="button" class="quiz-dir-pill ${_fibMode === 'type' ? 'active' : ''}" onclick="setFIBMode('type')">Yazarak</button>
        <button type="button" class="quiz-dir-pill ${_fibMode === 'bank' ? 'active' : ''}" onclick="setFIBMode('bank')">Seçenekli</button>
      </div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="fib-question">
      <div class="mc-q-label">Cümleyi tamamlayacak kelimeyi ${_fibMode === 'bank' ? 'seçin' : 'yazın'}</div>
      <div class="fib-sentence">${sentence}</div>
      <div class="fib-hint">Türkçe İpucu: <b>${esc(word[1])}</b></div>
    </div>
    ${inputAreaHtml}
  </div>`;

  if (_fibMode === 'type') {
    setTimeout(() => { const inp = document.getElementById('fib-inp'); if (inp) inp.focus(); }, 90);
  }
}

function checkFIBBank(btn, chosen) {
  const wrap = document.getElementById('fib-bank-opts');
  const fb = document.getElementById('fib-feedback');
  const blank = document.getElementById('fib-blank-slot');
  if (!wrap || wrap.dataset.answered === '1') return;
  wrap.dataset.answered = '1';

  const word = currentCards[cardIndex];
  const correctWord = word[0];
  const unit = word._unit || currentUnit;
  wrap.querySelectorAll('.mc-opt').forEach(b => b.classList.add('disabled'));
  const stEl = btn.querySelector('.mc-opt-status');

  if (chosen === correctWord) {
    const nextCombo = (typeof _comboCount !== 'undefined' ? _comboCount : 0) + 1;
    if (typeof playGameSFX === 'function') playGameSFX('correct', nextCombo);
    if (typeof _triggerCorrect === 'function') _triggerCorrect(btn, 'fib_correct');
    if (typeof _trackQuestStat === 'function') _trackQuestStat('fibCorrect');
    btn.classList.add('correct');
    if (stEl) stEl.innerHTML = icon('check', 16);
    if (blank) { blank.textContent = correctWord; blank.classList.add('filled-correct'); }
    if (fb) { fb.className = 'fib-feedback correct'; fb.textContent = 'Harika! Doğru kelime.'; }
    fibScore++;
    if (UNITS[unit]) markLearned(unit, correctWord);
    delete errorBox['u' + unit + '_' + correctWord];
    saveErrors();
    _quizNextTimer = setTimeout(() => { cardIndex++; renderFIB(); }, 1050);
  } else {
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _triggerWrong === 'function') _triggerWrong(btn);
    btn.classList.add('wrong');
    if (stEl) stEl.innerHTML = icon('x', 16);
    _fibWrong++;
    if (!_fibWrongWords.some(w => w[0] === correctWord)) _fibWrongWords.push(word);
    wrap.querySelectorAll('.mc-opt').forEach(b => {
      if (b.dataset.word === correctWord) {
        b.classList.add('correct');
        const st = b.querySelector('.mc-opt-status');
        if (st) st.innerHTML = icon('check', 16);
      }
    });
    if (blank) { blank.textContent = correctWord; blank.classList.add('filled-wrong'); }
    if (fb) { fb.className = 'fib-feedback wrong'; fb.innerHTML = `${icon('x', 14)} Yanlış. Doğru kelime: <b>${esc(correctWord)}</b>`; }
    if (UNITS[unit]) markUnlearned(unit, correctWord);
    errorBox['u' + unit + '_' + correctWord] = { word: correctWord, meaning: word[1], unit };
    saveErrors();
    _quizNextTimer = setTimeout(() => { cardIndex++; renderFIB(); }, 1550);
  }
}

function checkFIB() {
  const inp = document.getElementById('fib-inp');
  const fb = document.getElementById('fib-feedback');
  const nextBtn = document.getElementById('fib-next-btn');
  const blank = document.getElementById('fib-blank-slot');
  if (!inp || inp.disabled) return;
  const answer = inp.value.trim().toLowerCase();
  if (!answer) { showToast('Cevap yazmalısınız!'); return; }

  const word = currentCards[cardIndex];
  const rawCorrect = word[0];
  const correct = rawCorrect.toLowerCase();
  const unit = word._unit || currentUnit;
  inp.disabled = true;

  const isExactOrInflection = answer === correct || answer === correct + 's' || correct === answer + 's' || answer === correct + 'd' || correct === answer + 'd' || answer === correct + 'ed' || answer === correct + 'ing';
  if (isExactOrInflection) {
    const nextCombo = (typeof _comboCount !== 'undefined' ? _comboCount : 0) + 1;
    if (typeof playGameSFX === 'function') playGameSFX('correct', nextCombo);
    if (typeof _triggerCorrect === 'function') _triggerCorrect(inp, 'fib_correct');
    if (typeof _trackQuestStat === 'function') _trackQuestStat('fibCorrect');
    inp.classList.add('correct');
    if (blank) { blank.textContent = rawCorrect; blank.classList.add('filled-correct'); }
    fb.className = 'fib-feedback correct';
    fb.textContent = 'Harika! Doğru cevap.';
    fibScore++;
    if (UNITS[unit]) markLearned(unit, rawCorrect);
    delete errorBox['u' + unit + '_' + rawCorrect];
    saveErrors();
    _quizNextTimer = setTimeout(() => { cardIndex++; renderFIB(); }, 1100);
  } else {
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _triggerWrong === 'function') _triggerWrong(inp);
    inp.classList.add('wrong');
    if (blank) { blank.textContent = rawCorrect; blank.classList.add('filled-wrong'); }
    fb.className = 'fib-feedback wrong';
    fb.innerHTML = `${icon('x', 14)} Yanlış. Doğru cevap: <b>${esc(rawCorrect)}</b>`;
    _fibWrong++;
    if (!_fibWrongWords.some(w => w[0] === rawCorrect)) _fibWrongWords.push(word);
    if (UNITS[unit]) markUnlearned(unit, rawCorrect);
    errorBox['u' + unit + '_' + rawCorrect] = { word: rawCorrect, meaning: word[1], unit };
    saveErrors();
    nextBtn.style.display = 'block';
  }
}

function renderFIBResult() {
  _clearQuizTimer();
  const pct = fibTotal > 0 ? Math.round((fibScore / fibTotal) * 100) : 0;
  const s = document.getElementById('screen-fib');
  const backHandler = _fibBackFn || (currentUnit ? `openUnit(${currentUnit})` : 'goHome()');
  if (pct >= 70 && typeof playGameSFX === 'function') playGameSFX('win');

  window._retryFIBWrong = function () {
    startFIB(_fibMode, shuffle(_fibWrongWords), _fibBackFn, _fibTitle);
  };
  window._restartFIBAll = function () {
    startFIB(_fibMode, _fibPoolOrigin.length ? shuffle(_fibPoolOrigin) : null, _fibBackFn, _fibTitle);
  };

  s.innerHTML = `
  <div class="result-wrap">
    <div class="result-emoji">${pct >= 80 ? icon('sparkles', 48) : pct >= 50 ? icon('listChecks', 48) : icon('repeat', 48)}</div>
    <div class="result-title">${pct}% Başarı</div>
    <div class="result-sub">${esc(_fibTitle || 'Boşluk Doldur')} · ${fibTotal} sorudan ${fibScore} doğru</div>
    <div class="stat-row">
      <div class="stat-box"><div class="stat-num" style="color:var(--success)">${fibScore}</div><div class="stat-lbl">Doğru</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--error)">${fibTotal - fibScore}</div><div class="stat-lbl">Yanlış</div></div>
    </div>
    ${_fibWrongWords.length > 0 ? `<button type="button" class="result-btn" onclick="window._retryFIBWrong()">${icon('repeat', 16)} Yanlışları Tekrar Çöz (${_fibWrongWords.length})</button>` : ''}
    <button type="button" class="result-btn ${_fibWrongWords.length > 0 ? 'outline' : ''}" onclick="window._restartFIBAll()">${icon('shuffle', 16)} Yeniden Başla</button>
    <button type="button" class="result-btn outline" onclick="${backHandler}">${icon('arrowLeft', 16)} Geri Dön</button>
  </div>`;
}

// -- Syn Quiz --
function startSynQuiz(customPool) {
  _clearQuizTimer();
  _bindQuizKeys();
  const allWords = customPool || UNITS[currentUnit].words.filter(w => getWordMeta(w[0]).synonyms.length >= 1);
  if (allWords.length < 4 && !customPool) { showToast('Bu ünitede yeterli eş anlamlı verisi yok!'); return; }
  window._synCards = shuffle(allWords);
  window._synIdx = 0;
  window._synScore = 0;
  window._synWrong = 0;
  window._synWrongCards = [];
  window._synOrigin = [...window._synCards];
  showScreen('screen-syn-quiz');
  renderSynQuiz();
}

function renderSynQuiz() {
  _clearQuizTimer();
  _bindQuizKeys();
  const s = document.getElementById('screen-syn-quiz');
  const cards = window._synCards || [];
  const total = Math.min(cards.length, 20);

  if (window._synIdx >= total) {
    const pct = total > 0 ? Math.round((window._synScore / total) * 100) : 0;
    if (pct >= 70 && typeof playGameSFX === 'function') playGameSFX('win');
    s.innerHTML = `
      <div class="result-wrap">
        <div class="result-emoji">${pct >= 80 ? icon('trophy', 48) : icon('thumbsUp', 48)}</div>
        <div class="result-title">${pct}% Başarı</div>
        <div class="result-sub">Eş Anlam Testi · ${total} sorudan ${window._synScore} doğru</div>
        <div class="stat-row">
          <div class="stat-box"><div class="stat-num" style="color:var(--success)">${window._synScore}</div><div class="stat-lbl">Doğru</div></div>
          <div class="stat-box"><div class="stat-num" style="color:var(--error)">${total - window._synScore}</div><div class="stat-lbl">Yanlış</div></div>
        </div>
        ${(window._synWrongCards && window._synWrongCards.length > 0) ? `<button type="button" class="result-btn" onclick="startSynQuiz(window._synWrongCards)">${icon('repeat', 16)} Yanlışları Tekrar Çöz (${window._synWrongCards.length})</button>` : ''}
        <button type="button" class="result-btn ${(window._synWrongCards && window._synWrongCards.length > 0) ? 'outline' : ''}" onclick="startSynQuiz()">${icon('shuffle', 16)} Yeniden Başla</button>
        <button type="button" class="result-btn outline" onclick="openUnit(${currentUnit})">${icon('arrowLeft', 16)} Geri Dön</button>
      </div>`;
    return;
  }

  const word = cards[window._synIdx];
  const meta = getWordMeta(word[0]);
  const correctSyn = meta.synonyms[Math.floor(Math.random() * meta.synonyms.length)];

  const allPool = [];
  Object.values(UNITS).forEach(u => u.words.forEach(w => { const m = getWordMeta(w[0]); if (m && w[0] !== word[0]) allPool.push(...m.synonyms); }));
  const wrongOpts = shuffle([...new Set(allPool)].filter(x => x !== correctSyn)).slice(0, 3);
  const opts = shuffle([correctSyn, ...wrongOpts]);
  const pct = Math.round((window._synIdx / total) * 100);
  const comboVal = typeof _comboCount !== 'undefined' ? _comboCount : 0;
  const keys = ['A', 'B', 'C', 'D'];

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="_clearQuizTimer();openUnit(${currentUnit})" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div><div class="unit-title-h">Eş Anlam Quiz</div><div class="unit-sub">Soru ${window._synIdx + 1} / ${total}</div></div>
    </div>
    <div class="mc-wrap">
      <div class="quiz-status-bar">
        <div class="quiz-stat-group">
          <span class="fc-stat-pill is-ok">${icon('check', 12)} ${window._synScore}</span>
          <span class="fc-stat-pill is-err">${icon('x', 12)} ${window._synWrong || 0}</span>
          ${comboVal >= 2 ? `<span class="fc-stat-pill is-combo">${icon('flame', 12)} ${comboVal}x</span>` : ''}
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="mc-question">
        <div class="syn-quiz-badge">EŞ ANLAM · SYNONYM</div>
        <div class="mc-q-label">Bu kelimenin EŞ ANLAMLISI hangisidir?</div>
        <div class="mc-q-word-row">
          <div class="mc-q-word" style="color:var(--tone-green-fg)">${esc(word[0])}</div>
          <button type="button" class="pronounce-btn" onclick="speakWord('${escQ(word[0])}')" title="Dinle" aria-label="Telaffuz dinle">${icon('volume', 17)}</button>
        </div>
        <div style="font-size:14px;color:var(--text3);margin-top:8px">${esc(word[1])}</div>
      </div>
      <div class="mc-options" id="syn-options">
        ${opts.map((o, idx) => `
          <button type="button" class="mc-opt" data-opt="${escQ(o)}" onclick="checkSynQuiz(this,'${escQ(o)}','${escQ(correctSyn)}')">
            <span class="mc-opt-key">${keys[idx]}</span>
            <span class="mc-opt-text">${esc(o)}</span>
            <span class="mc-opt-status"></span>
          </button>`).join('')}
      </div>
      <div id="syn-explain-slot"></div>
    </div>`;
}

function checkSynQuiz(btn, chosen, correct) {
  const wrap = document.getElementById('syn-options');
  if (!wrap || wrap.dataset.answered === '1') return;
  wrap.dataset.answered = '1';

  const word = window._synCards[window._synIdx];
  const meta = getWordMeta(word[0]);
  wrap.querySelectorAll('.mc-opt').forEach(b => b.classList.add('disabled'));
  const stEl = btn.querySelector('.mc-opt-status');

  const explainEl = document.getElementById('syn-explain-slot');
  if (explainEl && meta.synonyms.length) {
    explainEl.innerHTML = `<div class="quiz-explain-box is-syn"><b>${esc(word[0])}</b> eş anlamlıları: ${meta.synonyms.map(x => `<span class="quiz-rel-chip">${esc(x)}</span>`).join('')}</div>`;
  }

  if (chosen === correct) {
    const nextCombo = (typeof _comboCount !== 'undefined' ? _comboCount : 0) + 1;
    if (typeof playGameSFX === 'function') playGameSFX('correct', nextCombo);
    if (typeof _triggerCorrect === 'function') _triggerCorrect(btn, 'syn_correct');
    if (typeof _trackQuestStat === 'function') _trackQuestStat('mcCorrect');
    btn.classList.add('correct');
    if (stEl) stEl.innerHTML = icon('check', 16);
    window._synScore++;
    logActivity();
    _quizNextTimer = setTimeout(() => { window._synIdx++; renderSynQuiz(); }, 1050);
  } else {
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _triggerWrong === 'function') _triggerWrong(btn);
    btn.classList.add('wrong');
    if (stEl) stEl.innerHTML = icon('x', 16);
    window._synWrong = (window._synWrong || 0) + 1;
    if (word && !window._synWrongCards.some(w => w[0] === word[0])) window._synWrongCards.push(word);
    wrap.querySelectorAll('.mc-opt').forEach(b => {
      if (b.dataset.opt === correct) {
        b.classList.add('correct');
        const st = b.querySelector('.mc-opt-status');
        if (st) st.innerHTML = icon('check', 16);
      }
    });
    _quizNextTimer = setTimeout(() => { window._synIdx++; renderSynQuiz(); }, 1650);
  }
}

// ===== ZIT ANLAM QUIZ =====
function startAntQuiz(customPool) {
  _clearQuizTimer();
  _bindQuizKeys();
  const allWords = customPool || UNITS[currentUnit].words.filter(w => getWordMeta(w[0]).antonyms.length >= 1);
  if (allWords.length < 4 && !customPool) { showToast('Bu ünitede yeterli zıt anlamlı veri yok!'); return; }
  window._antCards = shuffle(allWords);
  window._antIdx = 0;
  window._antScore = 0;
  window._antWrong = 0;
  window._antWrongCards = [];
  showScreen('screen-ant-quiz');
  renderAntQuiz();
}

function renderAntQuiz() {
  _clearQuizTimer();
  _bindQuizKeys();
  const s = document.getElementById('screen-ant-quiz');
  const cards = window._antCards || [];
  const total = Math.min(cards.length, 20);

  if (window._antIdx >= total) {
    const pct = total > 0 ? Math.round((window._antScore / total) * 100) : 0;
    if (pct >= 70 && typeof playGameSFX === 'function') playGameSFX('win');
    s.innerHTML = `
      <div class="result-wrap">
        <div class="result-emoji">${pct >= 80 ? icon('trophy', 48) : icon('thumbsUp', 48)}</div>
        <div class="result-title">${pct}% Başarı</div>
        <div class="result-sub">Zıt Anlam Testi · ${total} sorudan ${window._antScore} doğru</div>
        <div class="stat-row">
          <div class="stat-box"><div class="stat-num" style="color:var(--success)">${window._antScore}</div><div class="stat-lbl">Doğru</div></div>
          <div class="stat-box"><div class="stat-num" style="color:var(--error)">${total - window._antScore}</div><div class="stat-lbl">Yanlış</div></div>
        </div>
        ${(window._antWrongCards && window._antWrongCards.length > 0) ? `<button type="button" class="result-btn" onclick="startAntQuiz(window._antWrongCards)">${icon('repeat', 16)} Yanlışları Tekrar Çöz (${window._antWrongCards.length})</button>` : ''}
        <button type="button" class="result-btn ${(window._antWrongCards && window._antWrongCards.length > 0) ? 'outline' : ''}" onclick="startAntQuiz()">${icon('shuffle', 16)} Yeniden Başla</button>
        <button type="button" class="result-btn outline" onclick="openUnit(${currentUnit})">${icon('arrowLeft', 16)} Geri Dön</button>
      </div>`;
    return;
  }

  const word = cards[window._antIdx];
  const meta = getWordMeta(word[0]);
  const correctAnt = meta.antonyms[Math.floor(Math.random() * meta.antonyms.length)];

  const allPool = [];
  Object.values(UNITS).forEach(u => u.words.forEach(w => { const m = getWordMeta(w[0]); if (m && w[0] !== word[0]) allPool.push(...m.antonyms); }));
  const wrongOpts = shuffle([...new Set(allPool)].filter(x => x !== correctAnt)).slice(0, 3);
  if (wrongOpts.length < 3) { window._antIdx++; renderAntQuiz(); return; }
  const opts = shuffle([correctAnt, ...wrongOpts]);
  const pct = Math.round((window._antIdx / total) * 100);
  const comboVal = typeof _comboCount !== 'undefined' ? _comboCount : 0;
  const keys = ['A', 'B', 'C', 'D'];

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="_clearQuizTimer();openUnit(${currentUnit})" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div><div class="unit-title-h">Zıt Anlam Quiz</div><div class="unit-sub">Soru ${window._antIdx + 1} / ${total}</div></div>
    </div>
    <div class="mc-wrap">
      <div class="quiz-status-bar">
        <div class="quiz-stat-group">
          <span class="fc-stat-pill is-ok">${icon('check', 12)} ${window._antScore}</span>
          <span class="fc-stat-pill is-err">${icon('x', 12)} ${window._antWrong || 0}</span>
          ${comboVal >= 2 ? `<span class="fc-stat-pill is-combo">${icon('flame', 12)} ${comboVal}x</span>` : ''}
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="mc-question">
        <div class="ant-quiz-badge">ZIT ANLAM · ANTONYM</div>
        <div class="mc-q-label">Bu kelimenin ZIT ANLAMLISI hangisidir?</div>
        <div class="mc-q-word-row">
          <div class="mc-q-word" style="color:var(--error)">${esc(word[0])}</div>
          <button type="button" class="pronounce-btn" onclick="speakWord('${escQ(word[0])}')" title="Dinle" aria-label="Telaffuz dinle">${icon('volume', 17)}</button>
        </div>
        <div style="font-size:14px;color:var(--text3);margin-top:8px">${esc(word[1])}</div>
      </div>
      <div class="mc-options" id="ant-options">
        ${opts.map((o, idx) => `
          <button type="button" class="mc-opt" data-opt="${escQ(o)}" onclick="checkAntQuiz(this,'${escQ(o)}','${escQ(correctAnt)}')">
            <span class="mc-opt-key">${keys[idx]}</span>
            <span class="mc-opt-text">${esc(o)}</span>
            <span class="mc-opt-status"></span>
          </button>`).join('')}
      </div>
      <div id="ant-explain-slot"></div>
    </div>`;
}

function checkAntQuiz(btn, chosen, correct) {
  const wrap = document.getElementById('ant-options');
  if (!wrap || wrap.dataset.answered === '1') return;
  wrap.dataset.answered = '1';

  const word = window._antCards[window._antIdx];
  const meta = getWordMeta(word[0]);
  wrap.querySelectorAll('.mc-opt').forEach(b => b.classList.add('disabled'));
  const stEl = btn.querySelector('.mc-opt-status');

  const explainEl = document.getElementById('ant-explain-slot');
  if (explainEl && meta.antonyms.length) {
    explainEl.innerHTML = `<div class="quiz-explain-box is-ant"><b>${esc(word[0])}</b> zıt anlamlıları: ${meta.antonyms.map(x => `<span class="quiz-rel-chip">${esc(x)}</span>`).join('')}</div>`;
  }

  if (chosen === correct) {
    const nextCombo = (typeof _comboCount !== 'undefined' ? _comboCount : 0) + 1;
    if (typeof playGameSFX === 'function') playGameSFX('correct', nextCombo);
    if (typeof _triggerCorrect === 'function') _triggerCorrect(btn, 'ant_correct');
    if (typeof _trackQuestStat === 'function') _trackQuestStat('mcCorrect');
    btn.classList.add('correct');
    if (stEl) stEl.innerHTML = icon('check', 16);
    window._antScore++;
    logActivity();
    _quizNextTimer = setTimeout(() => { window._antIdx++; renderAntQuiz(); }, 1050);
  } else {
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _triggerWrong === 'function') _triggerWrong(btn);
    btn.classList.add('wrong');
    if (stEl) stEl.innerHTML = icon('x', 16);
    window._antWrong = (window._antWrong || 0) + 1;
    if (word && !window._antWrongCards.some(w => w[0] === word[0])) window._antWrongCards.push(word);
    wrap.querySelectorAll('.mc-opt').forEach(b => {
      if (b.dataset.opt === correct) {
        b.classList.add('correct');
        const st = b.querySelector('.mc-opt-status');
        if (st) st.innerHTML = icon('check', 16);
      }
    });
    _quizNextTimer = setTimeout(() => { window._antIdx++; renderAntQuiz(); }, 1650);
  }
}

// ═══════════════════════════════════════════════════════════════
//  HIZ MODU — Arcade Arena Zamanlayıcısı, Combo & Hızlı Bonus
// ═══════════════════════════════════════════════════════════════

const SPEED_TIME = 10;
const SPEED_BONUS_TIME = 5;
const SPEED_XP_NORMAL = 12;
const SPEED_XP_BONUS = 20;

let _spCards = [], _spIdx = 0, _spScore = 0, _spWrong = 0, _spTotal = 0;
let _spBonusCount = 0, _spEarnedXP = 0, _spTimeSum = 0;
let _spBackFn = '', _spTitle = '', _spOriginPool = [];
let _spTimeout = null, _spInterval = null, _spStart = 0, _spAnswered = false;
const CIRC = 2 * Math.PI * 18; // ~113.1

function startSpeedMode(customPool, backFn, titleOverride) {
  _clearQuizTimer();
  _bindQuizKeys();
  if (!customPool && (!currentUnit || !UNITS[currentUnit])) { showToast('Önce bir ünite seç!'); return; }
  const pool = customPool || shuffle(UNITS[currentUnit].words).slice(0, 25);
  if (pool.length === 0) { showToast('Bu ünitede kelime yok!'); return; }
  _spBackFn = backFn || '';
  _spTitle = titleOverride || '';
  _spOriginPool = customPool ? [...customPool] : [];
  _spCards = pool;
  _spIdx = 0;
  _spScore = 0;
  _spWrong = 0;
  _spBonusCount = 0;
  _spEarnedXP = 0;
  _spTimeSum = 0;
  _spTotal = _spCards.length;
  _spAnswered = false;
  showScreen('screen-speed');
  _renderSpeedQ();
}

function _clearSpeedTimer() {
  if (_spTimeout) { clearTimeout(_spTimeout); _spTimeout = null; }
  if (_spInterval) { clearInterval(_spInterval); _spInterval = null; }
}

function _timeLeftNow() {
  return Math.max(0, SPEED_TIME - (Date.now() - _spStart) / 1000);
}

function _startTimerTick() {
  _spInterval = setInterval(() => {
    const left = _timeLeftNow();
    const ratio = left / SPEED_TIME;
    const arc = document.querySelector('.sp-arc');
    const bar = document.getElementById('speed-bar-fill');
    const num = document.getElementById('speed-timer-num');
    let color = '#15803D';
    if (left <= SPEED_TIME * 0.25) color = '#B91C1C';
    else if (left <= SPEED_TIME * 0.5) color = '#B45309';

    if (arc) {
      arc.style.strokeDashoffset = CIRC * (1 - ratio);
      arc.style.stroke = color;
    }
    if (bar) {
      bar.style.width = `${Math.max(0, Math.min(100, ratio * 100))}%`;
      bar.style.background = color;
    }
    if (num) {
      num.textContent = Math.ceil(left);
      if (left <= 3 && left > 0) num.classList.add('sp-urgent');
      else num.classList.remove('sp-urgent');
    }
    if (left <= 0) _clearSpeedTimer();
  }, 50);
}

function _renderSpeedQ() {
  _clearSpeedTimer();
  _bindQuizKeys();
  const s = document.getElementById('screen-speed');
  if (!s) return;

  if (!_spCards || _spCards.length === 0 || _spIdx >= _spCards.length) {
    _renderSpeedResult();
    return;
  }

  const word = _spCards[_spIdx];
  if (!word || !word[0]) {
    _spIdx++;
    _renderSpeedQ();
    return;
  }
  const unit = word._unit || (currentUnit && UNITS[currentUnit] ? currentUnit : null);
  const weekId = word._weekId || null;
  const allWords = _getDistractorSource(unit, _spCards);
  const wrong = _pickDistinctDistractors(word, allWords, 3);
  const opts = shuffle([word, ...wrong]);
  const correctIdx = opts.findIndex(o => _normQuizText(o[0]) === _normQuizText(word[0]));
  const pct = _spTotal > 0 ? Math.round((_spIdx / _spTotal) * 100) : 0;
  const comboVal = typeof _comboCount !== 'undefined' ? _comboCount : 0;
  const keys = ['A', 'B', 'C', 'D'];
  const titleText = _spTitle || 'Hız Modu';
  const unitLabel = weekId
    ? (word._weekLabel || 'Haftalık Kelime')
    : (_spTitle
      ? (word._unit ? `Ünite ${word._unit}` : 'Karışık Mod')
      : (currentUnit ? `Ünite ${currentUnit}` : 'Karışık Mod'));
  _spAnswered = false;
  _speedCurrentQ = { word, opts, correctIdx, unit, weekId };

  s.innerHTML = `
  <div class="unit-header">
    <button type="button" class="back-btn" onclick="_runBackHandler(_spBackFn, currentUnit)" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div>
      <div class="unit-title-h" style="color:var(--tone-red-fg)">${icon('timer', 18)} ${esc(titleText)}</div>
      <div class="unit-sub">${esc(unitLabel)} · ${_spIdx + 1}/${_spTotal}</div>
    </div>
    <div class="speed-timer-wrap">
      <svg class="speed-timer-ring" viewBox="0 0 44 44">
        <circle class="sp-track" cx="22" cy="22" r="18"/>
        <circle class="sp-arc"   cx="22" cy="22" r="18"/>
      </svg>
      <div class="speed-timer-num" id="speed-timer-num">${SPEED_TIME}</div>
    </div>
  </div>
  <div class="mc-wrap">
    <div class="quiz-status-bar">
      <div class="quiz-stat-group">
        <span class="fc-stat-pill is-ok">${icon('check', 12)} ${_spScore}</span>
        <span class="fc-stat-pill is-err">${icon('x', 12)} ${_spWrong}</span>
        ${_spBonusCount > 0 ? `<span class="fc-stat-pill is-bonus">${icon('zap', 12)} ${_spBonusCount}</span>` : ''}
        ${comboVal >= 2 ? `<span class="fc-stat-pill is-combo">${icon('flame', 12)} ${comboVal}x</span>` : ''}
      </div>
      <span class="fc-stat-pill is-xp">+${_spEarnedXP} XP</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="speed-bar-wrap">
      <div class="speed-bar-track">
        <div class="speed-bar-fill" id="speed-bar-fill" style="width:100%"></div>
        <div class="speed-bonus-mark" title="5sn Bonus Sınırı"></div>
      </div>
    </div>
    <div class="speed-xp-hint" id="speed-xp-hint">${icon('zap', 14)} ${SPEED_BONUS_TIME}+ saniye kalırsa <b>+${SPEED_XP_BONUS} Bonus XP</b></div>
    <div class="mc-question">
      <div class="mc-q-label">Aşağıdaki Kelimenin Anlamı Nedir?</div>
      <div class="mc-q-word">${esc(word[0])}</div>
      ${word[2] ? `<div class="mc-q-example">${_maskSentenceWord(word[2], word[0])}</div>` : ''}
    </div>
    <div class="mc-options" id="speed-opts">
      ${opts.map((o, idx) => `
        <button type="button" class="mc-opt" data-idx="${idx}" onclick="checkSpeedQ(this,${idx})">
          <span class="mc-opt-key">${keys[idx] || (idx + 1)}</span>
          <span class="mc-opt-text">${esc(o[1])}</span>
          <span class="mc-opt-status"></span>
        </button>`).join('')}
    </div>
  </div>`;

  requestAnimationFrame(() => {
    _spStart = Date.now();
    _startTimerTick();
    _spTimeout = setTimeout(() => {
      if (!_spAnswered) _timeoutSpeedQ();
    }, SPEED_TIME * 1000);
  });
}

function _freezeTimer() {
  _clearSpeedTimer();
}

function checkSpeedQ(btn, chosenIdx) {
  if (_spAnswered || !_speedCurrentQ) return;
  if (!_spCards || _spIdx >= _spCards.length) return;

  _spAnswered = true;
  _clearSpeedTimer();
  _freezeTimer();
  document.querySelectorAll('#speed-opts .mc-opt').forEach(b => b.classList.add('disabled'));

  const q = _speedCurrentQ;
  const word = q.word;
  const chosenWord = q.opts[chosenIdx];
  const isCorrect = chosenIdx === q.correctIdx ||
    (chosenWord && _normQuizText(chosenWord[0]) === _normQuizText(word[0])) ||
    (chosenWord && _normQuizText(chosenWord[1]) === _normQuizText(word[1]));
  const unit = q.unit;
  const weekId = q.weekId;
  const errKey = weekId ? ('w_' + weekId + '_' + word[0]) : (unit ? ('u' + unit + '_' + word[0]) : null);
  const hintEl = document.getElementById('speed-xp-hint');
  const timeLeft = _timeLeftNow();
  _spTimeSum += (SPEED_TIME - timeLeft);
  const stEl = btn.querySelector('.mc-opt-status');

  if (isCorrect) {
    btn.classList.add('correct');
    if (stEl) stEl.innerHTML = icon('check', 16);
    _spScore++;
    if (weekId && typeof markWeeklyWordLearned === 'function') {
      markWeeklyWordLearned(weekId, word[0], true, true);
    } else if (unit && UNITS[unit]) {
      markLearned(unit, word[0]);
    }
    if (errKey && errorBox[errKey]) { delete errorBox[errKey]; saveErrors(); }

    const isBonus = timeLeft >= SPEED_BONUS_TIME;
    const mult = typeof _getComboMultiplier === 'function' ? _getComboMultiplier() : 1;
    const baseXp = isBonus ? SPEED_XP_BONUS : SPEED_XP_NORMAL;
    const xp = Math.round(baseXp * mult);
    const bonusComboXp = xp - baseXp;
    if (isBonus) _spBonusCount++;
    _spEarnedXP += xp;

    if (hintEl) {
      hintEl.innerHTML = isBonus
        ? `${icon('rocket', 14)} <b>Hızlı Cevap! +${xp} Bonus XP</b>${mult > 1 ? ` (${mult}x Seri)` : ''}`
        : `${icon('check', 14)} Doğru! <b>+${xp} XP</b>`;
      hintEl.className = 'speed-xp-hint sp-feedback-' + (isBonus ? 'bonus' : 'ok');
    }

    if (typeof _xpData !== 'undefined') {
      const prevLevel = _getLevelForXP(_xpData.xp);
      _xpData.xp += xp;
      const newLevel = _getLevelForXP(_xpData.xp);
      _saveXP();
      if (typeof _updateStreakWithFreeze === 'function') _updateStreakWithFreeze();
      if (typeof _incrementGoal === 'function') _incrementGoal('mc_correct', xp);
      if (typeof _incrementCombo === 'function') _incrementCombo();
      if (typeof _trackQuestStat === 'function') _trackQuestStat('mcCorrect');
      if (typeof _checkQuests === 'function') _checkQuests();
      if (typeof _checkAchievements === 'function') _checkAchievements();
      if (typeof syncActiveUserStats === 'function') syncActiveUserStats();
      if (typeof _showXPBubble === 'function') _showXPBubble(btn, xp, bonusComboXp);
      if (newLevel > prevLevel && typeof _showLevelUp === 'function') setTimeout(() => _showLevelUp(newLevel), 700);
      if (typeof _renderHUD === 'function') _renderHUD();
    }
    if (typeof playGameSFX === 'function') playGameSFX(isBonus ? 'bonus' : 'correct', typeof _comboCount !== 'undefined' ? _comboCount : 1);
    if (typeof _spawnConfetti === 'function') _spawnConfetti(isBonus ? 28 : 16);
    _quizNextTimer = setTimeout(() => {
      const scr = document.getElementById('screen-speed');
      if (!scr || !scr.classList.contains('active')) return;
      _spIdx++;
      _renderSpeedQ();
    }, 850);
  } else {
    btn.classList.add('wrong');
    if (stEl) stEl.innerHTML = icon('x', 16);
    _spWrong++;
    const correctBtn = document.querySelector(`#speed-opts .mc-opt[data-idx="${q.correctIdx}"]`);
    if (correctBtn) {
      correctBtn.classList.add('correct');
      const st = correctBtn.querySelector('.mc-opt-status');
      if (st) st.innerHTML = icon('check', 16);
    }
    if (weekId && typeof markWeeklyWordLearned === 'function') {
      markWeeklyWordLearned(weekId, word[0], false, true);
    } else if (unit && UNITS[unit]) {
      markUnlearned(unit, word[0]);
    }
    if (errKey) {
      errorBox[errKey] = { word: word[0], meaning: word[1], unit: unit || (word._weekLabel || 'Haftalık'), weekId: weekId || undefined };
      saveErrors();
    }
    if (hintEl) {
      hintEl.innerHTML = `${icon('x', 14)} Yanlış. <b>+0 XP</b>`;
      hintEl.className = 'speed-xp-hint sp-feedback-wrong';
    }
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _triggerWrong === 'function') _triggerWrong(btn);
    _quizNextTimer = setTimeout(() => {
      const scr = document.getElementById('screen-speed');
      if (!scr || !scr.classList.contains('active')) return;
      _spIdx++;
      _renderSpeedQ();
    }, 1350);
  }
}

function _timeoutSpeedQ() {
  if (_spAnswered || !_speedCurrentQ) return;
  if (!_spCards || _spIdx >= _spCards.length) return;

  _spAnswered = true;
  _freezeTimer();
  const q = _speedCurrentQ;
  const word = q.word;
  const unit = q.unit;
  const weekId = q.weekId;
  const errKey = weekId ? ('w_' + weekId + '_' + word[0]) : (unit ? ('u' + unit + '_' + word[0]) : null);
  _spWrong++;
  _spTimeSum += SPEED_TIME;
  document.querySelectorAll('#speed-opts .mc-opt').forEach(b => b.classList.add('disabled'));
  const correctBtn = document.querySelector(`#speed-opts .mc-opt[data-idx="${q.correctIdx}"]`);
  if (correctBtn) {
    correctBtn.classList.add('correct');
    const st = correctBtn.querySelector('.mc-opt-status');
    if (st) st.innerHTML = icon('check', 16);
  }
  if (weekId && typeof markWeeklyWordLearned === 'function') {
    markWeeklyWordLearned(weekId, word[0], false, true);
  } else if (unit && UNITS[unit]) {
    markUnlearned(unit, word[0]);
  }
  if (errKey) {
    errorBox[errKey] = { word: word[0], meaning: word[1], unit: unit || (word._weekLabel || 'Haftalık'), weekId: weekId || undefined };
    saveErrors();
  }
  const hintEl = document.getElementById('speed-xp-hint');
  if (hintEl) {
    hintEl.innerHTML = `${icon('clock', 14)} <b>Süre Doldu! Otomatik Yanlış.</b>`;
    hintEl.className = 'speed-xp-hint sp-feedback-wrong';
  }
  if (typeof playGameSFX === 'function') playGameSFX('wrong');
  if (typeof _triggerWrong === 'function') _triggerWrong();
  _quizNextTimer = setTimeout(() => {
    const scr = document.getElementById('screen-speed');
    if (!scr || !scr.classList.contains('active')) return;
    _spIdx++;
    _renderSpeedQ();
  }, 1500);
}

function _renderSpeedResult() {
  _clearSpeedTimer();
  const s = document.getElementById('screen-speed');
  const pct = _spTotal > 0 ? Math.round((_spScore / _spTotal) * 100) : 0;
  const answered = _spScore + _spWrong;
  const avgTime = answered > 0 ? (_spTimeSum / answered).toFixed(1) : '0.0';
  const backHandler = _spBackFn || (currentUnit ? `openUnit(${currentUnit})` : 'goHome()');
  if (pct >= 70 && typeof playGameSFX === 'function') playGameSFX('win');

  window._restartSpeed = function () {
    startSpeedMode(_spOriginPool.length ? shuffle(_spOriginPool) : null, _spBackFn, _spTitle);
  };

  s.innerHTML = `
  <div class="result-wrap">
    <div class="result-emoji">${pct >= 80 ? icon('zap', 48) : pct >= 50 ? icon('timer', 48) : icon('info', 48)}</div>
    <div class="result-title">${pct}% Başarı</div>
    <div class="result-sub">${esc(_spTitle || 'Hız Modu')} · ${_spTotal} sorudan ${_spScore} doğru · +${_spEarnedXP} XP</div>
    <div class="stat-row is-grid-2">
      <div class="stat-box"><div class="stat-num" style="color:var(--success)">${_spScore}</div><div class="stat-lbl">Doğru</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--error)">${_spWrong}</div><div class="stat-lbl">Yanlış/Süre</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--tone-amber-fg)">${_spBonusCount}</div><div class="stat-lbl">Hızlı Bonus</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--tone-blue-fg)">${avgTime}sn</div><div class="stat-lbl">Ort. Süre</div></div>
    </div>
    <button type="button" class="result-btn" style="background:var(--error-solid);color:var(--on-error);margin-bottom:8px" onclick="window._restartSpeed()">${icon('refresh', 16)} Tekrar Oyna</button>
    <button type="button" class="result-btn outline" onclick="${backHandler}">${icon('arrowLeft', 16)} Geri Dön</button>
  </div>`;
}
