// Flash card study mode with bi-directional 3D flip, touch/mouse swipe gestures, undo & audio SFX
// ===== FLASH CARD STATE =====
let _fcSwiping = false;
let _flashBackFn = null;
let _flashTitle = null;
let _flashUnitTagFn = null;
let _pvMode = false;
let _flashHistory = [];
let _fcAutoSpeak = localStorage.getItem('ydt_fc_autospeak') === '1';
let _fcKeyListenerBound = false;
let _fcLastTouchTime = 0;

function _bindFlashKeys() {
  if (_fcKeyListenerBound) return;
  _fcKeyListenerBound = true;
  document.addEventListener('keydown', e => {
    const screen = document.getElementById('screen-flash');
    if (!screen || !screen.classList.contains('active')) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.querySelector('.word-modal-overlay[style*="flex"], .stats-overlay[style*="flex"], #gm-goal-modal, #auth-modal-overlay')) return;
    const fc = document.getElementById('fc');
    if (!fc) return;

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault();
      flipCard();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      document.getElementById('btn-right')?.click();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      document.getElementById('btn-wrong')?.click();
    } else if (e.code === 'KeyZ' && typeof undoLastFlash === 'function') {
      const undoBtn = document.getElementById('fc-undo-btn');
      if (undoBtn && !undoBtn.disabled) {
        e.preventDefault();
        undoLastFlash();
      }
    } else if (e.code === 'KeyS') {
      const word = currentCards && currentCards[cardIndex];
      if (word && word[0] && typeof speakWord === 'function') {
        e.preventDefault();
        speakWord(word[0]);
      }
    }
  });
}

function toggleFcAutoSpeak() {
  _fcAutoSpeak = !_fcAutoSpeak;
  try { localStorage.setItem('ydt_fc_autospeak', _fcAutoSpeak ? '1' : '0'); } catch (e) { }
  const btn = document.getElementById('fc-autospeak-btn');
  if (btn) btn.classList.toggle('active', _fcAutoSpeak);
  if (_fcAutoSpeak && currentCards && currentCards[cardIndex] && currentCards[cardIndex][0]) {
    speakWord(currentCards[cardIndex][0]);
  }
  showToast(_fcAutoSpeak ? 'Otomatik seslendirme açıldı' : 'Otomatik seslendirme kapatıldı');
}

function toggleFcSfx() {
  if (typeof toggleSfx !== 'function') return;
  const on = toggleSfx();
  const btn = document.getElementById('fc-sfx-btn');
  if (btn) btn.classList.toggle('active', on);
}

// ===== MODES =====
// -- Flash Cards --
function startFlash(words, opts) {
  if (!currentUnit && !words) { showToast('Önce bir ünite seç!'); return; }
  let pool = words;
  if (!pool) {
    if (typeof getUnitStudyPool === 'function') {
      pool = shuffle(getUnitStudyPool(currentUnit));
      if (pool.length === 0 && UNITS[currentUnit] && UNITS[currentUnit].words.length > 0) {
        showToast('Tüm kelimeleri zaten öğrendin! Tüm ünite yükleniyor.');
        pool = shuffle(UNITS[currentUnit].words);
      }
    } else {
      pool = UNITS[currentUnit] ? shuffle(UNITS[currentUnit].words) : [];
    }
  }
  if (!pool || pool.length === 0) { showToast('Bu ünitede kelime yok!'); return; }
  currentCards = pool;
  cardIndex = 0;
  known = [];
  unknown = [];
  _flashHistory = [];
  _fcSwiping = false;
  if (opts && typeof opts === 'object') {
    _flashBackFn = opts.backFn !== undefined ? opts.backFn : null;
    _flashTitle = opts.title !== undefined ? opts.title : null;
    _flashUnitTagFn = opts.unitTagFn !== undefined ? opts.unitTagFn : null;
    _pvMode = !!opts.pvMode;
  } else {
    _flashBackFn = null;
    _flashTitle = null;
    _flashUnitTagFn = null;
    _pvMode = false;
  }
  renderFlash();
  showScreen('screen-flash');
}

