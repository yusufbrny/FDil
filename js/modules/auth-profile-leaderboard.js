// Authentication, Multi-Account Snapshot Storage, Comprehensive Profile Builder & Leaderboard

const AUTH_USERS_KEY = 'fdil_users_v1';
const AUTH_SESSION_KEY = 'fdil_session_v1';
const GUEST_PROFILE_KEY = 'fdil_guest_profile_v1';

const ACADEMIC_ROLES = [
  'YDT (YKS-Dil) Adayı',
  'Yüksek Lisans Adayı',
  'Doktora Öğrencisi',
  'TUS / DUS Adayı',
  'Arş. Gör. / Akademisyen',
  'Dil Tazminatı Adayı',
  'Üniversite Öğrencisi'
];

const FOCUS_AREA_OPTIONS = [
  { id: 'vocab', label: 'Akademik Kelime' },
  { id: 'grammar', label: 'Bağlaç & Dilbilgisi' },
  { id: 'reading', label: 'Reading Parçaları' },
  { id: 'translation', label: 'Çeviri Teknikleri' },
  { id: 'phrasal', label: 'Phrasal Verbs' }
];

const YDT_TARGET_DEPARTMENTS = [
  'İngilizce Öğretmenliği',
  'Mütercim-Tercümanlık',
  'İngiliz Dili ve Edebiyatı',
  'Çeviribilim (Boğaziçi / ODTÜ)',
  'Dilbilim / Amerikan Kültürü'
];

const YDS_TARGET_PURPOSES = [
  'Yüksek Lisans Başvurusu (55+)',
  'Doktora / Sanatta Yeterlik (65+)',
  'TUS / DUS / EUS Barajı (50–65+)',
  'Akademik Kadro / Doçentlik (70+)',
  'Kamu Dil Tazminatı B/A (80–90+)'
];

const LEAGUE_TIERS = [
  { id: 'diamond', name: 'Elmas Profesör Ligi', minWeekly: 1200, color: '#38BDF8', icon: 'diamond' },
  { id: 'emerald', name: 'Zümrüt Akademi Ligi', minWeekly: 750, color: '#2ECC71', icon: 'crown' },
  { id: 'gold', name: 'Altın Yüksek Lisans Ligi', minWeekly: 400, color: '#F1C40F', icon: 'trophy' },
  { id: 'silver', name: 'Gümüş Hazırlık Ligi', minWeekly: 150, color: '#94A3B8', icon: 'award' },
  { id: 'bronze', name: 'Bronz Başlangıç Ligi', minWeekly: 0, color: '#CD7F32', icon: 'star' }
];

function _defaultExamDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 95);
  return d.toISOString().slice(0, 10);
}

function _createDefaultProfile() {
  return {
    id: 'guest',
    isGuest: true,
    name: 'Misafir Öğrenci',
    username: 'misafir',
    email: '',
    role: 'Yüksek Lisans Adayı',
    examType: 'YOKDIL',
    examBranch: 'saglik',
    currentLevel: 'B1',
    targetScore: 70,
    targetYdtNet: 65,
    targetTytNet: 70,
    obpScore: 85,
    targetDepartment: 'İngilizce Öğretmenliği',
    targetPurpose: 'Yüksek Lisans Başvurusu (55+)',
    examDate: _defaultExamDateStr(),
    dailyGoal: 20,
    quizGoal: 15,
    avatar: 'classic',
    focusAreas: ['vocab', 'reading', 'grammar'],
    bio: 'Hedef netime ve puanıma düzenli kelime ve okuma pratikleriyle hazırlanıyorum.'
  };
}

function _hashPass(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 'h_' + (h >>> 0).toString(16);
}

function _getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function _saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function _getSessionUserId() {
  return localStorage.getItem(AUTH_SESSION_KEY) || null;
}

function _setSessionUserId(userId) {
  if (userId) localStorage.setItem(AUTH_SESSION_KEY, userId);
  else localStorage.removeItem(AUTH_SESSION_KEY);
}

function getActiveProfile() {
  const uid = _getSessionUserId();
  if (uid) {
    const u = _getUsers().find(x => x.id === uid);
    if (u) return { ...u, isGuest: false };
  }
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_PROFILE_KEY) || 'null');
    if (raw) return { ..._createDefaultProfile(), ...raw, isGuest: true };
  } catch (e) { }
  return _createDefaultProfile();
}

function _saveGuestProfile(p) {
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(p));
}

function formatProfileTargetShort(profile) {
  const p = profile || getActiveProfile();
  if (p.examType === 'YDT') return `Hedef ${p.targetYdtNet || 65} Net`;
  return `Hedef ${p.targetScore || 70} Puan`;
}

function getExamDisplayBadge(profile) {
  const p = profile || getActiveProfile();
  const branchMap = { saglik: 'Sağlık', fen: 'Fen', sosyal: 'Sosyal', ydt_dil: 'YKS-Dil', genel: 'Akademik' };
  const br = branchMap[p.examBranch] || 'Genel';
  if (p.examType === 'YDT') return `YDT (YKS-Dil) · Hedef ${p.targetYdtNet || 65} Net`;
  if (p.examType === 'YDS') return `YDS · Hedef ${p.targetScore || 70} Puan`;
  if (p.examType === 'BOTH') return `YDT (${p.targetYdtNet || 65}N) · YDS/YÖKDİL (${p.targetScore || 70}P)`;
  return `YÖKDİL ${br} · Hedef ${p.targetScore || 70} Puan`;
}

function getTrackKeyForProfile(p) {
  if (!p) return 'YOKDIL_saglik';
  if (p.examType === 'YDT') return 'YDT';
  if (p.examType === 'YDS') return 'YDS';
  if (p.examBranch === 'fen') return 'YOKDIL_fen';
  if (p.examBranch === 'sosyal') return 'YOKDIL_sosyal';
  return 'YOKDIL_saglik';
}

/* ── PER-USER SNAPSHOT PERSISTENCE ── */
function _collectCurrentRuntimeSnapshot() {
  const questCopy = typeof _questData !== 'undefined' ? { ..._questData } : {};
  if (questCopy.stats && questCopy.stats.modesUsed instanceof Set) {
    questCopy.stats = { ...questCopy.stats, modesUsed: [...questCopy.stats.modesUsed] };
  }
  return {
    xp: typeof _xpData !== 'undefined' ? _xpData : { xp: 0, level: 0 },
    streak: typeof _streakData !== 'undefined' ? _streakData : { streak: 0, lastDate: '', longest: 0 },
    goal: typeof _goalData !== 'undefined' ? _goalData : { target: 20, today: '', count: 0 },
    progress: typeof progressRaw !== 'undefined' ? progressRaw : {},
    errors: typeof errorBox !== 'undefined' ? errorBox : {},
    pvErrors: typeof pvErrors !== 'undefined' ? pvErrors : {},
    customVocab: typeof customVocab !== 'undefined' ? customVocab : [],
    achievements: typeof _achievementData !== 'undefined' ? _achievementData : { earned: [], shown: [] },
    quests: questCopy,
    sr: typeof _srData !== 'undefined' ? _srData : {},
    streakFreeze: typeof _streakFreezeAvailable !== 'undefined' ? _streakFreezeAvailable : 0,
    streakFreezeUsed: typeof _streakFreezeUsed !== 'undefined' ? _streakFreezeUsed : 0,
    mockTrials: (() => { try { return JSON.parse(localStorage.getItem('fdil_mock_trials_v1') || '[]'); } catch (e) { return []; } })()
  };
}

function saveUserSnapshot(userId) {
  if (!userId) return;
  const snap = _collectCurrentRuntimeSnapshot();
  localStorage.setItem('fdil_userdata_' + userId, JSON.stringify(snap));
}

