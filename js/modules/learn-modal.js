// Learn dictionary list, error box review, word detail & meta editor modals
let _learnFilter = 'all';
let _learnSort = 'default';
let _learnQuery = '';

function startLearn() {
  _learnFilter = 'all';
  _learnSort = 'default';
  _learnQuery = '';
  showScreen('screen-learn');
  renderLearn('');
}

function setLearnFilter(f) {
  _learnFilter = f || 'all';
  renderLearn(_learnQuery);
}

function toggleLearnSort() {
  _learnSort = _learnSort === 'default' ? 'az' : 'default';
  renderLearn(_learnQuery);
}

function toggleLearnWordState(e, unit, wordStr) {
  e.stopPropagation();
  const isLearned = getLearnedSet(unit).has(wordStr);
  if (isLearned) {
    markUnlearned(unit, wordStr);
    if (typeof playGameSFX === 'function') playGameSFX('undo');
    showToast('Öğrenilmedi olarak işaretlendi');
  } else {
    markLearned(unit, wordStr);
    if (typeof playGameSFX === 'function') playGameSFX('correct', 1);
    const btn = e.currentTarget;
    if (typeof _showXPBubble === 'function' && btn) _showXPBubble(btn, 5);
    showToast('Öğrenildi! +5 XP');
  }
  const listEl = document.querySelector('#screen-learn .learn-list');
  const prevScroll = listEl ? listEl.scrollTop : 0;
  renderLearn(_learnQuery);
  const newListEl = document.querySelector('#screen-learn .learn-list');
  if (newListEl) newListEl.scrollTop = prevScroll;
}

function renderLearn(filter) {
  _learnQuery = filter || '';
  const s = document.getElementById('screen-learn');
  if (!s || !UNITS[currentUnit]) return;

  const allWords = UNITS[currentUnit].words;
  const learnedSet = getLearnedSet(currentUnit);
  const errCount = allWords.filter(w => !!errorBox['u' + currentUnit + '_' + w[0]]).length;
  const learnedCount = learnedSet.size;
  const unlearnedCount = Math.max(0, allWords.length - learnedCount);

  const q = _learnQuery.trim().toLowerCase();
  let words = allWords.filter(w => {
    const matchesSearch = !q || w[0].toLowerCase().includes(q) || w[1].toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (_learnFilter === 'learned') return learnedSet.has(w[0]);
    if (_learnFilter === 'unlearned') return !learnedSet.has(w[0]);
    if (_learnFilter === 'error') return !!errorBox['u' + currentUnit + '_' + w[0]];
    return true;
  });

  if (_learnSort === 'az') {
    words = [...words].sort((a, b) => a[0].localeCompare(b[0]));
  }

  s.innerHTML = `
  <div class="unit-header">
    <button class="back-btn" onclick="openUnit(${currentUnit})" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div><div class="unit-title-h">Sözlük & Öğrenme</div><div class="unit-sub">Ünite ${currentUnit} · ${learnedCount}/${allWords.length} öğrenildi</div></div>
  </div>
  <div class="learn-wrap">
    <div class="learn-toolbar">
      <input class="learn-search" id="learn-search-inp" placeholder="İngilizce veya Türkçe ara..." oninput="debounceLearn(this.value)" value="${esc(_learnQuery)}">
      <button type="button" class="learn-sort-btn ${_learnSort === 'az' ? 'active' : ''}" onclick="toggleLearnSort()" title="Alfabetik sırala">
        ${_learnSort === 'az' ? 'A-Z' : 'Sıra'}
      </button>
    </div>
    <div class="learn-filter-pills">
      <button type="button" class="learn-filter-pill ${_learnFilter === 'all' ? 'active' : ''}" onclick="setLearnFilter('all')">Tümü (${allWords.length})</button>
      <button type="button" class="learn-filter-pill ${_learnFilter === 'unlearned' ? 'active' : ''}" onclick="setLearnFilter('unlearned')">Öğrenilecek (${unlearnedCount})</button>
      <button type="button" class="learn-filter-pill ${_learnFilter === 'learned' ? 'active' : ''}" onclick="setLearnFilter('learned')">Öğrenildi (${learnedCount})</button>
      ${errCount > 0 ? `<button type="button" class="learn-filter-pill is-err ${_learnFilter === 'error' ? 'active' : ''}" onclick="setLearnFilter('error')">Hatalar (${errCount})</button>` : ''}
    </div>
    <div class="learn-list">
      ${words.length === 0 ? '<div style="color:var(--text3);text-align:center;padding:24px">Sonuç bulunamadı.</div>' :
      words.map((w, i) => {
        const isLearned = learnedSet.has(w[0]);
        const isErr = !!errorBox['u' + currentUnit + '_' + w[0]];
        return `
        <div class="learn-item ${isLearned ? 'is-learned-card' : ''}" id="li${i}" data-word="${escQ(w[0])}" data-meaning="${escQ(w[1])}" data-example="${escQ(w[2] || '')}" onclick="toggleLearnMeta(this)">
          <div class="learn-item-header">
            <div class="learn-word-main">
              <div class="learn-word">${esc(w[0])}</div>
              ${isErr ? '<span class="learn-mini-tag is-err">Hatalı</span>' : isLearned ? '<span class="learn-mini-tag is-ok">Öğrenildi</span>' : ''}
            </div>
            <div class="learn-item-actions">
              <button type="button" class="learn-action-btn" onclick="event.stopPropagation();speakWord('${escQ(w[0])}')" title="Dinle" aria-label="Telaffuz dinle">${icon('volume', 14)}</button>
              <button type="button" class="learn-check-btn ${isLearned ? 'is-done' : ''}" onclick="toggleLearnWordState(event,${currentUnit},'${escQ(w[0])}')" title="${isLearned ? 'Öğrenildi işaretini kaldır' : 'Öğrendim olarak işaretle'}" aria-label="Öğrenme durumunu değiştir">${icon('check', 14)}</button>
              <span class="learn-expand">${icon('chevronRight', 15)}</span>
            </div>
          </div>
          <div class="learn-meanings">${esc(w[1])}</div>
          <div class="learn-detail"></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  if (_learnQuery) {
    const inp = document.getElementById('learn-search-inp');
    if (inp) {
      inp.focus();
      const len = inp.value.length;
      try { inp.setSelectionRange(len, len); } catch (e) { }
    }
  }
}