function renderFlash(backFn, titleOverride, unitTagFn) {
  if (backFn !== undefined) _flashBackFn = backFn;
  if (titleOverride !== undefined) _flashTitle = titleOverride;
  if (unitTagFn !== undefined) _flashUnitTagFn = unitTagFn;
  if (cardIndex === 0 && known.length === 0 && unknown.length === 0) {
    _flashHistory = [];
  }

  _bindFlashKeys();

  const s = document.getElementById('screen-flash');
  if (!s) return;

  if (!currentCards || currentCards.length === 0 || cardIndex >= currentCards.length) {
    renderFlashResult(_flashBackFn);
    return;
  }

  const word = currentCards[cardIndex];
  if (!word || !word[0]) {
    cardIndex++;
    renderFlash();
    return;
  }

  const total = currentCards.length;
  const remaining = total - cardIndex;
  const pct = Math.round((cardIndex / total) * 100);
  const backHandler = _flashBackFn || `openUnit(${currentUnit || 1})`;
  const title = _flashTitle || 'Flash Kartlar';
  const unitNum = word._unit || currentUnit || 1;
  const unitInfo = _flashUnitTagFn ? _flashUnitTagFn(word) : `Ünite ${unitNum}`;
  const isPV = _pvMode || currentCards._pvMode;

  let metaFront = '', metaBack = '';
  if (!isPV) {
    try { metaFront = renderWordMetaChips(word[0]); } catch (e) { }
    try { metaBack = renderWordMetaChips(word[0], true); } catch (e) { }
  }

  let statusChipHtml = '';
  if (!isPV) {
    const isLearned = typeof getLearnedSet === 'function' && UNITS[unitNum] ? getLearnedSet(unitNum).has(word[0]) : false;
    const isErr = typeof errorBox !== 'undefined' && !!errorBox['u' + unitNum + '_' + word[0]];
    if (isErr) {
      statusChipHtml = `<span class="flash-status-badge is-err">Tekrar Gerekli</span>`;
    } else if (isLearned) {
      statusChipHtml = `<span class="flash-status-badge is-ok">${icon('check', 11)} Öğrenildi</span>`;
    } else {
      statusChipHtml = `<span class="flash-status-badge is-new">Yeni Kart</span>`;
    }
  }

  const frontLabel = isPV ? 'Phrasal Verb' : 'İngilizce';
  const sfxOn = typeof isSfxEnabled === 'function' ? isSfxEnabled() : true;
  const comboVal = typeof _comboCount !== 'undefined' ? _comboCount : 0;

  s.innerHTML = `
  <div class="unit-header">
    <button class="back-btn" onclick="${backHandler}" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div><div class="unit-title-h">${title}</div><div class="unit-sub">${unitInfo} · ${cardIndex + 1}/${total}</div></div>
  </div>
  <div class="flash-wrap">
    <div class="flash-session-bar">
      <div class="flash-session-stats">
        <span class="fc-stat-pill is-ok">${icon('check', 12)} ${known.length}</span>
        <span class="fc-stat-pill is-err">${icon('x', 12)} ${unknown.length}</span>
        ${comboVal >= 2 ? `<span class="fc-stat-pill is-combo">${icon('flame', 12)} ${comboVal}x</span>` : ''}
      </div>
      <div class="flash-session-tools">
        <button type="button" id="fc-undo-btn" class="fc-tool-btn" onclick="undoLastFlash()" ${_flashHistory.length === 0 ? 'disabled' : ''} title="Son kartı geri al (Z)">
          ${icon('repeat', 13)} <span>Geri Al</span>
        </button>
        <button type="button" id="fc-autospeak-btn" class="fc-tool-btn ${_fcAutoSpeak ? 'active' : ''}" onclick="toggleFcAutoSpeak()" title="Kart açılınca otomatik seslendir">
          ${icon('volume', 13)} <span>Oto Ses</span>
        </button>
        <button type="button" id="fc-sfx-btn" class="fc-tool-btn ${sfxOn ? 'active' : ''}" onclick="toggleFcSfx()" title="Oyun ses efektleri">
          ${icon('zap', 13)} <span>Efekt</span>
        </button>
      </div>
    </div>
    <div class="flash-progress-row">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="flash-counter-badge">${cardIndex + 1}/${total}</span>
    </div>
    <div class="flash-card-wrap" id="fc-wrap">
      ${remaining > 2 ? '<div class="flash-deck-card layer-2" aria-hidden="true"></div>' : ''}
      ${remaining > 1 ? '<div class="flash-deck-card layer-1" aria-hidden="true"></div>' : ''}
      <div class="flash-card fc-enter" id="fc" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(word[0])} kartını çevir">
        <div class="swipe-overlay left" id="fc-overlay-left">
          <div class="swipe-overlay-icon">${icon('x', 28)}</div>
          <div class="swipe-overlay-label">Bilmedim</div>
        </div>
        <div class="swipe-overlay right" id="fc-overlay-right">
          <div class="swipe-overlay-icon">${icon('check', 28)}</div>
          <div class="swipe-overlay-label">Bildim</div>
        </div>
        <div class="flash-face flash-front">
          <div class="flash-face-top">
            ${statusChipHtml || `<span class="flash-status-badge is-new">Phrasal Verb</span>`}
            <span class="flash-unit-badge">${unitInfo}</span>
          </div>
          <div class="flash-face-body">
            <div class="flash-hint">${frontLabel}</div>
            <div class="flash-word-row">
              <div class="flash-word">${esc(word[0])}</div>
              <button type="button" class="pronounce-btn" onclick="event.stopPropagation();speakWord('${escQ(word[0])}')" title="Telaffuz dinle (S)" aria-label="Telaffuz dinle">${icon('volume', 18)}</button>
            </div>
            ${metaFront}
          </div>
          <div class="flash-flip-pill">${icon('refresh', 13)} <span>Tıkla ve Çevir · Anlamı Gör</span></div>
        </div>
        <div class="flash-face flash-back">
          <div class="flash-face-top">
            <div class="flash-back-word-chip">
              <span>${esc(word[0])}</span>
              <button type="button" class="pronounce-btn is-on-dark" onclick="event.stopPropagation();speakWord('${escQ(word[0])}')" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 15)}</button>
            </div>
            <span class="flash-unit-badge is-on-dark">${unitInfo}</span>
          </div>
          <div class="flash-face-body">
            <div class="flash-hint is-on-dark">Türkçe Anlamı</div>
            <div class="flash-meaning">${esc(word[1])}</div>
            ${word[2] ? `<div class="flash-example">"${typeof highlightTargetWord === 'function' ? highlightTargetWord(word[2], word[0]) : esc(word[2])}"</div>` : ''}
            ${metaBack}
          </div>
          <div class="flash-flip-pill is-back">${icon('refresh', 13)} <span>Tekrar Tıkla · Ön Yüze Dön</span></div>
        </div>
      </div>
    </div>
    <button type="button" class="flash-flip-btn" onclick="event.stopPropagation();flipCard();">${icon('refresh', 16)} Kartı Çevir</button>
    <div class="flash-swipe-guide">
      <div class="flash-guide-item"><div class="flash-guide-dot" style="background:var(--error)"></div><span class="icon-inline" style="color:var(--error)">${icon('arrowLeft', 12)} Bilmedim</span></div>
      <span style="font-size:11px;color:var(--text3)">sürükle, tıkla veya Boşluk</span>
      <div class="flash-guide-item"><span class="icon-inline" style="color:var(--success)">Bildim ${icon('arrowRight', 12)}</span><div class="flash-guide-dot" style="background:var(--success)"></div></div>
    </div>
    <div class="swipe-btn-row">
      <button type="button" class="swipe-btn wrong" id="btn-wrong" onclick="event.stopPropagation();swipeCard('left')">${icon('x', 16)} Bilmedim</button>
      <button type="button" class="swipe-btn right" id="btn-right" onclick="event.stopPropagation();swipeCard('right')">${icon('check', 16)} Bildim</button>
    </div>
  </div>`;
  initFlashDrag();
  showScreen('screen-flash');

  if (_fcAutoSpeak && !isPV) {
    const expectedIdx = cardIndex;
    setTimeout(() => {
      if (cardIndex === expectedIdx && document.getElementById('screen-flash')?.classList.contains('active')) {
        speakWord(word[0]);
      }
    }, 180);
  }
}

