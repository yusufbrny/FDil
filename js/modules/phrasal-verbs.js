// Phrasal Verbs learning and quiz module
// ===== PHRASAL VERBS SCREEN =====
let pvCurrentUnit = 1;
let pvSearchTimer = null;

function showPhrasalVerbs(unit) {
  pvCurrentUnit = unit || 1;
  showScreen('screen-phrasal');
  renderPhrasalVerbs('');
}

function renderPhrasalVerbs(filter) {
  const s = document.getElementById('screen-phrasal');
  const unitKeys = Object.keys(PHRASAL_VERBS).map(Number);
  // pvCurrentUnit=0 means "all"
  const list = pvCurrentUnit === 0
    ? Object.values(PHRASAL_VERBS).flat()
    : (PHRASAL_VERBS[pvCurrentUnit] || []);
  const norm = filter.trim().toLowerCase();
  const filtered = norm
    ? list.filter(p => p.pv.toLowerCase().includes(norm) || p.tr.toLowerCase().includes(norm))
    : list;

  const allTabHtml = `<button class="pill ${pvCurrentUnit === 0 ? 'active' : ''}" onclick="pvCurrentUnit=0;renderPhrasalVerbs(document.getElementById('pv-search').value)" style="${pvCurrentUnit === 0 ? 'background:var(--accent);color:var(--on-accent);border-color:var(--accent)' : ''}">Tümü</button>`;
  const tabsHtml = unitKeys.map(u => `
    <button class="pill ${u === pvCurrentUnit ? 'active' : ''}" onclick="pvCurrentUnit=${u};renderPhrasalVerbs(document.getElementById('pv-search').value)" style="${u === pvCurrentUnit ? 'background:var(--accent);color:var(--on-accent);border-color:var(--accent)' : ''}">Ünite ${u}</button>
  `).join('');

  const itemsHtml = filtered.length === 0
    ? `<div style="text-align:center;color:var(--text3);padding:32px">Sonuç bulunamadı.</div>`
    : filtered.map((p, i) => `
      <div class="pv-item" onclick="togglePV(this)" data-idx="${i}">
        <div class="pv-header">
          <div class="pv-verb">${esc(p.pv)}</div>
          <span class="learn-expand">${icon('chevronRight', 15)}</span>
        </div>
        <div class="pv-tr">${esc(p.tr.split('\n')[0])}${p.tr.includes('\n') ? ' <span style="color:var(--text3);font-size:11px">+daha</span>' : ''}</div>
        <div class="pv-detail" style="display:none">
          ${p.tr.split('\n').length > 1 ? `<div style="margin-bottom:10px">${p.tr.split('\n').map((t, j) => `<div style="font-size:13px;color:var(--text2);padding:2px 0"><span style="color:#e67e22;font-weight:700">${j + 1}.</span> ${esc(t.replace(/^\d+\.\s*/, ''))}</div>`).join('')}</div>` : `<div style="font-size:13px;color:var(--text2);margin-bottom:10px">${esc(p.tr)}</div>`}
          ${p.ex ? `<div style="font-style:italic;font-size:13px;color:var(--text3);background:var(--bg);padding:10px 12px;border-radius:10px;line-height:1.5">"${esc(p.ex)}"</div>` : ''}
        </div>
      </div>
    `).join('');

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('link', 18)} Phrasal Verbs</div>
        <div class="unit-sub">${filtered.length} / ${list.length} deyimsel fiil</div>
      </div>
    </div>
    <div class="learn-wrap" style="gap:0;padding-bottom:16px">
      <div style="padding:12px 16px 0;flex-shrink:0">
        <input class="learn-search" id="pv-search" placeholder="Phrasal verb veya Türkçe ara..." 
          oninput="clearTimeout(pvSearchTimer);pvSearchTimer=setTimeout(()=>renderPhrasalVerbs(this.value),200)" 
          value="${esc(filter)}" style="margin-bottom:10px">
        <div class="pills" style="flex-wrap:nowrap;overflow-x:auto;padding-bottom:8px;gap:6px">
          ${allTabHtml}${tabsHtml}
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px">
          <button style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:var(--card);border:1.5px solid rgba(230,126,34,0.3);border-radius:12px;padding:10px 6px;font-size:12px;font-weight:700;color:#e67e22;cursor:pointer;transition:all 0.2s" onclick="startPVFlash()" onmouseover="this.style.background='rgba(230,126,34,0.06)'" onmouseout="this.style.background='var(--card)'">
            <span class="pv-action-icon">${icon('layers', 20)}</span>Flash Kartlar
          </button>
          <button style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:var(--card);border:1.5px solid rgba(230,126,34,0.3);border-radius:12px;padding:10px 6px;font-size:12px;font-weight:700;color:#e67e22;cursor:pointer;transition:all 0.2s" onclick="startPVQuiz()" onmouseover="this.style.background='rgba(230,126,34,0.06)'" onmouseout="this.style.background='var(--card)'">
            <span class="pv-action-icon">${icon('checkCircle', 20)}</span>Çoktan Seçmeli
          </button>
          <button style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:var(--card);border:1.5px solid rgba(230,126,34,0.3);border-radius:12px;padding:10px 6px;font-size:12px;font-weight:700;color:#e67e22;cursor:pointer;transition:all 0.2s" onclick="startPVFib()" onmouseover="this.style.background='rgba(230,126,34,0.06)'" onmouseout="this.style.background='var(--card)'">
            <span class="pv-action-icon">${icon('penLine', 20)}</span>Boşluk Doldur
          </button>
        </div>
      </div>
      <div class="learn-list" style="margin-top:6px">${itemsHtml}</div>
    </div>
  `;
}

function togglePV(el) {
  const detail = el.querySelector('.pv-detail');
  const isOpen = detail.style.display !== 'none';
  document.querySelectorAll('#screen-phrasal .pv-detail').forEach(d => { d.style.display = 'none'; });
  document.querySelectorAll('#screen-phrasal .learn-item').forEach(item => item.classList.remove('open'));
  if (!isOpen) {
    detail.style.display = 'block';
    el.classList.add('open');
  }
}


function getPVPool() {
  if (pvCurrentUnit === 0) {
    let all = [];
    Object.entries(PHRASAL_VERBS).forEach(([u, arr]) => arr.forEach(p => all.push({ ...p, _unit: Number(u) })));
    return all;
  }
  return (PHRASAL_VERBS[pvCurrentUnit] || []).map(p => ({ ...p, _unit: pvCurrentUnit }));
}

// ===== PV FLASH (unified with regular flash) =====
function startPVFlash() {
  const pool = getPVPool();
  if (pool.length === 0) { showToast('Bu ünitede phrasal verb yok!'); return; }
  const adapted = pool.map(p => {
    const multiMeanings = p.tr.split('\n').map((t, i) => `${i + 1}. ${t.replace(/^\d+\.\s*/, '')}`).join(' / ');
    return [p.pv, multiMeanings, p.ex || '', p._unit];
  });
  currentCards = shuffle(adapted);
  cardIndex = 0; known = []; unknown = [];
  _fcSwiping = false;
  _flashBackFn = 'showPhrasalVerbs(pvCurrentUnit||1)';
  _flashTitle = 'PV Flash Kartlar';
  _flashUnitTagFn = w => `Ünite ${w._unit}`;
  _pvMode = true;
  renderFlash();
  showScreen('screen-flash');
}

// PV Flash uses the same swipeCard/flipCard as regular flash
// See startPVFlash above for the unified entry point

// ===== PV MULTIPLE CHOICE =====
let pvQuizCards = [], pvQuizIdx = 0, pvQuizScore = 0;

function startPVQuiz() {
  const pool = getPVPool();
  if (pool.length < 4) { showToast('Test için en az 4 phrasal verb gerekli!'); return; }
  pvQuizCards = shuffle(pool);
  pvQuizIdx = 0; pvQuizScore = 0;
  showScreen('screen-phrasal-quiz');
  renderPVQuiz();
}

function renderPVQuiz() {
  const s = document.getElementById('screen-phrasal-quiz');
  const total = pvQuizCards.length;
  if (pvQuizIdx >= total) { renderPVQuizResult(); return; }
  const card = pvQuizCards[pvQuizIdx];
  const pct = Math.round((pvQuizIdx / total) * 100);

  // Wrong options from all PVs
  const allPool = [];
  Object.values(PHRASAL_VERBS).forEach(arr => arr.forEach(p => { if (p.pv !== card.pv) allPool.push(p); }));
  const wrongOpts = shuffle(allPool).slice(0, 3);
  const opts = shuffle([card, ...wrongOpts]);
  const optId = 'pvq' + pvQuizIdx;

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="showPhrasalVerbs(pvCurrentUnit||1)" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('checkCircle', 18)} PV Çoktan Seçmeli</div>
        <div class="unit-sub">${pvQuizIdx + 1}/${total} · ${pvCurrentUnit === 0 ? 'Tümü' : 'Ünite ' + card._unit}</div>
      </div>
    </div>
    <div class="mc-wrap">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="mc-question">
        <div style="display:inline-block;background:rgba(230,126,34,0.12);color:#e67e22;border:1px solid rgba(230,126,34,0.25);border-radius:20px;padding:3px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Phrasal Verb</div>
        <div class="mc-q-word" style="color:#e67e22">${esc(card.pv)}</div>
        ${card.ex ? `<div class="mc-q-example">"${esc(card.ex)}"</div>` : ''}
      </div>
      <div class="mc-options" id="${optId}">
        ${opts.map(o => `
          <button class="mc-opt" data-pv="${escQ(o.pv)}"
            onclick="checkPVQuiz(this,'${optId}','${escQ(o.pv)}','${escQ(card.pv)}','${escQ(String(card._unit))}')">
            ${esc(o.tr.split('\n')[0])}
          </button>`).join('')}
      </div>
    </div>`;
}