function debounceLearn(val) { clearTimeout(searchDebounceTimer); searchDebounceTimer = setTimeout(() => renderLearn(val), 250); }

// toggleLearnMeta is defined below (uses getWordMetaFull with user overrides)

function switchLearnTab(e, btn, tabId) {
  e.stopPropagation();
  const tabGroup = btn.closest('.learn-detail');
  tabGroup.querySelectorAll('.wdt-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  tabGroup.querySelectorAll('.word-detail-content').forEach(c => c.style.display = 'none');
  const safeTabId = tabId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const target = tabGroup.querySelector('#tab-' + safeTabId);
  if (target) target.style.display = 'block';
}

// -- Syn Quiz --

// ===== WORD DETAIL MODAL =====
// (openWordModal is defined at the bottom of the script with meta edit support)

function closeWordModal() {
  const overlay = document.getElementById('word-modal-overlay');
  const modal = overlay.querySelector('.word-modal');
  if (modal) modal.classList.add('closing');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('closing');
    if (modal) modal.classList.remove('closing');
    document.body.style.overflow = '';
  }, 220);
}


function showErrorBox() {
  showScreen('screen-error'); const s = document.getElementById('screen-error');
  const errors = Object.values(errorBox);
  if (errors.length === 0) {
    s.innerHTML = `
    <div class="unit-header"><button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button><div><div class="unit-title-h">${icon('archive', 18)} Hata Kumbarası</div></div></div>
    <div style="padding:40px 20px; text-align:center; color:var(--text3)">
      <div style="margin-bottom:16px;color:var(--success)">${icon('checkCircle', 48)}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text)">Hata kumbarası tertemiz!</div>
      <div style="font-size:14px;margin-top:8px">Harika gidiyorsun, tüm kelimeleri bildin.</div>
    </div>`; return;
  }
  s.innerHTML = `
  <div class="unit-header">
    <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
    <div><div class="unit-title-h">${icon('archive', 18)} Hata Kumbarası</div><div class="unit-sub">${errors.length} kelime birikti</div></div>
  </div>
  <div class="learn-wrap">
    <div style="display:flex;gap:12px;margin-bottom:8px">
      <button class="result-btn" style="padding:12px;font-size:14px" onclick="practiceErrors()">${icon('layers', 16)} Flash Çalış</button>
      <button class="result-btn outline" style="padding:12px;font-size:14px" onclick="practiceErrorsMC()">${icon('checkCircle', 16)} Test Çöz</button>
    </div>
    <div class="learn-list">
      ${errors.map(e => `
        <div class="learn-item" style="display:flex;justify-content:space-between;align-items:center;cursor:default">
          <div><div style="font-weight:700;color:var(--error);font-size:15px">${esc(e.word)}</div><div style="font-size:13px;color:var(--text2)">${esc(e.meaning)}</div></div>
          <span style="font-size:11px;background:var(--bg);padding:4px 8px;border-radius:8px;color:var(--text3)">Ünite ${esc(String(e.unit))}</span>
        </div>`).join('')}
    </div>
    <button style="background:transparent;border:1px solid var(--border);color:var(--text3);padding:12px;border-radius:12px;margin-top:auto" onclick="if(confirm('Tüm hatalar silinsin mi?')){errorBox={};saveErrors();showErrorBox();}">${icon('trash', 14)} Kumbarayı Temizle</button>
  </div>`;
}