function flipCard() {
  if (_fcSwiping) return;
  const fc = document.getElementById('fc');
  if (!fc || fc.classList.contains('dragging')) return;

  // Clear any residual inline transform/transition so CSS .flipped toggles cleanly both ways
  fc.style.transform = '';
  fc.style.transition = '';
  fc.classList.remove('fc-enter');

  const isFlipped = fc.classList.toggle('flipped');
  fc.setAttribute('aria-pressed', String(isFlipped));

  const wrap = fc.closest('.flash-card-wrap');
  if (wrap) {
    wrap.classList.remove('is-flipping');
    void wrap.offsetWidth;
    wrap.classList.add('is-flipping');
    clearTimeout(wrap._flipTimer);
    wrap._flipTimer = setTimeout(() => wrap.classList.remove('is-flipping'), 300);
  }

  if (typeof playGameSFX === 'function') playGameSFX('flip');
  if (typeof _trackQuestStat === 'function') _trackQuestStat('cardsFlipped');
}

function undoLastFlash() {
  if (_fcSwiping || !_flashHistory || _flashHistory.length === 0) return;
  const last = _flashHistory.pop();
  if (!last) return;

  cardIndex = last.cardIndex;
  if (last.dir === 'right') {
    known.pop();
  } else {
    unknown.pop();
  }

  try {
    if (last.isPV) {
      if (last.hadError && last.prevErrorObj) {
        pvErrors[last.errorKey] = last.prevErrorObj;
      } else {
        delete pvErrors[last.errorKey];
      }
      savePVErrors();
    } else if (last.unit) {
      if (last.wasLearned) {
        if (!progressRaw[last.unit]) progressRaw[last.unit] = [];
        if (!progressRaw[last.unit].includes(last.word[0])) progressRaw[last.unit].push(last.word[0]);
        saveProgress();
      } else if (typeof markUnlearned === 'function') {
        markUnlearned(last.unit, last.word[0]);
      }
      if (last.hadError && last.prevErrorObj) {
        errorBox[last.errorKey] = last.prevErrorObj;
      } else {
        delete errorBox[last.errorKey];
      }
      saveErrors();
    }
  } catch (e) { }

  if (typeof playGameSFX === 'function') playGameSFX('undo');
  showToast('Son kart geri alındı');
  renderFlash();
}

