// Cozy Donkey Mascot ("Badem") SVG Renderer & Adaptive Exam Coaching Quotes

const MASCOT_AVATARS = [
  { id: 'classic', name: 'Cozy Badem', subtitle: 'Örgü atkı & sıcak çay', badge: 'Klasik' },
  { id: 'scholar', name: 'Prof. Badem', subtitle: 'Kep & yuvarlak gözlük', badge: 'YDS Akademik' },
  { id: 'health', name: 'Dr. Badem', subtitle: 'Stetoskop & tıp rozeti', badge: 'YÖKDİL Sağlık' },
  { id: 'science', name: 'Lab Badem', subtitle: 'Atom rozeti & laboratuvar', badge: 'YÖKDİL Fen' },
  { id: 'social', name: 'Tarihçi Badem', subtitle: 'Parşömen & fular', badge: 'YÖKDİL Sosyal' },
  { id: 'champion', name: 'Şampiyon Badem', subtitle: 'Altın defne tacı', badge: 'Derece' },
];

let _mascotTipIndex = 0;

function _getActiveMascotVariant(overrideVariant) {
  if (overrideVariant) return overrideVariant;
  if (typeof getActiveProfile === 'function') {
    const p = getActiveProfile();
    if (p && p.avatar) return p.avatar;
  }
  return 'classic';
}

function getMascotMood() {
  if (typeof _goalData !== 'undefined') {
    if (_goalData.count >= _goalData.target && _goalData.count > 0) return 'celebrate';
    if (_goalData.count > 0 && _goalData.count >= Math.ceil(_goalData.target * 0.5)) return 'happy';
  }
  if (typeof _streakData !== 'undefined' && (_streakData.streak || 0) >= 7) {
    return 'proud';
  }
  const hr = new Date().getHours();
  if (hr >= 23 || hr < 6) return 'sleepy';
  return 'cozy';
}