function _applySnapshotToRuntime(snap) {
  if (typeof _xpData !== 'undefined') {
    _xpData = snap.xp || { xp: 0, level: 0 };
    if (typeof _saveXP === 'function') _saveXP();
  }
  if (typeof _streakData !== 'undefined') {
    _streakData = snap.streak || { streak: 0, lastDate: '', longest: 0 };
    if (typeof _saveStreak === 'function') _saveStreak();
  }
  if (typeof _goalData !== 'undefined') {
    _goalData = snap.goal || { target: 20, today: '', count: 0, quizTarget: 15, quizCount: 0, history: {}, weeklyXP: 0, streakDays: 0 };
    if (typeof _saveGoal === 'function') _saveGoal();
  }
  if (typeof progressRaw !== 'undefined') {
    progressRaw = snap.progress || {};
    if (typeof saveProgress === 'function') saveProgress();
  }
  if (typeof errorBox !== 'undefined') {
    errorBox = snap.errors || {};
    if (typeof saveErrors === 'function') saveErrors();
  }
  if (typeof pvErrors !== 'undefined') {
    pvErrors = snap.pvErrors || {};
    if (typeof savePVErrors === 'function') savePVErrors();
  }
  if (typeof customVocab !== 'undefined') {
    customVocab = snap.customVocab || [];
    if (typeof saveVocab === 'function') saveVocab();
  }
  if (typeof _achievementData !== 'undefined') {
    _achievementData = snap.achievements || { earned: [], shown: [] };
    if (typeof _saveAchievements === 'function') _saveAchievements();
  }
  if (typeof _questData !== 'undefined') {
    _questData = snap.quests || { date: '', active: [], completed: [], completedCount: 0 };
    if (_questData.stats && Array.isArray(_questData.stats.modesUsed)) {
      _questData.stats.modesUsed = new Set(_questData.stats.modesUsed);
    }
    if (typeof _saveQuests === 'function') _saveQuests();
  }
  if (typeof _srData !== 'undefined') {
    _srData = snap.sr || {};
    if (typeof _srSave === 'function') _srSave();
  }
  if (typeof _streakFreezeAvailable !== 'undefined') {
    _streakFreezeAvailable = snap.streakFreeze || 0;
    localStorage.setItem('ydt_streak_freeze', _streakFreezeAvailable);
  }
  if (typeof _streakFreezeUsed !== 'undefined') {
    _streakFreezeUsed = snap.streakFreezeUsed || 0;
    localStorage.setItem('ydt_streak_freeze_used', _streakFreezeUsed);
  }
  try {
    localStorage.setItem('fdil_mock_trials_v1', JSON.stringify(Array.isArray(snap.mockTrials) ? snap.mockTrials : []));
  } catch (e) { }
}

function loadUserSnapshot(userId) {
  if (!userId) return;
  const raw = localStorage.getItem('fdil_userdata_' + userId);
  if (raw) {
    try {
      _applySnapshotToRuntime(JSON.parse(raw));
    } catch (e) { }
  } else {
    _applySnapshotToRuntime({});
    saveUserSnapshot(userId);
  }
}

function syncActiveUserStats() {
  const uid = _getSessionUserId();
  if (!uid) return;
  const users = _getUsers();
  const idx = users.findIndex(u => u.id === uid);
  if (idx === -1) return;

  const xp = typeof _xpData !== 'undefined' ? (_xpData.xp || 0) : 0;
  const lvl = typeof _getLevelForXP === 'function' ? _getLevelForXP(xp) : 0;
  const streak = typeof _streakData !== 'undefined' ? (_streakData.streak || 0) : 0;
  const longest = typeof _streakData !== 'undefined' ? (_streakData.longest || 0) : 0;
  const learnedCount = typeof getTotalLearned === 'function' ? getTotalLearned() : 0;
  const weeklyXP = typeof _goalData !== 'undefined' ? (_goalData.weeklyXP || 0) : 0;
  const goalStreak = typeof _goalData !== 'undefined' ? (_goalData.streakDays || 0) : 0;

  users[idx].stats = {
    xp,
    level: lvl,
    streak,
    longestStreak: longest,
    learnedCount,
    weeklyXP,
    goalStreak,
    updatedAt: new Date().toISOString()
  };
  _saveUsers(users);
  saveUserSnapshot(uid);
}

/* ── HEADER CHIP & HOME CARD ── */
function renderHeaderProfileChip() {
  const btn = document.getElementById('header-profile-btn');
  const examBadge = document.getElementById('header-exam-badge');
  const p = getActiveProfile();

  if (examBadge) {
    examBadge.textContent = p.examType === 'YDT'
      ? 'YDT Koçu'
      : p.examType === 'YDS'
        ? 'YDS Koçu'
        : p.examType === 'BOTH' ? 'YDT · YDS · YÖKDİL' : 'YÖKDİL Koçu';
  }

  if (!btn) return;
  const avatarSvg = typeof getDonkeyAvatarSVG === 'function'
    ? getDonkeyAvatarSVG(p.avatar || 'classic', 26)
    : '';
  const label = p.isGuest ? 'Giriş / Profil' : (p.name.split(' ')[0] || p.username);

  btn.innerHTML = `
    <span class="hdr-avatar-wrap">${avatarSvg}</span>
    <span class="hdr-profile-name">${esc(label)}</span>
  `;
  btn.title = p.isGuest ? 'Giriş yap veya Profil oluştur' : `${p.name} (@${p.username})`;
}

function openProfileOrAuth() {
  const uid = _getSessionUserId();
  if (uid) {
    showProfileScreen();
  } else {
    openAuthModal('login');
  }
}

/* ── AUTH MODAL (LOGIN & 3-STEP REGISTER / PROFILE WIZARD) ── */
let _authTab = 'login';
let _regStep = 1;
let _regDraft = null;

function openAuthModal(defaultTab = 'login') {
  const old = document.getElementById('auth-modal-overlay');
  if (old) old.remove();

  _authTab = defaultTab;
  _regStep = 1;
  const g = getActiveProfile();
  _regDraft = {
    name: '',
    username: '',
    email: '',
    password: '',
    role: g.role || 'Yüksek Lisans Adayı',
    examType: g.examType || 'YOKDIL',
    examBranch: g.examBranch || 'saglik',
    currentLevel: g.currentLevel || 'B1',
    targetScore: g.targetScore || 70,
    targetYdtNet: g.targetYdtNet || 65,
    targetTytNet: g.targetTytNet || 70,
    obpScore: g.obpScore || 85,
    targetDepartment: g.targetDepartment || 'İngilizce Öğretmenliği',
    targetPurpose: g.targetPurpose || 'Yüksek Lisans Başvurusu (55+)',
    examDate: g.examDate || _defaultExamDateStr(),
    dailyGoal: (typeof _goalData !== 'undefined' && _goalData.target) ? _goalData.target : 20,
    quizGoal: (typeof _goalData !== 'undefined' && _goalData.quizTarget) ? _goalData.quizTarget : 15,
    avatar: g.avatar || 'classic',
    focusAreas: g.focusAreas || ['vocab', 'reading', 'grammar']
  };

  const overlay = document.createElement('div');
  overlay.id = 'auth-modal-overlay';
  overlay.className = 'auth-modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeAuthModal(); };
  document.body.appendChild(overlay);
  _renderAuthModalContent();
  requestAnimationFrame(() => overlay.classList.add('show'));
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (overlay) overlay.remove();
}

function switchAuthTab(tab) {
  _authTab = tab;
  _renderAuthModalContent();
}

function _captureRegStepInputs() {
  if (!_regDraft) return;
  if (_regStep === 1) {
    const n = document.getElementById('reg-name');
    const u = document.getElementById('reg-username');
    const em = document.getElementById('reg-email');
    const pw = document.getElementById('reg-password');
    const rl = document.getElementById('reg-role');
    if (n) _regDraft.name = n.value.trim();
    if (u) _regDraft.username = u.value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (em) _regDraft.email = em.value.trim();
    if (pw) _regDraft.password = pw.value;
    if (rl) _regDraft.role = rl.value;
  } else if (_regStep === 2) {
    const dt = document.getElementById('reg-exam-date');
    const lv = document.getElementById('reg-level');
    const tyt = document.getElementById('reg-tyt-net');
    const dept = document.getElementById('reg-target-dept');
    const purp = document.getElementById('reg-target-purpose');
    if (dt && dt.value) _regDraft.examDate = dt.value;
    if (lv) _regDraft.currentLevel = lv.value;
    if (tyt) _regDraft.targetTytNet = Math.max(10, Math.min(120, parseInt(tyt.value, 10) || 70));
    if (dept) _regDraft.targetDepartment = dept.value;
    if (purp) _regDraft.targetPurpose = purp.value;
  } else if (_regStep === 3) {
    const dg = document.getElementById('reg-daily-goal');
    if (dg) _regDraft.dailyGoal = Math.max(5, Math.min(200, parseInt(dg.value, 10) || 20));
  }
}