function renderWordMetaChips(word, darkBg = false) {
  const meta = getWordMetaFull(word);
  if (!meta.synonyms.length && !meta.antonyms.length && !meta.family.length) return '';
  const synColor = darkBg ? '#86EFAC' : 'var(--tone-green-fg, var(--success))';
  const antColor = darkBg ? '#FCA5A5' : 'var(--tone-red-fg, var(--error))';
  const famColor = darkBg ? '#93C5FD' : 'var(--tone-blue-fg, #1D4ED8)';
  const bgColor = darkBg ? 'rgba(255,255,255,0.12)' : 'var(--bg)';
  const borderColor = darkBg ? 'rgba(255,255,255,0.22)' : 'var(--border)';
  const valColor = darkBg ? '#FFFFFF' : 'var(--text)';
  const chipStyle = `background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:4px 10px;font-size:11px;font-weight:600;margin:2px;display:inline-flex;flex-direction:column;align-items:center;gap:1px`;
  const lblBase = 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;';
  let html = '<div style="margin-top:10px;display:flex;flex-wrap:wrap;justify-content:center;gap:4px">';
  if (meta.synonyms.length) {
    const syns = meta.synonyms.slice(0, 3).join(', ');
    html += `<div style="${chipStyle}"><div style="${lblBase}color:${synColor}">Eş</div><span style="color:${valColor}">${esc(syns)}</span></div>`;
  }
  if (meta.antonyms.length) {
    const ants = meta.antonyms.slice(0, 3).join(', ');
    html += `<div style="${chipStyle}"><div style="${lblBase}color:${antColor}">Zıt</div><span style="color:${valColor}">${esc(ants)}</span></div>`;
  }
  if (meta.family.length) {
    const fams = meta.family.slice(0, 3).join(', ');
    html += `<div style="${chipStyle}"><div style="${lblBase}color:${famColor}">Aile</div><span style="color:${valColor}">${esc(fams)}</span></div>`;
  }
  html += '</div>';
  return html;
}

