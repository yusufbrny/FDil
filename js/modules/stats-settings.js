// Statistics drawer, settings modal, data export/import, onboarding, and PWA install controls
// ===== STATS & UI FIXES =====
function showStats() {
  const overlay = document.getElementById('stats-overlay');
  const panel = overlay.querySelector('.stats-panel');
  overlay.style.display = 'flex';
  if (panel) panel.classList.remove('closing');
  overlay.classList.remove('closing');
  renderStatsContent();
}

function closeStats() {
  const overlay = document.getElementById('stats-overlay');
  const panel = overlay.querySelector('.stats-panel');
  if (panel) panel.classList.add('closing');
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('closing');
    if (panel) panel.classList.remove('closing');
  }, 200);
}

function renderStatsContent() {
  const totalWords = Object.values(UNITS).reduce((a, u) => a + u.words.length, 0);
  let learnedCount = 0;
  Object.values(progressRaw).forEach(arr => { learnedCount += arr.length; });
  const errCount = Object.keys(errorBox).length;
  const pvErrCount = Object.keys((typeof pvErrors !== 'undefined' ? pvErrors : null) || {}).length;
  const completePct = Math.round((learnedCount / totalWords) * 100) || 0;
  const remaining = totalWords - learnedCount;

  // Total PV count
  const totalPV = Object.values(PHRASAL_VERBS).reduce((a, arr) => a + arr.length, 0);

  // Best / worst unit
  let bestUnit = null, bestPct = -1, worstUnit = null, worstPct = 101;
  const unitStats = Object.entries(UNITS).map(([num, unit]) => {
    const learned = unit.words.filter(w => progressRaw[num] && progressRaw[num].includes(w[0])).length;
    const pct = Math.round((learned / unit.words.length) * 100);
    if (pct > bestPct) { bestPct = pct; bestUnit = num; }
    if (pct < worstPct) { worstPct = pct; worstUnit = num; }
    return { num, total: unit.words.length, learned, pct };
  });

  // SVG ring
  const circ = 2 * Math.PI * 45;
  const offset = circ - (completePct / 100) * circ;

  // Milestones
  const milestones = [
    { icon: 'trendingUp', label: '%10', earned: completePct >= 10 },
    { icon: 'trendingUp', label: '%25', earned: completePct >= 25 },
    { icon: 'award', label: '%50', earned: completePct >= 50 },
    { icon: 'star', label: '%75', earned: completePct >= 75 },
    { icon: 'award', label: '%90', earned: completePct >= 90 },
    { icon: 'trophy', label: '%100', earned: completePct >= 100 },
  ];

  const unitBarsHtml = unitStats.map(u => `
    <div class="stats-unit-row">
      <span class="stats-unit-label">Ünite ${u.num}</span>
      <div class="stats-unit-bar-wrap">
        <div class="stats-unit-bar-fill ${u.pct === 100 ? 'done' : ''}" style="width:${u.pct}%"></div>
      </div>
      <span class="stats-unit-pct">${u.pct}%</span>
      <span class="stats-unit-count">${u.learned}/${u.total}</span>
    </div>`).join('');

  const milestonesHtml = milestones.map(m => `
    <div class="stats-milestone ${m.earned ? 'earned' : ''}">
      <span class="stats-milestone-icon">${icon(m.icon, 16)}</span>
      <span>${m.label}</span>
    </div>`).join('');

  document.getElementById('stats-content').innerHTML = `
    <!-- Hero Ring -->
    <div class="stats-hero">
      <div class="stats-ring-wrap">
        <svg class="stats-ring-svg" viewBox="0 0 100 100">
          <circle class="stats-ring-bg" cx="50" cy="50" r="45"/>
          <circle class="stats-ring-fill" cx="50" cy="50" r="45"
            stroke-dasharray="${circ.toFixed(1)}"
            stroke-dashoffset="${offset.toFixed(1)}"/>
        </svg>
        <div class="stats-ring-center">
          <div class="stats-ring-pct">${completePct}%</div>
          <div class="stats-ring-lbl">Başarı</div>
        </div>
      </div>
      <div class="stats-hero-sub"><b>${learnedCount}</b> öğrenildi · <b>${remaining}</b> kaldı</div>
    </div>

    <!-- 6-card grid (2x3) -->
    <div class="stats-grid">
      <div class="stats-card green">
        <div class="stats-card-icon">${icon('checkCircle', 20)}</div>
        <div class="stats-card-num" style="color:var(--success)">${learnedCount}</div>
        <div class="stats-card-label">Öğrenilen</div>
      </div>
      <div class="stats-card red">
        <div class="stats-card-icon">${icon('alertTriangle', 20)}</div>
        <div class="stats-card-num" style="color:var(--error)">${errCount + pvErrCount}</div>
        <div class="stats-card-label">Hata Kumbarası</div>
      </div>
      <div class="stats-card blue">
        <div class="stats-card-icon">${icon('books', 20)}</div>
        <div class="stats-card-num" style="color:#3498db">${totalWords}</div>
        <div class="stats-card-label">Toplam Kelime</div>
      </div>
      <div class="stats-card accent">
        <div class="stats-card-icon">${icon('clock', 20)}</div>
        <div class="stats-card-num">${remaining}</div>
        <div class="stats-card-label">Kalan</div>
      </div>
      <div class="stats-card orange" style="grid-column: span 2">
        <div class="stats-card-icon">${icon('link', 20)}</div>
        <div class="stats-card-num" style="color:#e67e22">${totalPV}</div>
        <div class="stats-card-label">Toplam Phrasal Verb · ${pvErrCount} hata</div>
      </div>
    </div>

    <!-- Best / Worst -->
    ${bestUnit ? `
    <div style="display:flex;gap:10px;padding:0 16px 16px">
      <div style="flex:1;background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.2);border-radius:14px;padding:14px;text-align:center">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${icon('award', 12)} En İyi</div>
        <div style="font-size:16px;font-weight:800;color:var(--success)">Ünite ${bestUnit}</div>
        <div style="font-size:12px;color:var(--success);font-weight:600">${bestPct}%</div>
      </div>
      <div style="flex:1;background:rgba(231,76,60,0.06);border:1px solid rgba(231,76,60,0.18);border-radius:14px;padding:14px;text-align:center">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${icon('target', 12)} Çalışılacak</div>
        <div style="font-size:16px;font-weight:800;color:var(--error)">Ünite ${worstUnit}</div>
        <div style="font-size:12px;color:var(--error);font-weight:600">${worstPct}%</div>
      </div>
    </div>` : ''}

    <!-- Unit bars -->
    <div class="stats-section" style="border-top:1px solid var(--border);padding-top:20px">
      <div class="stats-section-title">${icon('barChart', 15)} Ünite Bazlı İlerleme</div>
      ${unitBarsHtml}
    </div>

    <!-- Milestones -->
    <div class="stats-section" style="border-top:1px solid var(--border);padding-top:20px">
      <div class="stats-section-title">${icon('award', 15)} Başarı Rozetleri</div>
      <div class="stats-milestones">
        ${milestonesHtml}
      </div>
    </div>

    <!-- Reset -->
    <button class="stats-reset-btn" onclick="if(confirm('Tüm kelime ilerlemesi sıfırlansın mı? Bu geri alınamaz!')){localStorage.removeItem('ydt_progress2');localStorage.removeItem('ydt_errors');localStorage.removeItem('ydt_pv_errors');location.reload()}">${icon('trash', 15)} Tüm İlerlemeyi Sıfırla</button>
  `;

  if (typeof _injectXPStats === 'function') _injectXPStats();
  const panel = document.getElementById('stats-panel');
  if (panel && typeof _renderAchievementsInStats === 'function') {
    _renderAchievementsInStats(panel.querySelector('.stats-panel') || panel);
  }
}