function practiceErrors() {
  const errs = Object.values(errorBox); if (!errs.length) return;
  currentCards = shuffle(errs.map(e => { const w = [e.word, e.meaning, '']; w._unit = e.unit; w._fromErrors = true; return w; }));
  cardIndex = 0; known = []; unknown = [];
  _fcSwiping = false;
  _flashBackFn = 'showErrorBox()';
  _flashTitle = 'Hata Kumbarası - Flash';
  _flashUnitTagFn = w => `Ünite ${w._unit}`;
  renderFlash();
  showScreen('screen-flash');
}
function practiceErrorsMC() {
  const errs = Object.values(errorBox);
  if (errs.length < 4) { showToast('Test için en az 4 kelime olmalı!'); return; }
  const pool = shuffle(errs.map(e => {
    const w = [e.word, e.meaning, ''];
    if (e.unit && UNITS[e.unit]) w._unit = e.unit;
    if (e.weekId) w._weekId = e.weekId;
    return w;
  }));
  startMC(pool, 'showErrorBox()', 'Hata Kumbarası - Test');
}


// ===== META EDIT MODAL =====
function openMetaEdit(wordStr) {
  const meta = getWordMetaFull(wordStr);
  const modal = document.getElementById('meta-edit-content');
  modal.innerHTML = `
    <div class="word-modal-handle"></div>
    <div style="padding:20px 20px 0">
      <div style="font-size:18px;font-weight:800;color:var(--accent)">${esc(wordStr)}</div>
      <div style="font-size:13px;color:var(--text3);margin-bottom:16px">Eş anlam, zıt anlam ve kelime ailesini düzenle</div>
    </div>
    <div style="padding:0 20px 20px;display:flex;flex-direction:column;gap:16px">
      <div>
        <div class="add-word-label" style="margin-bottom:6px"><span class="status-dot success"></span> Eş Anlamlılar (virgülle ayır)</div>
        <input class="add-word-input" id="meta-syn" placeholder="örn: happy, joyful, glad"
          value="${esc(meta.synonyms.join(', '))}">
      </div>
      <div>
        <div class="add-word-label" style="margin-bottom:6px"><span class="status-dot danger"></span> Zıt Anlamlılar (virgülle ayır)</div>
        <input class="add-word-input" id="meta-ant" placeholder="örn: sad, unhappy, gloomy"
          value="${esc(meta.antonyms.join(', '))}">
      </div>
      <div>
        <div class="add-word-label" style="margin-bottom:6px"><span class="status-dot accent"></span> Kelime Ailesi (virgülle ayır)</div>
        <input class="add-word-input" id="meta-fam" placeholder="örn: happiness, happily"
          value="${esc(meta.family.join(', '))}">
      </div>
      <button class="save-word-btn" onclick="saveMetaEdit('${escQ(wordStr)}')">${icon('save', 16)} Kaydet</button>
      <button style="background:transparent;border:1.5px solid var(--border2);color:var(--text3);border-radius:14px;padding:14px;font-size:14px;font-weight:600;width:100%" onclick="closeMetaEdit()">İptal</button>
    </div>
  `;
  document.getElementById('meta-edit-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function saveMetaEdit(wordStr) {
  const synVal = document.getElementById('meta-syn').value.trim();
  const antVal = document.getElementById('meta-ant').value.trim();
  const famVal = document.getElementById('meta-fam').value.trim();
  const key = wordStr.toLowerCase().trim();
  userMeta[key] = {
    s: synVal ? synVal.split(',').map(x => x.trim()).filter(Boolean) : [],
    a: antVal ? antVal.split(',').map(x => x.trim()).filter(Boolean) : [],
    f: famVal ? famVal.split(',').map(x => x.trim()).filter(Boolean) : []
  };
  saveUserMeta();
  closeMetaEdit();
  showToast('Meta bilgisi güncellendi!');
  // Reopen word modal to show updated info
  openWordModal(wordStr);
}

function closeMetaEdit() {
  const overlay = document.getElementById('meta-edit-overlay');
  const modal = overlay.querySelector('.word-modal');
  if (modal) modal.classList.add('closing');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('closing');
    if (modal) modal.classList.remove('closing');
    document.body.style.overflow = '';
  }, 220);
}