// ===== TOUCH/MOUSE DRAG SWIPE =====
let flashTouchHandled = false;

function initFlashDrag() {
  const fc = document.getElementById('fc');
  if (!fc) return;

  let startX = 0, startY = 0, curX = 0;
  let isDragging = false;
  let intentLocked = false;
  let dragActive = false;
  const SWIPE_THRESHOLD = 80;
  const DRAG_START_MIN = 10;

  function resetOverlays() {
    const overlayL = document.getElementById('fc-overlay-left');
    const overlayR = document.getElementById('fc-overlay-right');
    const btnW = document.getElementById('btn-wrong');
    const btnR = document.getElementById('btn-right');
    if (overlayL) overlayL.style.opacity = 0;
    if (overlayR) overlayR.style.opacity = 0;
    if (btnW) btnW.classList.remove('drag-hint-left', 'drag-hint-right');
    if (btnR) btnR.classList.remove('drag-hint-left', 'drag-hint-right');
  }

  function snapBack() {
    const isFlipped = fc.classList.contains('flipped');
    fc.classList.remove('dragging');
    fc.style.transition = 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)';
    fc.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    clearTimeout(fc._snapTimer);
    fc._snapTimer = setTimeout(() => {
      if (fc) {
        fc.style.transition = '';
        fc.style.transform = '';
      }
    }, 330);
    resetOverlays();
  }

  function onStart(x, y) {
    if (_fcSwiping) return;
    startX = x; startY = y; curX = x;
    isDragging = true; intentLocked = false; dragActive = false;
  }

  function onMove(x, y) {
    if (!isDragging || _fcSwiping) return;
    const dx = x - startX;
    const dy = y - startY;

    if (!intentLocked) {
      const adx = Math.abs(dx), ady = Math.abs(dy);
      if (adx < 5 && ady < 5) return;
      if (ady > adx * 1.2) { intentLocked = 'vertical'; isDragging = false; return; }
      intentLocked = 'horizontal';
    }
    if (intentLocked !== 'horizontal') return;

    if (Math.abs(dx) >= DRAG_START_MIN) dragActive = true;
    if (!dragActive) return;
    curX = x;

    const rot = Math.min(18, Math.max(-18, dx / 12));
    const isFlipped = fc.classList.contains('flipped');
    fc.classList.add('dragging');
    fc.style.transition = 'none';
    fc.style.transform = `translateX(${dx}px) rotate(${rot}deg)${isFlipped ? ' rotateY(180deg)' : ''}`;

    const progress = Math.min(1, Math.abs(dx) / SWIPE_THRESHOLD);
    const overlayL = document.getElementById('fc-overlay-left');
    const overlayR = document.getElementById('fc-overlay-right');
    const btnW = document.getElementById('btn-wrong');
    const btnR = document.getElementById('btn-right');
    if (dx < 0) {
      if (overlayL) overlayL.style.opacity = progress;
      if (overlayR) overlayR.style.opacity = 0;
      if (btnW) btnW.classList.add('drag-hint-left');
      if (btnR) btnR.classList.remove('drag-hint-right');
    } else {
      if (overlayR) overlayR.style.opacity = progress;
      if (overlayL) overlayL.style.opacity = 0;
      if (btnR) btnR.classList.add('drag-hint-right');
      if (btnW) btnW.classList.remove('drag-hint-left');
    }
  }

  function finishGesture(isTouch) {
    if (!isDragging) return;
    isDragging = false;
    const wasDrag = dragActive;
    dragActive = false;

    if (!wasDrag) {
      resetOverlays();
      flipCard();
      return;
    }

    const dx = curX - startX;
    if (dx < -SWIPE_THRESHOLD) {
      const btnRight = document.getElementById('btn-right');
      const btnWrong = document.getElementById('btn-wrong');
      if (btnWrong && typeof btnWrong.getAttribute('onclick') === 'string' && btnWrong.getAttribute('onclick').includes('srSwipe')) {
        srSwipe('wrong');
      } else {
        swipeCard('left');
      }
    } else if (dx > SWIPE_THRESHOLD) {
      const btnRight = document.getElementById('btn-right');
      if (btnRight && typeof btnRight.getAttribute('onclick') === 'string' && btnRight.getAttribute('onclick').includes('srSwipe')) {
        srSwipe('good');
      } else {
        swipeCard('right');
      }
    } else {
      snapBack();
    }
  }

  function onCancel() {
    isDragging = false; dragActive = false; intentLocked = false;
    snapBack();
  }

  fc.addEventListener('touchstart', e => {
    if (e.target.closest('button, a, .no-flip')) return;
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });

  fc.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
    if (dragActive) e.preventDefault();
  }, { passive: false });

  fc.addEventListener('touchend', e => {
    if (!isDragging) return;
    _fcLastTouchTime = Date.now();
    if (e.cancelable) e.preventDefault();
    finishGesture(true);
  }, { passive: false });

  fc.addEventListener('touchcancel', onCancel);

  fc.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (Date.now() - _fcLastTouchTime < 450) return;
    if (e.target.closest('button, a, .no-flip')) return;
    onStart(e.clientX, e.clientY);
    const moveHandler = ev => onMove(ev.clientX, ev.clientY);
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      finishGesture(false);
    };
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    e.preventDefault();
  });
}