// Utilities

/* ────────────────────────────────────────────────────────────────
   ONSBOARDING FLOW
   ─────────────────────────────────────────────────────────────── */
const ONBOARDING_STEPS = [
  { icon: 'books', title: 'FDil\'e Hoş Geldin!', desc: 'YDT/DİL sınavı için kelime öğrenme uygulaması. Flash kartlar, testler ve spaced repetition ile etkili öğren.' },
  { icon: 'layers', title: 'Flash Kartlarla Öğren', desc: 'Kartı sağa kaydır = bildim, sola = bilmedim. Veya kartın üstüne tıkla veya çevir butonuna bas.' },
  { icon: 'zap', title: 'XP Kazan, Seviye Atla', desc: 'Doğru cevaplar XP kazandırır. Combo yaparsan XP\'nin katlanır! Günlük hedefini tamamla.' },
  { icon: 'trophy', title: 'Başarıları Aç', desc: 'Rozetleri kazan, görevleri tamamla ve YDT Şampiyonu ol! Öğrenmeye hazır mısın?' },
];

function _showOnboarding() {
  let step = 0;

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';

  function finishOnboarding() {
    localStorage.setItem('ydt_onboarding_done', 'true');
    overlay.remove();
  }

  function renderStep() {
    const data = ONBOARDING_STEPS[step];
    const isLast = step === ONBOARDING_STEPS.length - 1;
    overlay.innerHTML = `
            <div class="onboarding-card">
                <div class="onboarding-icon">${icon(data.icon, 44)}</div>
                <div class="onboarding-title">${data.title}</div>
                <div class="onboarding-desc">${data.desc}</div>
                <div class="onboarding-dots">
                    ${ONBOARDING_STEPS.map((_, i) => `<div class="onboarding-dot ${i === step ? 'active' : ''}" data-step="${i}" style="cursor:pointer;"></div>`).join('')}
                </div>
                <button class="onboarding-btn">${isLast ? `Başla! ${icon('rocket', 16)}` : 'Devam'}</button>
                ${!isLast ? `<button class="onboarding-skip">Atla</button>` : ''}
            </div>
        `;

    overlay.querySelector('.onboarding-btn').onclick = () => {
      if (isLast) {
        finishOnboarding();
      } else {
        step++;
        renderStep();
      }
    };

    const skipBtn = overlay.querySelector('.onboarding-skip');
    if (skipBtn) {
      skipBtn.onclick = finishOnboarding;
    }

    overlay.querySelectorAll('.onboarding-dot').forEach((dot, i) => {
      dot.onclick = () => {
        step = i;
        renderStep();
      };
    });
  }

  renderStep();
  document.body.appendChild(overlay);
}