const _webMetaCache = JSON.parse(localStorage.getItem('ydt_web_meta') || '{}');

async function enrichWordMetaFromWeb(wordStr) {
  const key = (wordStr || '').toLowerCase().trim();
  if (!key) return null;
  if (_webMetaCache[key]) return _webMetaCache[key];

  // Check if already in dictCache
  if (typeof dictCache !== 'undefined' && dictCache[key] && (dictCache[key].allSynonyms?.length || dictCache[key].allAntonyms?.length)) {
    const res = {
      synonyms: dictCache[key].allSynonyms.slice(0, 8),
      antonyms: dictCache[key].allAntonyms.slice(0, 8)
    };
    _webMetaCache[key] = res;
    return res;
  }

  try {
    const fetchFn = typeof fetchWithTimeout === 'function' ? fetchWithTimeout : fetch;
    const [synRes, antRes] = await Promise.allSettled([
      fetchFn(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(key)}&max=8`, {}, 2500).then(r => r.ok ? r.json() : []),
      fetchFn(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(key)}&max=8`, {}, 2500).then(r => r.ok ? r.json() : [])
    ]);
    const synonyms = synRes.status === 'fulfilled' && Array.isArray(synRes.value)
      ? synRes.value.map(x => x.word).filter(Boolean).slice(0, 8) : [];
    const antonyms = antRes.status === 'fulfilled' && Array.isArray(antRes.value)
      ? antRes.value.map(x => x.word).filter(Boolean).slice(0, 8) : [];

    const out = { synonyms, antonyms };
    if (synonyms.length > 0 || antonyms.length > 0) {
      _webMetaCache[key] = out;
      try { localStorage.setItem('ydt_web_meta', JSON.stringify(_webMetaCache)); } catch (e) { }
    }
    return out;
  } catch (e) {
    return null;
  }
}