function swipeCard(dir) {
  if (_fcSwiping) return;
  _fcSwiping = true;

  const btnR = document.getElementById('btn-right');
  const btnW = document.getElementById('btn-wrong');
  if (btnR) btnR.disabled = true;
  if (btnW) btnW.disabled = true;

  if (!currentCards || currentCards.length === 0) {
    _fcSwiping = false;
    renderFlashResult();
    return;
  }

  const word = currentCards[cardIndex];
  if (!word || !word[0]) {
    _fcSwiping = false;
    cardIndex++;
    renderFlash();
    return;
  }

  if (dir === 'right') {
    const nextCombo = (typeof _comboCount !== 'undefined' ? _comboCount : 0) + 1;
    if (typeof playGameSFX === 'function') playGameSFX('correct', nextCombo);
    if (typeof earnXP === 'function') earnXP('flash_correct', btnR);
    if (typeof _trackQuestStat === 'function') _trackQuestStat('cardsFlipped');
  } else {
    if (typeof playGameSFX === 'function') playGameSFX('wrong');
    if (typeof _resetCombo === 'function') _resetCombo();
    if (typeof _shakeElement === 'function') _shakeElement(document.getElementById('fc'));
  }

  const unit = word._unit || currentUnit || 1;
  const isPV = !!(_pvMode || currentCards._pvMode);

  try {
    if (isPV) {
      const card = currentCards[cardIndex];
      const pvKey = 'pv_' + (card[0] || '').replace(/\s+/g, '_');
      const hadError = !!pvErrors[pvKey];
      const prevErrorObj = hadError ? { ...pvErrors[pvKey] } : null;
      _flashHistory.push({ cardIndex, dir, word, unit, isPV: true, errorKey: pvKey, hadError, prevErrorObj, wasLearned: false });
      if (dir === 'right') {
        known.push(word);
        if (pvErrors[pvKey]) { delete pvErrors[pvKey]; savePVErrors(); }
      } else {
        unknown.push(word);
        pvErrors[pvKey] = { pv: card[0], tr: card[1].split('\n')[0], unit };
        savePVErrors();
      }
    } else {
      const errorKey = 'u' + unit + '_' + word[0];
      const hadError = !!errorBox[errorKey];
      const prevErrorObj = hadError ? { ...errorBox[errorKey] } : null;
      const wasLearned = typeof getLearnedSet === 'function' && UNITS[unit] ? getLearnedSet(unit).has(word[0]) : false;
      _flashHistory.push({ cardIndex, dir, word, unit, isPV: false, errorKey, hadError, prevErrorObj, wasLearned });

      if (dir === 'right') {
        known.push(word);
        if (UNITS[unit]) markLearned(unit, word[0]);
        delete errorBox[errorKey];
        saveErrors();
      } else {
        unknown.push(word);
        if (UNITS[unit]) markUnlearned(unit, word[0]);
        errorBox[errorKey] = { word: word[0], meaning: word[1], unit };
        saveErrors();
      }
    }
  } catch (e) { }

  const fc = document.getElementById('fc');
  if (fc) {
    const isFlipped = fc.classList.contains('flipped');
    fc.classList.remove('dragging');
    fc.style.transition = 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease';
    const baseFlip = isFlipped ? ' rotateY(180deg)' : '';
    fc.style.transform = dir === 'right'
      ? `translateX(120vw) rotate(18deg)${baseFlip}`
      : `translateX(-120vw) rotate(-18deg)${baseFlip}`;
    fc.style.opacity = '0';
  }

  setTimeout(() => {
    _fcSwiping = false;
    cardIndex++;
    try {
      if (cardIndex >= currentCards.length) {
        renderFlashResult();
      } else {
        renderFlash();
      }
    } catch (e) {
      _fcSwiping = false;
      renderFlash();
    }
  }, 300);
}

