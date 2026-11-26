// SM-2 Spaced Repetition System
//  interval  = bir sonraki tekrara kadar gün sayısı
//  reps      = art arda doğru cevap sayısı
//  due       = "YYYY-MM-DD" formatında sonraki tekrar tarihi
// ═══════════════════════════════════════════════════════════════

/* ── STATE ── */
// _srData already declared at top
// { "abandon": { ef:2.5, interval:1, reps:0, due:"2024-01-01" }, ... }

function _srSave() {
  localStorage.setItem('ydt_sr_v1', JSON.stringify(_srData));
}

/* ── YARDIMCI ── */
function _srToday() {
  return new Date().toISOString().slice(0, 10);
}

function _srDatePlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

function _srGet(word) {
  return _srData[word] || { ef: 2.5, interval: 0, reps: 0, due: _srToday() };
}

/* ── SM-2 CORE ──
   q = 0..5 kalite notu
     5 = anında doğru
     4 = doğru (biraz düşününce)
     3 = doğru (zor)
     2 = yanlış ama çok kolayca hatırladı
     1 = yanlış
     0 = tamamen yanlış
   Biz için: doğru -> q=4, yanlış -> q=1
*/
function _sm2Update(word, q) {
  const card = _srGet(word);
  let { ef, interval, reps } = card;

  if (q >= 3) {
    // Doğru cevap — interval artır, reps artır, EF güncelle
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 4;
    } else {
      interval = Math.round(interval * ef);
    }
    reps += 1;
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ef < 1.3) ef = 1.3;
  } else {
    // Yanlış cevap — reps sıfırla, interval düşür, EF sabit kalır
    reps = 0;
    interval = 1;
    // EF değişmez — SM-2'de EF sadece doğru cevapta güncellenir
  }

const due = _srDatePlusDays(interval);
  _srData[word] = { ef: parseFloat(ef.toFixed(3)), interval, reps, due, last: _srToday() };
  _srSave();
}

/* ── DOĞRU/YANLIŞ API ── */
function srMarkCorrect(word) {
  _sm2Update(word, 4);
  _srUpdateHomeCard();
}

function srMarkHard(word) {
  _sm2Update(word, 2);
  _srUpdateHomeCard();
}

function srMarkWrong(word) {
  _sm2Update(word, 1);
  _srUpdateHomeCard();
}

/* ── BUGÜNKÜ KUYRUK ── */
function _srGetDueWords() {
  const today = _srToday();
  const due = [];

  for (let u = 1; u <= 10; u++) {
    UNITS[u].words.forEach(w => {
      const word = w[0];
      const card = _srGet(word);
      // Hiç çalışılmamış (interval=0 ve reps=0) kelimeler hariç —
      // sadece en az bir kez görülmüş kelimeler kuyruğa girer.
      // Tamamen yeni kelimeler SR ekranında değil normal modda tanıtılır.
      if (card.reps > 0 && card.due <= today) {
        due.push({ wordArr: w, unit: u, card });
      }
    });
  }

  // Önce en gecikmiş, sonra en düşük EF (en zor)
  due.sort((a, b) => {
    const daysDiffA = _srDaysDiff(a.card.due, today);
    const daysDiffB = _srDaysDiff(b.card.due, today);
    if (daysDiffB !== daysDiffA) return daysDiffB - daysDiffA;
    return a.card.ef - b.card.ef;
  });

  return due;
}

function _srDaysDiff(dateStr, today) {
  const a = new Date(dateStr), b = new Date(today);
  return Math.round((b - a) / 86400000);
}

/* ── YENİ KELİMELER (SR'ye girmemiş) ── */
function _srGetNewWords(limit) {
  const newWords = [];
  for (let u = 1; u <= 10; u++) {
    UNITS[u].words.forEach(w => {
      const card = _srGet(w[0]);
      if (card.reps === 0) {
        newWords.push({ wordArr: w, unit: u, card });
      }
    });
  }
  // Önce üniteye göre sırala, ilk ünite önce gelsin
  newWords.sort((a, b) => a.unit - b.unit);
  return newWords.slice(0, limit || 10);
}