function openWordModal(wordStr) {
  let foundWord = null, foundUnit = null;
  for (let u = 1; u <= 10; u++) {
    const w = UNITS[u].words.find(w => w[0] === wordStr);
    if (w) { foundWord = w; foundUnit = u; break; }
  }
  if (!foundWord) { openDictWord(wordStr); return; }

  const baseMeta = getWordMetaFull(wordStr);
  const webCached = _webMetaCache[wordStr.toLowerCase().trim()] || { synonyms: [], antonyms: [] };
  const mergedSyns = baseMeta.synonyms.length ? baseMeta.synonyms : webCached.synonyms;
  const mergedAnts = baseMeta.antonyms.length ? baseMeta.antonyms : webCached.antonyms;

  const isLearned = getLearnedSet(foundUnit).has(wordStr);
  const hasError = !!errorBox['u' + foundUnit + '_' + wordStr];

  const synHtml = mergedSyns.length
    ? mergedSyns.map(s => `<span class="word-chip syn" onclick="openWordModal('${escQ(s)}')">${esc(s)}</span>`).join('')
    : '<span style="color:var(--text3);font-size:13px">İnternetten kontrol ediliyor...</span>';
  const antHtml = mergedAnts.length
    ? mergedAnts.map(s => `<span class="word-chip ant" onclick="openWordModal('${escQ(s)}')">${esc(s)}</span>`).join('')
    : '<span style="color:var(--text3);font-size:13px">İnternetten kontrol ediliyor...</span>';
  const famHtml = baseMeta.family.length
    ? baseMeta.family.map(s => `<span class="word-chip fam" onclick="openWordModal('${escQ(s)}')">${esc(s)}</span>`).join('')
    : '<span style="color:var(--text3);font-size:13px">Veri yok</span>';

  const modal = document.getElementById('word-modal-content');
  modal.dataset.activeWord = wordStr;
  modal.innerHTML = `
    <div class="word-modal-handle"></div>
    <div class="word-modal-header">
      <div>
        <div class="word-modal-title-row">
          <div class="word-modal-title">${esc(foundWord[0])}</div>
          <button class="pronounce-btn" onclick="speakWord('${escQ(foundWord[0])}')" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 18)}</button>
        </div>
        <div class="word-modal-meaning">${esc(foundWord[1])}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
        <span class="word-modal-unit">Ünite ${foundUnit}</span>
        ${isLearned ? '<span style="font-size:11px;color:var(--success);font-weight:700">Öğrenildi</span>' : ''}
        ${hasError ? '<span style="font-size:11px;color:var(--error);font-weight:700">Hata Kutusunda</span>' : ''}
      </div>
    </div>
    ${foundWord[2] ? `<div class="word-modal-example">"${esc(foundWord[2])}"</div>` : ''}
    <div class="word-modal-divider"></div>
    <div class="word-modal-section">
      <div class="word-modal-section-title"><span class="status-dot success"></span> Eş Anlamlılar</div>
      <div class="word-modal-chips" id="modal-syn-chips">${synHtml}</div>
    </div>
    <div class="word-modal-section">
      <div class="word-modal-section-title"><span class="status-dot danger"></span> Zıt Anlamlılar</div>
      <div class="word-modal-chips" id="modal-ant-chips">${antHtml}</div>
    </div>
    <div class="word-modal-section">
      <div class="word-modal-section-title"><span class="status-dot accent"></span> Kelime Ailesi</div>
      <div class="word-modal-chips">${famHtml}</div>
    </div>
    <div class="word-modal-divider"></div>
    <div class="word-modal-actions" style="flex-wrap:wrap">
      ${isLearned
      ? `<button class="word-modal-btn" onclick="markUnlearned(${foundUnit},'${escQ(wordStr)}');closeWordModal();showToast('Öğrenilmedi olarak işaretlendi')">${icon('repeat', 15)} Geri Al</button>`
      : `<button class="word-modal-btn primary" onclick="markLearned(${foundUnit},'${escQ(wordStr)}');closeWordModal();showToast('Öğrenildi olarak işaretlendi!')">${icon('check', 15)} Öğrendim</button>`
    }
      <button class="word-modal-btn" onclick="closeWordModal();openDictWord('${escQ(wordStr)}','en')">${icon('globe', 15)} Sözlük</button>
      <button class="word-modal-btn" onclick="closeWordModal();openMetaEdit('${escQ(wordStr)}')">${icon('edit', 15)} Düzenle</button>
      <button class="word-modal-btn" onclick="closeWordModal()">Kapat</button>
    </div>
  `;

  const overlay = document.getElementById('word-modal-overlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (mergedSyns.length === 0 || mergedAnts.length === 0) {
    enrichWordMetaFromWeb(wordStr).then(web => {
      if (modal.dataset.activeWord !== wordStr) return;
      const synEl = document.getElementById('modal-syn-chips');
      const antEl = document.getElementById('modal-ant-chips');
      if (mergedSyns.length === 0 && synEl) {
        synEl.innerHTML = web?.synonyms?.length
          ? web.synonyms.map(s => `<span class="word-chip syn" onclick="openWordModal('${escQ(s)}')">${esc(s)}</span>`).join('')
          : '<span style="color:var(--text3);font-size:13px">Veri yok</span>';
      }
      if (mergedAnts.length === 0 && antEl) {
        antEl.innerHTML = web?.antonyms?.length
          ? web.antonyms.map(s => `<span class="word-chip ant" onclick="openWordModal('${escQ(s)}')">${esc(s)}</span>`).join('')
          : '<span style="color:var(--text3);font-size:13px">Veri yok</span>';
      }
    });
  }
}

