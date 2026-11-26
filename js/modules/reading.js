// Interactive reading comprehension passages and passage vocabulary practice
function showReading() {
  showScreen('screen-reading');
  renderReadingHome();
}

function renderReadingHome() {
  const s = document.getElementById('screen-reading');
  const completed = Object.keys(readingLearnedWords).filter(k => readingLearnedWords[k]).length;

  s.innerHTML = `
        <div class="unit-header">
            <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
            <div>
                <div class="unit-title-h">${icon('bookOpen', 18)} Günlük Reading</div>
                <div class="unit-sub">${completed}/${READING_PASSAGES.length} metin tamamlandı</div>
            </div>
        </div>
        <div class="general-wrap" style="padding:16px;overflow-y:auto">
            <div style="margin-bottom:20px">
                <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">Seviye: Başlangıç</div>
                <div style="display:grid;gap:10px">
                    ${READING_PASSAGES.filter(p => p.level === 'Beginner').map(p => `
                        <div class="home-card" onclick="openReading(${p.id})" style="border-color:rgba(46,204,113,0.4)">
                            <div>
                                <div class="home-card-title" style="color:var(--text)">${p.title}</div>
                                <div class="home-card-sub">${p.text.split(' ').length} kelime · ${p.level}</div>
                            </div>
                            ${readingLearnedWords[p.id] ? `<span style="color:var(--success)">${icon('checkCircle', 20)}</span>` : `<span style="color:#2ecc71">${icon('arrowRight', 18)}</span>`}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-bottom:20px">
                <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">Seviye: Orta</div>
                <div style="display:grid;gap:10px">
                    ${READING_PASSAGES.filter(p => p.level === 'Intermediate').map(p => `
                        <div class="home-card" onclick="openReading(${p.id})" style="border-color:rgba(241,196,15,0.4)">
                            <div>
                                <div class="home-card-title" style="color:var(--text)">${p.title}</div>
                                <div class="home-card-sub">${p.text.split(' ').length} kelime · ${p.level}</div>
                            </div>
                            ${readingLearnedWords[p.id] ? `<span style="color:var(--success)">${icon('checkCircle', 20)}</span>` : `<span style="color:#f1c40f">${icon('arrowRight', 18)}</span>`}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div>
                <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">Seviye: İleri</div>
                <div style="display:grid;gap:10px">
                    ${READING_PASSAGES.filter(p => p.level === 'Advanced').map(p => `
                        <div class="home-card" onclick="openReading(${p.id})" style="border-color:rgba(231,76,60,0.4)">
                            <div>
                                <div class="home-card-title" style="color:var(--text)">${p.title}</div>
                                <div class="home-card-sub">${p.text.split(' ').length} kelime · ${p.level}</div>
                            </div>
                            ${readingLearnedWords[p.id] ? `<span style="color:var(--success)">${icon('checkCircle', 20)}</span>` : `<span style="color:#e74c3c">${icon('arrowRight', 18)}</span>`}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

let readingFlashCards = [];
let readingFlashIdx = 0;
let readingFlashKnown = [];
let readingFlashUnknown = [];

function openReading(id) {
  const passage = READING_PASSAGES.find(p => p.id === id);
  if (!passage) return;
  const s = document.getElementById('screen-reading');
  const isDone = readingLearnedWords[id];

  const keywordsHtml = passage.keywords.map(w => {
    const knownWord = readingLearnedWords[passage.id + '_' + w];
    const style = knownWord
      ? 'background:rgba(46,204,113,0.15);border:1px solid rgba(46,204,113,0.4);border-radius:8px;padding:8px 10px;cursor:pointer;text-align:center;font-size:13px;font-weight:600;color:var(--success);display:flex;align-items:center;justify-content:space-between;gap:6px'
      : 'background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 10px;cursor:pointer;text-align:center;font-size:13px;font-weight:600;color:var(--accent);display:flex;align-items:center;justify-content:space-between;gap:6px';
    return `<div class="reading-kw ${knownWord ? 'known' : ''}" data-word="${w}" data-passage-id="${passage.id}" style="${style}">
            <span onclick="event.stopPropagation();showReadingWordPopup('${w}', this)">${w}</span>
            <span style="font-size:11px;opacity:0.7">${knownWord ? icon('check', 12) : ''}</span>
        </div>`;
  }).join('');

  s.innerHTML = `
        <div class="unit-header">
            <button class="back-btn" onclick="renderReadingHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
            <div>
                <div class="unit-title-h">${passage.title}</div>
                <div class="unit-sub">${passage.level} · ${passage.text.split(' ').length} kelime</div>
            </div>
            <button onclick="toggleReadingWord(this,'${passage.id}')" style="margin-left:auto;padding:6px 14px;background:${isDone ? 'var(--success)' : 'var(--card)'};color:${isDone ? 'white' : 'var(--text)'};border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer">
                ${isDone ? icon('check', 15) + ' Tamamlandı' : 'Tamamla'}
            </button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px">
            <div style="background:var(--card);border-radius:12px;padding:16px;border:1px solid var(--border)">
                <div style="font-size:15px;line-height:1.8;color:var(--text)">${passage.text}</div>
            </div>
            <div style="background:rgba(46,204,113,0.1);border-radius:12px;padding:16px;border:1px solid rgba(46,204,113,0.3)">
                <div style="font-size:12px;font-weight:700;color:var(--success);margin-bottom:6px">TÜRKÇE ÇEVIRI</div>
                <div style="font-size:14px;line-height:1.8;color:var(--text)">${passage.turkish}</div>
            </div>
            <div>
                <div style="font-size:12px;font-weight:700;color:var(--text3);margin-bottom:8px">${icon('books', 14)} KELİMELER (tıklayınca anlamı gör)</div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
                    ${keywordsHtml}
                </div>
            </div>
            <button onclick="startReadingFlash(${id})" style="width:100%;padding:14px;background:var(--tone-teal-bg);color:var(--tone-teal-fg);border:1.5px solid var(--tone-teal-border);border-radius:12px;font-size:14px;font-weight:700;cursor:pointer">
                ${icon('layers', 16)} Kelimeleri Flash Kartla Çalış
            </button>
        </div>
        <div id="reading-word-popup" style="display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:20px">
            <div id="reading-word-popup-card" style="background:var(--card);border-radius:20px;padding:24px;max-width:340px;width:100%;text-align:center"></div>
        </div>
    `;

  document.getElementById('reading-word-popup').addEventListener('click', function (e) {
    if (e.target === this) hideReadingWordPopup();
  });
}

async function showReadingWordPopup(word, el) {
  const popup = document.getElementById('reading-word-popup');
  const card = document.getElementById('reading-word-popup-card');
  card.innerHTML = `<div style="margin-bottom:8px;color:var(--accent)">${icon('search', 30)}</div><div class="spinner" style="margin:0 auto"></div><div style="color:var(--text3);margin-top:8px;font-size:13px">Aranıyor...</div>`;
  popup.style.display = 'flex';

  const kwElement = el.closest('.reading-kw');
  const passageId = kwElement?.dataset?.passageId;

  const data = await fetchDictData(word);
  if (!data) {
    card.innerHTML = `
            <div style="margin-bottom:8px;color:var(--error)">${icon('x', 30)}</div>
            <div style="font-size:18px;font-weight:800;color:var(--text)">${word}</div>
            <div style="color:var(--error);margin-top:8px">Anlam bulunamadı</div>
            <button onclick="hideReadingWordPopup()" style="margin-top:16px;padding:10px 24px;background:var(--accent);color:var(--on-accent);border:none;border-radius:10px;font-weight:600;cursor:pointer">Kapat</button>
        `;
    return;
  }

  const mainMeaning = data.meanings[0];
  const firstDef = mainMeaning?.definitions?.[0];
  const examples = mainMeaning?.examples?.slice(0, 1)[0];

  card.innerHTML = `
        <div style="font-size:40px;font-weight:800;color:var(--accent);margin-bottom:4px">${data.word}</div>
        ${data.phonetic ? `<div style="color:var(--text3);font-size:14px;font-style:italic;margin-bottom:12px">${data.phonetic}</div>` : ''}
        ${data.turkish ? `<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:12px">${data.turkish}</div>` : ''}
        ${firstDef ? `<div style="background:var(--bg);border-radius:10px;padding:12px;margin-bottom:12px;text-align:left">
            <div style="font-size:12px;color:var(--text3);margin-bottom:4px">${icon('bookOpen', 13)} Tanım</div>
            <div style="font-size:14px;color:var(--text);margin-bottom:6px">${firstDef.text}</div>
            ${firstDef.turkish ? `<div style="font-size:13px;color:var(--text2)" class="icon-inline">${icon('arrowRight', 12)} <span>${firstDef.turkish}</span></div>` : ''}
        </div>` : ''}
        ${examples ? `<div style="background:var(--tone-green-bg);border-radius:10px;padding:12px;margin-bottom:12px;text-align:left;border:1px solid var(--tone-green-border)">
            <div style="font-size:12px;color:var(--text3);margin-bottom:4px">${icon('messageSquare', 13)} Örnek</div>
            <div style="font-size:13px;color:var(--text);font-style:italic;margin-bottom:4px">"${examples.original}"</div>
            ${examples.turkish ? `<div style="font-size:13px;color:var(--text2)" class="icon-inline">${icon('arrowRight', 12)} <span>${examples.turkish}</span></div>` : ''}
        </div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:12px">
            ${data.audio ? `<button onclick="speakWord('${data.word}')" style="padding:8px 16px;background:var(--accent);color:var(--on-accent);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">${icon('volume', 15)} Seslendir</button>` : ''}
            <button onclick="dictSearchWord('${data.word}');hideReadingWordPopup()" style="padding:8px 16px;background:var(--card);color:var(--accent);border:1.5px solid var(--accent);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">${icon('bookOpen', 15)} Sözlükte Ara</button>
        </div>
        <button onclick="hideReadingWordPopup()" style="padding:10px 24px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:10px;font-weight:600;cursor:pointer">Kapat</button>
    `;

  if (kwElement) {
    const w = kwElement.dataset.word;
    const pId = kwElement.dataset.passageId;
    if (pId && w) {
      readingLearnedWords[pId + '_' + w] = true;
      _saveReadingWords();
    }
  }
}

function hideReadingWordPopup() {
  const popup = document.getElementById('reading-word-popup');
  if (popup) popup.style.display = 'none';
}

async function startReadingFlash(id) {
  const passage = READING_PASSAGES.find(p => p.id === id);
  if (!passage || passage.keywords.length === 0) { showToast('Bu metinde kelime yok!'); return; }

  showScreen('screen-reading');
  readingFlashCards = [];
  readingFlashIdx = 0;
  readingFlashKnown = [];
  readingFlashUnknown = [];

  for (const kw of passage.keywords) {
    const data = await fetchDictData(kw);
    readingFlashCards.push({
      word: kw,
      turkish: data?.turkish || '',
      definition: data?.meanings?.[0]?.definitions?.[0] || '',
      example: data?.meanings?.[0]?.example || ''
    });
  }

  readingFlashCards = shuffle(readingFlashCards);
  renderReadingFlash(id);
}

function renderReadingFlash(id) {
  const s = document.getElementById('screen-reading');
  if (readingFlashIdx >= readingFlashCards.length) {
    const known = readingFlashKnown.length;
    const total = readingFlashCards.length;
    s.innerHTML = `
            <div class="result-wrap">
                <div class="result-emoji">${known === total ? icon('trophy', 48) : known > total / 2 ? icon('award', 48) : icon('bookOpen', 48)}</div>
                <div class="result-title">${known === total ? 'Mükemmel!' : 'Sonuçlar'}</div>
                <div class="result-sub">${total} kelimeden ${known} tanesini bildiniz</div>
                <div class="stat-row">
                    <div class="stat-box"><div class="stat-num" style="color:var(--success)">${known}</div><div class="stat-lbl">Bildim</div></div>
                    <div class="stat-box"><div class="stat-num" style="color:var(--error)">${readingFlashUnknown.length}</div><div class="stat-lbl">Bilmedim</div></div>
                </div>
                ${readingFlashUnknown.length > 0 ? `<button class="result-btn" onclick="readingFlashCards=shuffle([...readingFlashUnknown]);readingFlashIdx=0;readingFlashKnown=[];readingFlashUnknown=[];renderReadingFlash(${id})">Bilemediklerimi Tekrar Et</button>` : ''}
                <button class="result-btn outline" onclick="openReading(${id})">${icon('arrowLeft', 16)} Geri Dön</button>
            </div>`;
    return;
  }

  const card = readingFlashCards[readingFlashIdx];
  const pct = Math.round((readingFlashIdx / readingFlashCards.length) * 100);

  s.innerHTML = `
        <div class="unit-header">
            <button class="back-btn" onclick="openReading(${id})" aria-label="Geri">${icon('arrowLeft', 18)}</button>
            <div>
                <div class="unit-title-h">${icon('layers', 18)} Reading Flash</div>
                <div class="unit-sub">${readingFlashIdx + 1}/${readingFlashCards.length}</div>
            </div>
        </div>
        <div class="flash-wrap">
            <div class="flash-progress-row">
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                <span class="flash-counter-badge">${readingFlashIdx + 1}/${readingFlashCards.length}</span>
            </div>
            <div class="flash-card-wrap">
                <div class="flash-card fc-enter" id="reading-fc" onclick="flipReadingCard()" role="button" tabindex="0" aria-pressed="false">
                    <div class="flash-face flash-front">
                        <div class="flash-face-body">
                          <div class="flash-hint">İngilizce</div>
                          <div class="flash-word-row">
                            <div class="flash-word">${esc(card.word)}</div>
                            <button type="button" class="pronounce-btn" onclick="event.stopPropagation();speakWord('${escQ(card.word)}')" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 18)}</button>
                          </div>
                        </div>
                        <div class="flash-flip-pill">${icon('refresh', 13)} <span>Tıkla ve Çevir · Anlamı Gör</span></div>
                    </div>
                    <div class="flash-face flash-back">
                        <div class="flash-face-top">
                          <div class="flash-back-word-chip">
                            <span>${esc(card.word)}</span>
                            <button type="button" class="pronounce-btn is-on-dark" onclick="event.stopPropagation();speakWord('${escQ(card.word)}')" title="Telaffuz dinle" aria-label="Telaffuz dinle">${icon('volume', 15)}</button>
                          </div>
                        </div>
                        <div class="flash-face-body">
                          <div class="flash-hint is-on-dark">Türkçe Anlamı</div>
                          <div class="flash-meaning">${esc(card.turkish) || 'Çeviri bulunamadı'}</div>
                          ${card.definition ? `<div class="flash-example">${esc(card.definition)}</div>` : ''}
                        </div>
                        <div class="flash-flip-pill is-back">${icon('refresh', 13)} <span>Tekrar Tıkla · Ön Yüze Dön</span></div>
                    </div>
                </div>
            </div>
            <button type="button" class="flash-flip-btn" onclick="event.stopPropagation();flipReadingCard()">${icon('refresh', 16)} Kartı Çevir</button>
            <div class="swipe-btn-row">
                <button type="button" class="swipe-btn wrong" onclick="readingFlashAnswer(false, ${id})">${icon('x', 16)} Bilmedim</button>
                <button type="button" class="swipe-btn right" onclick="readingFlashAnswer(true, ${id})">${icon('check', 16)} Bildim</button>
            </div>
        </div>`;
}

function flipReadingCard() {
  const fc = document.getElementById('reading-fc');
  if (!fc) return;
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
}

function readingFlashAnswer(known, id) {
  const card = readingFlashCards[readingFlashIdx];
  if (known) {
    readingFlashKnown.push(card);
  } else {
    readingFlashUnknown.push(card);
  }
  readingFlashIdx++;
  setTimeout(() => renderReadingFlash(id), 300);
}

function toggleReadingWord(btn, id) {
  readingLearnedWords[id] = !readingLearnedWords[id];
  _saveReadingWords();
  if (readingLearnedWords[id]) {
    btn.style.background = 'var(--success)';
    btn.style.color = 'white';
    btn.innerHTML = `${icon('check', 15)} Tamamlandı`;
    showToast('Metin tamamlandı!');
  } else {
    btn.style.background = 'var(--card)';
    btn.style.color = 'var(--text)';
    btn.textContent = 'Tamamla';
  }
}