window._showOnboarding = _showOnboarding;

/* ────────────────────────────────────────────────────────────────
   DATA EXPORT/IMPORT
   ─────────────────────────────────────────────────────────────── */
function exportAllData() {
  const data = {
    version: 2,
    exportDate: new Date().toISOString(),
    xp: _xpData,
    streak: _streakData,
    goal: _goalData,
    progress: progressRaw,
    errors: errorBox,
    pvErrors: pvErrors,
    customVocab: customVocab,
    userMeta: userMeta,
    achievements: _achievementData,
    quests: { completedCount: _questData.completedCount },
    sr: typeof _srData !== 'undefined' ? _srData : {},
    readingLearnedWords: readingLearnedWords,
    dictHistory: dictHistory,
    streakFreeze: _streakFreezeAvailable,
    streakFreezeUsed: _streakFreezeUsed,
    prepProgress: typeof exportPrepProgress === 'function' ? exportPrepProgress() : [],
    notebook: typeof exportNotebookData === 'function' ? exportNotebookData() : null
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fdil-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Veriler dışa aktarıldı!');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (data.xp) { _xpData = data.xp; _saveXP(); }
      if (data.streak) { _streakData = data.streak; _saveStreak(); }
      if (data.goal) { _goalData = data.goal; _saveGoal(); }
      if (data.progress) { progressRaw = data.progress; saveProgress(); }
      if (data.errors) { errorBox = data.errors; saveErrors(); }
      if (data.pvErrors) { pvErrors = data.pvErrors; savePVErrors(); }
      if (data.customVocab) { customVocab = data.customVocab; saveVocab(); }
      if (data.userMeta) { userMeta = data.userMeta; saveUserMeta(); }
      if (data.achievements) { _achievementData = data.achievements; _saveAchievements(); }
      if (data.quests) { _questData.date = ''; _questData.completedCount = data.quests.completedCount || 0; _saveQuests(); }
      if (data.sr && typeof _srData !== 'undefined') { _srData = data.sr; _srSave(); }
      if (data.readingLearnedWords) { readingLearnedWords = data.readingLearnedWords; _saveReadingWords(); }
      if (data.dictHistory) { dictHistory = data.dictHistory; _saveDictHistory(); }
      if (data.streakFreeze !== undefined) { _streakFreezeAvailable = data.streakFreeze; localStorage.setItem('ydt_streak_freeze', _streakFreezeAvailable); }
      if (data.streakFreezeUsed !== undefined) { _streakFreezeUsed = data.streakFreezeUsed; localStorage.setItem('ydt_streak_freeze_used', _streakFreezeUsed); }
      if (data.prepProgress && typeof importPrepProgress === 'function') { importPrepProgress(data.prepProgress); }
      if (data.notebook && typeof importNotebookData === 'function') { importNotebookData(data.notebook); }

      _renderHUD();
      renderHome();
      _checkAchievements();
      showToast('Veriler içe aktarıldı!');
    } catch (err) {
      showToast('Dosya geçersiz!');
      console.error('Import error:', err);
    }
  };
  reader.readAsText(file);
}