function _renderAuthModalContent() {
  const overlay = document.getElementById('auth-modal-overlay');
  if (!overlay) return;

  const users = _getUsers();
  const mascotHero = typeof renderDonkeyMascot === 'function'
    ? renderDonkeyMascot('cozy', 64, _authTab === 'register' ? _regDraft.avatar : 'classic')
    : '';

  let bodyHtml = '';

  if (_authTab === 'login') {
    bodyHtml = `
      <form class="auth-form" onsubmit="event.preventDefault(); submitLoginForm();">
        <div class="auth-field">
          <label>Kullanıcı Adı veya E-posta</label>
          <input id="login-ident" type="text" placeholder="ornek_aday veya eposta@mail.com" required autocomplete="username">
        </div>
        <div class="auth-field">
          <label>Şifre</label>
          <input id="login-pass" type="password" placeholder="••••••••" required autocomplete="current-password">
        </div>
        <button type="submit" class="auth-submit-btn">${icon('checkCircle', 16)} Giriş Yap</button>
      </form>
      ${users.length > 0 ? `
        <div class="auth-saved-accounts">
          <div class="auth-saved-title">Bu Cihazdaki Kayıtlı Profiller</div>
          <div class="auth-saved-list">
            ${users.map(u => `
              <button type="button" class="auth-saved-chip" onclick="quickSwitchAccount('${escQ(u.id)}')">
                <span>${typeof getDonkeyAvatarSVG === 'function' ? getDonkeyAvatarSVG(u.avatar, 28) : ''}</span>
                <div>
                  <div class="auth-saved-name">${esc(u.name)}</div>
                  <div class="auth-saved-meta">@${esc(u.username)} · ${esc(getExamDisplayBadge(u))}</div>
                </div>
                ${icon('arrowRight', 14)}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
      <div class="auth-switch-hint">
        Henüz hesabın yok mu? <button type="button" onclick="switchAuthTab('register')">Kayıt Ol &amp; Profil Oluştur</button>
      </div>
    `;
  } else {
    // 3-step registration & profile builder
    const stepsNav = `
      <div class="auth-steps-bar">
        <div class="auth-step-pill ${_regStep === 1 ? 'active' : _regStep > 1 ? 'done' : ''}">1. Kimlik</div>
        <div class="auth-step-pill ${_regStep === 2 ? 'active' : _regStep > 2 ? 'done' : ''}">2. Sınav &amp; Hedef</div>
        <div class="auth-step-pill ${_regStep === 3 ? 'active' : ''}">3. Rutin &amp; Maskot</div>
      </div>
    `;

    if (_regStep === 1) {
      bodyHtml = `
        ${stepsNav}
        <div class="auth-form">
          <div class="auth-row-2">
            <div class="auth-field">
              <label>Ad Soyad</label>
              <input id="reg-name" type="text" value="${escQ(_regDraft.name)}" placeholder="Örn. Zeynep Kaya" required>
            </div>
            <div class="auth-field">
              <label>Kullanıcı Adı</label>
              <input id="reg-username" type="text" value="${escQ(_regDraft.username)}" placeholder="zeynep_ydt" required>
            </div>
          </div>
          <div class="auth-row-2">
            <div class="auth-field">
              <label>E-posta</label>
              <input id="reg-email" type="email" value="${escQ(_regDraft.email)}" placeholder="zeynep@uni.edu.tr">
            </div>
            <div class="auth-field">
              <label>Şifre (min 4 karakter)</label>
              <input id="reg-password" type="password" value="${escQ(_regDraft.password)}" placeholder="••••••" required>
            </div>
          </div>
          <div class="auth-field">
            <label>Akademik Unvan / Hazırlık Amacı</label>
            <select id="reg-role">
              ${ACADEMIC_ROLES.map(r => `<option value="${escQ(r)}" ${_regDraft.role === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
            </select>
          </div>
          <button type="button" class="auth-submit-btn" onclick="nextRegStep(2)">Devam Et: Sınavını Seç ${icon('arrowRight', 15)}</button>
        </div>
      `;
    } else if (_regStep === 2) {
      bodyHtml = `
        ${stepsNav}
        <div class="auth-form">
          <div class="auth-field">
            <label>Hangi Sınava Hazırlanıyorsun?</label>
            <div class="auth-choice-grid cols-2">
              ${[
                { id: 'YDT', title: 'YDT (YKS-Dil)', sub: 'Üniversite Dil · 120 Dk' },
                { id: 'YOKDIL', title: 'YÖKDİL', sub: 'Sağlık / Fen / Sosyal' },
                { id: 'YDS', title: 'YDS', sub: 'Genel Akademik' },
                { id: 'BOTH', title: 'Hepsi / Karma', sub: 'YDT · YDS · YÖKDİL' }
              ].map(ex => `
                <button type="button" class="auth-choice-card ${_regDraft.examType === ex.id ? 'active' : ''}" onclick="_setRegField('examType','${ex.id}')">
                  <strong>${ex.title}</strong>
                  <span>${ex.sub}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="auth-field">
            <label>Çalışma Alanın / Branşın</label>
            <div class="auth-choice-grid cols-2">
              ${[
                { id: 'ydt_dil', title: 'YKS-Dil (YDT Ortak)', sub: 'Situation · Diyalog · 12 Çeviri · Hız', span: true },
                { id: 'saglik', title: 'Sağlık Bilimleri', sub: 'Tıp, Eczacılık, Biyoloji' },
                { id: 'fen', title: 'Fen Bilimleri', sub: 'Mühendislik, Fizik, Doğa' },
                { id: 'sosyal', title: 'Sosyal Bilimler', sub: 'Tarih, Hukuk, İİBF, Edebiyat' },
                { id: 'genel', title: 'Genel Akademik', sub: 'YDS Karma Terminoloji' }
              ].map(br => `
                <button type="button" class="auth-choice-card ${br.span ? 'span-2' : ''} ${_regDraft.examBranch === br.id ? 'active' : ''}" onclick="_setRegField('examBranch','${br.id}')">
                  <strong>${br.title}</strong>
                  <span>${br.sub}</span>
                </button>
              `).join('')}
            </div>
          </div>

          ${_regDraft.examType === 'YDT' ? `
            <div class="auth-row-2">
              <div class="auth-field">
                <label>Hedef YDT Neti (/ 80 Soru)</label>
                <div class="auth-score-pills">
                  ${[50, 60, 65, 72, 76].map(n => `
                    <button type="button" class="auth-mini-pill ${_regDraft.targetYdtNet === n ? 'active' : ''}" onclick="_setRegField('targetYdtNet', ${n})">${n}+ Net</button>
                  `).join('')}
                </div>
              </div>
              <div class="auth-field">
                <label>Hedef TYT Neti (/ 120 Soru)</label>
                <input id="reg-tyt-net" type="number" min="20" max="120" value="${_regDraft.targetTytNet || 70}">
              </div>
            </div>
            <div class="auth-row-2">
              <div class="auth-field">
                <label>Hedef Üniversite Bölümü</label>
                <select id="reg-target-dept">
                  ${YDT_TARGET_DEPARTMENTS.map(d => `<option value="${escQ(d)}" ${_regDraft.targetDepartment === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
                </select>
              </div>
              <div class="auth-field">
                <label>Mevcut Seviye</label>
                <select id="reg-level">
                  ${['A2', 'B1', 'B2', 'C1'].map(lv => `<option value="${lv}" ${_regDraft.currentLevel === lv ? 'selected' : ''}>${lv} Seviyesi</option>`).join('')}
                </select>
              </div>
            </div>
          ` : `
            <div class="auth-row-2">
              <div class="auth-field">
                <label>Hedef Puan (/ 100)</label>
                <div class="auth-score-pills">
                  ${[55, 65, 70, 80, 90].map(sc => `
                    <button type="button" class="auth-mini-pill ${_regDraft.targetScore === sc ? 'active' : ''}" onclick="_setRegField('targetScore', ${sc})">${sc}+ Puan</button>
                  `).join('')}
                </div>
              </div>
              <div class="auth-field">
                <label>Mevcut Seviye</label>
                <select id="reg-level">
                  ${['A2', 'B1', 'B2', 'C1'].map(lv => `<option value="${lv}" ${_regDraft.currentLevel === lv ? 'selected' : ''}>${lv} Seviyesi</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="auth-field">
              <label>Kurum / Akademik Baraj Amacı</label>
              <select id="reg-target-purpose">
                ${YDS_TARGET_PURPOSES.map(pr => `<option value="${escQ(pr)}" ${_regDraft.targetPurpose === pr ? 'selected' : ''}>${esc(pr)}</option>`).join('')}
              </select>
            </div>
          `}

          <div class="auth-field">
            <label>Hedef Sınav Tarihi</label>
            <input id="reg-exam-date" type="date" value="${escQ(_regDraft.examDate)}">
          </div>

          <div class="auth-btn-row">
            <button type="button" class="auth-btn-sec" onclick="nextRegStep(1)">${icon('arrowLeft', 15)} Geri</button>
            <button type="button" class="auth-submit-btn" onclick="nextRegStep(3)">Son Adım: Maskot &amp; Hedef ${icon('arrowRight', 15)}</button>
          </div>
        </div>
      `;
    } else {
      const avatars = typeof MASCOT_AVATARS !== 'undefined' ? MASCOT_AVATARS : [];
      bodyHtml = `
        ${stepsNav}
        <div class="auth-form">
          <div class="auth-field">
            <label>Cozy Eşek Maskotunu Seç (Badem)</label>
            <div class="mascot-picker-grid">
              ${avatars.map(av => `
                <button type="button" class="mascot-pick-card ${_regDraft.avatar === av.id ? 'active' : ''}" onclick="_setRegField('avatar','${av.id}')">
                  ${typeof renderDonkeyMascot === 'function' ? renderDonkeyMascot('cozy', 52, av.id) : ''}
                  <span class="mascot-pick-name">${esc(av.name)}</span>
                  <span class="mascot-pick-sub">${esc(av.badge)}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="auth-field">
            <label>Günlük Kelime Hedefin</label>
            <div class="auth-score-pills">
              ${[15, 25, 40, 60].map(g => `
                <button type="button" class="auth-mini-pill ${_regDraft.dailyGoal === g ? 'active' : ''}" onclick="_setRegField('dailyGoal', ${g})">${g} Kelime</button>
              `).join('')}
            </div>
            <input id="reg-daily-goal" type="number" min="5" max="200" value="${_regDraft.dailyGoal}" style="margin-top:8px" placeholder="Özel günlük hedef">
          </div>

          <div class="auth-field">
            <label>Öncelikli Odak Alanların</label>
            <div class="auth-focus-chips">
              ${FOCUS_AREA_OPTIONS.map(f => {
                const active = (_regDraft.focusAreas || []).includes(f.id);
                return `<button type="button" class="auth-focus-chip ${active ? 'active' : ''}" onclick="_toggleRegFocus('${f.id}')">${active ? icon('check', 12) : ''} ${esc(f.label)}</button>`;
              }).join('')}
            </div>
          </div>

          <div class="auth-btn-row">
            <button type="button" class="auth-btn-sec" onclick="nextRegStep(2)">${icon('arrowLeft', 15)} Geri</button>
            <button type="button" class="auth-submit-btn" onclick="submitRegisterWizard()">${icon('sparkles', 16)} Hesabı Oluştur &amp; Başla!</button>
          </div>
        </div>
      `;
    }
  }

  overlay.innerHTML = `
    <div class="auth-modal-card">
      <button type="button" class="auth-close-x" onclick="closeAuthModal()" aria-label="Kapat">${icon('x', 18)}</button>
      <div class="auth-hero">
        <div class="auth-hero-mascot">${mascotHero}</div>
        <div>
          <div class="auth-hero-title">FDil · YDT · YDS · YÖKDİL Kulübü</div>
          <div class="auth-hero-sub">Kişisel sınav koçun, günlük hedeflerin ve liderlik tablosu tek yerde</div>
        </div>
      </div>
      <div class="auth-tabs">
        <button type="button" class="${_authTab === 'login' ? 'active' : ''}" onclick="switchAuthTab('login')">Giriş Yap</button>
        <button type="button" class="${_authTab === 'register' ? 'active' : ''}" onclick="switchAuthTab('register')">Kayıt Ol &amp; Profil Oluştur</button>
      </div>
      <div class="auth-body">${bodyHtml}</div>
    </div>
  `;
}

function _setRegField(key, val) {
  _captureRegStepInputs();
  _regDraft[key] = val;
  if (key === 'examType') {
    if (val === 'YDT') {
      _regDraft.examBranch = 'ydt_dil';
    } else if (val === 'YDS' && (_regDraft.examBranch === 'saglik' || _regDraft.examBranch === 'ydt_dil')) {
      _regDraft.examBranch = 'genel';
    } else if (val === 'YOKDIL' && (_regDraft.examBranch === 'genel' || _regDraft.examBranch === 'ydt_dil')) {
      _regDraft.examBranch = 'saglik';
    }
  }
  _renderAuthModalContent();
}

function _toggleRegFocus(id) {
  _captureRegStepInputs();
  const arr = _regDraft.focusAreas || [];
  if (arr.includes(id)) _regDraft.focusAreas = arr.filter(x => x !== id);
  else _regDraft.focusAreas = [...arr, id];
  _renderAuthModalContent();
}

function nextRegStep(step) {
  _captureRegStepInputs();
  if (_regStep === 1 && step > 1) {
    if (!_regDraft.name || _regDraft.name.length < 2) {
      showToast('Lütfen adını ve soyadını gir.');
      return;
    }
    if (!_regDraft.username || _regDraft.username.length < 3) {
      showToast('Kullanıcı adı en az 3 karakter olmalı (harf/rakam).');
      return;
    }
    if (!_regDraft.password || _regDraft.password.length < 4) {
      showToast('Şifre en az 4 karakter olmalı.');
      return;
    }
    const exists = _getUsers().some(u => u.username.toLowerCase() === _regDraft.username.toLowerCase());
    if (exists) {
      showToast('Bu kullanıcı adı zaten kayıtlı! Giriş yapmayı dene.');
      return;
    }
  }
  _regStep = step;
  _renderAuthModalContent();
}

function submitRegisterWizard() {
  _captureRegStepInputs();
  if (!_regDraft.name || !_regDraft.username || !_regDraft.password) {
    _regStep = 1;
    _renderAuthModalContent();
    showToast('Lütfen kimlik bilgilerini tamamla.');
    return;
  }

  const users = _getUsers();
  if (users.some(u => u.username.toLowerCase() === _regDraft.username.toLowerCase())) {
    showToast('Bu kullanıcı adı zaten kullanılıyor.');
    return;
  }

  const newId = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const newUser = {
    id: newId,
    name: _regDraft.name,
    username: _regDraft.username,
    email: _regDraft.email,
    passwordHash: _hashPass(_regDraft.password),
    role: _regDraft.role,
    examType: _regDraft.examType,
    examBranch: _regDraft.examBranch,
    currentLevel: _regDraft.currentLevel,
    targetScore: _regDraft.targetScore || 70,
    targetYdtNet: _regDraft.targetYdtNet || 65,
    targetTytNet: _regDraft.targetTytNet || 70,
    obpScore: _regDraft.obpScore || 85,
    targetDepartment: _regDraft.targetDepartment || 'İngilizce Öğretmenliği',
    targetPurpose: _regDraft.targetPurpose || 'Yüksek Lisans Başvurusu (55+)',
    examDate: _regDraft.examDate,
    dailyGoal: _regDraft.dailyGoal || 20,
    quizGoal: Math.max(10, Math.round((_regDraft.dailyGoal || 20) * 0.75)),
    avatar: _regDraft.avatar || 'classic',
    focusAreas: _regDraft.focusAreas || ['vocab', 'reading'],
    bio: _regDraft.examType === 'YDT'
      ? `YDT ${_regDraft.targetYdtNet || 65} Net · ${_regDraft.targetDepartment || 'İngilizce Öğretmenliği'} hedefiyle çalışıyorum.`
      : `${_regDraft.examType} hedefiyle çalışıyorum.`,
    createdAt: new Date().toISOString(),
    stats: {}
  };

  // Migrate current local guest progress if this is the first user, else start fresh cleanly
  const isFirstAccount = users.length === 0;
  users.push(newUser);
  _saveUsers(users);
  _setSessionUserId(newId);

  if (isFirstAccount) {
    if (typeof _goalData !== 'undefined') {
      _goalData.target = newUser.dailyGoal;
      _goalData.quizTarget = newUser.quizGoal;
      if (typeof _saveGoal === 'function') _saveGoal();
    }
    syncActiveUserStats();
  } else {
    _applySnapshotToRuntime({
      goal: { target: newUser.dailyGoal, quizTarget: newUser.quizGoal, today: '', count: 0, quizCount: 0, history: {}, weeklyXP: 0, streakDays: 0 }
    });
    syncActiveUserStats();
  }

  closeAuthModal();
  if (typeof _renderHUD === 'function') _renderHUD();
  if (typeof renderHome === 'function') renderHome();
  showToast(`Hoş geldin ${newUser.name}! Profilin hazır.`);
}

function submitLoginForm() {
  const identEl = document.getElementById('login-ident');
  const passEl = document.getElementById('login-pass');
  if (!identEl || !passEl) return;

  const ident = identEl.value.trim().toLowerCase();
  const pass = passEl.value;
  const users = _getUsers();
  const found = users.find(u =>
    u.username.toLowerCase() === ident ||
    (u.email && u.email.toLowerCase() === ident)
  );

  if (!found || found.passwordHash !== _hashPass(pass)) {
    showToast('Kullanıcı adı veya şifre hatalı!');
    return;
  }

  const prevUid = _getSessionUserId();
  if (prevUid) saveUserSnapshot(prevUid);

  _setSessionUserId(found.id);
  loadUserSnapshot(found.id);
  syncActiveUserStats();

  closeAuthModal();
  if (typeof _renderHUD === 'function') _renderHUD();
  if (typeof renderHome === 'function') renderHome();
  showToast(`Tekrar hoş geldin, ${found.name}!`);
}

function quickSwitchAccount(userId) {
  const users = _getUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  const prevUid = _getSessionUserId();
  if (prevUid) saveUserSnapshot(prevUid);

  _setSessionUserId(target.id);
  loadUserSnapshot(target.id);
  syncActiveUserStats();

  closeAuthModal();
  if (typeof _renderHUD === 'function') _renderHUD();
  if (typeof renderHome === 'function') renderHome();
  showToast(`${target.name} profiline geçildi!`);
}

function logoutAccount() {
  const prevUid = _getSessionUserId();
  if (prevUid) saveUserSnapshot(prevUid);
  _setSessionUserId(null);
  if (typeof _renderHUD === 'function') _renderHUD();
  if (typeof renderHome === 'function') renderHome();
  showScreen('screen-home');
  showToast('Çıkış yapıldı.');
}

/* ── PROFILE SCREEN ── */
function showProfileScreen() {
  renderProfileScreen();
  showScreen('screen-profile');
}

function renderProfileScreen() {
  const s = document.getElementById('screen-profile');
  if (!s) return;

  const p = getActiveProfile();
  const xp = typeof _xpData !== 'undefined' ? (_xpData.xp || 0) : 0;
  const lvl = typeof _getLevelForXP === 'function' ? _getLevelForXP(xp) : 0;
  const lvlName = typeof _getLevelName === 'function' ? _getLevelName(lvl) : 'Çaylak';
  const streak = typeof _streakData !== 'undefined' ? (_streakData.streak || 0) : 0;
  const learned = typeof getTotalLearned === 'function' ? getTotalLearned() : 0;
  const countdown = typeof getExamCountdownInfo === 'function' ? getExamCountdownInfo() : { label: '—' };
  const mascotHtml = typeof renderDonkeyMascot === 'function'
    ? renderDonkeyMascot(typeof getMascotMood === 'function' ? getMascotMood() : 'cozy', 88, p.avatar)
    : '';
  const avatars = typeof MASCOT_AVATARS !== 'undefined' ? MASCOT_AVATARS : [];

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('award', 18)} Öğrenci Profilim</div>
        <div class="unit-sub">${p.isGuest ? 'Misafir Oturumu' : '@' + esc(p.username)} · ${esc(p.role || 'Aday')}</div>
      </div>
      ${p.isGuest
        ? `<button class="profile-hdr-cta" onclick="openAuthModal('register')">Kayıt Ol</button>`
        : `<button class="profile-hdr-cta outline" onclick="openAuthModal('login')">Hesap Değiştir</button>`
      }
    </div>

    <div class="profile-scroll">
      <div class="profile-hero-card">
        <div class="profile-hero-avatar">${mascotHtml}</div>
        <div class="profile-hero-info">
          <div class="profile-name-row">
            <h2>${esc(p.name)}</h2>
            <span class="profile-lvl-pill">Sv ${lvl} · ${esc(lvlName)}</span>
          </div>
          <div class="profile-exam-tag">${icon('target', 13)} ${esc(getExamDisplayBadge(p))} · ${esc(countdown.label)}</div>
          <div class="profile-bio">${esc(p.bio || 'Düzenli pratikle hedef puanıma ilerliyorum.')}</div>
        </div>
      </div>

      <div class="profile-kpis">
        <div class="profile-kpi"><span>${xp}</span><small>Toplam XP</small></div>
        <div class="profile-kpi"><span>${streak} gün</span><small>Aktif Seri</small></div>
        <div class="profile-kpi"><span>${learned}</span><small>Kelime</small></div>
        <div class="profile-kpi"><span>${p.examType === 'YDT' ? (p.targetYdtNet || 65) + ' / 80' : (p.targetScore || 70)}</span><small>${p.examType === 'YDT' ? 'Hedef YDT Net' : 'Hedef Puan'}</small></div>
      </div>

      <form class="profile-edit-card" onsubmit="event.preventDefault(); saveProfileChanges();">
        <div class="profile-section-title">${icon('edit', 15)} Profil &amp; Sınav Tercihlerini Düzenle</div>

        <div class="auth-row-2">
          <div class="auth-field">
            <label>Ad Soyad</label>
            <input id="prof-name" type="text" value="${escQ(p.name)}" required>
          </div>
          <div class="auth-field">
            <label>Akademik Unvan / Rol</label>
            <select id="prof-role">
              ${ACADEMIC_ROLES.map(r => `<option value="${escQ(r)}" ${p.role === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="auth-row-2">
          <div class="auth-field">
            <label>Hazırlanılan Sınav</label>
            <select id="prof-exam-type" onchange="onProfExamTypeChange(this.value)">
              <option value="YDT" ${p.examType === 'YDT' ? 'selected' : ''}>YDT (YKS-Dil)</option>
              <option value="YOKDIL" ${p.examType === 'YOKDIL' ? 'selected' : ''}>YÖKDİL</option>
              <option value="YDS" ${p.examType === 'YDS' ? 'selected' : ''}>YDS</option>
              <option value="BOTH" ${p.examType === 'BOTH' ? 'selected' : ''}>YDT + YDS + YÖKDİL</option>
            </select>
          </div>
          <div class="auth-field">
            <label>Branş / Alan</label>
            <select id="prof-exam-branch">
              <option value="ydt_dil" ${p.examBranch === 'ydt_dil' ? 'selected' : ''}>YKS-Dil (YDT Ortak)</option>
              <option value="saglik" ${p.examBranch === 'saglik' ? 'selected' : ''}>Sağlık Bilimleri</option>
              <option value="fen" ${p.examBranch === 'fen' ? 'selected' : ''}>Fen Bilimleri</option>
              <option value="sosyal" ${p.examBranch === 'sosyal' ? 'selected' : ''}>Sosyal Bilimler</option>
              <option value="genel" ${p.examBranch === 'genel' ? 'selected' : ''}>Genel Akademik (YDS)</option>
            </select>
          </div>
        </div>

        <div id="prof-target-fields-ydt" style="display:${p.examType === 'YDT' ? '' : 'none'}">
          <div class="auth-row-2">
            <div class="auth-field">
              <label>Hedef YDT Neti (30–80)</label>
              <input id="prof-target-ydt-net" type="number" min="30" max="80" step="1" value="${p.targetYdtNet || 65}">
            </div>
            <div class="auth-field">
              <label>Hedef TYT Neti (20–120)</label>
              <input id="prof-target-tyt-net" type="number" min="20" max="120" step="1" value="${p.targetTytNet || 70}">
            </div>
          </div>
          <div class="auth-row-2">
            <div class="auth-field">
              <label>OBP / Diploma Notu (50–100)</label>
              <input id="prof-obp-score" type="number" min="50" max="100" step="1" value="${p.obpScore || 85}">
            </div>
            <div class="auth-field">
              <label>Hedef Üniversite Bölümü</label>
              <select id="prof-target-dept">
                ${YDT_TARGET_DEPARTMENTS.map(d => `<option value="${escQ(d)}" ${p.targetDepartment === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div id="prof-target-fields-acad" style="display:${p.examType === 'YDT' ? 'none' : ''}">
          <div class="auth-row-2">
            <div class="auth-field">
              <label>Hedef Puan (45–100)</label>
              <input id="prof-target-score" type="number" min="45" max="100" step="5" value="${p.targetScore || 70}">
            </div>
            <div class="auth-field">
              <label>Hedef Kurum / Kadro Barajı</label>
              <select id="prof-target-purpose">
                ${YDS_TARGET_PURPOSES.map(pr => `<option value="${escQ(pr)}" ${p.targetPurpose === pr ? 'selected' : ''}>${esc(pr)}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="auth-field">
          <label>Sınav Tarihi</label>
          <input id="prof-exam-date" type="date" value="${escQ(p.examDate || _defaultExamDateStr())}">
        </div>

        <div class="auth-row-2">
          <div class="auth-field">
            <label>Günlük Kelime Hedefi</label>
            <input id="prof-daily-goal" type="number" min="5" max="200" value="${(typeof _goalData !== 'undefined' && _goalData.target) ? _goalData.target : (p.dailyGoal || 20)}">
          </div>
          <div class="auth-field">
            <label>Günlük Test Doğru Hedefi</label>
            <input id="prof-quiz-goal" type="number" min="5" max="100" value="${(typeof _goalData !== 'undefined' && _goalData.quizTarget) ? _goalData.quizTarget : (p.quizGoal || 15)}">
          </div>
        </div>

        <div class="auth-field">
          <label>Kişisel Motivasyon Notu</label>
          <input id="prof-bio" type="text" value="${escQ(p.bio || '')}" placeholder="Hedefin hakkında kısa bir not...">
        </div>

        <div class="auth-field">
          <label>Cozy Eşek Maskot Stili</label>
          <div class="mascot-picker-grid">
            ${avatars.map(av => `
              <label class="mascot-pick-card ${p.avatar === av.id ? 'active' : ''}" onclick="this.parentElement.querySelectorAll('.mascot-pick-card').forEach(c=>c.classList.remove('active'));this.classList.add('active');">
                <input type="radio" name="prof-avatar" value="${av.id}" ${p.avatar === av.id ? 'checked' : ''} style="display:none">
                ${typeof renderDonkeyMascot === 'function' ? renderDonkeyMascot('cozy', 48, av.id) : ''}
                <span class="mascot-pick-name">${esc(av.name)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="profile-form-actions">
          <button type="submit" class="auth-submit-btn">${icon('save', 15)} Profili Kaydet</button>
          ${!p.isGuest
            ? `<button type="button" class="auth-btn-danger" onclick="logoutAccount()">Çıkış Yap</button>`
            : `<button type="button" class="auth-btn-sec" onclick="openAuthModal('register')">Kalıcı Hesaba Dönüştür</button>`
          }
        </div>
      </form>
    </div>
  `;
}

function onProfExamTypeChange(val) {
  const b = document.getElementById('prof-exam-branch');
  if (b) {
    if (val === 'YDT') b.value = 'ydt_dil';
    else if (val === 'YDS' && b.value === 'ydt_dil') b.value = 'genel';
    else if (val === 'YOKDIL' && (b.value === 'ydt_dil' || b.value === 'genel')) b.value = 'saglik';
  }
  const ydtBox = document.getElementById('prof-target-fields-ydt');
  const acadBox = document.getElementById('prof-target-fields-acad');
  if (ydtBox) ydtBox.style.display = val === 'YDT' ? '' : 'none';
  if (acadBox) acadBox.style.display = val === 'YDT' ? 'none' : '';
}

function saveProfileChanges() {
  const name = (document.getElementById('prof-name')?.value || '').trim() || 'Öğrenci';
  const role = document.getElementById('prof-role')?.value || 'Yüksek Lisans Adayı';
  const examType = document.getElementById('prof-exam-type')?.value || 'YOKDIL';
  const examBranch = document.getElementById('prof-exam-branch')?.value || 'saglik';
  const targetScore = Math.max(45, Math.min(100, parseInt(document.getElementById('prof-target-score')?.value, 10) || 70));
  const targetYdtNet = Math.max(30, Math.min(80, parseInt(document.getElementById('prof-target-ydt-net')?.value, 10) || 65));
  const targetTytNet = Math.max(20, Math.min(120, parseInt(document.getElementById('prof-target-tyt-net')?.value, 10) || 70));
  const obpScore = Math.max(50, Math.min(100, parseInt(document.getElementById('prof-obp-score')?.value, 10) || 85));
  const targetDepartment = document.getElementById('prof-target-dept')?.value || 'İngilizce Öğretmenliği';
  const targetPurpose = document.getElementById('prof-target-purpose')?.value || 'Yüksek Lisans Başvurusu (55+)';
  const examDate = document.getElementById('prof-exam-date')?.value || _defaultExamDateStr();
  const dailyGoal = Math.max(5, Math.min(200, parseInt(document.getElementById('prof-daily-goal')?.value, 10) || 20));
  const quizGoal = Math.max(5, Math.min(100, parseInt(document.getElementById('prof-quiz-goal')?.value, 10) || 15));
  const bio = (document.getElementById('prof-bio')?.value || '').trim();
  const avatarInput = document.querySelector('input[name="prof-avatar"]:checked');
  const avatar = avatarInput ? avatarInput.value : 'classic';

  const fields = { name, role, examType, examBranch, targetScore, targetYdtNet, targetTytNet, obpScore, targetDepartment, targetPurpose, examDate, dailyGoal, quizGoal, bio, avatar };

  const uid = _getSessionUserId();
  if (uid) {
    const users = _getUsers();
    const idx = users.findIndex(u => u.id === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...fields };
      _saveUsers(users);
    }
  } else {
    const g = getActiveProfile();
    _saveGuestProfile({ ...g, ...fields });
  }

  if (typeof _goalData !== 'undefined') {
    _goalData.target = dailyGoal;
    _goalData.quizTarget = quizGoal;
    if (typeof _saveGoal === 'function') _saveGoal();
  }
  syncActiveUserStats();
  renderHeaderProfileChip();
  renderProfileScreen();
  if (typeof _renderGoalCard === 'function') _renderGoalCard();
  showToast('Profil & sınav ayarların kaydedildi!');
}

function updateProfileExamQuick(examType, examBranch, targetVal) {
  const uid = _getSessionUserId();
  const curProf = getActiveProfile();
  const activeExam = examType || curProf.examType;
  if (uid) {
    const users = _getUsers();
    const idx = users.findIndex(u => u.id === uid);
    if (idx !== -1) {
      if (examType) users[idx].examType = examType;
      if (examBranch) users[idx].examBranch = examBranch;
      if (targetVal) {
        if (activeExam === 'YDT') users[idx].targetYdtNet = targetVal;
        else users[idx].targetScore = targetVal;
      }
      _saveUsers(users);
    }
  } else {
    const g = getActiveProfile();
    const next = {
      ...g,
      examType: examType || g.examType,
      examBranch: examBranch || g.examBranch
    };
    if (targetVal) {
      if (activeExam === 'YDT') next.targetYdtNet = targetVal;
      else next.targetScore = targetVal;
    }
    _saveGuestProfile(next);
  }
  syncActiveUserStats();
  renderHeaderProfileChip();
  if (typeof _renderGoalCard === 'function') _renderGoalCard();
}

/* ── LEADERBOARD SYSTEM ── */
const SEEDED_PEERS = [
  { id: 'p1', name: 'Dr. Elif Arslan', username: 'elif_tus', role: 'TUS Adayı', examType: 'YOKDIL', examBranch: 'saglik', targetScore: 85, avatar: 'health', xp: 4820, weeklyXP: 1410, streak: 28, learnedCount: 640 },
  { id: 'p2', name: 'Mert Can Yılmaz', username: 'mert_eng', role: 'Doktora Öğrencisi', examType: 'YDS', examBranch: 'genel', targetScore: 90, avatar: 'scholar', xp: 4390, weeklyXP: 1290, streak: 21, learnedCount: 590 },
  { id: 'p3', name: 'Selin Demirtaş', username: 'selin_bio', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'fen', targetScore: 80, avatar: 'science', xp: 3910, weeklyXP: 1120, streak: 19, learnedCount: 520 },
  { id: 'p4', name: 'Ahmet Kılıç', username: 'akilic_hukuk', role: 'Arş. Gör.', examType: 'YOKDIL', examBranch: 'sosyal', targetScore: 85, avatar: 'social', xp: 3560, weeklyXP: 980, streak: 16, learnedCount: 485 },
  { id: 'p5', name: 'Büşra Öztürk', username: 'busra_med', role: 'TUS / DUS Adayı', examType: 'YOKDIL', examBranch: 'saglik', targetScore: 75, avatar: 'health', xp: 3120, weeklyXP: 870, streak: 15, learnedCount: 430 },
  { id: 'p6', name: 'Kerem Aksoy', username: 'kerem_yds', role: 'Dil Tazminatı Adayı', examType: 'YDS', examBranch: 'genel', targetScore: 80, avatar: 'champion', xp: 2880, weeklyXP: 810, streak: 12, learnedCount: 395 },
  { id: 'p7', name: 'Zehra Nur Çelik', username: 'zehra_ee', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'fen', targetScore: 75, avatar: 'science', xp: 2540, weeklyXP: 740, streak: 14, learnedCount: 360 },
  { id: 'p8', name: 'Emre Şahin', username: 'emre_sosyal', role: 'Doktora Öğrencisi', examType: 'YOKDIL', examBranch: 'sosyal', targetScore: 70, avatar: 'social', xp: 2290, weeklyXP: 660, streak: 10, learnedCount: 325 },
  { id: 'p9', name: 'Deniz Karahan', username: 'deniz_yds', role: 'Akademisyen', examType: 'YDS', examBranch: 'genel', targetScore: 85, avatar: 'scholar', xp: 1980, weeklyXP: 580, streak: 9, learnedCount: 290 },
  { id: 'p10', name: 'İrem Koç', username: 'irem_diyet', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'saglik', targetScore: 70, avatar: 'health', xp: 1740, weeklyXP: 510, streak: 8, learnedCount: 255 },
  { id: 'p11', name: 'Burak Tanrıverdi', username: 'burak_makine', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'fen', targetScore: 65, avatar: 'science', xp: 1510, weeklyXP: 430, streak: 7, learnedCount: 220 },
  { id: 'p12', name: 'Ayşe Melis Güneş', username: 'ayse_tarih', role: 'Doktora Öğrencisi', examType: 'YOKDIL', examBranch: 'sosyal', targetScore: 75, avatar: 'social', xp: 1320, weeklyXP: 380, streak: 6, learnedCount: 195 },
  { id: 'p13', name: 'Oğuzhan Yıldız', username: 'oguz_yds', role: 'Dil Tazminatı Adayı', examType: 'YDS', examBranch: 'genel', targetScore: 70, avatar: 'classic', xp: 1080, weeklyXP: 310, streak: 5, learnedCount: 165 },
  { id: 'p14', name: 'Ceren Aydın', username: 'ceren_ecz', role: 'TUS / DUS Adayı', examType: 'YOKDIL', examBranch: 'saglik', targetScore: 65, avatar: 'health', xp: 890, weeklyXP: 245, streak: 4, learnedCount: 140 },
  { id: 'p15', name: 'Yusuf Emre Polat', username: 'yusuf_kimya', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'fen', targetScore: 65, avatar: 'classic', xp: 710, weeklyXP: 190, streak: 4, learnedCount: 118 },
  { id: 'p16', name: 'Nazlı Korkmaz', username: 'nazli_psik', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'sosyal', targetScore: 70, avatar: 'social', xp: 540, weeklyXP: 145, streak: 3, learnedCount: 92 },
  { id: 'p17', name: 'Kaan Doğan', username: 'kaan_yds', role: 'Üniversite Öğrencisi', examType: 'YDS', examBranch: 'genel', targetScore: 65, avatar: 'classic', xp: 360, weeklyXP: 95, streak: 2, learnedCount: 64 },
  { id: 'p18', name: 'Sude Başaran', username: 'sude_saglik', role: 'Yüksek Lisans Adayı', examType: 'YOKDIL', examBranch: 'saglik', targetScore: 60, avatar: 'classic', xp: 185, weeklyXP: 55, streak: 1, learnedCount: 38 },
  { id: 'p19', name: 'Zeynep Naz Kaya', username: 'zeynep_ydt', role: 'YDT (YKS-Dil) Adayı', examType: 'YDT', examBranch: 'ydt_dil', targetScore: 85, targetYdtNet: 74, avatar: 'champion', xp: 4050, weeklyXP: 1180, streak: 20, learnedCount: 545 },
  { id: 'p20', name: 'Arda Yılmaz', username: 'arda_yksdil', role: 'YDT (YKS-Dil) Adayı', examType: 'YDT', examBranch: 'ydt_dil', targetScore: 80, targetYdtNet: 68, avatar: 'scholar', xp: 3040, weeklyXP: 890, streak: 13, learnedCount: 410 },
  { id: 'p21', name: 'Ece Demir', username: 'ece_ydt', role: 'YDT (YKS-Dil) Adayı', examType: 'YDT', examBranch: 'ydt_dil', targetScore: 75, targetYdtNet: 62, avatar: 'classic', xp: 1840, weeklyXP: 540, streak: 9, learnedCount: 270 },
  { id: 'p22', name: 'Tuna Akın', username: 'tuna_dil', role: 'YDT (YKS-Dil) Adayı', examType: 'YDT', examBranch: 'ydt_dil', targetScore: 65, targetYdtNet: 55, avatar: 'classic', xp: 790, weeklyXP: 210, streak: 5, learnedCount: 125 }
];

let _lbMetric = 'weeklyXP';
let _lbExamFilter = 'all';

function getLeagueForXP(weeklyXP) {
  for (const tier of LEAGUE_TIERS) {
    if ((weeklyXP || 0) >= tier.minWeekly) return tier;
  }
  return LEAGUE_TIERS[LEAGUE_TIERS.length - 1];
}

function getLeaderboardEntries(metric = 'weeklyXP', examFilter = 'all') {
  const activeProfile = getActiveProfile();
  const activeXP = typeof _xpData !== 'undefined' ? (_xpData.xp || 0) : 0;
  const activeStreak = typeof _streakData !== 'undefined' ? (_streakData.streak || 0) : 0;
  const activeLearned = typeof getTotalLearned === 'function' ? getTotalLearned() : 0;
  const activeWeeklyXP = typeof _goalData !== 'undefined' ? (_goalData.weeklyXP || Math.min(activeXP, 500)) : 0;

  const registeredUsers = _getUsers().map(u => {
    const isMe = !activeProfile.isGuest && u.id === activeProfile.id;
    const st = u.stats || {};
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      role: u.role || 'Aday',
      examType: u.examType || 'YOKDIL',
      examBranch: u.examBranch || 'saglik',
      targetScore: u.targetScore || 70,
      targetYdtNet: u.targetYdtNet || 65,
      avatar: u.avatar || 'classic',
      xp: isMe ? activeXP : (st.xp || 0),
      weeklyXP: isMe ? activeWeeklyXP : (st.weeklyXP || 0),
      streak: isMe ? activeStreak : (st.streak || 0),
      learnedCount: isMe ? activeLearned : (st.learnedCount || 0),
      isMe,
      isRealUser: true
    };
  });

  const allEntries = [...SEEDED_PEERS.map(p => ({ ...p, isMe: false })), ...registeredUsers];

  if (activeProfile.isGuest) {
    allEntries.push({
      id: 'guest_me',
      name: activeProfile.name || 'Sen (Misafir)',
      username: activeProfile.username || 'misafir',
      role: activeProfile.role || 'Aday',
      examType: activeProfile.examType || 'YOKDIL',
      examBranch: activeProfile.examBranch || 'saglik',
      targetScore: activeProfile.targetScore || 70,
      targetYdtNet: activeProfile.targetYdtNet || 65,
      avatar: activeProfile.avatar || 'classic',
      xp: activeXP,
      weeklyXP: activeWeeklyXP,
      streak: activeStreak,
      learnedCount: activeLearned,
      isMe: true,
      isGuest: true
    });
  }

  let filtered = allEntries;
  if (examFilter !== 'all') {
    filtered = allEntries.filter(e => {
      if (examFilter === 'YDT') return e.examType === 'YDT' || e.examType === 'BOTH';
      if (examFilter === 'YDS') return e.examType === 'YDS' || e.examType === 'BOTH';
      if (examFilter === 'YOKDIL_saglik') return e.examType !== 'YDS' && e.examType !== 'YDT' && e.examBranch === 'saglik';
      if (examFilter === 'YOKDIL_fen') return e.examType !== 'YDS' && e.examType !== 'YDT' && e.examBranch === 'fen';
      if (examFilter === 'YOKDIL_sosyal') return e.examType !== 'YDS' && e.examType !== 'YDT' && e.examBranch === 'sosyal';
      return true;
    });
  }

  filtered.sort((a, b) => {
    const diff = (b[metric] || 0) - (a[metric] || 0);
    if (diff !== 0) return diff;
    return (b.xp || 0) - (a.xp || 0);
  });

  return filtered.map((e, i) => ({ ...e, rank: i + 1 }));
}

function renderHomeLeaderboardCard() {
  const container = document.getElementById('leaderboard-home-card');
  if (!container) return;

  const entries = getLeaderboardEntries('weeklyXP', 'all');
  const me = entries.find(e => e.isMe) || entries[entries.length - 1];
  const league = getLeagueForXP(me ? me.weeklyXP : 0);
  const top3 = entries.slice(0, 3);
  const meOutsideTop3 = me && me.rank > 3;
  const nextAbove = meOutsideTop3 ? entries[me.rank - 2] : null;
  const xpGap = nextAbove ? Math.max(0, (nextAbove.weeklyXP || 0) - (me.weeklyXP || 0)) : 0;
  const gapHint = nextAbove
    ? (xpGap === 0 ? 'Üst sırayla eşit · +1 XP ile geç!' : `Bir üst sıra (#${nextAbove.rank}) için +${xpGap + 1} XP`)
    : '';

  container.innerHTML = `
    <div class="lb-home-card" onclick="showLeaderboard()">
      <div class="lb-home-top">
        <div class="lb-home-title-wrap">
          <div class="home-card-icon-box is-amber">
            ${icon('trophy', 19)}
          </div>
          <div>
            <div class="lb-home-title">Liderlik Tablosu</div>
            <div class="lb-home-sub">${esc(league.name)} · Sıran: <b>#${me ? me.rank : '-'}</b></div>
          </div>
        </div>
        <span class="lb-home-cta">Tümünü Gör ${icon('arrowRight', 14)}</span>
      </div>
      <div class="lb-home-mini-list">
        ${top3.map((e, idx) => `
          <div class="lb-mini-row ${e.isMe ? 'me' : ''}">
            <span class="lb-mini-rank rank-${idx + 1}">#${e.rank}</span>
            <span class="lb-mini-avatar">${typeof getDonkeyAvatarSVG === 'function' ? getDonkeyAvatarSVG(e.avatar, 24) : ''}</span>
            <span class="lb-mini-name">${esc(e.name)}</span>
            <span class="lb-mini-val">${e.weeklyXP} XP</span>
          </div>
        `).join('')}
        ${meOutsideTop3 ? `
          <div class="lb-mini-divider"><span>${gapHint}</span></div>
          <div class="lb-mini-row me is-pinned">
            <span class="lb-mini-rank">#${me.rank}</span>
            <span class="lb-mini-avatar">${typeof getDonkeyAvatarSVG === 'function' ? getDonkeyAvatarSVG(me.avatar, 24) : ''}</span>
            <span class="lb-mini-name">${esc(me.name)} (Sen)</span>
            <span class="lb-mini-val">${me.weeklyXP} XP</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function showLeaderboard() {
  renderLeaderboardScreen();
  showScreen('screen-leaderboard');
}

function setLeaderboardFilter(type, value) {
  if (type === 'metric') _lbMetric = value;
  if (type === 'exam') _lbExamFilter = value;
  renderLeaderboardScreen();
}

function _formatMetricVal(entry, metric) {
  const val = entry[metric] || 0;
  if (metric === 'streak') return `${val} gün`;
  if (metric === 'learnedCount') return `${val} kelime`;
  return `${val} XP`;
}

function _getDaysUntilMonday() {
  const day = new Date().getDay();
  return day === 0 ? 1 : 8 - day;
}

function renderLeaderboardScreen() {
  const s = document.getElementById('screen-leaderboard');
  if (!s) return;

  const entries = getLeaderboardEntries(_lbMetric, _lbExamFilter);
  const me = entries.find(e => e.isMe);
  const league = getLeagueForXP(me ? me.weeklyXP : 0);
  const ahead = me && me.rank > 1 ? entries[me.rank - 2] : null;
  const diffNeeded = ahead && me ? Math.max(1, (ahead[_lbMetric] || 0) - (me[_lbMetric] || 0) + 1) : 0;

  const p1 = entries[0], p2 = entries[1], p3 = entries[2];
  const rest = entries.slice(3);

  const branchLabel = e => {
    if (e.examType === 'YDT') return 'YDT (YKS-Dil)';
    if (e.examType === 'YDS') return 'YDS';
    if (e.examType === 'BOTH') return 'YDT·YDS·YÖKDİL';
    const m = { saglik: 'YÖKDİL Sağlık', fen: 'YÖKDİL Fen', sosyal: 'YÖKDİL Sosyal', ydt_dil: 'YDT (YKS-Dil)', genel: 'YÖKDİL' };
    return m[e.examBranch] || 'YÖKDİL';
  };

  s.innerHTML = `
    <div class="unit-header">
      <button class="back-btn" onclick="goHome()" aria-label="Geri">${icon('arrowLeft', 18)}</button>
      <div>
        <div class="unit-title-h">${icon('trophy', 18)} Liderlik Tablosu</div>
        <div class="unit-sub">Haftalık lig sıfırlanmasına ${_getDaysUntilMonday()} gün</div>
      </div>
      <button class="profile-hdr-cta" onclick="openProfileOrAuth()">${me && !me.isGuest ? 'Profilim' : 'Kayıt Ol'}</button>
    </div>

    <div class="lb-controls">
      <div class="lb-filter-row">
        ${[
          { id: 'weeklyXP', label: 'Haftalık XP' },
          { id: 'xp', label: 'Toplam XP' },
          { id: 'streak', label: 'Seri (Streak)' },
          { id: 'learnedCount', label: 'Kelime' }
        ].map(m => `<button class="lb-pill ${_lbMetric === m.id ? 'active' : ''}" onclick="setLeaderboardFilter('metric','${m.id}')">${m.label}</button>`).join('')}
      </div>
      <div class="lb-filter-row subtle">
        ${[
          { id: 'all', label: 'Tüm Sınavlar' },
          { id: 'YDT', label: 'YDT (YKS-Dil)' },
          { id: 'YDS', label: 'YDS' },
          { id: 'YOKDIL_saglik', label: 'YÖKDİL Sağlık' },
          { id: 'YOKDIL_fen', label: 'YÖKDİL Fen' },
          { id: 'YOKDIL_sosyal', label: 'YÖKDİL Sosyal' }
        ].map(f => `<button class="lb-chip ${_lbExamFilter === f.id ? 'active' : ''}" onclick="setLeaderboardFilter('exam','${f.id}')">${f.label}</button>`).join('')}
      </div>
    </div>

    <div class="lb-scroll">
      <div class="lb-league-banner" style="border-color:${league.color}50">
        <div class="lb-league-icon" style="color:${league.color}">${icon(league.icon, 24)}</div>
        <div style="flex:1">
          <div class="lb-league-name">${esc(league.name)}</div>
          <div class="lb-league-sub">
            ${me ? `Mevcut Sıran: <b>#${me.rank}</b> / ${entries.length}` : 'Bu kategoride henüz kayıt yok'}
            ${ahead ? ` · <b>${esc(ahead.name)}</b>’ı geçmek için +${diffNeeded} ${ _lbMetric === 'streak' ? 'gün' : _lbMetric === 'learnedCount' ? 'kelime' : 'XP' }` : ''}
          </div>
        </div>
      </div>

      ${entries.length === 0 ? `<div class="lb-empty">Bu filtrede aday bulunamadı.</div>` : `
        <div class="lb-podium">
          ${[p2, p1, p3].filter(Boolean).map(p => {
            const place = p.rank;
            return `
              <div class="lb-podium-card place-${place} ${p.isMe ? 'me' : ''}">
                <div class="lb-podium-crown">${place === 1 ? icon('crown', 18) : '#' + place}</div>
                <div class="lb-podium-avatar">${typeof getDonkeyAvatarSVG === 'function' ? getDonkeyAvatarSVG(p.avatar, place === 1 ? 56 : 44) : ''}</div>
                <div class="lb-podium-name">${esc(p.name)}</div>
                <div class="lb-podium-tag">${esc(branchLabel(p))}</div>
                <div class="lb-podium-score">${esc(_formatMetricVal(p, _lbMetric))}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="lb-list">
          ${rest.map(e => `
            <div class="lb-row ${e.isMe ? 'me' : ''}">
              <div class="lb-row-rank">${e.rank}</div>
              <div class="lb-row-avatar">${typeof getDonkeyAvatarSVG === 'function' ? getDonkeyAvatarSVG(e.avatar, 36) : ''}</div>
              <div class="lb-row-info">
                <div class="lb-row-name">${esc(e.name)} ${e.isMe ? '<span class="lb-me-badge">SEN</span>' : ''}</div>
                <div class="lb-row-meta">${esc(branchLabel(e))} · Hedef ${e.examType === 'YDT' ? (e.targetYdtNet || 65) + ' Net' : (e.targetScore || 70) + ' Puan'} · ${icon('flame', 11)} ${e.streak}g</div>
              </div>
              <div class="lb-row-score">${esc(_formatMetricVal(e, _lbMetric))}</div>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    ${me ? `
      <div class="lb-sticky-me">
        <span><b>#${me.rank}</b> ${esc(me.name)} ${me.isGuest ? '(Misafir)' : ''}</span>
        <span class="lb-sticky-val">${esc(_formatMetricVal(me, _lbMetric))}</span>
      </div>
    ` : ''}
  `;
}

function initAuthAndProfile() {
  const uid = _getSessionUserId();
  if (uid) {
    loadUserSnapshot(uid);
    syncActiveUserStats();
  }
  renderHeaderProfileChip();
  renderHomeLeaderboardCard();
}

window.ACADEMIC_ROLES = ACADEMIC_ROLES;
window.YDT_TARGET_DEPARTMENTS = YDT_TARGET_DEPARTMENTS;
window.YDS_TARGET_PURPOSES = YDS_TARGET_PURPOSES;
window.getActiveProfile = getActiveProfile;
window.formatProfileTargetShort = formatProfileTargetShort;
window.getExamDisplayBadge = getExamDisplayBadge;
window.syncActiveUserStats = syncActiveUserStats;
window.renderHeaderProfileChip = renderHeaderProfileChip;
window.openProfileOrAuth = openProfileOrAuth;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.nextRegStep = nextRegStep;
window._setRegField = _setRegField;
window._toggleRegFocus = _toggleRegFocus;
window.submitRegisterWizard = submitRegisterWizard;
window.submitLoginForm = submitLoginForm;
window.quickSwitchAccount = quickSwitchAccount;
window.logoutAccount = logoutAccount;
window.showProfileScreen = showProfileScreen;
window.renderProfileScreen = renderProfileScreen;
window.onProfExamTypeChange = onProfExamTypeChange;
window.saveProfileChanges = saveProfileChanges;
window.updateProfileExamQuick = updateProfileExamQuick;
window.getLeaderboardEntries = getLeaderboardEntries;
window.renderHomeLeaderboardCard = renderHomeLeaderboardCard;
window.showLeaderboard = showLeaderboard;
window.setLeaderboardFilter = setLeaderboardFilter;
window.renderLeaderboardScreen = renderLeaderboardScreen;
window.initAuthAndProfile = initAuthAndProfile;
