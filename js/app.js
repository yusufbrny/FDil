// Main application bootstrap, theme management, bookshelf, home grid, unit screen, and global keyboard/scroll listeners

const BOOKS = [
  {
    id: 'genel',
    title: 'Genel Çalışma',
    subtitle: 'YDT Temel & Akademik Kelimeler',
    badge: 'TEMEL KİTAP',
    units: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    coverTheme: 'emerald'
  }
];

let currentBookId = null;
let currentUnitFilter = 'all';

function getBookStats(book) {
  let totalWords = 0;
  let learnedWords = 0;
  let completedUnits = 0;
  let errorCount = 0;

  book.units.forEach(u => {
    const unit = UNITS[u];
    if (!unit) return;
    totalWords += unit.words.length;
    const learned = getLearnedSet(u).size;
    learnedWords += learned;
    if (learned >= unit.words.length && unit.words.length > 0) completedUnits++;
    errorCount += Object.values(errorBox).filter(e => String(e.unit) === String(u)).length;
  });

  const pct = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  return { totalWords, learnedWords, completedUnits, errorCount, pct };
}

function getExamBookStats() {
  const packs = typeof EXAM_WORD_PACKS !== 'undefined' ? Object.values(EXAM_WORD_PACKS) : [];
  let totalWords = 0;
  let learnedWords = 0;
  const allLearned = new Set();
  for (let u = 1; u <= 10; u++) {
    if (UNITS[u]) getLearnedSet(u).forEach(w => allLearned.add(String(w).toLowerCase()));
  }
  packs.forEach(p => {
    const ws = p.words || [];
    totalWords += ws.length;
    ws.forEach(w => {
      if (allLearned.has(String(w[0]).toLowerCase())) learnedWords++;
    });
  });
  const pct = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  return { packCount: packs.length, totalWords, learnedWords, pct };
}

function renderContinueBanner(book) {
  const banner = document.getElementById('bookshelf-continue-banner');
  if (!banner || !book || !book.units.length) return;

  let resumeUnit = currentUnit && book.units.includes(Number(currentUnit)) ? Number(currentUnit) : null;
  if (!resumeUnit || getProgressPct(resumeUnit) >= 100) {
    const firstIncomplete = book.units.find(u => UNITS[u] && getProgressPct(u) < 100);
    resumeUnit = firstIncomplete || book.units[0];
  }
  const unit = UNITS[resumeUnit];
  if (!unit) { banner.innerHTML = ''; return; }

  const pct = getProgressPct(resumeUnit);
  const learned = getLearnedSet(resumeUnit).size;
  const total = unit.words.length;
  const firstWord = unit.words[0] ? unit.words[0][0].toUpperCase() : '';
  const lastWord = unit.words[total - 1] ? unit.words[total - 1][0].toUpperCase() : '';
  const errs = Object.values(errorBox).filter(e => String(e.unit) === String(resumeUnit)).length;

  banner.innerHTML = `
    <div class="bookshelf-continue-card">
      <div class="bsc-top">
        <div class="bsc-title-wrap">
          <span class="bsc-eyebrow">${icon('play', 11)} KALDIĞIN YERDEN DEVAM ET</span>
          <div class="bsc-title">Ünite ${resumeUnit} · ${esc(firstWord)} — ${esc(lastWord)}</div>
          <div class="bsc-sub">${learned}/${total} kelime öğrenildi (%${pct})${errs > 0 ? ` · ${errs} hata` : ''}</div>
        </div>
        <button type="button" class="bsc-open-btn" onclick="openUnit(${resumeUnit})">
          <span>Üniteyi Aç</span>
          ${icon('arrowRight', 14)}
        </button>
      </div>
      <div class="bsc-bar-track"><div class="bsc-bar-fill" style="width:${pct}%"></div></div>
      <div class="bsc-actions">
        <button type="button" class="bsc-quick-btn" onclick="openUnitQuickMode(${resumeUnit},'flash')">${icon('layers', 13)} Flash Kart</button>
        <button type="button" class="bsc-quick-btn" onclick="openUnitQuickMode(${resumeUnit},'mc')">${icon('checkCircle', 13)} Çoktan Seçmeli</button>
        <button type="button" class="bsc-quick-btn" onclick="openUnit(${resumeUnit});if(typeof startLearn==='function')startLearn();">${icon('bookOpen', 13)} Sözlük</button>
      </div>
    </div>
  `;
}