window.exportAllData = exportAllData;
window.importData = importData;

/* ────────────────────────────────────────────────────────────────
   SETTINGS SCREEN
   ─────────────────────────────────────────────────────────────── */
function showSettings() {
  const overlay = document.createElement('div');
  overlay.className = 'word-modal-overlay';
  overlay.style.display = 'flex';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
        <div class="word-modal" style="max-height:85vh;overflow-y:auto;">
            <div class="word-modal-handle"></div>
            <div class="word-modal-header" style="padding:16px 24px 0;">
                <div class="word-modal-title" style="font-size:20px">${icon('settings', 20)} Ayarlar</div>
                <button onclick="this.closest('.word-modal-overlay').remove()" style="background:var(--bg);border:1px solid var(--border);border-radius:10px;width:32px;height:32px;font-size:16px;cursor:pointer" aria-label="Kapat">${icon('x', 16)}</button>
            </div>
            <div style="padding:16px 24px;">
                <div class="settings-section">
                    <div class="settings-section-title">${icon('save', 15)} Veri Yönetimi</div>
                    <div class="export-import-area">
                        <button class="export-btn" onclick="exportAllData()">
                            ${icon('download', 15)} Verileri Dışa Aktar
                        </button>
                        <label class="import-btn">
                            ${icon('upload', 15)} Verileri İçe Aktar
                            <input type="file" accept=".json" onchange="importData(this.files[0])" style="display:none">
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <div class="settings-section-title">${icon('snowflake', 15)} Streak Freeze</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-title">Mevcut Freeze Hakları</div>
                            <div class="settings-item-desc">Her 30 günlük streak için 1 freeze kazan</div>
                        </div>
                        <span class="streak-freeze-badge">${icon('snowflake', 14)} ${_streakFreezeAvailable}</span>
                    </div>
                    ${_streakFreezeAvailable > 0 ? `
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-title">Freeze Kullan</div>
                            <div class="settings-item-desc">Yarın çalışmasan da streak korunsun</div>
                        </div>
                        <button class="settings-btn" onclick="if(_useStreakFreeze()){showToast('Freeze aktif!');this.textContent='Aktif!';this.disabled=true;}">Aktive Et</button>
                    </div>
                    ` : ''}
                </div>
                
                <div class="settings-section">
                    <div class="settings-section-title">${icon('trash', 15)} Verileri Sil</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-title">Tüm İlerlemeyi Sıfırla</div>
                            <div class="settings-item-desc">XP, streak, achievement ve tüm ilerleme silinir</div>
                        </div>
                        <button class="settings-btn danger" onclick="if(confirm('Emin misin? Bu işlem geri alınamaz!')){localStorage.clear();location.reload();}">Sıfırla</button>
                    </div>
                </div>
                
                <div class="settings-section">
                    <div class="settings-section-title">${icon('smartphone', 15)} Uygulama</div>
                    <div class="settings-item">
                        <div class="settings-item-info">
                            <div class="settings-item-title">PWA Kurulumu</div>
                            <div class="settings-item-desc" id="pwa-install-status">Ana ekrana ekle ve offline çalıştır</div>
                        </div>
                        <button class="settings-btn" id="pwa-install-btn" onclick="installPWA()" style="display:none">${icon('download', 14)} Kur</button>
                    </div>
                    <div id="pwa-install-help" style="display:none;background:var(--bg);border-radius:12px;padding:16px;margin-top:8px">
                        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">${icon('smartphone', 15)} PWA Nasıl Kurulur?</div>
                        <div style="font-size:12px;color:var(--text2);line-height:1.8">
                            <div style="margin-bottom:8px"><b>Chrome/Edge:</b> Sağ üst menü > "Ana ekrana ekle" veya adres çubuğundaki + ikonu</div>
                            <div style="margin-bottom:8px"><b>Safari (iOS):</b> Paylaş butonu > "Ana Ekrana Ekle"</div>
                            <div style="margin-bottom:8px"><b>Firefox:</b> Sağ üst menü > "Uygulama kur" veya + ikonu</div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">
                    FDil v2.0 · YDT Kelime Öğrenme Platformu
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(overlay);
}