/* ── HOME KART RENDER ── */
function _srUpdateHomeCard() {
  const card = document.getElementById('sr-home-card');
  if (!card) return;

  const due = _srGetDueWords();
  const newWords = _srGetNewWords(5);
  const total = due.length;
  const newCount = newWords.length;
  const today = _srToday();

  const entries = Object.values(_srData);
  const trackedCount = entries.length;
  const masteredCount = entries.filter(c => (c.interval || 0) >= 21).length;
  const doneToday = entries.filter(c => (c.last || '') === today && c.reps > 0).length;

  const metricsHtml = `
    <div class="sr-home-metrics">
      <span class="sr-metric-pill">${icon('check', 11)} Bugün: <b>${doneToday}</b></span>
      <span class="sr-metric-pill">${icon('layers', 11)} Takipte: <b>${trackedCount}</b></span>
      <span class="sr-metric-pill is-master">${icon('award', 11)} Uzmanlaşılan: <b>${masteredCount}</b></span>
    </div>
  `;

  if (total === 0 && newCount === 0) {
    card.innerHTML = `
      <div class="sr-card-done">
        <span class="sr-card-done-icon">${icon('checkCircle', 20)}</span>
        <div>
          <div class="sr-card-title">Günlük Tekrarlar Tamam!</div>
          <div class="sr-card-sub">Bugün ${doneToday} kelime tekrar ettin</div>
        </div>
      </div>
      ${metricsHtml}
      <div class="sr-card-actions">
        <button type="button" class="sr-btn primary" onclick="startMixFlash()">${icon('zap', 14)} Ekstra Pratik</button>
        <button type="button" class="sr-btn outline" onclick="showSRStats()">${icon('barChart', 14)} Detay &amp; Takvim</button>
      </div>`;
    return;
  }

  const urgentCount = due.filter(d => _srDaysDiff(d.card.due, today) >= 1).length;

  card.innerHTML = `
    <div class="sr-card-header">
      <div class="sr-card-icon-wrap">
        <span class="sr-card-icon">${icon('brain', 22)}</span>
      </div>
      <div class="sr-card-info">
        <div class="sr-card-title">Tekrar Zamanı</div>
        <div class="sr-card-chips">
          ${total > 0 ? `<span class="sr-chip due">${total} tekrar</span>` : ''}
          ${newCount > 0 ? `<span class="sr-chip new">${newCount} yeni</span>` : ''}
          ${urgentCount > 0 ? `<span class="sr-chip urgent">${icon('alertTriangle', 12)} ${urgentCount} gecikmiş</span>` : ''}
        </div>
      </div>
    </div>
    ${metricsHtml}
    <div class="sr-card-actions">
      <button type="button" class="sr-btn primary" onclick="startSRSession()">${icon('play', 14)} Çalışmaya Başla</button>
      <button type="button" class="sr-btn outline" onclick="showSRStats()">${icon('barChart', 14)} Detay</button>
    </div>
  `;
}

/* ── SR OTURUMU BAŞLAT ── */
function startSRSession() {
  const due = _srGetDueWords();
  const newWords = _srGetNewWords(10 - Math.min(due.length, 10));

  // Miktar sınırla: max 20 kart / oturum
  const reviewCards = due.slice(0, 15).map(d => {
    const w = [...d.wordArr];
    w._unit = d.unit;
    w._sr = true;
    w._srWord = d.wordArr[0];
    return w;
  });

  const newCards = newWords.slice(0, 5).map(d => {
    const w = [...d.wordArr];
    w._unit = d.unit;
    w._sr = true;
    w._srNew = true;
    w._srWord = d.wordArr[0];
    return w;
  });

  const allCards = shuffle([...reviewCards, ...newCards]);

  if (allCards.length === 0) {
    showToast('Bugün çalışılacak kelime yok!');
    return;
  }

  // SR modunu flash card olarak başlat
  currentCards = allCards;
  cardIndex = 0; known = []; unknown = [];
  renderSRFlash();
  showScreen('screen-flash');
}

