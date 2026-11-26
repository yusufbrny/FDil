// Custom personal vocabulary manager and practice modes

function showAddWord(editIdx) {
  editingWordIndex = (editIdx !== undefined && editIdx !== null) ? editIdx : null;
  const isEdit = editingWordIndex !== null;
  const existing = isEdit ? customVocab[editingWordIndex] : null;
  const s = document.getElementById('screen-mywords');
  showScreen('screen-mywords');

  const initMeanings = existing && existing.meanings && existing.meanings.length > 0
    ? existing.meanings : [''];

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="showMyWords()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${isEdit ? icon('edit', 18) + ' Kelimeyi Düzenle' : icon('plus', 18) + ' Yeni Kelime Ekle'}</div>
        <div class="unit-sub">Birden fazla anlam ekleyebilirsin</div>
      </div>
    </div>
    <div class="add-word-wrap">
      <div class="add-word-field">
        <div class="add-word-label">İngilizce Kelime</div>
        <input class="add-word-input" id="aw-word" placeholder="örn: perseverance" value="${esc(existing ? existing.word : '')}" autocomplete="off" autocapitalize="none" spellcheck="false">
      </div>
      <div class="add-word-field">
        <div class="add-word-label">Türkçe Anlamlar</div>
        <div class="meanings-list" id="meanings-list">
          ${initMeanings.map((m, i) => `
            <div class="meaning-row" id="mrow-${i}">
              <span class="meaning-num">${i + 1}.</span>
              <input class="add-word-input" placeholder="anlam ${i + 1}" value="${esc(m)}" id="m-${i}" autocomplete="off">
              ${initMeanings.length > 1 ? `<button class="remove-meaning-btn" onclick="removeMeaning(${i})">−</button>` : ''}
            </div>
          `).join('')}
        </div>
        <button class="add-meaning-btn" onclick="addMeaning()">+ Başka Bir Anlam Ekle</button>
      </div>
      <div class="add-word-field">
        <div class="add-word-label">Örnek Cümle <span style="color:var(--text3);font-weight:400;text-transform:none;font-size:11px">(isteğe bağlı)</span></div>
        <input class="add-word-input" id="aw-example" placeholder="örn: Her perseverance paid off." value="${esc(existing ? (existing.example || '') : '')}" autocomplete="off" spellcheck="false">
      </div>
      <button class="save-word-btn" onclick="saveCustomWord()">${isEdit ? icon('save', 16) + ' Değişiklikleri Kaydet' : icon('check', 16) + ' Kelimeyi Kaydet'}</button>
      ${isEdit ? `<button style="background:transparent;border:1.5px solid var(--error);color:var(--error);border-radius:14px;padding:14px;font-size:14px;font-weight:700;width:100%;margin-top:0;cursor:pointer" onclick="deleteCustomWord(${editingWordIndex})">${icon('trash', 15)} Bu Kelimeyi Sil</button>` : ''}
    </div>
  `;
}

function addMeaning() {
  const list = document.getElementById('meanings-list');
  if (!list) return;
  const rows = list.querySelectorAll('.meaning-row');
  const count = rows.length;
  if (count >= 8) { showToast('En fazla 8 anlam ekleyebilirsin!'); return; }
  const vals = [...rows].map(r => r.querySelector('input').value);
  vals.push('');
  list.innerHTML = vals.map((v, i) => `
    <div class="meaning-row" id="mrow-${i}">
      <span class="meaning-num">${i + 1}.</span>
      <input class="add-word-input" placeholder="anlam ${i + 1}" value="${esc(v)}" id="m-${i}" autocomplete="off">
      <button class="remove-meaning-btn" onclick="removeMeaning(${i})">−</button>
    </div>
  `).join('');
  const newInp = document.getElementById('m-' + count);
  if (newInp) newInp.focus();
}

function removeMeaning(idx) {
  const list = document.getElementById('meanings-list');
  const rows = list.querySelectorAll('.meaning-row');
  if (rows.length <= 1) { showToast('En az bir anlam olmalı!'); return; }
  const vals = [...rows].map(r => r.querySelector('input').value);
  vals.splice(idx, 1);
  list.innerHTML = vals.map((v, i) => `
    <div class="meaning-row" id="mrow-${i}">
      <span class="meaning-num">${i + 1}.</span>
      <input class="add-word-input" placeholder="anlam ${i + 1}" value="${esc(v)}" id="m-${i}" autocomplete="off">
      ${vals.length > 1 ? `<button class="remove-meaning-btn" onclick="removeMeaning(${i})">−</button>` : ''}
    </div>
  `).join('');
}

function saveCustomWord() {
  const wordInput = document.getElementById('aw-word');
  const exampleInput = document.getElementById('aw-example');
  const list = document.getElementById('meanings-list');
  const word = wordInput ? wordInput.value.trim() : '';
  const example = exampleInput ? exampleInput.value.trim() : '';
  const meanings = list ? [...list.querySelectorAll('input')].map(i => i.value.trim()).filter(v => v.length > 0) : [];

  if (!word) { showToast('İngilizce kelimeyi boş bırakamazsın!'); if (wordInput) wordInput.focus(); return; }
  if (meanings.length === 0) { showToast('En az bir anlam girmelisin!'); return; }

  if (editingWordIndex === null) {
    const exists = customVocab.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (exists) { showToast('Bu kelime zaten listende var!'); return; }
    customVocab.push({ word, meanings, example });
    _trackQuestStat('customAdded', true);
    showToast('"' + word + '" eklendi!');
  } else {
    customVocab[editingWordIndex] = { word, meanings, example };
    showToast('Kelime güncellendi!');
  }

  saveVocab();
  editingWordIndex = null;
  showMyWords();
}

function deleteCustomWord(idx) {
  const w = customVocab[idx] ? customVocab[idx].word : '';
  if (!confirm('"' + w + '" silinsin mi?')) return;
  customVocab.splice(idx, 1);
  saveVocab();
  showToast('Kelime silindi.');
  showMyWords();
}

// ===== MY WORDS LIST =====
function showMyWords() {
  const s = document.getElementById('screen-mywords');
  showScreen('screen-mywords');
  renderMyWords(s);
}

function renderMyWords(s) {
  s = s || document.getElementById('screen-mywords');
  const count = customVocab.length;

  if (count === 0) {
    s.innerHTML = `
      <div class="unit-header">
        <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
        <div><div class="unit-title-h">${icon('fileText', 18)} Kişisel Kelimelerim</div></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;text-align:center">
        <div style="color:var(--text3)">${icon('inbox', 52)}</div>
        <div style="font-size:18px;font-weight:700;color:var(--text)">Henüz kelime eklenmemiş</div>
        <div style="font-size:14px;color:var(--text3)">Bilmediğin kelimeleri birden fazla anlamıyla ekle</div>
        <button class="save-word-btn" style="max-width:280px" onclick="showAddWord()">${icon('plus', 16)} İlk Kelimeyi Ekle</button>
      </div>`;
    return;
  }

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('fileText', 18)} Kişisel Kelimelerim</div>
        <div class="unit-sub">${count} kelime</div>
      </div>
      <button class="header-btn" onclick="showAddWord()" style="padding:6px 10px" aria-label="Yeni kelime ekle">${icon('plus', 18)}</button>
    </div>
    <div class="learn-wrap">
      <div style="display:flex;gap:10px;margin-bottom:4px;flex-shrink:0">
        <button class="result-btn" style="padding:10px 14px;font-size:13px;flex:1" onclick="startMyWordsFlash()">${icon('layers', 15)} Flash</button>
        <button class="result-btn outline" style="padding:10px 14px;font-size:13px;flex:1" onclick="startMyWordsMC()">${icon('checkCircle', 15)} Test</button>
      </div>
      <div class="learn-list">
        ${customVocab.map((entry, i) => `
          <div class="learn-item" style="cursor:default">
            <div class="learn-item-header">
              <div class="learn-word" style="color:var(--accent)">${esc(entry.word)}</div>
              <button onclick="showAddWord(${i})" style="background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:8px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer">${icon('edit', 14)} Düzenle</button>
            </div>
            <div class="learn-meanings" style="margin-top:4px">
              ${entry.meanings.length === 1
      ? '<span style="color:var(--text2)">' + esc(entry.meanings[0]) + '</span>'
      : entry.meanings.map((m, j) => '<div style="display:flex;align-items:center;gap:6px;margin-top:2px"><span style="background:var(--accent);color:var(--on-accent);border-radius:50%;width:18px;height:18px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">' + (j + 1) + '</span><span style="color:var(--text2);font-size:14px">' + esc(m) + '</span></div>').join('')}
            </div>
            ${entry.example ? '<div style="font-size:12px;color:var(--text3);margin-top:6px;font-style:italic;padding-left:4px">"' + esc(entry.example) + '"</div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>`;
}

function getMyWordsAsCards() {
  return customVocab.map(e => {
    const arr = [e.word, e.meanings.join(' / '), e.example || ''];
    arr._isCustom = true;
    return arr;
  });
}

function startMyWordsFlash() {
  if (customVocab.length === 0) { showToast('Kelime yok!'); return; }
  currentCards = shuffle(getMyWordsAsCards());
  cardIndex = 0; known = []; unknown = [];
  _fcSwiping = false;
  _flashBackFn = 'showMyWords()';
  _flashTitle = 'Kişisel Kelimelerim';
  _flashUnitTagFn = () => 'Kişisel';
  renderFlash();
  showScreen('screen-flash');
}

function startMyWordsMC() {
  if (customVocab.length < 4) { showToast('Test için en az 4 kelime ekle!'); return; }
  const pool = shuffle(getMyWordsAsCards());
  startMC(pool, 'showMyWords()', 'Kelime Testi');
}