function openUnitQuickMode(u, mode) {
  if (!u || !UNITS[u]) { goHome(); return; }
  if (!currentBookId) {
    const matchingBook = BOOKS.find(b => b.units.includes(Number(u)));
    if (matchingBook) currentBookId = matchingBook.id;
  }
  currentUnit = u;
  window._unitStudyFilter = 'all';
  if (mode === 'mc') {
    startMC(UNITS[u].words, 'goHome()', `Ünite ${u} · Çoktan Seçmeli`);
  } else {
    startFlash(UNITS[u].words, { backFn: 'goHome()', title: `Ünite ${u} · Flash Kartlar` });
  }
}

function renderBookshelf() {
  const shelf = document.getElementById('bookshelf-grid');
  if (!shelf) return;

  renderContinueBanner(BOOKS[0]);

  let html = BOOKS.map(book => {
    const stats = getBookStats(book);
    return `
      <button type="button" class="book-card" onclick="openBook('${escQ(book.id)}')" aria-label="${esc(book.title)} kitabını aç">
        <div class="book-pages-edge">
          <div class="book-cover">
            <div class="book-spine"></div>
            <div class="book-ribbon"></div>
            <div class="book-cover-top">
              <span class="book-badge">${icon('sparkles', 11)} ${esc(book.badge)}</span>
              <div class="book-emblem">
                <svg class="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  <path d="M9 7h7"/>
                  <path d="M9 11h5"/>
                </svg>
              </div>
            </div>
            <div class="book-cover-body">
              <div class="book-title">${esc(book.title)}</div>
              <div class="book-subtitle">${esc(book.subtitle)} · ${stats.completedUnits}/${book.units.length} Ünite Tamam</div>
            </div>
            <div class="book-cover-footer">
              <div class="book-meta-row">
                <span>${stats.learnedWords}/${stats.totalWords} Kelime</span>
                <span>%${stats.pct}</span>
              </div>
              <div class="book-progress-track">
                <div class="book-progress-fill" style="width:${stats.pct}%"></div>
              </div>
              <div class="book-open-cta">
                <span>Üniteleri Aç</span>
                ${icon('arrowRight', 13)}
              </div>
            </div>
          </div>
        </div>
      </button>`;
  }).join('');

  const examStats = getExamBookStats();
  html += `
    <button type="button" class="book-card" onclick="showExamCoach('packs')" aria-label="YDT, YDS ve YÖKDİL Branş Kitapları">
      <div class="book-pages-edge">
        <div class="book-cover book-cover--exam">
          <div class="book-spine"></div>
          <div class="book-ribbon"></div>
          <div class="book-cover-top">
            <span class="book-badge">${icon('graduationCap', 11)} YDT · YDS · YÖKDİL</span>
            <div class="book-emblem">
              ${icon('target', 22)}
            </div>
          </div>
          <div class="book-cover-body">
            <div class="book-title">Sınav Branş Setleri</div>
            <div class="book-subtitle">YDT (YKS-Dil) · Sağlık · Fen · Sosyal · YDS</div>
          </div>
          <div class="book-cover-footer">
            <div class="book-meta-row">
              <span>${examStats.packCount || 7} Özel Paket · ${examStats.totalWords || 165} Kelime</span>
              <span>%${examStats.pct}</span>
            </div>
            <div class="book-progress-track">
              <div class="book-progress-fill" style="width:${examStats.pct}%"></div>
            </div>
            <div class="book-open-cta">
              <span>Paketleri &amp; Koçu Aç</span>
              ${icon('arrowRight', 13)}
            </div>
          </div>
        </div>
      </div>
    </button>`;

  shelf.innerHTML = html;
}