window.showSettings = showSettings;

// PWA Install Handler
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  pwaInstallable = true;
  updatePWAInstallUI();
  showPWAInstallBanner();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  pwaInstallable = false;
  updatePWAInstallUI();
  hidePWAInstallBanner();
  showToast('PWA kuruldu! Ana ekrandan açabilirsin');
});

function showPWAInstallBanner() {
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (localStorage.getItem('ydt_pwa_banner_dismissed')) return;

  const existing = document.getElementById('pwa-install-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#2e4d17,#3B5323);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:inherit';
  banner.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;flex:1">
            <span>${icon('smartphone', 24)}</span>
            <div>
                <div style="font-size:14px;font-weight:700;color:white">FDil'i Ana Ekrana Ekle</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.85)">Offline çalışsın, hızlı açılsın</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
            <button onclick="installPWA()" class="icon-inline" style="background:white;color:#2e4d17;border:none;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer">${icon('download', 14)} <span>Kur</span></button>
            <button onclick="dismissPWAInstallBanner()" style="background:rgba(255,255,255,0.2);color:white;border:none;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center" aria-label="Kapat">${icon('x', 16)}</button>
        </div>
    `;
  document.body.appendChild(banner);
}

function hidePWAInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
}

function dismissPWAInstallBanner() {
  hidePWAInstallBanner();
  localStorage.setItem('ydt_pwa_banner_dismissed', '1');
}

function updatePWAInstallUI() {
  setTimeout(() => {
    const btn = document.getElementById('pwa-install-btn');
    const status = document.getElementById('pwa-install-status');
    const help = document.getElementById('pwa-install-help');
    if (btn) {
      if (pwaInstallable && deferredPrompt) {
        btn.style.display = '';
        btn.innerHTML = `${icon('download', 14)} Kur`;
        if (status) status.textContent = 'Kurulum hazır!';
      } else if (window.matchMedia('(display-mode: standalone)').matches) {
        btn.style.display = 'none';
        if (status) status.textContent = 'PWA olarak açık';
      } else {
        btn.style.display = 'none';
        if (status) status.textContent = 'Tarayıcıda açık';
      }
    }
    if (help) {
      help.style.display = 'block';
    }
  }, 100);
}

async function installPWA() {
  dismissPWAInstallBanner();
  if (!deferredPrompt) {
    showToast('PWA kurulumu tarayıcı tarafından desteklenmiyor');
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    showToast('Kurulum başladı!');
  }
  deferredPrompt = null;
  pwaInstallable = false;
  updatePWAInstallUI();
}