function renderDonkeyMascot(mood = 'cozy', size = 76, variant = null) {
  const v = _getActiveMascotVariant(variant);
  const uid = 'm_' + Math.random().toString(36).slice(2, 7);

  // Eyes by mood
  let eyesHtml = '';
  if (mood === 'happy' || mood === 'celebrate') {
    eyesHtml = `
      <path d="M 41 56 Q 46 50 51 56" fill="none" stroke="#2D241E" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M 69 56 Q 74 50 79 56" fill="none" stroke="#2D241E" stroke-width="2.6" stroke-linecap="round"/>
    `;
  } else if (mood === 'sleepy') {
    eyesHtml = `
      <path d="M 41 55 Q 46 58 51 55" fill="none" stroke="#2D241E" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M 69 55 Q 74 58 79 55" fill="none" stroke="#2D241E" stroke-width="2.4" stroke-linecap="round"/>
      <text x="86" y="34" font-size="10" font-weight="800" fill="#628141" opacity="0.85">z</text>
      <text x="93" y="25" font-size="12" font-weight="800" fill="#8BAE66" opacity="0.9">Z</text>
    `;
  } else if (mood === 'proud') {
    eyesHtml = `
      <circle cx="46" cy="54" r="4.6" fill="#2D241E"/>
      <circle cx="74" cy="54" r="4.6" fill="#2D241E"/>
      <circle cx="44.4" cy="52.3" r="1.7" fill="#FFFFFF"/>
      <circle cx="72.4" cy="52.3" r="1.7" fill="#FFFFFF"/>
      <polygon points="94,24 96,29 101,29 97,32 98.5,37 94,34 89.5,37 91,32 87,29 92,29" fill="#F1C40F"/>
    `;
  } else {
    eyesHtml = `
      <ellipse cx="46" cy="54" rx="4.5" ry="5" fill="#2D241E"/>
      <ellipse cx="74" cy="54" rx="4.5" ry="5" fill="#2D241E"/>
      <circle cx="44.3" cy="52" r="1.7" fill="#FFFFFF"/>
      <circle cx="72.3" cy="52" r="1.7" fill="#FFFFFF"/>
      <circle cx="47.2" cy="55.6" r="0.8" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="75.2" cy="55.6" r="0.8" fill="#FFFFFF" opacity="0.7"/>
    `;
  }

  // Eyebrows
  const browsHtml = mood === 'proud'
    ? `<path d="M 40 46 Q 46 42 52 46" fill="none" stroke="#5D483A" stroke-width="2" stroke-linecap="round"/>
       <path d="M 68 46 Q 74 42 80 46" fill="none" stroke="#5D483A" stroke-width="2" stroke-linecap="round"/>`
    : `<path d="M 41 47 Q 46 44.5 51 47" fill="none" stroke="#5D483A" stroke-width="1.8" stroke-linecap="round"/>
       <path d="M 69 47 Q 74 44.5 79 47" fill="none" stroke="#5D483A" stroke-width="1.8" stroke-linecap="round"/>`;

  // Glasses for scholar, science, or cozy scholar mood
  const glassesHtml = (v === 'scholar' || v === 'science' || mood === 'scholar') ? `
    <g stroke="${v === 'science' ? '#2B7A78' : '#C9A23F'}" stroke-width="2" fill="rgba(255,255,255,0.14)">
      <circle cx="46" cy="54" r="9.2"/>
      <circle cx="74" cy="54" r="9.2"/>
      <path d="M 55.2 54 Q 60 52 64.8 54" fill="none"/>
      <line x1="34" y1="53" x2="36.8" y2="54"/>
      <line x1="83.2" y1="54" x2="86" y2="53"/>
    </g>
  ` : '';

  // Scarf palette by variant
  const scarfPrimary = v === 'social' ? '#B97745' : v === 'health' ? '#2A9D8F' : v === 'science' ? '#3B82A6' : '#628141';
  const scarfLight = v === 'social' ? '#E2A878' : v === 'health' ? '#70C1B3' : v === 'science' ? '#76B5D3' : '#8BAE66';

  // Variant headwear & accessories
  let headAccessory = '';
  let frontAccessory = '';

  if (v === 'scholar') {
    headAccessory = `
      <g transform="translate(60, 26)">
        <polygon points="0,-13 24,-4 0,5 -24,-4" fill="#2A3429" stroke="#1B211A" stroke-width="1.4"/>
        <rect x="-11" y="-2" width="22" height="7" rx="3" fill="#1F281E"/>
        <path d="M 18 -3 L 22 8" stroke="#E7C268" stroke-width="2" stroke-linecap="round"/>
        <circle cx="22" cy="10" r="2.6" fill="#E7C268"/>
      </g>
    `;
  } else if (v === 'champion') {
    headAccessory = `
      <g>
        <path d="M 44 26 L 48 15 L 55 22 L 60 11 L 65 22 L 72 15 L 76 26 Z" fill="#F1C40F" stroke="#C59611" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="60" cy="21" r="2.2" fill="#628141"/>
      </g>
    `;
  } else if (v === 'health') {
    headAccessory = `
      <g transform="translate(60, 24)">
        <rect x="-10" y="-7" width="20" height="11" rx="4" fill="#FFFFFF" stroke="#2A9D8F" stroke-width="1.6"/>
        <rect x="-1.6" y="-4.5" width="3.2" height="6" rx="0.8" fill="#E74C3C"/>
        <rect x="-3" y="-3.1" width="6" height="3.2" rx="0.8" fill="#E74C3C"/>
      </g>
    `;
    frontAccessory = `
      <g>
        <path d="M 43 93 Q 41 108 55 110 Q 68 110 73 97" fill="none" stroke="#475569" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="74" cy="96" r="4.5" fill="#E2E8F0" stroke="#475569" stroke-width="1.8"/>
      </g>
    `;
  } else if (v === 'science') {
    frontAccessory = `
      <g transform="translate(88, 96)">
        <circle cx="0" cy="0" r="11" fill="#E6F4F9" stroke="#3B82A6" stroke-width="1.6"/>
        <ellipse cx="0" cy="0" rx="8" ry="3.2" fill="none" stroke="#3B82A6" stroke-width="1.3" transform="rotate(35)"/>
        <ellipse cx="0" cy="0" rx="8" ry="3.2" fill="none" stroke="#3B82A6" stroke-width="1.3" transform="rotate(-35)"/>
        <circle cx="0" cy="0" r="2" fill="#E67E22"/>
      </g>
    `;
  } else if (v === 'social') {
    frontAccessory = `
      <g transform="translate(89, 98) rotate(-10)">
        <rect x="-10" y="-9" width="20" height="17" rx="3" fill="#F5E6C8" stroke="#A67C52" stroke-width="1.5"/>
        <line x1="-6" y1="-4" x2="6" y2="-4" stroke="#A67C52" stroke-width="1.4" stroke-linecap="round"/>
        <line x1="-6" y1="0" x2="5" y2="0" stroke="#A67C52" stroke-width="1.4" stroke-linecap="round"/>
        <line x1="-6" y1="4" x2="3" y2="4" stroke="#A67C52" stroke-width="1.4" stroke-linecap="round"/>
      </g>
    `;
  }

  // Classic & celebrate warm tea mug
  if (v === 'classic' || v === 'scholar' || v === 'champion') {
    frontAccessory += `
      <g transform="translate(88, 97)">
        <path class="mascot-steam" d="M -3 -10 Q -5 -15 -2 -19" fill="none" stroke="#B6CEB4" stroke-width="1.8" stroke-linecap="round"/>
        <path class="mascot-steam mascot-steam-2" d="M 3 -11 Q 5 -16 2 -20" fill="none" stroke="#D9E9CF" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 7 -4 C 12 -4, 12 4, 7 4" fill="none" stroke="#F2E8D5" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="-8" y="-7" width="15" height="14" rx="4" fill="#F5EBE1" stroke="#8BAE66" stroke-width="1.8"/>
        <path d="M -5 -2 Q 0 1 4 -2" fill="none" stroke="#628141" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    `;
  }

  // Celebrate sparkles
  const celebrateFx = mood === 'celebrate' ? `
    <circle cx="18" cy="24" r="2.8" fill="#F1C40F"/>
    <circle cx="102" cy="22" r="2.5" fill="#2ECC71"/>
    <path d="M 16 42 L 19 48 L 25 49 L 20 53 L 21 59 L 16 56 L 11 59 L 12 53 L 7 49 L 13 48 Z" fill="#F1C40F" opacity="0.85" transform="scale(0.6) translate(6, 18)"/>
  ` : '';

  return `
    <svg class="mascot-svg mascot-mood-${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="FDil Koç Maskot Badem">
      <defs>
        <radialGradient id="${uid}_bg" cx="50%" cy="45%" r="54%">
          <stop offset="0%" stop-color="#D9E9CF" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#B6CEB4" stop-opacity="0.45"/>
        </radialGradient>
        <linearGradient id="${uid}_fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#AA927D"/>
          <stop offset="100%" stop-color="#8A725E"/>
        </linearGradient>
      </defs>

      <!-- Soft cozy backdrop circle -->
      <circle cx="60" cy="60" r="56" fill="url(#${uid}_bg)" stroke="#8BAE66" stroke-width="2" stroke-opacity="0.45"/>

      ${celebrateFx}

      <!-- Left & Right Donkey Ears -->
      <g class="mascot-ear-left">
        <path d="M 38 35 C 24 10, 15 12, 22 36 C 26 48, 33 50, 39 46 Z" fill="#8A725E" stroke="#6E5849" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M 35 35 C 26 18, 22 20, 26 36 C 28 43, 33 44, 36 42 Z" fill="#E8C5B8"/>
      </g>
      <g class="mascot-ear-right">
        <path d="M 82 35 C 96 10, 105 12, 98 36 C 94 48, 87 50, 81 46 Z" fill="#8A725E" stroke="#6E5849" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M 85 35 C 94 18, 98 20, 94 36 C 92 43, 87 44, 84 42 Z" fill="#E8C5B8"/>
      </g>

      <!-- Cozy Body / Shoulders -->
      <path d="M 32 106 C 32 88, 44 82, 60 82 C 76 82, 88 88, 88 106 Z" fill="#8A725E" stroke="#6E5849" stroke-width="1.8"/>

      <!-- Head -->
      <ellipse cx="60" cy="56" rx="28" ry="26" fill="url(#${uid}_fur)" stroke="#6E5849" stroke-width="1.8"/>

      <!-- Fluffy Hair Tuft -->
      <path d="M 52 32 C 53 23, 60 22, 61 30 C 64 23, 70 25, 68 33 C 62 32, 56 32, 52 32 Z" fill="#5D483A"/>

      <!-- Cream Snout / Muzzle -->
      <ellipse cx="60" cy="69" rx="20" ry="14" fill="#F5EBE1" stroke="#D8C8B8" stroke-width="1.4"/>

      <!-- Rosy Cozy Cheeks -->
      <ellipse cx="38" cy="63" rx="4.8" ry="3" fill="#E8998D" opacity="0.55"/>
      <ellipse cx="82" cy="63" rx="4.8" ry="3" fill="#E8998D" opacity="0.55"/>

      <!-- Eyes & Eyebrows -->
      ${browsHtml}
      ${eyesHtml}
      ${glassesHtml}

      <!-- Cute Nostrils & Warm Smile -->
      <ellipse cx="52" cy="66" rx="2.2" ry="3" fill="#6E5849" transform="rotate(-12 52 66)"/>
      <ellipse cx="68" cy="66" rx="2.2" ry="3" fill="#6E5849" transform="rotate(12 68 66)"/>
      ${mood === 'happy' || mood === 'celebrate'
        ? `<path d="M 53 73 Q 60 79.5 67 73" fill="none" stroke="#5D483A" stroke-width="2.2" stroke-linecap="round"/>`
        : `<path d="M 54 73.5 Q 60 77.5 66 73.5" fill="none" stroke="#5D483A" stroke-width="2" stroke-linecap="round"/>`
      }

      <!-- Cozy Knitted Scarf -->
      <g>
        <path d="M 38 83 Q 60 93 82 83 L 84 92 Q 60 102 36 92 Z" fill="${scarfPrimary}" stroke="#445C2C" stroke-width="1.4"/>
        <path d="M 43 86 L 45 93 M 52 89 L 53 96 M 61 90 L 61 97 M 70 89 L 69 96 M 77 86 L 75 93" stroke="${scarfLight}" stroke-width="1.8" stroke-linecap="round"/>
        <!-- Hanging scarf tail -->
        <path d="M 42 90 L 38 106 L 49 107 L 51 92 Z" fill="${scarfLight}" stroke="#445C2C" stroke-width="1.3" stroke-linejoin="round"/>
        <line x1="40" y1="106" x2="39" y2="110" stroke="#F3D789" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="44" y1="106" x2="43.5" y2="110.5" stroke="#F3D789" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="48" y1="107" x2="48" y2="110.5" stroke="#F3D789" stroke-width="1.6" stroke-linecap="round"/>
      </g>

      ${headAccessory}
      ${frontAccessory}
    </svg>
  `;
}