function checkPVQuiz(btn, containerId, chosen, correct, unitVal) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.mc-opt').forEach(b => b.classList.add('disabled'));
  const errKey = 'pv_' + correct.replace(/\s+/g, '_');
  if (chosen === correct) {
    btn.classList.add('correct'); pvQuizScore++;
    if (pvErrors[errKey]) { delete pvErrors[errKey]; savePVErrors(); }
    setTimeout(() => { pvQuizIdx++; renderPVQuiz(); }, 1000);
  } else {
    btn.classList.add('wrong');
    container.querySelectorAll('.mc-opt').forEach(b => { if (b.dataset.pv === correct) b.classList.add('correct'); });
    pvErrors[errKey] = { pv: correct, tr: pvQuizCards[pvQuizIdx].tr.split('\n')[0], unit: parseInt(unitVal) || pvCurrentUnit };
    savePVErrors();
    setTimeout(() => { pvQuizIdx++; renderPVQuiz(); }, 1600);
  }
}

function renderPVQuizResult() {
  const s = document.getElementById('screen-phrasal-quiz');
  const total = pvQuizCards.length, pct = Math.round((pvQuizScore / total) * 100);
  s.innerHTML = `
    <div class="result-wrap">
      <div class="result-emoji">${pct >= 80 ? icon('target', 48) : pct >= 50 ? icon('thumbsUp', 48) : icon('info', 48)}</div>
      <div class="result-title">${pct}% Başarı</div>
      <div class="result-sub">${total} sorudan ${pvQuizScore} doğru</div>
      <div class="stat-row">
        <div class="stat-box"><div class="stat-num" style="color:var(--success)">${pvQuizScore}</div><div class="stat-lbl">Doğru</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--error)">${total - pvQuizScore}</div><div class="stat-lbl">Yanlış</div></div>
      </div>
      <button class="result-btn" onclick="startPVQuiz()">${icon('shuffle', 16)} Yeniden Başla</button>
      <button class="result-btn outline" onclick="showPhrasalVerbs(pvCurrentUnit||1)">${icon('arrowLeft', 16)} Geri Dön</button>
    </div>`;
}