function renderFlashResult(backFn) {
  const s = document.getElementById('screen-flash');
  if (!s) return;

  const total = known.length + unknown.length;
  const pct = total > 0 ? Math.round((known.length / total) * 100) : 0;
  const backHandler = backFn || _flashBackFn || (currentUnit ? `openUnit(${currentUnit})` : 'goHome()');
  if (pct >= 70 && typeof playGameSFX === 'function') playGameSFX('win');

  window._retryFlashUnknown = function () {
    const retryPool = shuffle(unknown);
    startFlash(retryPool, {
      backFn: _flashBackFn,
      title: _flashTitle,
      unitTagFn: _flashUnitTagFn,
      pvMode: _pvMode
    });
  };

  s.innerHTML = `
  <div class="result-wrap">
    <div class="result-emoji">${unknown.length === 0 ? icon('trophy', 48) : known.length > unknown.length ? icon('award', 48) : icon('bookOpen', 48)}</div>
    <div class="result-title">${unknown.length === 0 ? 'Mükemmel!' : pct + '% Başarı'}</div>
    <div class="result-sub">${total} kelimeden ${known.length} tanesini bildiniz</div>
    <div class="stat-row">
      <div class="stat-box"><div class="stat-num" style="color:var(--success)">${known.length}</div><div class="stat-lbl">Bildim</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--error)">${unknown.length}</div><div class="stat-lbl">Bilmedim</div></div>
    </div>
    ${unknown.length > 0 ? `<button type="button" class="result-btn" onclick="window._retryFlashUnknown()">${icon('repeat', 16)} Bilemediklerimi Tekrar Et (${unknown.length})</button>` : ''}
    ${_pvMode
      ? `<button type="button" class="result-btn ${_pvMode && unknown.length > 0 ? 'outline' : ''}" style="${unknown.length > 0 ? 'margin-top:8px' : ''}" onclick="startPVFlash()">${icon('shuffle', 16)} Yeniden Başla</button>`
      : `<button type="button" class="result-btn ${unknown.length > 0 ? 'outline' : ''}" onclick="startFlash()">${icon('shuffle', 16)} Yeniden Başla</button>`}
    <button type="button" class="result-btn outline" onclick="${backHandler}">${icon('arrowLeft', 16)} Geri Dön</button>
  </div>`;
}

// -- MC Mode --