/* ── SR FLASH RENDER ── */
function renderSRFlash() {
  const s = document.getElementById('screen-flash');
  if (cardIndex >= currentCards.length) {
    renderSRResult();
    return;
  }

  const word = currentCards[cardIndex];
  const total = currentCards.length;
  const pct = Math.round((cardIndex / total) * 100);
  const card = _srGet(word._srWord || word[0]);
  const isNew = word._srNew;
  const daysOverdue = isNew ? 0 : _srDaysDiff(card.due, _srToday());

  const intervalLabel = isNew
    ? `<span class="sr-badge new-badge">${icon('sparkles', 12)} Yeni</span>`
    : daysOverdue > 0
      ? `<span class="sr-badge overdue-badge">${icon('alertTriangle', 12)} ${daysOverdue}g gecikmiş</span>`
      : `<span class="sr-badge review-badge">${icon('refresh', 12)} Tekrar</span>`;

  const remaining = total - cardIndex;
  if (typeof _bindFlashKeys === 'function') _bindFlashKeys();

  s.innerHTML = `
  <div class="unit-header">
    <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div>
      <div class="unit-title-h">${icon('brain', 18)} Tekrar Modu</div>
      <div class="unit-sub">Ünite ${word._unit} · ${cardIndex + 1}/${total}</div>
    </div>
    <div style="font-size:11px;color:var(--text3);font-weight:600">${known.length} doğru · ${unknown.length} yanlış</div>
  </div>
  <div class="flash-wrap">
    <div class="flash-progress-row">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="flash-counter-badge">${cardIndex + 1}/${total}</span>
    </div>
    <div class="flash-card-wrap">
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
            ${intervalLabel}
            <span class="flash-unit-badge">Ünite ${word._unit}</span>
          </div>
          <div class="flash-face-body">
            <div class="flash-hint">İngilizce</div>
            <div class="flash-word-row">
              <div class="flash-word">${esc(word[0])}</div>
              <button type="button" class="pronounce-btn" onclick="event.stopPropagation();speakWord('${escQ(word[0])}')" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 18)}</button>
            </div>
          </div>
          <div class="flash-flip-pill">${icon('refresh', 13)} <span>Tıkla ve Çevir · Anlamı Gör</span></div>
        </div>
        <div class="flash-face flash-back">
          <div class="flash-face-top">
            <div class="flash-back-word-chip">
              <span>${esc(word[0])}</span>
              <button type="button" class="pronounce-btn is-on-dark" onclick="event.stopPropagation();speakWord('${escQ(word[0])}')" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 15)}</button>
            </div>
            <span class="flash-unit-badge is-on-dark">Ünite ${word._unit}</span>
          </div>
          <div class="flash-face-body">
            <div class="flash-hint is-on-dark">Türkçe Anlamı</div>
            <div class="flash-meaning">${esc(word[1])}</div>
            ${word[2] ? `<div class="flash-example">"${typeof highlightTargetWord === 'function' ? highlightTargetWord(word[2], word[0]) : esc(word[2])}"</div>` : ''}
            <div class="sr-quality-row no-flip">
              <button type="button" class="sr-q-btn hard" onclick="event.stopPropagation();srSwipe('hard')">${icon('alertTriangle', 14)} Zor</button>
              <button type="button" class="sr-q-btn good" onclick="event.stopPropagation();srSwipe('good')">${icon('check', 14)} Bildim</button>
              <button type="button" class="sr-q-btn easy" onclick="event.stopPropagation();srSwipe('easy')">${icon('zap', 14)} Kolay</button>
            </div>
          </div>
          <div class="flash-flip-pill is-back">${icon('refresh', 13)} <span>Tekrar Tıkla · Ön Yüze Dön</span></div>
        </div>
      </div>
    </div>
    <button type="button" class="flash-flip-btn" onclick="event.stopPropagation();flipCard();">${icon('refresh', 16)} Kartı Çevir</button>
    <div class="flash-swipe-guide">
      <div class="flash-guide-item"><div class="flash-guide-dot" style="background:var(--error)"></div><span class="icon-inline" style="color:var(--error)">${icon('arrowLeft', 12)} Bilmedim</span></div>
      <span style="font-size:11px;color:var(--text3)">sürükle veya bas</span>
      <div class="flash-guide-item"><span class="icon-inline" style="color:var(--success)">Bildim ${icon('arrowRight', 12)}</span><div class="flash-guide-dot" style="background:var(--success)"></div></div>
    </div>
    <div class="sr-quality-row">
      <button class="sr-quality-btn hard" onclick="srSwipe('hard')">${icon('alertTriangle', 14)} Zor</button>
      <button class="swipe-btn wrong" id="btn-wrong" onclick="srSwipe('wrong')">${icon('x', 16)} Bilmedim</button>
      <button class="swipe-btn right" id="btn-right" onclick="srSwipe('good')">${icon('check', 16)} Bildim</button>
      <button class="sr-quality-btn easy" onclick="srSwipe('easy')">${icon('zap', 14)} Kolay</button>
    </div>
  </div>`;

  initFlashDrag();
}