function toggleLearnMeta(el) {
  const word = el.dataset.word;
  const meaning = el.dataset.meaning;
  const example = el.dataset.example;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.learn-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) {
    el.classList.add('open');
    const baseMeta = getWordMetaFull(word);
    const webCached = _webMetaCache[word.toLowerCase().trim()] || { synonyms: [], antonyms: [] };
    const mergedSyns = baseMeta.synonyms.length ? baseMeta.synonyms : webCached.synonyms;
    const mergedAnts = baseMeta.antonyms.length ? baseMeta.antonyms : webCached.antonyms;

    const detail = el.querySelector('.learn-detail');
    if (detail) {
      const synHtml = mergedSyns.length
        ? mergedSyns.map(s => `<span class="word-chip syn" onclick="event.stopPropagation();openDictWord('${escQ(s)}','en')">${esc(s)}</span>`).join('')
        : '<span style="color:var(--text3);font-size:12px">İnternetten aranıyor...</span>';
      const antHtml = mergedAnts.length
        ? mergedAnts.map(s => `<span class="word-chip ant" onclick="event.stopPropagation();openDictWord('${escQ(s)}','en')">${esc(s)}</span>`).join('')
        : '<span style="color:var(--text3);font-size:12px">İnternetten aranıyor...</span>';
      const famHtml = baseMeta.family.length
        ? baseMeta.family.map(s => `<span class="word-chip fam">${esc(s)}</span>`).join('')
        : '<span style="color:var(--text3);font-size:12px">Veri yok</span>';
      const safeId = word.replace(/[^a-zA-Z0-9]/g, '_');
      detail.innerHTML = `
        ${example && example !== 'undefined' ? `<div style="font-style:italic;color:var(--text3);margin-bottom:12px;background:var(--bg);padding:10px;border-radius:8px">"${typeof highlightTargetWord === 'function' ? highlightTargetWord(example, word) : esc(example)}"</div>` : ''}
        <div class="word-detail-tabs">
          <button class="wdt-tab active" onclick="switchLearnTab(event,this,'syn-${safeId}')">Eş Anlam</button>
          <button class="wdt-tab" onclick="switchLearnTab(event,this,'ant-${safeId}')">Zıt Anlam</button>
          <button class="wdt-tab" onclick="switchLearnTab(event,this,'fam-${safeId}')">Kelime Ailesi</button>
          <button class="wdt-tab" onclick="openDictWord('${escQ(word)}','en');event.stopPropagation()">${icon('globe', 13)} Sözlük</button>
          <button class="wdt-tab" onclick="openWordModal('${escQ(word)}');event.stopPropagation()">${icon('search', 13)} Detay</button>
        </div>
        <div class="word-detail-content" id="tab-syn-${safeId}">${synHtml}</div>
        <div class="word-detail-content" id="tab-ant-${safeId}" style="display:none">${antHtml}</div>
        <div class="word-detail-content" id="tab-fam-${safeId}" style="display:none">${famHtml}</div>
      `;

      if (mergedSyns.length === 0 || mergedAnts.length === 0) {
        enrichWordMetaFromWeb(word).then(web => {
          if (!el.classList.contains('open')) return;
          const synBox = detail.querySelector('#tab-syn-' + safeId);
          const antBox = detail.querySelector('#tab-ant-' + safeId);
          if (mergedSyns.length === 0 && synBox) {
            synBox.innerHTML = web?.synonyms?.length
              ? web.synonyms.map(s => `<span class="word-chip syn" onclick="event.stopPropagation();openDictWord('${escQ(s)}','en')">${esc(s)}</span>`).join('')
              : '<span style="color:var(--text3);font-size:12px">Veri yok</span>';
          }
          if (mergedAnts.length === 0 && antBox) {
            antBox.innerHTML = web?.antonyms?.length
              ? web.antonyms.map(s => `<span class="word-chip ant" onclick="event.stopPropagation();openDictWord('${escQ(s)}','en')">${esc(s)}</span>`).join('')
              : '<span style="color:var(--text3);font-size:12px">Veri yok</span>';
          }
        });
      }
    }
  }
}