function getDonkeyAvatarSVG(variant = 'classic', size = 40) {
  return renderDonkeyMascot('cozy', size, variant || 'classic');
}

function getMascotCoachQuote() {
  const profile = typeof getActiveProfile === 'function' ? getActiveProfile() : null;
  const examType = profile ? profile.examType : 'YOKDIL';
  const branch = profile ? profile.examBranch : 'saglik';
  const targetScore = profile ? (profile.targetScore || 70) : 70;
  const targetYdtNet = profile ? (profile.targetYdtNet || 65) : 65;
  const targetDept = profile ? (profile.targetDepartment || 'iyi bir dil bölümü') : 'iyi bir dil bölümü';
  const count = typeof _goalData !== 'undefined' ? (_goalData.count || 0) : 0;
  const target = typeof _goalData !== 'undefined' ? (_goalData.target || 20) : 20;
  const streak = typeof _streakData !== 'undefined' ? (_streakData.streak || 0) : 0;
  const errCount = typeof errorBox !== 'undefined' ? Object.keys(errorBox).length : 0;

  const branchLabel = branch === 'saglik' ? 'Sağlık Bilimleri'
    : branch === 'fen' ? 'Fen Bilimleri'
      : branch === 'sosyal' ? 'Sosyal Bilimler'
        : branch === 'ydt_dil' ? 'YKS-Dil (YDT)' : 'Akademik Genel';

  const tips = [];

  if (count >= target && target > 0) {
    tips.push(`Harikasın! Bugünkü ${target} kelime hedefini devirdin. Badem seninle gurur duyuyor — şimdi 1 paragraf okumasıyla pekiştirebilirsin!`);
  } else if (count === 0) {
    if (examType === 'YDT') {
      tips.push(`Günaydın çalışma arkadaşım! YDT (YKS-Dil) hedefimiz ${targetYdtNet}+ net (${targetDept}). İlk 5 kelimeyle ısınalım mı?`);
    } else {
      tips.push(`Günaydın çalışma arkadaşım! ${examType} (${branchLabel}) hedefimiz ${targetScore}+ puan. İlk 5 kelimeyle ısınalım mı?`);
    }
  } else {
    const left = Math.max(1, target - count);
    tips.push(`Süpersin! Günlük hedefe sadece ${left} kelime kaldı. Tempo bozulmadan devam!`);
  }

  if (examType === 'YDT' || examType === 'BOTH') {
    tips.push(`YDT Net Stratejisi: 12 Çeviri + 5 Situation + 5 Diyalog = 22 hızlı net! Bu bloğu ilk 25 dakikada çözerek Reading'e zaman kazan.`);
    tips.push(`YDT Net Uyarısı: YDS/YÖKDİL’den farklı olarak 4 yanlış 1 doğruyu götürür! Emin olmadan işaretlenen 8 soru sana -2.0 net kaybettirir.`);
    tips.push(`YDT (${targetYdtNet}+ Net) Zamanlama: 120 dakikada 80 soru çözeceksin (1.5 dk/soru). Okuma parçalarında önce soru kökünü okuyup paragrafta anahtar kelime tara!`);
  }
  if (examType === 'YDS' || examType === 'BOTH') {
    tips.push(`YDS Taktiği: 20 Reading ve 4 Yakın Anlam sorusu sınavın yarısını belirler. Zıtlık bağlaçlarını (whereas, nevertheless) görür görmez işaretle!`);
    tips.push(`YDS'de kelime soruları 6 adettir ama paragraf anlamanın %70'ini akademik fiil ve zarflar taşır. Bugün eş anlamlı çalışmayı unutma.`);
  }
  if (examType === 'YOKDIL' || examType === 'BOTH') {
    tips.push(`YÖKDİL ${branchLabel} İpucu: Çeviri sorularında (12 soru!) önce yüklemi ve özneyi eşle, 15 dakikada +12 net cebinde olsun!`);
    tips.push(`YÖKDİL'de 14 Dilbilgisi ve 10 Cloze sorusunda edatlar (prepositions) belirleyicidir: "stem from, lead to, vulnerable to" kalıplarını ezberle.`);
  }

  if (errCount >= 5) {
    tips.push(`Hata Kumbaranda ${errCount} kelime seni bekliyor. Yanlışlarını temizlemek ${examType === 'YDT' ? 'netini' : 'puanını'} en hızlı artıran gizli silahtır!`);
  }
  if (streak >= 3) {
    tips.push(`${streak} günlük harika bir seri yakaladın! Her gün az ama düzenli çalışmak sınav sabahı fark yaratır.`);
  }

  const idx = _mascotTipIndex % tips.length;
  return tips[idx];
}

function cycleMascotTip() {
  _mascotTipIndex++;
  const bubble = document.getElementById('mascot-coach-bubble-text');
  const stage = document.getElementById('mascot-stage-box');
  if (bubble) {
    bubble.textContent = getMascotCoachQuote();
    bubble.classList.remove('tip-pop');
    void bubble.offsetWidth;
    bubble.classList.add('tip-pop');
  }
  if (stage) {
    stage.classList.remove('mascot-bounce');
    void stage.offsetWidth;
    stage.classList.add('mascot-bounce');
  }
}

window.MASCOT_AVATARS = MASCOT_AVATARS;
window.renderDonkeyMascot = renderDonkeyMascot;
window.getDonkeyAvatarSVG = getDonkeyAvatarSVG;
window.getMascotMood = getMascotMood;
window.getMascotCoachQuote = getMascotCoachQuote;
window.cycleMascotTip = cycleMascotTip;