/* ── SR SWIPE ── */
function srSwipe(quality) {
  if (_fcSwiping) return;
  _fcSwiping = true;

  const fc = document.getElementById('fc');
  if (!fc) { _fcSwiping = false; return; }

  if (!currentCards || currentCards.length === 0 || cardIndex >= currentCards.length) {
    _fcSwiping = false;
    renderSRResult();
    return;
  }

  const word = currentCards[cardIndex];
  if (!word || !word[0]) {
    _fcSwiping = false;
    cardIndex++;
    renderSRFlash();
    return;
  }

  const wordKey = word._srWord || word[0];
  const unit = word._unit || currentUnit || 1;

  let q;
  if (quality === 'easy') q = 5;
  else if (quality === 'good') q = 4;
  else if (quality === 'hard') q = 2;
  else q = 1;

  _sm2Update(wordKey, q);

  const isRight = q >= 3;
  if (typeof playGameSFX === 'function') {
    playGameSFX(isRight ? (q === 5 ? 'bonus' : 'correct') : 'wrong', (typeof _comboCount !== 'undefined' ? _comboCount + 1 : 1));
  }
  fc.classList.remove('dragging');
  fc.style.transition = 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.34s ease';
  const baseFlip = fc.classList.contains('flipped') ? ' rotateY(180deg)' : '';
  fc.style.transform = isRight
    ? `translateX(110vw) rotate(22deg)${baseFlip}`
    : `translateX(-110vw) rotate(-22deg)${baseFlip}`;
  fc.style.opacity = '0';

  if (isRight) {
    known.push(word);
    markLearned(unit, word[0]);
    delete errorBox['u' + unit + '_' + word[0]];
    saveErrors();
    _trackQuestStat('srReviews');
    if (typeof earnXP === 'function') earnXP('flash_correct', document.getElementById('btn-right'));
  } else {
    unknown.push(word);
    markUnlearned(unit, word[0]);
    errorBox['u' + unit + '_' + word[0]] = { word: word[0], meaning: word[1], unit };
    saveErrors();
    _resetCombo();
  }

  setTimeout(() => {
    _fcSwiping = false;
    cardIndex++;
    _trackQuestStat('cardsFlipped');
    if (cardIndex >= currentCards.length) {
      renderSRResult();
    } else {
      renderSRFlash();
    }
  }, 400);
}

/* ── SR SONUÇ ── */
function renderSRResult() {
  const s = document.getElementById('screen-flash');
  const total = known.length + unknown.length;
  const pct = total > 0 ? Math.round((known.length / total) * 100) : 0;

  // Sonraki tekrar sürelerini göster
  const nextReviews = currentCards.slice(0, 5).map(w => {
    const card = _srGet(w._srWord || w[0]);
    return { word: w[0], interval: card.interval, due: card.due };
  });

  const nextHtml = nextReviews.map(r => `
    <div class="sr-result-row">
      <span class="sr-result-word">${esc(r.word)}</span>
      <span class="sr-result-next">${r.interval === 1 ? 'Yarın' : r.interval + ' gün sonra'}</span>
    </div>`).join('');

  s.innerHTML = `
  <div class="result-wrap" style="overflow-y:auto">
    <div class="result-emoji">${pct >= 80 ? icon('trophy', 44) : pct >= 50 ? icon('award', 44) : icon('bookOpen', 44)}</div>
    <div class="result-title">${pct >= 80 ? 'Harika!' : pct >= 50 ? 'İyi İş!' : 'Devam Et!'}</div>
    <div class="result-sub">${total} karttan ${known.length} doğru · ${pct}% başarı</div>
    <div class="stat-row">
      <div class="stat-box"><div class="stat-num" style="color:var(--success)">${known.length}</div><div class="stat-lbl">Bildim</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--error)">${unknown.length}</div><div class="stat-lbl">Bilmedim</div></div>
    </div>
    <div class="sr-next-wrap">
      <div class="sr-next-title">${icon('calendar', 15)} Sonraki tekrar tarihleri</div>
      ${nextHtml}
    </div>
    <button class="result-btn" onclick="startSRSession()">${icon('refresh', 16)} Devam Et</button>
    <button class="result-btn outline" onclick="goHome()">Ana Sayfa</button>
  </div>`;

  _srUpdateHomeCard();
}