function renderBookUnits(bookId) {
  const book = BOOKS.find(b => b.id === bookId) || BOOKS[0];
  if (!book) return;
  const stats = getBookStats(book);

  const banner = document.getElementById('active-book-banner');
  if (banner) {
    banner.innerHTML = `
      <button type="button" class="book-back-btn" onclick="closeBook()" aria-label="Kitaplığa dön">
        ${icon('arrowLeft', 15)}
        <span>Kitaplık</span>
      </button>
      <div class="active-book-mini-cover">${icon('books', 16)}</div>
      <div class="active-book-info">
        <div class="active-book-title">${esc(book.title)}</div>
        <div class="active-book-sub">${book.units.length} Ünite · ${stats.learnedWords}/${stats.totalWords} kelime</div>
      </div>
      <span class="active-book-pct">%${stats.pct}</span>
    `;
  }

  let totalUnits = 0, incCount = 0, doneCount = 0, errUnitCount = 0;
  const grid = document.getElementById('unit-grid');
  if (!grid) return;
  grid.innerHTML = '';

  book.units.forEach(u => {
    if (!UNITS[u]) return;
    const words = UNITS[u].words || [];
    const total = words.length;
    const learned = getLearnedSet(u).size;
    const pct = getProgressPct(u);
    const errs = Object.values(errorBox).filter(e => String(e.unit) === String(u)).length;

    totalUnits++;
    if (pct === 100) doneCount++;
    else incCount++;
    if (errs > 0) errUnitCount++;

    const previewWords = words.slice(0, 3).map(w => `<span class="unit-preview-chip">${esc(w[0])}</span>`).join('');
    const statusBadge = errs > 0
      ? `<span class="ebadge">${errs} HATA</span>`
      : pct === 100
        ? `<span class="unit-done-pill">${icon('check', 11)} Bitti</span>`
        : `<span class="unit-pct-pill">%${pct}</span>`;

    grid.innerHTML += `
      <div class="unit-card ${pct === 100 ? 'is-done' : ''}" data-unit="${u}" data-pct="${pct}" data-errors="${errs}" onclick="openUnit(${u})">
        <div class="unit-card-top">
          <span class="unit-card-num">Ünite ${u}</span>
          ${statusBadge}
        </div>
        <div class="unit-card-title">${words[0][0].toUpperCase()} — ${words[words.length - 1][0].toUpperCase()}</div>
        <div class="unit-card-preview">${previewWords}</div>
        <div class="unit-card-count">${learned}/${total} kelime öğrenildi</div>
        <div class="unit-card-bar"><div class="unit-card-bar-fill" style="width:${pct}%"></div></div>
        <div class="unit-card-actions">
          <button type="button" class="unit-qbtn" onclick="event.stopPropagation();openUnitQuickMode(${u},'flash')">${icon('layers', 12)} Kartlar</button>
          <button type="button" class="unit-qbtn" onclick="event.stopPropagation();openUnitQuickMode(${u},'mc')">${icon('checkCircle', 12)} Test</button>
        </div>
      </div>`;
  });

  const filterLabels = {
    all: `Tümü (${totalUnits})`,
    incomplete: `Eksik (${incCount})`,
    done: `Bitti (${doneCount})`,
    error: `Hatalı (${errUnitCount})`
  };
  document.querySelectorAll('#unit-filter-pills .pill').forEach(p => {
    const f = p.dataset.filter;
    if (f && filterLabels[f]) p.textContent = filterLabels[f];
    p.classList.toggle('active', f === currentUnitFilter);
  });

  applyUnitFilter(currentUnitFilter);
}

