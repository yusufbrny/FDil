// Shared utility helpers: navigation, escaping, toast notifications, and speech synthesis

function showScreen(id, direction = 'forward') {
  if (id !== 'screen-speed' && typeof _clearSpeedTimer === 'function') {
    _clearSpeedTimer();
  }
  if (id !== 'screen-weekly-drill' && typeof _cleanupWeeklyDrill === 'function') {
    _cleanupWeeklyDrill();
  }
  if (id !== 'screen-prep-drill' && typeof _cleanupPrepDrill === 'function') {
    _cleanupPrepDrill();
  }
  const quizScreens = ['screen-mc', 'screen-fib', 'screen-syn-quiz', 'screen-ant-quiz', 'screen-speed'];
  if (!quizScreens.includes(id) && typeof _clearQuizTimer === 'function') {
    _clearQuizTimer();
  }
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'slide-out-left', 'slide-out-right');
  });
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

function shuffle(arr) {
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// XSS güvenli HTML escape — innerHTML'e yazmadan önce daima kullan
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// onclick attribute'larında kullanmak için (tek tırnakları kaçır)
function escQ(s) { return esc(s || ''); }


function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer = setTimeout(() => { t.classList.remove('show'); }, 2500);
}


function speakWord(word) {
  if (!('speechSynthesis' in window)) {
    showToast('Tarayıcı desteklemiyor');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// ===== GAME FEEL: WEB AUDIO SFX, HAPTICS & TEXT HIGHLIGHTING =====
let _sfxCtx = null;

function isSfxEnabled() {
  try {
    return localStorage.getItem('ydt_sfx') !== 'off';
  } catch (e) {
    return true;
  }
}

function toggleSfx() {
  const next = !isSfxEnabled();
  try {
    localStorage.setItem('ydt_sfx', next ? 'on' : 'off');
  } catch (e) { }
  if (next) playGameSFX('correct', 1);
  if (typeof showToast === 'function') {
    showToast(next ? 'Oyun sesleri açıldı' : 'Oyun sesleri kapatıldı');
  }
  return next;
}

function _getSfxCtx() {
  if (_sfxCtx) {
    if (_sfxCtx.state === 'suspended') _sfxCtx.resume().catch(() => {});
    return _sfxCtx;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  _sfxCtx = new Ctx();
  if (_sfxCtx.state === 'suspended') _sfxCtx.resume().catch(() => {});
  return _sfxCtx;
}

function _playTone(ctx, freqStart, freqEnd, duration, type = 'sine', gainPeak = 0.06, delay = 0) {
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, start);
  if (freqEnd && freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(gainPeak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playGameSFX(type, combo = 1) {
  try {
    if (navigator.vibrate) {
      if (type === 'flip') navigator.vibrate(8);
      else if (type === 'correct') navigator.vibrate(14);
      else if (type === 'bonus' || type === 'win') navigator.vibrate([12, 22, 16]);
      else if (type === 'wrong') navigator.vibrate([22, 28, 22]);
    }
  } catch (e) { }

  if (!isSfxEnabled()) return;
  try {
    const ctx = _getSfxCtx();
    if (!ctx) return;

    if (type === 'flip') {
      _playTone(ctx, 240, 430, 0.055, 'triangle', 0.045);
    } else if (type === 'correct') {
      const lift = Math.min(Math.max(combo - 1, 0), 8) * 24;
      _playTone(ctx, 523 + lift, 523 + lift, 0.09, 'sine', 0.06, 0);
      _playTone(ctx, 659 + lift, 659 + lift, 0.14, 'triangle', 0.055, 0.06);
    } else if (type === 'bonus') {
      _playTone(ctx, 587, 587, 0.08, 'triangle', 0.06, 0);
      _playTone(ctx, 740, 740, 0.09, 'triangle', 0.06, 0.055);
      _playTone(ctx, 987, 987, 0.16, 'sine', 0.065, 0.11);
    } else if (type === 'wrong') {
      _playTone(ctx, 175, 118, 0.13, 'triangle', 0.055, 0);
    } else if (type === 'undo') {
      _playTone(ctx, 360, 250, 0.08, 'sine', 0.045, 0);
    } else if (type === 'win') {
      _playTone(ctx, 523, 523, 0.1, 'triangle', 0.06, 0);
      _playTone(ctx, 659, 659, 0.1, 'triangle', 0.06, 0.08);
      _playTone(ctx, 784, 784, 0.18, 'sine', 0.07, 0.16);
    }
  } catch (e) { }
}

function highlightTargetWord(sentence, word) {
  if (!sentence) return '';
  const target = (word || '').trim();
  if (!target) return esc(sentence);
  const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundaryPattern = /\s/.test(target)
    ? `(${escapedTarget})`
    : `(\\b${escapedTarget}[a-zA-Z']*\\b)`;
  const regex = new RegExp(boundaryPattern, 'gi');
  let out = '';
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(sentence)) !== null) {
    out += esc(sentence.slice(lastIndex, match.index));
    out += `<mark class="fc-hl">${esc(match[0])}</mark>`;
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) break;
  }
  out += esc(sentence.slice(lastIndex));
  return out || esc(sentence);
}