/* ── SR İSTATİSTİK DETAY ── */
function showSRStats() {
  const due = _srGetDueWords();
  const today = _srToday();
  const allSR = Object.entries(_srData);

  // Olgunluk dağılımı
  const buckets = { new: 0, learning: 0, young: 0, mature: 0 };
  for (let u = 1; u <= 10; u++) {
    UNITS[u].words.forEach(w => {
      const c = _srGet(w[0]);
      if (c.reps === 0) buckets.new++;
      else if (c.interval <= 1) buckets.learning++;
      else if (c.interval <= 7) buckets.young++;
      else buckets.mature++;
    });
  }

  // Önümüzdeki 7 günün tahmini yükü
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = allSR.filter(([, c]) => c.due === dateStr && c.reps > 0).length;
    const label = i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : d.toLocaleDateString('tr-TR', { weekday: 'short' });
    forecast.push({ label, count, dateStr });
  }

  const maxForecast = Math.max(...forecast.map(f => f.count), 1);

  let modal = document.getElementById('sr-stats-modal');
  if (modal) { modal.remove(); return; }

  modal = document.createElement('div');
  modal.id = 'sr-stats-modal';
  modal.className = 'gm-goal-modal-overlay';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div class="gm-goal-modal-card" style="max-height:85vh;overflow-y:auto;padding-bottom:40px">
      <div class="gm-goal-modal-handle"></div>
      <div class="gm-goal-modal-title">${icon('brain', 18)} Spaced Repetition</div>
      <div class="gm-goal-modal-sub">SM-2 algoritması ile kişiselleştirilmiş tekrar programı</div>

      <!-- Olgunluk dağılımı -->
      <div class="sr-stats-section">
        <div class="sr-stats-section-title">Kelime Olgunluğu</div>
        <div class="sr-maturity-row">
          <div class="sr-maturity-chip" style="background:rgba(52,152,219,0.12);border-color:rgba(52,152,219,0.3)">
            <div class="sr-maturity-num" style="color:#3498db">${buckets.new}</div>
            <div class="sr-maturity-lbl">Yeni</div>
          </div>
          <div class="sr-maturity-chip" style="background:rgba(230,126,34,0.1);border-color:rgba(230,126,34,0.3)">
            <div class="sr-maturity-num" style="color:#e67e22">${buckets.learning}</div>
            <div class="sr-maturity-lbl">Öğreniliyor</div>
          </div>
          <div class="sr-maturity-chip" style="background:rgba(241,196,15,0.1);border-color:rgba(241,196,15,0.35)">
            <div class="sr-maturity-num" style="color:#f1c40f">${buckets.young}</div>
            <div class="sr-maturity-lbl">Genç</div>
          </div>
          <div class="sr-maturity-chip" style="background:rgba(46,204,113,0.1);border-color:rgba(46,204,113,0.3)">
            <div class="sr-maturity-num" style="color:#2ecc71">${buckets.mature}</div>
            <div class="sr-maturity-lbl">Olgun</div>
          </div>
        </div>
      </div>

      <!-- 7 günlük tahmin -->
      <div class="sr-stats-section">
        <div class="sr-stats-section-title">Önümüzdeki 7 Gün</div>
        <div class="sr-forecast-wrap">
          ${forecast.map(f => `
            <div class="sr-forecast-col">
              <div class="sr-forecast-bar-wrap">
                <div class="sr-forecast-bar" style="height:${Math.max(4, Math.round((f.count / maxForecast) * 60))}px;background:${f.label === 'Bugün' ? 'var(--accent)' : 'var(--border2)'}"></div>
              </div>
              <div class="sr-forecast-num" style="color:${f.label === 'Bugün' ? 'var(--accent)' : 'var(--text3)'}">${f.count}</div>
              <div class="sr-forecast-label" style="color:${f.label === 'Bugün' ? 'var(--accent)' : 'var(--text3)'}">${f.label}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Bekleyen kelimeler listesi -->
      ${due.length > 0 ? `
      <div class="sr-stats-section">
        <div class="sr-stats-section-title">Bekleyen Tekrarlar (${due.length})</div>
        <div class="sr-due-list">
          ${due.slice(0, 10).map(d => {
    const overdue = _srDaysDiff(d.card.due, today);
    return `
            <div class="sr-due-row">
              <div>
                <span class="sr-due-word">${esc(d.wordArr[0])}</span>
                <span class="sr-due-meaning">${esc(d.wordArr[1])}</span>
              </div>
              <div style="text-align:right">
                <div class="sr-due-interval">her ${d.card.interval}g</div>
                ${overdue > 0 ? `<div style="font-size:11px;color:var(--error)">${overdue}g gecikmiş</div>` : ''}
              </div>
            </div>`;
  }).join('')}
          ${due.length > 10 ? `<div style="text-align:center;font-size:12px;color:var(--text3);padding:8px">+${due.length - 10} kelime daha</div>` : ''}
        </div>
      </div>` : ''}

      <button class="sr-btn primary" style="width:100%;margin-top:8px" onclick="document.getElementById('sr-stats-modal').remove();startSRSession()">${icon('play', 14)} Çalışmaya Başla</button>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));
}

/* ── HOME KARTINI renderHome'a bağla ── */

function _srSyncWordLearned(word) {
  const existing = _srData[word];
  if (!existing || existing.reps === 0) {
    _sm2Update(word, 3);
  }
  _srUpdateHomeCard();
}

function _srSyncWordUnlearned(word) {
  if (_srData[word] && _srData[word].reps > 0) {
    _sm2Update(word, 1);
  }
  _srUpdateHomeCard();
}