function openBook(bookId) {
  const book = BOOKS.find(b => b.id === bookId);
  if (!book) return;
  currentBookId = book.id;
  currentUnitFilter = 'all';

  const shelfSection = document.getElementById('bookshelf-section');
  const unitsSection = document.getElementById('book-units-section');
  if (shelfSection) shelfSection.style.display = 'none';
  if (unitsSection) {
    unitsSection.style.display = 'flex';
    unitsSection.classList.remove('book-opening');
    void unitsSection.offsetWidth;
    unitsSection.classList.add('book-opening');
  }

  document.querySelectorAll('#book-units-section .pill').forEach((p, idx) => {
    p.classList.toggle('active', idx === 0);
  });

  renderBookUnits(book.id);
}

function closeBook() {
  currentBookId = null;
  const shelfSection = document.getElementById('bookshelf-section');
  const unitsSection = document.getElementById('book-units-section');
  if (unitsSection) unitsSection.style.display = 'none';
  if (shelfSection) shelfSection.style.display = 'flex';
  renderBookshelf();
}

function applyUnitFilter(type) {
  const cards = document.querySelectorAll('#unit-grid .unit-card');
  let visibleCount = 0;
  cards.forEach(card => {
    const pct = parseInt(card.dataset.pct || '0', 10);
    const errs = parseInt(card.dataset.errors || '0', 10);
    let show = true;
    if (type === 'incomplete') show = pct < 100;
    else if (type === 'done') show = pct === 100;
    else if (type === 'error') show = errs > 0;
    card.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  const emptyEl = document.getElementById('unit-grid-empty');
  if (emptyEl) {
    if (visibleCount === 0) {
      const msg = type === 'error'
        ? 'Hatalı kelimesi bulunan ünite yok.'
        : type === 'done'
          ? 'Henüz tamamlanan ünite bulunmuyor.'
          : type === 'incomplete'
            ? 'Harika! Bu kitaptaki tüm üniteler tamamlandı.'
            : 'Gösterilecek ünite bulunamadı.';
      emptyEl.style.display = 'flex';
      emptyEl.innerHTML = `
        <span>${msg}</span>
        <button type="button" class="pill active" onclick="filterUnits('all', document.querySelector('#unit-filter-pills [data-filter=all]'))">Tüm Üniteleri Göster</button>
      `;
    } else {
      emptyEl.style.display = 'none';
      emptyEl.innerHTML = '';
    }
  }
}

function updateHomeToolsMeta() {
  const errTotal = (typeof errorBox !== 'undefined' ? Object.keys(errorBox).length : 0)
    + (typeof pvErrors !== 'undefined' ? Object.keys(pvErrors).length : 0);
  const errSub = document.getElementById('home-error-sub');
  if (errSub) {
    errSub.textContent = errTotal > 0
      ? `${errTotal} hatalı kelime tekrar bekliyor`
      : 'Harika! Şu an hatalı kelimen yok';
  }

  const myWordsTotal = typeof customVocab !== 'undefined' ? customVocab.length : 0;
  const myWordsSub = document.getElementById('home-mywords-sub');
  if (myWordsSub) {
    myWordsSub.textContent = myWordsTotal > 0
      ? `${myWordsTotal} kayıtlı kelimenle flash kart & test çöz`
      : 'Bilmediğin kelimeleri birden fazla anlamıyla ekle';
  }

  const pvEntries = typeof PHRASAL_VERBS !== 'undefined' ? Object.values(PHRASAL_VERBS) : [];
  const pvCount = pvEntries.reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
  const pvBadge = document.getElementById('pv-count-badge');
  const pvSub = document.getElementById('home-pv-sub');
  if (pvBadge && pvCount > 0) {
    pvBadge.textContent = pvCount;
    pvBadge.style.display = 'inline-block';
  }
  if (pvSub && pvCount > 0) {
    pvSub.textContent = `${pvCount} deyimsel fiil · ${pvEntries.length} ünite`;
  }

  const passages = typeof READING_PASSAGES !== 'undefined' ? READING_PASSAGES : [];
  const totalRead = passages.length;
  const doneRead = typeof readingLearnedWords !== 'undefined'
    ? Object.keys(readingLearnedWords).filter(k => readingLearnedWords[k]).length
    : 0;
  const readBadge = document.getElementById('reading-count-badge');
  const readSub = document.getElementById('home-reading-sub');
  if (readBadge && totalRead > 0) {
    readBadge.textContent = `${doneRead}/${totalRead}`;
    readBadge.style.display = 'inline-block';
  }
  if (readSub && totalRead > 0) {
    readSub.textContent = doneRead > 0
      ? `${doneRead}/${totalRead} metin tamamlandı`
      : `${totalRead} seviyelendirilmiş okuma metni`;
  }

  let totalUnitWords = 0;
  for (let u = 1; u <= 10; u++) {
    if (UNITS[u] && UNITS[u].words) totalUnitWords += UNITS[u].words.length;
  }
  const dictEnMeta = document.getElementById('dict-en-meta');
  if (dictEnMeta && totalUnitWords > 0) {
    dictEnMeta.textContent = `${totalUnitWords}+ Akademik Kelime`;
  }
  const histLen = typeof dictHistory !== 'undefined' ? dictHistory.length : 0;
  const dictTrMeta = document.getElementById('dict-tr-meta');
  if (dictTrMeta) {
    dictTrMeta.textContent = histLen > 0 ? `${histLen} son arama · Anında` : 'Anında Çift Yönlü Arama';
  }
}

function renderHome() {
  renderBookshelf();
  const shelfSection = document.getElementById('bookshelf-section');
  const unitsSection = document.getElementById('book-units-section');

  if (currentBookId) {
    if (shelfSection) shelfSection.style.display = 'none';
    if (unitsSection) unitsSection.style.display = 'flex';
    renderBookUnits(currentBookId);
  } else {
    if (shelfSection) shelfSection.style.display = 'flex';
    if (unitsSection) unitsSection.style.display = 'none';
  }

  updateErrorBadge();
  updateMyWordsBadge();
  updateHomeToolsMeta();
  if (typeof _srUpdateHomeCard === 'function') _srUpdateHomeCard();
  if (typeof renderHeaderProfileChip === 'function') renderHeaderProfileChip();
  if (typeof renderHomeLeaderboardCard === 'function') renderHomeLeaderboardCard();
  if (typeof _renderGoalCard === 'function') _renderGoalCard();
  if (typeof _renderHeaderBar === 'function') _renderHeaderBar();
  if (typeof _renderQuestsInHome === 'function') _renderQuestsInHome();
}

function filterUnits(type, el) {
  currentUnitFilter = type;
  document.querySelectorAll('#book-units-section .pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  applyUnitFilter(type);
}

function goHome() {
  clearGlobalSearch();
  showScreen('screen-home', 'back');
  renderHome();
}

window._unitStudyFilter = 'all';

function getUnitStudyPool(u) {
  const unit = UNITS[u];
  if (!unit || !unit.words) return [];
  if (window._unitStudyFilter === 'unlearned') {
    const learned = getLearnedSet(u);
    return unit.words.filter(w => !learned.has(w[0]));
  }
  return unit.words;
}

function setUnitStudyFilter(mode) {
  window._unitStudyFilter = mode === 'unlearned' ? 'unlearned' : 'all';
  if (currentUnit) _refreshUnitOverview(currentUnit);
}

function _refreshUnitOverview(u) {
  const unit = UNITS[u];
  if (!unit) return;
  const words = unit.words || [];
  const total = words.length;
  const learnedCount = getLearnedSet(u).size;
  const unlearnedCount = Math.max(0, total - learnedCount);
  const errCount = Object.values(errorBox).filter(e => String(e.unit) === String(u)).length;
  const pct = getProgressPct(u);

  const barEl = document.getElementById('unit-progress-bar');
  const txtEl = document.getElementById('unit-progress-txt');
  if (barEl) barEl.style.width = pct + '%';
  if (txtEl) txtEl.textContent = pct + '%';

  const statsEl = document.getElementById('unit-stats-pills');
  if (statsEl) {
    statsEl.innerHTML = `
      <span class="unit-stat-chip is-green">${icon('check', 12)} Öğrenilen: ${learnedCount}/${total}</span>
      <span class="unit-stat-chip is-blue">${icon('layers', 12)} Kalan: ${unlearnedCount}</span>
      ${errCount > 0 ? `<span class="unit-stat-chip is-red">${icon('alertTriangle', 12)} Hata: ${errCount}</span>` : ''}
    `;
  }

  if (window._unitStudyFilter === 'unlearned' && unlearnedCount === 0) {
    window._unitStudyFilter = 'all';
  }

  const filterEl = document.getElementById('unit-study-filter');
  if (filterEl) {
    filterEl.innerHTML = `
      <button type="button" class="unit-filter-btn ${window._unitStudyFilter === 'all' ? 'active' : ''}" onclick="setUnitStudyFilter('all')">Tüm Kelimeler (${total})</button>
      <button type="button" class="unit-filter-btn ${window._unitStudyFilter === 'unlearned' ? 'active' : ''}" onclick="setUnitStudyFilter('unlearned')" ${unlearnedCount === 0 ? 'disabled' : ''}>Öğrenilmeyenler (${unlearnedCount})</button>
    `;
  }

  const studyCount = window._unitStudyFilter === 'unlearned' && unlearnedCount > 0 ? unlearnedCount : total;
  const fibCount = words.filter(w => w[2]).length;
  const synCount = typeof getWordMeta === 'function' ? words.filter(w => getWordMeta(w[0]).synonyms.length >= 1).length : 0;
  const antCount = typeof getWordMeta === 'function' ? words.filter(w => getWordMeta(w[0]).antonyms.length >= 1).length : 0;

  const setMeta = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  setMeta('mode-meta-learn', `${total} Kelime · Sözlük`);
  setMeta('mode-meta-flash', `${studyCount} Kart`);
  setMeta('mode-meta-mc', `${studyCount} Soru`);
  setMeta('mode-meta-fib', `${fibCount} Cümle`);
  setMeta('mode-meta-syn', synCount >= 4 ? `${Math.min(synCount, 20)} Soru` : 'Yetersiz Veri');
  setMeta('mode-meta-ant', antCount >= 4 ? `${Math.min(antCount, 20)} Soru` : 'Yetersiz Veri');
  setMeta('mode-meta-speed', `${Math.min(total, 25)} Soru · 10sn`);
}

function openUnit(u) {
  if (!u || !UNITS[u]) { goHome(); return; }
  if (!currentBookId) {
    const matchingBook = BOOKS.find(b => b.units.includes(Number(u)));
    if (matchingBook) currentBookId = matchingBook.id;
  }
  currentUnit = u;
  showScreen('screen-unit', 'forward');
  document.getElementById('unit-screen-title').textContent = `Ünite ${u}`;
  document.getElementById('unit-screen-sub').textContent = UNITS[u].words.length + ' kelime';
  _refreshUnitOverview(u);
}


function toggleMixModes(el) {
  const dropdown = document.getElementById('mix-mode-dropdown');
  const wasHidden = dropdown.style.display === 'none';
  dropdown.style.display = wasHidden ? 'block' : 'none';
  const caret = el.querySelector('.mix-mode-caret');
  if (caret) caret.innerHTML = wasHidden ? icon('chevronUp', 18) : icon('chevronDown', 18);
}

function closeMixDropdown(selectedLabel) {
  const dropdown = document.getElementById('mix-mode-dropdown');
  const label = document.getElementById('mix-mode-label');
  const caret = document.querySelector('.mix-mode-caret');
  if (dropdown) dropdown.style.display = 'none';
  if (label && selectedLabel) label.textContent = selectedLabel;
  if (caret) caret.innerHTML = icon('chevronDown', 18);
}

function getMixPool() {
  let pool = [];
  for (let u = 1; u <= 10; u++) {
    if (!UNITS[u]) continue;
    UNITS[u].words.forEach(w => {
      const wc = [...w];
      wc._unit = u;
      pool.push(wc);
    });
  }
  return shuffle(pool);
}

function startMixMC() {
  closeMixDropdown('Çoktan Seçmeli');
  const pool = getMixPool().slice(0, 40);
  startMC(pool, 'goHome()', 'Karışık Çoktan Seçmeli (40 Soru)');
}

function startMixFlash() {
  closeMixDropdown('Flash Kartlar');
  const pool = getMixPool().slice(0, 30);
  startFlash(pool, {
    backFn: 'goHome()',
    title: 'Karışık Flash Kartlar',
    unitTagFn: w => `Ünite ${w._unit}`
  });
}

function startMixFIB() {
  closeMixDropdown('Boşluk Doldur');
  const pool = getMixPool().filter(w => w[2]).slice(0, 20);
  if (pool.length === 0) { showToast('Örnek cümleli kelime bulunamadı!'); return; }
  startFIB('type', pool, 'goHome()', 'Karışık Boşluk Doldur');
}

function startMixSpeed() {
  closeMixDropdown('Hız Modu');
  const pool = getMixPool().slice(0, 25);
  if (pool.length === 0) { showToast('Kelime bulunamadı!'); return; }
  startSpeedMode(pool, 'goHome()', 'Karışık Hız Modu');
}

function showMixQuiz() {
  startMixMC();
}



function initTheme() {
  const saved = localStorage.getItem('ydt_theme');
  const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(isDark ? 'dark' : 'light');
  updateThemeBtn(isDark);
}

function toggleTheme() {
  const wasDark = document.documentElement.classList.contains('dark');
  const isDark = !wasDark;
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(isDark ? 'dark' : 'light');
  localStorage.setItem('ydt_theme', isDark ? 'dark' : 'light');
  updateThemeBtn(isDark);
}

function updateThemeBtn(isDark) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  btn.innerHTML = icon(isDark ? 'sun' : 'moon', 18);
  const label = isDark ? 'Açık temaya geç' : 'Koyu temaya geç';
  btn.title = label;
  btn.setAttribute('aria-label', label);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeWordModal();
    if (typeof closeMetaEdit === 'function') closeMetaEdit();
    const goalOverlay = document.getElementById('gm-goal-modal');
    if (goalOverlay) goalOverlay.remove();
    const authOverlay = document.getElementById('auth-modal-overlay');
    if (authOverlay) authOverlay.remove();
    const srStatsModal = document.getElementById('sr-stats-modal');
    if (srStatsModal) srStatsModal.remove();
    const statsOverlay = document.getElementById('stats-overlay');
    if (statsOverlay && statsOverlay.style.display === 'flex' && typeof closeStats === 'function') {
      closeStats();
    }
  }
});

window.addEventListener('scroll', () => {
  const sw = document.querySelector('.global-search-wrap');
  if (sw) sw.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (typeof initAuthAndProfile === 'function') initAuthAndProfile();
  if (typeof _initGamification === 'function') _initGamification();
  renderHome();
  if (typeof _renderQuestsInHome === 'function') _renderQuestsInHome();
  updateErrorBadge();
  updateMyWordsBadge();
  if (typeof _checkAchievements === 'function') _checkAchievements();
  if (typeof updatePWAInstallUI === 'function') updatePWAInstallUI();

  if (!localStorage.getItem('ydt_onboarding_done') && typeof _showOnboarding === 'function') {
    setTimeout(() => _showOnboarding(), 800);
  }
});