// ===== PV FILL IN THE BLANK =====
let pvFibCards = [], pvFibIdx = 0, pvFibScore = 0;

function startPVFib() {
  const pool = getPVPool().filter(p => p.ex && p.ex.trim());
  if (pool.length === 0) { showToast('Bu ünitede örnek cümle olan phrasal verb yok!'); return; }
  pvFibCards = shuffle(pool);
  pvFibIdx = 0; pvFibScore = 0;
  showScreen('screen-phrasal-quiz');
  renderPVFib();
}

function renderPVFib() {
  const s = document.getElementById('screen-phrasal-quiz');
  const total = pvFibCards.length;
  if (pvFibIdx >= total) { renderPVFibResult(); return; }
  const card = pvFibCards[pvFibIdx];
  const pct = Math.round((pvFibIdx / total) * 100);

  // Mask the phrasal verb in the example sentence
  const pvEscaped = card.pv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sentence = card.ex.replace(new RegExp(pvEscaped, 'gi'), '<span class="fib-blank" style="min-width:90px">_____</span>');

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="showPhrasalVerbs(pvCurrentUnit||1)" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('penLine', 18)} PV Boşluk Doldur</div>
        <div class="unit-sub">${pvFibIdx + 1}/${total} · ${pvCurrentUnit === 0 ? 'Tümü' : 'Ünite ' + card._unit}</div>
      </div>
    </div>
    <div class="fib-wrap">
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="fib-question" style="border-color:var(--tone-amber-border)">
        <div class="mc-q-label" style="color:#e67e22">Cümledeki boşluğu doldurun</div>
        <div class="fib-sentence">${sentence}</div>
        <div class="fib-hint" style="margin-top:14px">
          Türkçe İpucu: <b style="color:#e67e22">${esc(card.tr.split('\n')[0])}</b>
        </div>
      </div>
      <div class="fib-input-area">
        <div class="fib-input-row">
          <input class="fib-input" id="pvfib-inp" placeholder="Phrasal verb'i yaz..." autocomplete="off" autocapitalize="none" spellcheck="false"
            onkeydown="if(event.key==='Enter')checkPVFib()">
          <button class="fib-submit" style="background:#e67e22;box-shadow:0 4px 12px rgba(230,126,34,0.3)" onclick="checkPVFib()">Kontrol</button>
        </div>
        <div id="pvfib-feedback"></div>
        <button id="pvfib-next-btn" class="fib-submit" style="display:none;width:100%;background:var(--text);color:var(--bg)" onclick="pvFibIdx++;renderPVFib()">Sonraki ${icon('arrowRight', 15)}</button>
      </div>
    </div>`;
  setTimeout(() => { const inp = document.getElementById('pvfib-inp'); if (inp) inp.focus(); }, 100);
}

function checkPVFib() {
  const inp = document.getElementById('pvfib-inp');
  const fb = document.getElementById('pvfib-feedback');
  const nextBtn = document.getElementById('pvfib-next-btn');
  if (!inp || inp.disabled) return;
  const answer = inp.value.trim().toLowerCase();
  if (!answer) { showToast('Cevap yazmalısınız!'); return; }
  const card = pvFibCards[pvFibIdx];
  const correct = card.pv.toLowerCase();
  inp.disabled = true;

  // Accept close matches (ignore articles, minor typos handled via includes)
  if (answer === correct || correct.includes(answer) && answer.length > correct.length - 3) {
    inp.classList.add('correct');
    fb.className = 'fib-feedback correct';
    fb.textContent = 'Harika! Doğru cevap.';
    pvFibScore++;
    const errKey = 'pv_' + card.pv.replace(/\s+/g, '_');
    if (pvErrors[errKey]) { delete pvErrors[errKey]; savePVErrors(); }
    setTimeout(() => { pvFibIdx++; renderPVFib(); }, 1200);
  } else {
    inp.classList.add('wrong');
    fb.className = 'fib-feedback wrong';
    fb.innerHTML = `${icon('x', 14)} Yanlış. Doğru cevap: <b style="color:#e67e22">${esc(card.pv)}</b>`;
    const errKey = 'pv_' + card.pv.replace(/\s+/g, '_');
    pvErrors[errKey] = { pv: card.pv, tr: card.tr.split('\n')[0], unit: card._unit };
    savePVErrors();
    nextBtn.style.display = 'block';
  }
}

function renderPVFibResult() {
  const s = document.getElementById('screen-phrasal-quiz');
  const total = pvFibCards.length, pct = Math.round((pvFibScore / total) * 100);
  s.innerHTML = `
    <div class="result-wrap">
      <div class="result-emoji">${pct >= 80 ? icon('sparkles', 48) : pct >= 50 ? icon('listChecks', 48) : icon('repeat', 48)}</div>
      <div class="result-title">${pct}% Başarı</div>
      <div class="result-sub">Boşluk Doldur · ${total} sorudan ${pvFibScore} doğru</div>
      <div class="stat-row">
        <div class="stat-box"><div class="stat-num" style="color:var(--success)">${pvFibScore}</div><div class="stat-lbl">Doğru</div></div>
        <div class="stat-box"><div class="stat-num" style="color:var(--error)">${total - pvFibScore}</div><div class="stat-lbl">Yanlış</div></div>
      </div>
      <button class="result-btn" style="background:#e67e22;box-shadow:0 4px 16px rgba(230,126,34,0.3)" onclick="startPVFib()">${icon('shuffle', 16)} Yeniden Başla</button>
      <button class="result-btn outline" onclick="showPhrasalVerbs(pvCurrentUnit||1)">${icon('arrowLeft', 16)} Geri Dön</button>
    </div>`;
}

