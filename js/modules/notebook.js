// Unified Single-Sheet Editorial Notebook ("Not Defteri") for FDil
// Write, draw, annotate, and organize across multiple notebooks & pages on a single sheet.
(function (global) {
  'use strict';

  const DATA_KEY_V2 = 'fdil_notebook_v2';
  const DATA_KEY_V1 = 'fdil_notebook_v1';
  const UI_KEY = 'fdil_nb_ui_v1';

  const CORNERS = ['tl', 'tr', 'bl', 'br'];
  const CORNER_LABELS = {
    tl: 'Sol Üst',
    tr: 'Sağ Üst',
    bl: 'Sol Alt',
    br: 'Sağ Alt'
  };

  const BOOK_COLORS = [
    { id: 'green', label: 'Orman Yeşili' },
    { id: 'teal', label: 'Deniz Yeşili' },
    { id: 'amber', label: 'Kehribar' },
    { id: 'blue', label: 'Akademik Mavi' },
    { id: 'red', label: 'Bordo' }
  ];

  const BOOK_ICONS = [
    'books', 'bookOpen', 'penLine', 'graduationCap',
    'target', 'star', 'fileText', 'sparkles'
  ];

  const PAPER_TYPES = [
    { id: 'ruled', label: 'Çizgili', desc: 'Yazı ve ders notları' },
    { id: 'dots', label: 'Noktalı', desc: 'Yazı + serbest şema' },
    { id: 'grid', label: 'Kareli', desc: 'Tablo ve diyagram' },
    { id: 'plain', label: 'Düz Kağıt', desc: 'Saf çizim ve eskiz' }
  ];

  const PAPER_LABELS = {
    ruled: 'Çizgili',
    dots: 'Noktalı',
    grid: 'Kareli',
    plain: 'Düz Kağıt'
  };

  const PAPER_TONES = [
    { id: 'auto', label: 'Tema', swatch: 'linear-gradient(135deg,#FDFCF8 50%,#192018 50%)' },
    { id: 'warm', label: 'Sıcak', swatch: '#F7F3E6' },
    { id: 'white', label: 'Beyaz', swatch: '#FFFFFF' },
    { id: 'dark', label: 'Koyu', swatch: '#161B15' }
  ];

  const STROKE_PALETTE = [
    { val: 'auto', label: 'Otomatik' },
    { val: '#182017', label: 'Kömür' },
    { val: '#3F621A', label: 'Yeşil' },
    { val: '#0F766E', label: 'Deniz Yeşili' },
    { val: '#1D4ED8', label: 'Mavi' },
    { val: '#B45309', label: 'Kehribar' },
    { val: '#B91C1C', label: 'Kırmızı' }
  ];

  const FILL_PALETTE = [
    { val: 'transparent', label: 'Şeffaf' },
    { val: '#E7F5EB', label: 'Yeşil' },
    { val: '#E6F4F1', label: 'Teal' },
    { val: '#FEF3C7', label: 'Sarı' },
    { val: '#EFF6FF', label: 'Mavi' },
    { val: '#FEE2E2', label: 'Kırmızı' },
    { val: '#F7F5EE', label: 'Kağıt' }
  ];

  const SHAPE_LIST = [
    { kind: 'rect', label: 'Dikdörtgen', icon: 'square' },
    { kind: 'roundRect', label: 'Yuvarlak', icon: 'square' },
    { kind: 'ellipse', label: 'Daire', icon: 'circle' },
    { kind: 'triangle', label: 'Üçgen', icon: 'triangle' },
    { kind: 'diamond', label: 'Eşkenar', icon: 'diamond' },
    { kind: 'pentagon', label: 'Beşgen', icon: 'shield' },
    { kind: 'hexagon', label: 'Altıgen', icon: 'layers' },
    { kind: 'star', label: 'Yıldız', icon: 'starOutline' },
    { kind: 'callout', label: 'Balon', icon: 'messageCircle' }
  ];

  const LINE_LIST = [
    { kind: 'line', label: 'Düz Çizgi', icon: 'slantedLine' },
    { kind: 'arrow', label: 'Ok', icon: 'arrowUpRight' },
    { kind: 'doubleArrow', label: 'Çift Ok', icon: 'repeat' }
  ];

  const TEMPLATES = [
    {
      id: 'blank',
      label: 'Boş Sayfa',
      tags: [],
      inputMode: 'write',
      docHtml: '<p></p>',
      objects: []
    },
    {
      id: 'vocab-table',
      label: 'Kelime Tablosu',
      tags: ['Kelime'],
      inputMode: 'write',
      docHtml: `<p>Öğrendiğin kelimeleri aşağıdaki tabloya ekle:</p>
        <table>
          <thead><tr><th>Kelime</th><th>Tür</th><th>Türkçe Anlam</th><th>Eş / Zıt</th><th>Örnek Cümle</th></tr></thead>
          <tbody>
            <tr><td>implement</td><td>fiil</td><td>uygulamak, yürürlüğe koymak</td><td>carry out / neglect</td><td>We need to implement the plan immediately.</td></tr>
            <tr><td>subsequent</td><td>sıfat</td><td>sonraki, müteakip</td><td>following / prior</td><td>Subsequent studies confirmed the results.</td></tr>
            <tr><td></td><td></td><td></td><td></td><td></td></tr>
          </tbody>
        </table>`,
      objects: []
    },
    {
      id: 'cornell',
      label: 'Cornell Notu',
      tags: ['Cornell'],
      inputMode: 'write',
      docHtml: `<div class="nb-callout is-blue"><div class="nb-callout-title">Anahtar İpuçları &amp; Sorular</div><div>Bu konudaki temel soru veya hatırlatıcı anahtar kelimeler...</div></div>
        <h3>Ana Notlar</h3>
        <ul><li>Birinci önemli nokta ve açıklama</li><li>İkinci önemli nokta ve örnek cümle</li></ul>
        <div class="nb-callout"><div class="nb-callout-title">Bölüm Özeti</div><div>Tek paragrafta konunun özeti...</div></div>`,
      objects: []
    },
    {
      id: 'grammar',
      label: 'Gramer Özeti',
      tags: ['Gramer'],
      inputMode: 'write',
      docHtml: `<p>Kuralın temel kullanım amacı:</p>
        <pre>If + Past Simple, ... would + V1</pre>
        <h3>Örnek Cümleler</h3>
        <ul><li>If she studied harder, she would pass the exam effortlessly.</li></ul>
        <div class="nb-callout is-amber"><div class="nb-callout-title">Sınavda Dikkat</div><div>YDT sorularında zaman uyumuna ve devrik yapılara (Were I...) dikkat et.</div></div>`,
      objects: []
    },
    {
      id: 'checklist',
      label: 'Kontrol Listesi',
      tags: ['Plan'],
      inputMode: 'write',
      docHtml: `<div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">Günün 20 yeni kelimesini flash kartlarla tekrar et</span></div>
        <div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">Hata kumbarasındaki kelimeleri temizle</span></div>
        <div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">1 adet Günlük Reading metni çöz ve bilinmeyenleri ekle</span></div>
        <div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">Phrasal verb quiz ile hızlı tekrar yap</span></div>`,
      objects: []
    },
    {
      id: 'mindmap',
      label: 'Zihin Haritası',
      tags: ['Şema'],
      inputMode: 'draw',
      docHtml: '<p>Şemadaki kutulara çift tıklayarak metinlerini düzenleyebilirsin.</p>',
      objects: [
        { id: 'mm_c', type: 'roundRect', x: 185, y: 195, w: 170, h: 68, strokeColor: '#3F621A', fillColor: '#E7F5EB', strokeWidth: 2.5, strokeStyle: 'solid', opacity: 1, text: 'Ana Konu\n(Çift Tıkla)', fontSize: 15, fontFamily: 'sans', rotation: 0 },
        { id: 'mm_a1', type: 'arrow', x1: 185, y1: 215, x2: 115, y2: 145, strokeColor: '#0F766E', strokeWidth: 2, strokeStyle: 'solid', opacity: 1 },
        { id: 'mm_a2', type: 'arrow', x1: 355, y1: 215, x2: 425, y2: 145, strokeColor: '#1D4ED8', strokeWidth: 2, strokeStyle: 'solid', opacity: 1 },
        { id: 'mm_a3', type: 'arrow', x1: 185, y1: 245, x2: 115, y2: 315, strokeColor: '#B45309', strokeWidth: 2, strokeStyle: 'solid', opacity: 1 },
        { id: 'mm_a4', type: 'arrow', x1: 355, y1: 245, x2: 425, y2: 315, strokeColor: '#B91C1C', strokeWidth: 2, strokeStyle: 'solid', opacity: 1 },
        { id: 'mm_n1', type: 'roundRect', x: 25, y: 88, w: 125, h: 52, strokeColor: '#0F766E', fillColor: '#E6F4F1', strokeWidth: 2, strokeStyle: 'solid', opacity: 1, text: 'Eş Anlamlar', fontSize: 13, fontFamily: 'sans', rotation: 0 },
        { id: 'mm_n2', type: 'roundRect', x: 390, y: 88, w: 125, h: 52, strokeColor: '#1D4ED8', fillColor: '#EFF6FF', strokeWidth: 2, strokeStyle: 'solid', opacity: 1, text: 'Örnek Cümle', fontSize: 13, fontFamily: 'sans', rotation: 0 },
        { id: 'mm_n3', type: 'roundRect', x: 25, y: 315, w: 125, h: 52, strokeColor: '#B45309', fillColor: '#FEF3C7', strokeWidth: 2, strokeStyle: 'solid', opacity: 1, text: 'İpuçları', fontSize: 13, fontFamily: 'sans', rotation: 0 },
        { id: 'mm_n4', type: 'roundRect', x: 390, y: 315, w: 125, h: 52, strokeColor: '#B91C1C', fillColor: '#FEE2E2', strokeWidth: 2, strokeStyle: 'solid', opacity: 1, text: 'Dikkat Et', fontSize: 13, fontFamily: 'sans', rotation: 0 }
      ]
    }
  ];

  let store = null;
  let ui = null;
  let canvasCtrl = null;
  let sheetObserver = null;
  let saveTimer = null;
  let searchQuery = '';
  let pageScope = 'book';
  let activePopover = null;
  let editingBookId = null;
  let bookDraft = { color: 'green', icon: 'books', defaultPaper: 'ruled' };
  let newPageDraft = { tone: 'auto', templateId: 'blank' };
  let pendingConfirmAction = null;
  let dom = {};

  function uid(p) {
    return (p || 'nb') + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function cloneDeep(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function paperPreviewSvg(paperId) {
    if (paperId === 'ruled') {
      return `<svg viewBox="0 0 64 46" class="nb-paper-svg" aria-hidden="true">
        <line x1="12" y1="0" x2="12" y2="46" stroke="#B91C1C" stroke-opacity="0.28" stroke-width="1"/>
        <line x1="0" y1="11" x2="64" y2="11" stroke="currentColor" stroke-opacity="0.24" stroke-width="1"/>
        <line x1="0" y1="20" x2="64" y2="20" stroke="currentColor" stroke-opacity="0.24" stroke-width="1"/>
        <line x1="0" y1="29" x2="64" y2="29" stroke="currentColor" stroke-opacity="0.24" stroke-width="1"/>
        <line x1="0" y1="38" x2="64" y2="38" stroke="currentColor" stroke-opacity="0.24" stroke-width="1"/>
      </svg>`;
    }
    if (paperId === 'dots') {
      const dots = [];
      for (let x = 8; x <= 56; x += 12) {
        for (let y = 8; y <= 38; y += 10) {
          dots.push(`<circle cx="${x}" cy="${y}" r="1.15" fill="currentColor" fill-opacity="0.38"/>`);
        }
      }
      return `<svg viewBox="0 0 64 46" class="nb-paper-svg" aria-hidden="true">${dots.join('')}</svg>`;
    }
    if (paperId === 'grid') {
      return `<svg viewBox="0 0 64 46" class="nb-paper-svg" aria-hidden="true">
        <path d="M12 0V46 M24 0V46 M36 0V46 M48 0V46 M0 11H64 M0 23H64 M0 35H64" stroke="currentColor" stroke-opacity="0.22" stroke-width="1"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 64 46" class="nb-paper-svg" aria-hidden="true">
      <rect x="10" y="14" width="44" height="2" rx="1" fill="currentColor" fill-opacity="0.14"/>
      <rect x="10" y="22" width="32" height="2" rx="1" fill="currentColor" fill-opacity="0.1"/>
    </svg>`;
  }

  function createPageFromTemplate(tpl, paper, paperTone, customTitle) {
    const chosenPaper = paper || 'ruled';
    const now = Date.now();
    return {
      id: uid('pg'),
      title: customTitle || (tpl && tpl.id !== 'blank' ? tpl.label : 'Yeni Sayfa'),
      tags: tpl && Array.isArray(tpl.tags) ? [...tpl.tags] : [],
      pinned: false,
      inputMode: (tpl && tpl.inputMode) || 'write',
      docFont: 'sans',
      docSize: 'md',
      docHtml: (tpl && tpl.docHtml) || '<p></p>',
      createdAt: now,
      updatedAt: now,
      canvas: {
        id: uid('cv'),
        paper: chosenPaper,
        paperTone: paperTone || 'auto',
        objects: tpl && Array.isArray(tpl.objects) ? cloneDeep(tpl.objects) : []
      }
    };
  }

  function createStarterStore() {
    const b1Id = uid('book');
    const b2Id = uid('book');
    const now = Date.now();
    return {
      version: 2,
      activeNotebookId: b1Id,
      notebooks: [
        {
          id: b1Id,
          name: 'Genel Çalışma Defteri',
          color: 'green',
          icon: 'books',
          defaultPaper: 'ruled',
          createdAt: now,
          updatedAt: now,
          activePageIndex: 0,
          pages: [
            {
              id: uid('pg'),
              title: 'Çalışma Notlarım',
              tags: ['YDT', 'Başlangıç'],
              pinned: true,
              inputMode: 'write',
              docFont: 'sans',
              docSize: 'md',
              docHtml: `<p>Bu sayfada doğrudan <b>yazı yazabilir</b>, üstten <b>Çiz</b> moduna geçerek aynı kağıdın üzerine şekiller, oklar veya serbest notlar çizebilirsin.</p>
                <div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">Yeni sayfa açarken Çizgili, Noktalı, Kareli veya Düz kağıt seç</span></div>
                <div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">Çalıştığın kelimeyi "Bağlam Ekle" ile sayfaya aktar</span></div>`,
              createdAt: now,
              updatedAt: now,
              canvas: {
                id: uid('cv'),
                paper: 'ruled',
                paperTone: 'auto',
                objects: []
              }
            },
            createPageFromTemplate(TEMPLATES[1], 'grid', 'auto', 'Kelime Çalışma Tablosu')
          ]
        },
        {
          id: b2Id,
          name: 'Gramer & Şemalar',
          color: 'blue',
          icon: 'graduationCap',
          defaultPaper: 'dots',
          createdAt: now,
          updatedAt: now,
          activePageIndex: 0,
          pages: [
            createPageFromTemplate(TEMPLATES[3], 'dots', 'auto', 'Gramer & Bağlaç Notları')
          ]
        }
      ]
    };
  }

  function migrateV1ToV2(v1) {
    if (!v1 || !Array.isArray(v1.notes) || !v1.notes.length) {
      return createStarterStore();
    }
    const folders = Array.isArray(v1.folders) && v1.folders.length
      ? v1.folders
      : [{ id: 'f_general', name: 'Genel Notlar', color: 'green' }];

    const bookMap = new Map();
    folders.forEach((f, idx) => {
      const bookId = f.id || uid('book');
      bookMap.set(bookId, {
        id: bookId,
        name: f.name || `Defter ${idx + 1}`,
        color: BOOK_COLORS.some(c => c.id === f.color) ? f.color : 'green',
        icon: 'books',
        defaultPaper: 'dots',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        activePageIndex: 0,
        pages: []
      });
    });

    let targetBookId = null;
    let targetPageIdx = 0;

    v1.notes.forEach(n => {
      const fId = bookMap.has(n.folderId) ? n.folderId : Array.from(bookMap.keys())[0];
      const book = bookMap.get(fId);
      const v1Pages = Array.isArray(n.pages) && n.pages.length
        ? n.pages
        : [{ id: uid('cv'), paper: 'dots', paperTone: 'auto', objects: [] }];

      v1Pages.forEach((cp, pIdx) => {
        const pageObj = {
          id: uid('pg'),
          title: pIdx === 0 ? (n.title || 'Başlıksız Sayfa') : `${n.title || 'Sayfa'} (${pIdx + 1})`,
          tags: Array.isArray(n.tags) ? [...n.tags] : [],
          pinned: pIdx === 0 ? !!n.pinned : false,
          inputMode: n.viewMode === 'canvas' ? 'draw' : 'write',
          docFont: n.docFont || 'sans',
          docSize: n.docSize || 'md',
          docHtml: pIdx === 0 ? (n.docHtml || '') : '',
          createdAt: n.createdAt || Date.now(),
          updatedAt: n.updatedAt || Date.now(),
          canvas: {
            id: cp.id || uid('cv'),
            paper: cp.paper || 'dots',
            paperTone: cp.paperTone || 'auto',
            objects: Array.isArray(cp.objects) ? cloneDeep(cp.objects) : []
          }
        };
        book.pages.push(pageObj);
        if (n.id === v1.activeNoteId && pIdx === (n.activePageIndex || 0)) {
          targetBookId = book.id;
          targetPageIdx = book.pages.length - 1;
        }
      });
    });

    const notebooks = Array.from(bookMap.values()).filter(b => b.pages.length > 0);
    if (!notebooks.length) return createStarterStore();

    const activeNbId = targetBookId && notebooks.some(b => b.id === targetBookId) ? targetBookId : notebooks[0].id;
    const activeNb = notebooks.find(b => b.id === activeNbId);
    if (activeNb) activeNb.activePageIndex = Math.max(0, Math.min(targetPageIdx, activeNb.pages.length - 1));

    return {
      version: 2,
      activeNotebookId: activeNbId,
      notebooks: notebooks
    };
  }

  function normalizeStore(s) {
    if (!s || !Array.isArray(s.notebooks) || !s.notebooks.length) {
      return createStarterStore();
    }
    s.version = 2;
    s.notebooks.forEach((b, idx) => {
      if (!b.id) b.id = uid('book');
      if (!b.name) b.name = `Defter ${idx + 1}`;
      if (!BOOK_COLORS.some(c => c.id === b.color)) b.color = 'green';
      if (!BOOK_ICONS.includes(b.icon)) b.icon = 'books';
      if (!PAPER_LABELS[b.defaultPaper]) b.defaultPaper = 'ruled';
      if (!Array.isArray(b.pages) || !b.pages.length) {
        b.pages = [createPageFromTemplate(TEMPLATES[0], b.defaultPaper, 'auto', 'Sayfa 1')];
      }
      b.pages.forEach((p, pIdx) => {
        if (!p.id) p.id = uid('pg');
        if (typeof p.title !== 'string') p.title = `Sayfa ${pIdx + 1}`;
        if (!Array.isArray(p.tags)) p.tags = [];
        if (p.inputMode !== 'write' && p.inputMode !== 'draw') {
          p.inputMode = p.viewMode === 'canvas' ? 'draw' : 'write';
        }
        if (!p.canvas || typeof p.canvas !== 'object') {
          p.canvas = { id: uid('cv'), paper: b.defaultPaper || 'ruled', paperTone: 'auto', objects: [] };
        }
        if (!PAPER_LABELS[p.canvas.paper]) p.canvas.paper = b.defaultPaper || 'ruled';
        if (!Array.isArray(p.canvas.objects)) p.canvas.objects = [];
      });
      b.activePageIndex = Math.max(0, Math.min(b.activePageIndex || 0, b.pages.length - 1));
    });
    if (!s.activeNotebookId || !s.notebooks.some(b => b.id === s.activeNotebookId)) {
      s.activeNotebookId = s.notebooks[0].id;
    }
    return s;
  }

  function loadState() {
    try {
      const rawV2 = localStorage.getItem(DATA_KEY_V2);
      if (rawV2) {
        store = normalizeStore(JSON.parse(rawV2));
      } else {
        const rawV1 = localStorage.getItem(DATA_KEY_V1);
        if (rawV1) {
          store = normalizeStore(migrateV1ToV2(JSON.parse(rawV1)));
          localStorage.setItem(DATA_KEY_V2, JSON.stringify(store));
        } else {
          store = createStarterStore();
        }
      }
    } catch (_) {
      store = createStarterStore();
    }

    try {
      const rawUi = localStorage.getItem(UI_KEY);
      ui = rawUi ? JSON.parse(rawUi) : {};
    } catch (_) {
      ui = {};
    }
    ui = Object.assign({
      corner: 'br',
      width: 600,
      height: 660,
      isOpen: false,
      isFullscreen: false,
      sidebarOpen: false
    }, ui);
    if (!CORNERS.includes(ui.corner)) ui.corner = 'br';
  }

  function saveStoreNow() {
    try {
      localStorage.setItem(DATA_KEY_V2, JSON.stringify(store));
      if (dom.saveStatus) dom.saveStatus.textContent = 'Kaydedildi';
    } catch (_) {
      if (dom.saveStatus) dom.saveStatus.textContent = 'Depolama Dolu!';
      if (typeof showToast === 'function') showToast('Depolama alanı sınırına ulaşıldı!');
    }
  }

  function scheduleSave() {
    if (dom.saveStatus) dom.saveStatus.textContent = 'Kaydediliyor...';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveStoreNow, 320);
  }

  function saveUI() {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify(ui));
    } catch (_) {}
  }

  function getActiveNotebook() {
    return store.notebooks.find(b => b.id === store.activeNotebookId) || store.notebooks[0];
  }

  function getActivePage() {
    const book = getActiveNotebook();
    const idx = Math.max(0, Math.min(book.activePageIndex || 0, book.pages.length - 1));
    book.activePageIndex = idx;
    return book.pages[idx];
  }

  function getTotalPageCount() {
    return store.notebooks.reduce((sum, b) => sum + (b.pages ? b.pages.length : 0), 0);
  }

  function sanitizeNotebookHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    tmp.querySelectorAll('script, style, iframe, object, embed, link').forEach(el => el.remove());
    tmp.querySelectorAll('*').forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || (name === 'href' && /^\s*javascript:/i.test(attr.value))) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return tmp.innerHTML;
  }

  function stripHtml(html) {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || d.innerText || '').trim();
  }

  function formatDateShort(ts) {
    try {
      return new Date(ts || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    } catch (_) {
      return '';
    }
  }

  function padPageNum(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /* ── Build DOM Structure ── */
  function buildDOM() {
    if (document.getElementById('nb-drawer')) return;

    const dock = document.createElement('button');
    dock.type = 'button';
    dock.id = 'nb-dock-tab';
    dock.className = `nb-dock-tab pos-${ui.corner}`;
    dock.setAttribute('aria-label', 'Not Defterini Aç (Alt+N)');
    dock.title = 'Not Defteri (Açmak için tıkla, köşeye taşımak için sürükle)';
    dock.innerHTML = `
      <span class="nb-dock-icon">${icon('notebook', 16)}</span>
      <span class="nb-dock-label">Not Defteri</span>
      <span class="nb-dock-badge" id="nb-dock-badge">${getTotalPageCount()}</span>
      <span class="nb-dock-grip" aria-hidden="true"><span></span><span></span><span></span></span>
    `;

    const zones = document.createElement('div');
    zones.id = 'nb-snap-zones';
    zones.className = 'nb-snap-zones';
    zones.innerHTML = CORNERS.map(c => `
      <div class="nb-snap-zone" data-corner="${c}">
        ${icon(c === 'tl' ? 'cornerUpLeft' : c === 'tr' ? 'cornerUpRight' : c === 'bl' ? 'cornerDownLeft' : 'cornerDownRight', 20)}
        <span>${CORNER_LABELS[c]}</span>
      </div>
    `).join('');

    const backdrop = document.createElement('div');
    backdrop.id = 'nb-backdrop';
    backdrop.className = 'nb-backdrop';
    backdrop.addEventListener('click', () => closeNotebook());

    const drawer = document.createElement('aside');
    drawer.id = 'nb-drawer';
    drawer.className = `nb-drawer pos-${ui.corner}`;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Not Defteri');
    drawer.style.setProperty('--nb-w', ui.width + 'px');
    drawer.style.setProperty('--nb-h', ui.height + 'px');

    drawer.innerHTML = `
      <div class="nb-resize-handle" id="nb-resize-handle" title="Boyutlandır" aria-hidden="true">${icon('move', 12)}</div>

      <!-- Slim Header -->
      <header class="nb-header" id="nb-header">
        <span class="nb-drag-handle" id="nb-drag-handle" title="Köşeye taşımak için sürükle" aria-label="Köşeye taşı">${icon('move', 14)}</span>
        <button type="button" class="nb-icon-btn" id="nb-sidebar-toggle" title="Defterler &amp; Sayfalar">${icon('sidebar', 16)}</button>
        <button type="button" class="nb-active-book-pill" id="nb-active-book-pill" title="Defter Değiştir">
          <span class="nb-book-dot is-green" id="nb-active-book-dot"></span>
          <span class="nb-active-book-name" id="nb-active-book-name">Defter</span>
          ${icon('chevronDown', 12)}
        </button>

        <div class="nb-mode-seg" role="tablist" aria-label="Sayfa Modu">
          <button type="button" class="nb-mode-btn is-active" data-input-mode="write" title="Yazı Modu (Alt+M)">${icon('type', 13)}<span>Yaz</span></button>
          <button type="button" class="nb-mode-btn" data-input-mode="draw" title="Çizim &amp; Şekil Modu (Alt+M)">${icon('penLine', 13)}<span>Çiz</span></button>
        </div>

        <div class="nb-header-controls">
          <button type="button" class="nb-icon-btn" id="nb-paper-btn" title="Sayfa Kağıdı (Çizgili / Noktalı / Kareli)" aria-label="Sayfa Kağıdı">${icon('grid', 15)}</button>
          <button type="button" class="nb-icon-btn" id="nb-corner-btn" title="Köşe Konumu" aria-label="Köşe Konumu">${icon('sliders', 15)}</button>
          <button type="button" class="nb-icon-btn" id="nb-export-btn" title="Dışa Aktar &amp; Yedekle" aria-label="Dışa Aktar">${icon('fileDown', 15)}</button>
          <button type="button" class="nb-icon-btn" id="nb-fullscreen-btn" title="Tam Ekran Aç/Kapat" aria-label="Tam Ekran">${icon('maximize', 15)}</button>
          <button type="button" class="nb-icon-btn" id="nb-close-btn" title="Kapat (Esc)" aria-label="Kapat">${icon('x', 16)}</button>
        </div>
      </header>

      <!-- Single Contextual Ribbon -->
      <div class="nb-ribbon" id="nb-ribbon">
        <!-- Write Ribbon -->
        <div class="nb-ribbon-group is-active" id="nb-ribbon-write">
          <select class="nb-rt-select" id="nb-rt-block" title="Başlık / Paragraf">
            <option value="P">Normal</option>
            <option value="H1">Başlık 1</option>
            <option value="H2">Başlık 2</option>
            <option value="H3">Başlık 3</option>
          </select>
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-rt-btn" data-cmd="bold" title="Kalın (Ctrl+B)">${icon('bold', 14)}</button>
          <button type="button" class="nb-rt-btn" data-cmd="italic" title="İtalik (Ctrl+I)">${icon('italic', 14)}</button>
          <button type="button" class="nb-rt-btn" data-cmd="underline" title="Altı Çizili (Ctrl+U)">${icon('underline', 14)}</button>
          <button type="button" class="nb-rt-btn" data-cmd="strikeThrough" title="Üstü Çizili">${icon('strikethrough', 14)}</button>
          <input type="color" class="nb-rt-color-input" id="nb-rt-forecolor" value="#3F621A" title="Yazı Rengi" aria-label="Yazı rengi">
          <input type="color" class="nb-rt-color-input" id="nb-rt-hilite" value="#FEF3C7" title="Vurgu Rengi" aria-label="Vurgu rengi">
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-rt-btn" data-cmd="insertUnorderedList" title="Madde Listesi">${icon('list', 14)}</button>
          <button type="button" class="nb-rt-btn" data-cmd="insertOrderedList" title="Numaralı Liste">${icon('listOrdered', 14)}</button>
          <button type="button" class="nb-rt-btn" data-action="todo" title="Kontrol Listesi">${icon('listChecks', 14)}</button>
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-rt-btn" data-action="table" title="Tablo Ekle">${icon('table', 14)}</button>
          <button type="button" class="nb-rt-btn" data-action="callout" title="Bilgi Kutusu">${icon('info', 14)}</button>
          <button type="button" class="nb-rt-btn" data-action="quote" title="Alıntı">${icon('quote', 14)}</button>
          <button type="button" class="nb-rt-btn" data-action="code" title="Kod / Formül">${icon('code', 14)}</button>
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-rt-btn" id="nb-rt-font-toggle" title="Yazı Tipi: Sans / Serif">Sans</button>
          <button type="button" class="nb-rt-btn is-accent-soft" id="nb-insert-context-btn" title="Çalıştığın aktif kelime veya üniteyi ekle">
            ${icon('plus', 13)}<span>Bağlam</span>
          </button>
        </div>

        <!-- Draw Ribbon -->
        <div class="nb-ribbon-group" id="nb-ribbon-draw">
          <button type="button" class="nb-tool-btn" data-tool="select" title="Seç / Taşı / Düzenle (V)">${icon('mousePointer', 15)}</button>
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-tool-btn is-active" data-tool="pen" title="Kalem (P)">${icon('penLine', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="highlighter" title="Fosforlu Kalem (M)">${icon('highlighter', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="eraser" id="nb-eraser-btn" title="Silgi (E)">${icon('eraser', 15)}</button>
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-tool-btn" data-tool="shape" id="nb-shapes-btn" title="Şekiller (S)">${icon('shapes', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="line" id="nb-lines-btn" title="Çizgi &amp; Ok (L)">${icon('arrowUpRight', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="text" title="Metin Kutusu (T)">${icon('type', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="sticky" title="Yapışkan Not (N)">${icon('stickyNote', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="image" id="nb-image-btn" title="Görsel Ekle (I)">${icon('image', 15)}</button>
          <button type="button" class="nb-tool-btn" data-tool="laser" title="Lazer İşaretçi (Z)">${icon('laser', 15)}</button>
          <div class="nb-rt-sep"></div>
          <div class="nb-swatches" id="nb-stroke-swatches"></div>
          <button type="button" class="nb-rt-btn" id="nb-style-popover-btn" title="Kalınlık, Dolgu ve Çizgi Stili">${icon('palette', 14)}<span>Stil</span></button>
          <div class="nb-rt-sep"></div>
          <button type="button" class="nb-tool-btn" id="nb-c-undo" title="Geri Al (Ctrl+Z)">${icon('undo', 15)}</button>
          <button type="button" class="nb-tool-btn" id="nb-c-redo" title="Yinele (Ctrl+Y)">${icon('redo', 15)}</button>
          <button type="button" class="nb-tool-btn is-danger" id="nb-c-clear" title="Çizimi Temizle">${icon('trash', 15)}</button>
          <input type="file" id="nb-c-img-input" accept="image/*" style="display:none">
        </div>
      </div>

      <!-- Body: Collapsible Sidebar + Unified Paper Desk -->
      <div class="nb-body">
        <aside class="nb-sidebar" id="nb-sidebar">
          <div class="nb-books-section">
            <div class="nb-section-head">
              <span>Defterlerim</span>
              <button type="button" class="nb-compact-btn" id="nb-new-notebook-btn">${icon('plus', 12)}<span>Yeni Defter</span></button>
            </div>
            <div class="nb-books-list" id="nb-books-list"></div>
          </div>

          <div class="nb-pages-section">
            <div class="nb-section-head">
              <span class="nb-active-book-heading" id="nb-sidebar-book-name">Sayfalar</span>
              <button type="button" class="nb-compact-btn is-accent" id="nb-sidebar-newpage-btn" title="Yeni Sayfa Aç">${icon('plus', 12)}<span>Yeni Sayfa</span></button>
            </div>
            <div class="nb-search-box">
              ${icon('search', 13)}
              <input type="text" class="nb-search-input" id="nb-search-input" placeholder="Sayfalarda ara...">
            </div>
            <div class="nb-scope-chips" id="nb-scope-chips">
              <button type="button" class="nb-folder-chip is-active" data-scope="book">Bu Defter</button>
              <button type="button" class="nb-folder-chip" data-scope="pinned">${icon('pin', 11)} Sabit</button>
              <button type="button" class="nb-folder-chip" data-scope="all">Tümü</button>
            </div>
            <div class="nb-pages-list" id="nb-pages-list"></div>
          </div>
        </aside>

        <!-- Unified Single-Sheet Desk -->
        <div class="nb-workspace" id="nb-workspace">
          <div class="nb-desk" id="nb-desk">
            <div class="nb-paper-sheet" id="nb-paper-sheet">
              <!-- Layer 0: Crisp HiDPI Paper Pattern -->
              <canvas class="nb-paper-canvas" id="nb-paper-canvas" aria-hidden="true"></canvas>

              <!-- Layer 1: Editorial Page Title, Tags & Rich Text -->
              <div class="nb-sheet-content" id="nb-sheet-content">
                <input type="text" class="nb-sheet-title" id="nb-title-input" placeholder="Sayfa başlığı..." maxlength="80" aria-label="Sayfa başlığı">
                <div class="nb-sheet-meta">
                  <span class="nb-sheet-date" id="nb-sheet-date"></span>
                  <span class="nb-sheet-paper-badge" id="nb-sheet-paper-badge">Çizgili</span>
                  <div class="nb-tag-row" id="nb-tag-row"></div>
                </div>
                <div class="nb-rt-editor" id="nb-rt-editor" contenteditable="true" spellcheck="true" data-placeholder="Bu sayfaya yazmaya başla veya üstten Çiz moduna geçip üzerine çizim yap..."></div>
              </div>

              <!-- Layer 2: Transparent Vector/Ink Overlay -->
              <canvas class="nb-canvas" id="nb-canvas"></canvas>
              <textarea class="nb-inline-text-editor" id="nb-inline-text" placeholder="Metin yaz..." spellcheck="false"></textarea>

              <div class="nb-selection-bar" id="nb-selection-bar">
                <button type="button" class="nb-icon-btn" data-sel="front" title="En Öne Getir">${icon('layersFront', 14)}</button>
                <button type="button" class="nb-icon-btn" data-sel="back" title="En Arkaya Gönder">${icon('layersBack', 14)}</button>
                <button type="button" class="nb-icon-btn" data-sel="duplicate" title="Çoğalt (Ctrl+D)">${icon('copy', 14)}</button>
                <button type="button" class="nb-icon-btn" data-sel="lock" id="nb-sel-lock-btn" title="Kilitle / Kilidi Aç">${icon('lock', 14)}</button>
                <button type="button" class="nb-icon-btn is-danger" data-sel="delete" title="Sil (Del)">${icon('trash', 14)}</button>
              </div>
            </div>
          </div>

          <!-- Slim Bottom Page-Flip Bar -->
          <div class="nb-pagebar" id="nb-pagebar">
            <div class="nb-page-controls">
              <button type="button" class="nb-icon-btn" id="nb-page-prev" title="Önceki Sayfa (Alt+Sol Ok)">${icon('chevronLeft', 14)}</button>
              <select class="nb-page-select" id="nb-page-select" title="Sayfaya Git" aria-label="Sayfa Seçici"></select>
              <button type="button" class="nb-icon-btn" id="nb-page-next" title="Sonraki Sayfa (Alt+Sağ Ok)">${icon('chevronRight', 14)}</button>
              <button type="button" class="nb-compact-btn is-accent" id="nb-page-add" title="Yeni Sayfa Aç (Kağıt Seç)">${icon('plus', 12)}<span>Yeni Sayfa</span></button>
              <button type="button" class="nb-icon-btn" id="nb-page-dup" title="Sayfayı Çoğalt">${icon('copy', 13)}</button>
              <button type="button" class="nb-icon-btn is-danger" id="nb-page-del" title="Sayfayı Sil">${icon('trash', 13)}</button>
            </div>
            <div class="nb-pagebar-status">
              <span id="nb-rt-counts">0 kelime</span>
              <span class="nb-save-pill" id="nb-save-status">Kaydedildi</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Popovers anchored cleanly at drawer root -->
      <!-- 1. New Page Visual Paper Picker -->
      <div class="nb-popover nb-newpage-popover" id="nb-newpage-popover">
        <div class="nb-popover-title">Yeni Sayfa Kağıdını Seç</div>
        <div class="nb-paper-picker-grid" id="nb-newpage-papers">
          ${PAPER_TYPES.map(pt => `
            <button type="button" class="nb-paper-card" data-new-paper="${pt.id}">
              <div class="nb-paper-thumb">${paperPreviewSvg(pt.id)}</div>
              <div class="nb-paper-card-name">${pt.label}</div>
              <div class="nb-paper-card-desc">${pt.desc}</div>
            </button>
          `).join('')}
        </div>
        <div class="nb-popover-subrow">
          <span class="nb-popover-sublabel">Kağıt Tonu</span>
          <div class="nb-tone-pills" id="nb-newpage-tones">
            ${PAPER_TONES.map(tn => `
              <button type="button" class="nb-tone-chip ${tn.id === 'auto' ? 'is-active' : ''}" data-new-tone="${tn.id}">
                <span class="nb-tone-swatch" style="background:${tn.swatch}"></span>
                <span>${tn.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="nb-popover-subrow">
          <span class="nb-popover-sublabel">Şablon (İsteğe Bağlı)</span>
          <div class="nb-tpl-chips" id="nb-newpage-tpls">
            ${TEMPLATES.map(t => `
              <button type="button" class="nb-tpl-chip ${t.id === 'blank' ? 'is-active' : ''}" data-new-tpl="${t.id}">${t.label}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 2. Current Page Paper Switcher -->
      <div class="nb-popover nb-paper-popover" id="nb-paper-popover">
        <div class="nb-popover-title">Bu Sayfanın Kağıdı</div>
        <div class="nb-paper-mini-grid" id="nb-cur-paper-grid">
          ${PAPER_TYPES.map(pt => `
            <button type="button" class="nb-paper-mini-btn" data-cur-paper="${pt.id}">
              <div class="nb-paper-thumb is-sm">${paperPreviewSvg(pt.id)}</div>
              <span>${pt.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="nb-popover-subrow">
          <span class="nb-popover-sublabel">Ton</span>
          <div class="nb-tone-pills" id="nb-cur-paper-tones">
            ${PAPER_TONES.map(tn => `
              <button type="button" class="nb-tone-chip" data-cur-tone="${tn.id}">
                <span class="nb-tone-swatch" style="background:${tn.swatch}"></span>
                <span>${tn.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 3. Draw Style Popover -->
      <div class="nb-popover nb-style-popover" id="nb-style-popover">
        <div class="nb-popover-title">Çizim Stili</div>
        <div class="nb-style-row">
          <span>Özel Renk</span>
          <input type="color" class="nb-rt-color-input" id="nb-c-stroke-picker" value="#3F621A" aria-label="Özel renk">
        </div>
        <div class="nb-style-row">
          <span>Dolgu</span>
          <div class="nb-swatches" id="nb-fill-swatches"></div>
        </div>
        <div class="nb-style-row">
          <span>Kalınlık</span>
          <input type="range" class="nb-range" id="nb-c-width" min="1" max="24" value="3">
          <span class="nb-num-readout" id="nb-c-width-val">3px</span>
        </div>
        <div class="nb-style-row">
          <span>Opaklık</span>
          <input type="range" class="nb-range" id="nb-c-opacity" min="15" max="100" value="100">
          <span class="nb-num-readout" id="nb-c-opacity-val">100%</span>
        </div>
        <div class="nb-style-row">
          <span>Çizgi</span>
          <select class="nb-rt-select" id="nb-c-style">
            <option value="solid">Düz</option>
            <option value="dashed">Kesikli</option>
            <option value="dotted">Noktalı</option>
          </select>
          <button type="button" class="nb-rt-btn" id="nb-c-snap-btn" title="Izgaraya Hizala">${icon('grid', 13)}<span>Hizala</span></button>
        </div>
      </div>

      <!-- 4. Shapes, Lines, Eraser Popovers -->
      <div class="nb-popover nb-shapes-popover" id="nb-shapes-popover">
        <div class="nb-popover-title">Şekiller</div>
        <div class="nb-shapes-grid">
          ${SHAPE_LIST.map(s => `
            <button type="button" class="nb-shape-choice" data-shape="${s.kind}">
              ${icon(s.icon, 16)}
              <span>${s.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nb-popover nb-shapes-popover" id="nb-lines-popover">
        <div class="nb-popover-title">Çizgi ve Oklar</div>
        <div class="nb-shapes-grid">
          ${LINE_LIST.map(l => `
            <button type="button" class="nb-shape-choice" data-line="${l.kind}">
              ${icon(l.icon, 16)}
              <span>${l.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="nb-popover nb-eraser-popover" id="nb-eraser-popover">
        <div class="nb-popover-title">Silgi Modu</div>
        <button type="button" class="nb-menu-item" data-eraser="object">${icon('trash', 14)}<span>Nesne Silgisi (Tümünü Sil)</span></button>
        <button type="button" class="nb-menu-item" data-eraser="partial">${icon('eraser', 14)}<span>Kısmi Silgi (Çizgi Parçası)</span></button>
      </div>

      <!-- 5. Corner & Export Popovers -->
      <div class="nb-popover nb-corner-popover" id="nb-corner-popover">
        <div class="nb-popover-title">Köşe Konumu</div>
        <div class="nb-corner-grid">
          <button type="button" class="nb-corner-opt" data-corner="tl">${icon('cornerUpLeft', 15)}<span>Sol Üst</span></button>
          <button type="button" class="nb-corner-opt" data-corner="tr">${icon('cornerUpRight', 15)}<span>Sağ Üst</span></button>
          <button type="button" class="nb-corner-opt" data-corner="bl">${icon('cornerDownLeft', 15)}<span>Sol Alt</span></button>
          <button type="button" class="nb-corner-opt" data-corner="br">${icon('cornerDownRight', 15)}<span>Sağ Alt</span></button>
        </div>
      </div>

      <div class="nb-popover nb-export-popover" id="nb-export-popover">
        <div class="nb-popover-title">Dışa Aktar</div>
        <button type="button" class="nb-menu-item" data-export="png">${icon('image', 14)}<span>Sayfa Çizimini PNG İndir</span></button>
        <button type="button" class="nb-menu-item" data-export="svg">${icon('shapes', 14)}<span>Sayfa Çizimini SVG İndir</span></button>
        <button type="button" class="nb-menu-item" data-export="md">${icon('fileText', 14)}<span>Bu Sayfayı Markdown (.md)</span></button>
        <button type="button" class="nb-menu-item" data-export="txt">${icon('fileDown', 14)}<span>Bu Sayfayı Düz Metin (.txt)</span></button>
        <button type="button" class="nb-menu-item" data-export="book-md">${icon('books', 14)}<span>Tüm Defteri Markdown (.md)</span></button>
        <button type="button" class="nb-menu-item" data-export="json">${icon('save', 14)}<span>Tüm Defterleri Yedekle (JSON)</span></button>
        <label class="nb-menu-item" style="cursor:pointer;">
          ${icon('upload', 14)}<span>Defter Yedeği Yükle</span>
          <input type="file" id="nb-import-json-input" accept=".json" style="display:none">
        </label>
      </div>

      <!-- Create / Edit Notebook Modal -->
      <div class="nb-modal-overlay" id="nb-book-modal">
        <div class="nb-modal-card nb-book-modal-card">
          <div class="nb-modal-head">
            <span class="icon-inline" id="nb-book-modal-title">${icon('books', 16)} <span>Yeni Defter Oluştur</span></span>
            <button type="button" class="nb-icon-btn" id="nb-close-book-modal-btn" aria-label="Kapat">${icon('x', 16)}</button>
          </div>
          <form class="nb-book-form" id="nb-book-form">
            <div class="nb-form-field">
              <label for="nb-book-name-input">Defter Adı</label>
              <input type="text" id="nb-book-name-input" class="nb-form-input" placeholder="Örn: YDS Kelimeler, Reading Notları..." maxlength="40" required>
            </div>
            <div class="nb-form-field">
              <label>Kapak Rengi</label>
              <div class="nb-color-picker-row" id="nb-book-color-picker">
                ${BOOK_COLORS.map(c => `
                  <button type="button" class="nb-color-choice tone-${c.id}" data-book-color="${c.id}" title="${c.label}"></button>
                `).join('')}
              </div>
            </div>
            <div class="nb-form-field">
              <label>Defter İkonu</label>
              <div class="nb-icon-picker-grid" id="nb-book-icon-picker">
                ${BOOK_ICONS.map(ic => `
                  <button type="button" class="nb-icon-choice" data-book-icon="${ic}">${icon(ic, 16)}</button>
                `).join('')}
              </div>
            </div>
            <div class="nb-form-field">
              <label for="nb-book-paper-select">Varsayılan Sayfa Kağıdı</label>
              <select id="nb-book-paper-select" class="nb-form-input">
                <option value="ruled">Çizgili Sayfa</option>
                <option value="dots">Noktalı Sayfa</option>
                <option value="grid">Kareli Sayfa</option>
                <option value="plain">Düz Kağıt</option>
              </select>
            </div>
            <div class="nb-book-form-actions">
              <button type="button" class="nb-secondary-btn" id="nb-cancel-book-btn">Vazgeç</button>
              <button type="submit" class="nb-primary-btn" id="nb-save-book-btn">Defteri Kaydet</button>
            </div>
          </form>
        </div>
      </div>

      <!-- In-App Confirmation Modal -->
      <div class="nb-modal-overlay" id="nb-confirm-modal">
        <div class="nb-modal-card nb-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="nb-confirm-title" aria-describedby="nb-confirm-desc">
          <div class="nb-modal-head">
            <span class="icon-inline" id="nb-confirm-title">${icon('alertTriangle', 16)} <span>Onay</span></span>
            <button type="button" class="nb-icon-btn" id="nb-confirm-close-btn" aria-label="Kapat">${icon('x', 16)}</button>
          </div>
          <div class="nb-confirm-body">
            <p class="nb-confirm-desc" id="nb-confirm-desc"></p>
            <div class="nb-book-form-actions">
              <button type="button" class="nb-secondary-btn" id="nb-confirm-cancel">Vazgeç</button>
              <button type="button" class="nb-danger-btn" id="nb-confirm-ok">Onayla</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dock);
    document.body.appendChild(zones);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    dom = {
      dock, zones, backdrop, drawer,
      dockBadge: document.getElementById('nb-dock-badge'),
      resizeHandle: document.getElementById('nb-resize-handle'),
      header: document.getElementById('nb-header'),
      sidebarToggle: document.getElementById('nb-sidebar-toggle'),
      sidebar: document.getElementById('nb-sidebar'),
      activeBookPill: document.getElementById('nb-active-book-pill'),
      activeBookDot: document.getElementById('nb-active-book-dot'),
      activeBookName: document.getElementById('nb-active-book-name'),
      paperBtn: document.getElementById('nb-paper-btn'),
      cornerBtn: document.getElementById('nb-corner-btn'),
      exportBtn: document.getElementById('nb-export-btn'),
      fullscreenBtn: document.getElementById('nb-fullscreen-btn'),
      closeBtn: document.getElementById('nb-close-btn'),
      ribbonWrite: document.getElementById('nb-ribbon-write'),
      ribbonDraw: document.getElementById('nb-ribbon-draw'),
      workspace: document.getElementById('nb-workspace'),
      desk: document.getElementById('nb-desk'),
      paperSheet: document.getElementById('nb-paper-sheet'),
      paperCanvas: document.getElementById('nb-paper-canvas'),
      sheetContent: document.getElementById('nb-sheet-content'),
      titleInput: document.getElementById('nb-title-input'),
      sheetDate: document.getElementById('nb-sheet-date'),
      sheetPaperBadge: document.getElementById('nb-sheet-paper-badge'),
      booksList: document.getElementById('nb-books-list'),
      sidebarBookName: document.getElementById('nb-sidebar-book-name'),
      scopeChips: document.getElementById('nb-scope-chips'),
      pagesList: document.getElementById('nb-pages-list'),
      tagRow: document.getElementById('nb-tag-row'),
      searchInput: document.getElementById('nb-search-input'),
      rtEditor: document.getElementById('nb-rt-editor'),
      rtBlock: document.getElementById('nb-rt-block'),
      rtCounts: document.getElementById('nb-rt-counts'),
      saveStatus: document.getElementById('nb-save-status'),
      rtFontToggle: document.getElementById('nb-rt-font-toggle'),
      canvas: document.getElementById('nb-canvas'),
      inlineText: document.getElementById('nb-inline-text'),
      selectionBar: document.getElementById('nb-selection-bar'),
      selLockBtn: document.getElementById('nb-sel-lock-btn'),
      pagePrev: document.getElementById('nb-page-prev'),
      pageSelect: document.getElementById('nb-page-select'),
      pageNext: document.getElementById('nb-page-next'),
      pageAdd: document.getElementById('nb-page-add'),
      pageDel: document.getElementById('nb-page-del'),
      newpagePopover: document.getElementById('nb-newpage-popover'),
      paperPopover: document.getElementById('nb-paper-popover'),
      stylePopover: document.getElementById('nb-style-popover'),
      shapesPopover: document.getElementById('nb-shapes-popover'),
      linesPopover: document.getElementById('nb-lines-popover'),
      eraserPopover: document.getElementById('nb-eraser-popover'),
      cornerPopover: document.getElementById('nb-corner-popover'),
      exportPopover: document.getElementById('nb-export-popover'),
      bookModal: document.getElementById('nb-book-modal'),
      bookModalTitle: document.getElementById('nb-book-modal-title'),
      bookNameInput: document.getElementById('nb-book-name-input'),
      bookPaperSelect: document.getElementById('nb-book-paper-select'),
      confirmModal: document.getElementById('nb-confirm-modal'),
      confirmTitle: document.getElementById('nb-confirm-title'),
      confirmDesc: document.getElementById('nb-confirm-desc'),
      confirmOk: document.getElementById('nb-confirm-ok')
    };

    renderSwatches();
    initCanvasEngine();
    bindUIEvents();
    applyUILayout();
    loadActivePageIntoView();
    renderSidebar();
  }

  function renderSwatches() {
    const strokeBox = document.getElementById('nb-stroke-swatches');
    const fillBox = document.getElementById('nb-fill-swatches');
    if (strokeBox) {
      strokeBox.innerHTML = STROKE_PALETTE.map(c => `
        <button type="button" class="nb-swatch ${c.val === 'auto' ? 'is-auto is-active' : ''}"
          data-stroke="${c.val}" title="${c.label}" style="${c.val !== 'auto' ? 'background:' + c.val : ''}"></button>
      `).join('');
    }
    if (fillBox) {
      fillBox.innerHTML = FILL_PALETTE.map(c => `
        <button type="button" class="nb-swatch ${c.val === 'transparent' ? 'is-transparent is-active' : ''}"
          data-fill="${c.val}" title="${c.label}" style="${c.val !== 'transparent' ? 'background:' + c.val : ''}"></button>
      `).join('');
    }
  }

  function syncPaperBackground() {
    if (!dom.paperSheet || !dom.paperCanvas) return;
    const page = getActivePage();
    if (!page) return;
    const w = Math.max(240, Math.floor(dom.paperSheet.clientWidth));
    const h = Math.max(320, Math.floor(dom.paperSheet.clientHeight));
    const paper = page.canvas?.paper || 'ruled';
    const tone = page.canvas?.paperTone || 'auto';

    global.NotebookCanvas.renderPaperBackground(dom.paperCanvas, w, h, paper, tone);

    const palette = global.NotebookCanvas.resolvePaperPalette(tone);
    dom.paperSheet.classList.toggle('is-dark-paper', !!palette.isDark);
    dom.paperSheet.classList.toggle('is-ruled-paper', paper === 'ruled');
    dom.rtEditor.classList.toggle('is-ruled', paper === 'ruled');

    if (dom.sheetPaperBadge) {
      dom.sheetPaperBadge.textContent = PAPER_LABELS[paper] || 'Çizgili';
    }
    if (canvasCtrl) canvasCtrl.resize();
  }

  function initCanvasEngine() {
    canvasCtrl = new global.NotebookCanvas(
      dom.paperSheet,
      dom.canvas,
      dom.inlineText,
      {
        onChange: () => {
          const page = getActivePage();
          if (page) page.updatedAt = Date.now();
          scheduleSave();
          renderSidebar();
        },
        onToolChange: (tool) => syncCanvasToolUI(tool),
        onSelectionChange: (selected) => syncSelectionUI(selected),
        onHistoryChange: (canUndo, canRedo) => {
          const uBtn = document.getElementById('nb-c-undo');
          const rBtn = document.getElementById('nb-c-redo');
          if (uBtn) uBtn.disabled = !canUndo;
          if (rBtn) rBtn.disabled = !canRedo;
        },
        onPageMetaChange: (canvasObj, gridSnap) => {
          const snapBtn = document.getElementById('nb-c-snap-btn');
          if (snapBtn) snapBtn.classList.toggle('is-active', !!gridSnap);
          syncPaperPopovers(canvasObj);
          syncPaperBackground();
        },
        onStageInteract: () => closePopovers()
      },
      { transparentBackground: true, scrollMode: true }
    );

    if (typeof ResizeObserver !== 'undefined') {
      sheetObserver = new ResizeObserver(() => syncPaperBackground());
      sheetObserver.observe(dom.paperSheet);
    }
  }

  /* ── Corner & Drag Mechanics ── */
  function getNearestCorner(clientX, clientY) {
    const isLeft = clientX < window.innerWidth / 2;
    const isTop = clientY < window.innerHeight / 2;
    return (isTop ? 't' : 'b') + (isLeft ? 'l' : 'r');
  }

  function highlightSnapZone(corner) {
    dom.zones.querySelectorAll('.nb-snap-zone').forEach(z => {
      z.classList.toggle('is-active', z.dataset.corner === corner);
    });
  }

  function setNotebookCorner(corner) {
    if (!CORNERS.includes(corner)) return;
    ui.corner = corner;
    saveUI();
    applyUILayout();
    if (typeof showToast === 'function') {
      showToast(`Not Defteri: ${CORNER_LABELS[corner]}`);
    }
  }

  function applyUILayout() {
    CORNERS.forEach(c => {
      dom.dock.classList.remove('pos-' + c);
      dom.drawer.classList.remove('pos-' + c);
    });
    dom.dock.classList.add('pos-' + ui.corner);
    dom.drawer.classList.add('pos-' + ui.corner);

    dom.drawer.classList.toggle('is-open', !!ui.isOpen);
    dom.drawer.classList.toggle('is-fullscreen', !!(ui.isOpen && ui.isFullscreen));
    dom.dock.classList.toggle('is-hidden', !!ui.isOpen);
    dom.backdrop.classList.toggle('is-visible', !!ui.isOpen);
    dom.sidebar.classList.toggle('is-open', !!ui.sidebarOpen);
    dom.sidebarToggle.classList.toggle('is-active', !!ui.sidebarOpen);

    dom.drawer.style.setProperty('--nb-w', ui.width + 'px');
    dom.drawer.style.setProperty('--nb-h', ui.height + 'px');

    if (dom.fullscreenBtn) {
      dom.fullscreenBtn.innerHTML = icon(ui.isFullscreen ? 'minimize' : 'maximize', 15);
      dom.fullscreenBtn.title = ui.isFullscreen ? 'Çekmece Boyutuna Dön' : 'Tam Ekran';
    }

    dom.cornerPopover.querySelectorAll('.nb-corner-opt').forEach(opt => {
      opt.classList.toggle('is-active', opt.dataset.corner === ui.corner);
    });

    if (ui.isOpen) {
      requestAnimationFrame(() => syncPaperBackground());
      setTimeout(() => syncPaperBackground(), 260);
    }
  }

  function openNotebook() {
    ui.isOpen = true;
    saveUI();
    applyUILayout();
  }

  function closeNotebook() {
    if (canvasCtrl) canvasCtrl.commitTextEdit();
    closePopovers();
    ui.isOpen = false;
    saveUI();
    applyUILayout();
  }

  function toggleNotebook() {
    if (ui.isOpen) closeNotebook();
    else openNotebook();
  }

  function toggleNotebookFullscreen() {
    if (!ui.isOpen) ui.isOpen = true;
    ui.isFullscreen = !ui.isFullscreen;
    saveUI();
    applyUILayout();
  }

  function closePopovers() {
    activePopover = null;
    [
      dom.newpagePopover, dom.paperPopover, dom.stylePopover,
      dom.shapesPopover, dom.linesPopover, dom.eraserPopover,
      dom.cornerPopover, dom.exportPopover
    ].forEach(p => { if (p) p.classList.remove('is-open'); });
  }

  function togglePopover(name, el) {
    const wasOpen = activePopover === name;
    closePopovers();
    if (!wasOpen && el) {
      activePopover = name;
      el.classList.add('is-open');
    }
  }

  /* ── Page & Notebook Loading / Switching ── */
  function flushCurrentPageEdits() {
    if (canvasCtrl) canvasCtrl.commitTextEdit();
    syncEditorToNote(false);
  }

  function loadActivePageIntoView() {
    const book = getActiveNotebook();
    const page = getActivePage();
    if (!book || !page) return;

    dom.titleInput.value = page.title || '';
    if (dom.sheetDate) dom.sheetDate.textContent = formatDateShort(page.updatedAt);
    dom.rtEditor.innerHTML = sanitizeNotebookHtml(page.docHtml || '');
    syncEditorTypography(page);
    updateTextCounts();
    setInputMode(page.inputMode || 'write', false);
    renderPageTags(page);

    canvasCtrl.setPage(page.canvas, true);
    syncPageBar(book);
    syncPaperPopovers(page.canvas);
    requestAnimationFrame(() => syncPaperBackground());

    if (dom.dockBadge) {
      dom.dockBadge.textContent = getTotalPageCount();
      dom.dock.title = `Not Defteri (${store.notebooks.length} defter · ${getTotalPageCount()} sayfa)`;
    }
  }

  function syncPaperPopovers(canvasObj) {
    const paper = (canvasObj && canvasObj.paper) || 'ruled';
    const tone = (canvasObj && canvasObj.paperTone) || 'auto';
    if (dom.paperPopover) {
      dom.paperPopover.querySelectorAll('[data-cur-paper]').forEach(b => {
        b.classList.toggle('is-active', b.dataset.curPaper === paper);
      });
      dom.paperPopover.querySelectorAll('[data-cur-tone]').forEach(b => {
        b.classList.toggle('is-active', b.dataset.curTone === tone);
      });
    }
  }

  function syncPageBar(book) {
    const idx = book.activePageIndex || 0;
    const total = book.pages.length;

    if (dom.activeBookName) dom.activeBookName.textContent = book.name;
    if (dom.activeBookDot) {
      dom.activeBookDot.className = `nb-book-dot is-${book.color || 'green'}`;
    }

    if (dom.pagePrev) dom.pagePrev.disabled = idx <= 0;
    if (dom.pageNext) dom.pageNext.disabled = idx >= total - 1;
    if (dom.pageDel) dom.pageDel.disabled = total <= 1;

    if (dom.pageSelect) {
      dom.pageSelect.innerHTML = book.pages.map((p, i) => {
        const label = `Sayfa ${i + 1} / ${total}` + (p.title ? ` — ${p.title}` : '');
        return `<option value="${i}" ${i === idx ? 'selected' : ''}>${esc(label)}</option>`;
      }).join('');
    }
  }

  function setInputMode(mode, persist = true) {
    const valid = mode === 'draw' ? 'draw' : 'write';
    const page = getActivePage();
    if (persist && page) {
      page.inputMode = valid;
      page.updatedAt = Date.now();
      scheduleSave();
    }

    if (valid === 'write' && canvasCtrl) {
      canvasCtrl.commitTextEdit();
      canvasCtrl.selectedIds.clear();
      canvasCtrl._notifySelection();
      canvasCtrl.requestRender();
    }

    dom.paperSheet.classList.toggle('is-draw-mode', valid === 'draw');
    dom.ribbonWrite.classList.toggle('is-active', valid === 'write');
    dom.ribbonDraw.classList.toggle('is-active', valid === 'draw');

    dom.header.querySelectorAll('.nb-mode-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.inputMode === valid);
    });
    closePopovers();
    if (valid === 'draw' && canvasCtrl) {
      requestAnimationFrame(() => canvasCtrl.resize());
    }
  }

  function syncEditorTypography(page) {
    dom.rtEditor.classList.toggle('font-serif', page.docFont === 'serif');
    if (dom.rtFontToggle) {
      dom.rtFontToggle.textContent = page.docFont === 'serif' ? 'Serif' : 'Sans';
      dom.rtFontToggle.classList.toggle('is-active', page.docFont === 'serif');
    }
  }

  function updateTextCounts() {
    const txt = (dom.rtEditor.innerText || '').trim();
    const words = txt ? txt.split(/\s+/).filter(Boolean).length : 0;
    dom.rtCounts.textContent = `${words} kelime`;
  }

  function selectNotebook(bookId) {
    if (store.activeNotebookId === bookId) return;
    flushCurrentPageEdits();
    store.activeNotebookId = bookId;
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
  }

  function goToPage(index) {
    const book = getActiveNotebook();
    const nextIdx = Math.max(0, Math.min(index, book.pages.length - 1));
    if (nextIdx === book.activePageIndex) return;
    flushCurrentPageEdits();
    book.activePageIndex = nextIdx;
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
  }

  function jumpToNotebookPage(bookId, pageIndex) {
    flushCurrentPageEdits();
    store.activeNotebookId = bookId;
    const book = getActiveNotebook();
    book.activePageIndex = Math.max(0, Math.min(pageIndex, book.pages.length - 1));
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
    if (ui.sidebarOpen && !ui.isFullscreen) {
      ui.sidebarOpen = false;
      saveUI();
      applyUILayout();
    }
  }

  function addNewPageWithPaper(paperId) {
    flushCurrentPageEdits();
    closePopovers();
    const book = getActiveNotebook();
    const insertIdx = (book.activePageIndex || 0) + 1;
    const tpl = TEMPLATES.find(t => t.id === newPageDraft.templateId) || TEMPLATES[0];
    const pageNum = book.pages.length + 1;
    const title = tpl.id === 'blank' ? `Sayfa ${pageNum}` : tpl.label;
    const newPage = createPageFromTemplate(tpl, paperId || book.defaultPaper || 'ruled', newPageDraft.tone || 'auto', title);

    book.pages.splice(insertIdx, 0, newPage);
    book.activePageIndex = insertIdx;
    book.updatedAt = Date.now();
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();

    if (ui.sidebarOpen && !ui.isFullscreen) {
      ui.sidebarOpen = false;
      saveUI();
      applyUILayout();
    }
    if (typeof showToast === 'function') {
      showToast(`${PAPER_LABELS[newPage.canvas.paper]} sayfa eklendi`);
    }
  }

  function duplicatePage(index) {
    flushCurrentPageEdits();
    const book = getActiveNotebook();
    const orig = book.pages[index];
    if (!orig) return;
    const copy = cloneDeep(orig);
    copy.id = uid('pg');
    copy.canvas.id = uid('cv');
    copy.title = (copy.title || `Sayfa ${index + 1}`) + ' (Kopya)';
    copy.pinned = false;
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    book.pages.splice(index + 1, 0, copy);
    book.activePageIndex = index + 1;
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
  }

  function deletePage(index) {
    const book = getActiveNotebook();
    if (book.pages.length <= 1) {
      if (typeof showToast === 'function') showToast('Defterdeki son sayfa silinemez.');
      return;
    }
    book.pages.splice(index, 1);
    if (book.activePageIndex >= book.pages.length) {
      book.activePageIndex = book.pages.length - 1;
    } else if (book.activePageIndex > index) {
      book.activePageIndex--;
    }
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
  }

  function movePage(index, dir) {
    const book = getActiveNotebook();
    const target = index + dir;
    if (target < 0 || target >= book.pages.length) return;
    const activeId = book.pages[book.activePageIndex].id;
    const tmp = book.pages[index];
    book.pages[index] = book.pages[target];
    book.pages[target] = tmp;
    book.activePageIndex = book.pages.findIndex(p => p.id === activeId);
    saveStoreNow();
    syncPageBar(book);
    renderSidebar();
  }

  function togglePinPage(bookId, pageIndex) {
    const book = store.notebooks.find(b => b.id === bookId);
    if (!book || !book.pages[pageIndex]) return;
    book.pages[pageIndex].pinned = !book.pages[pageIndex].pinned;
    saveStoreNow();
    renderSidebar();
  }

  /* ── Notebook Create / Edit / Delete ── */
  function openBookModal(bookId) {
    editingBookId = bookId || null;
    const existing = editingBookId ? store.notebooks.find(b => b.id === editingBookId) : null;
    bookDraft = {
      color: existing ? existing.color : 'green',
      icon: existing ? existing.icon : 'books',
      defaultPaper: existing ? existing.defaultPaper : 'ruled'
    };
    dom.bookModalTitle.innerHTML = `${icon(bookDraft.icon, 16)} <span>${existing ? 'Defteri Düzenle' : 'Yeni Defter Oluştur'}</span>`;
    dom.bookNameInput.value = existing ? existing.name : '';
    dom.bookPaperSelect.value = bookDraft.defaultPaper;
    syncBookModalPickers();
    dom.bookModal.classList.add('is-open');
    setTimeout(() => dom.bookNameInput.focus(), 20);
  }

  function syncBookModalPickers() {
    dom.bookModal.querySelectorAll('[data-book-color]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.bookColor === bookDraft.color);
    });
    dom.bookModal.querySelectorAll('[data-book-icon]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.bookIcon === bookDraft.icon);
    });
  }

  function saveBookFromModal() {
    const name = (dom.bookNameInput.value || '').trim();
    if (!name) return;
    const paper = dom.bookPaperSelect.value || 'ruled';

    if (editingBookId) {
      const book = store.notebooks.find(b => b.id === editingBookId);
      if (book) {
        book.name = name;
        book.color = bookDraft.color;
        book.icon = bookDraft.icon;
        book.defaultPaper = paper;
        book.updatedAt = Date.now();
      }
    } else {
      flushCurrentPageEdits();
      const newBook = {
        id: uid('book'),
        name: name,
        color: bookDraft.color,
        icon: bookDraft.icon,
        defaultPaper: paper,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        activePageIndex: 0,
        pages: [createPageFromTemplate(TEMPLATES[0], paper, 'auto', 'Sayfa 1')]
      };
      store.notebooks.push(newBook);
      store.activeNotebookId = newBook.id;
    }

    dom.bookModal.classList.remove('is-open');
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
  }

  function openConfirmModal(opts) {
    if (!dom.confirmModal) return;
    const cfg = opts || {};
    dom.confirmTitle.innerHTML = `${icon('alertTriangle', 16)} <span>${esc(cfg.title || 'Emin misin?')}</span>`;
    dom.confirmDesc.textContent = cfg.desc || '';
    dom.confirmOk.textContent = cfg.confirmLabel || 'Onayla';
    pendingConfirmAction = typeof cfg.onConfirm === 'function' ? cfg.onConfirm : null;
    dom.confirmModal.classList.add('is-open');
    setTimeout(() => dom.confirmOk.focus(), 20);
  }

  function closeConfirmModal() {
    pendingConfirmAction = null;
    if (dom.confirmModal) dom.confirmModal.classList.remove('is-open');
  }

  function deleteNotebook(bookId) {
    if (store.notebooks.length <= 1) {
      if (typeof showToast === 'function') showToast('Son defter silinemez.');
      return;
    }
    const book = store.notebooks.find(b => b.id === bookId);
    if (!book) return;
    openConfirmModal({
      title: 'Defteri Sil',
      desc: `"${book.name}" defteri ve içindeki ${book.pages.length} sayfa kalıcı olarak silinsin mi?`,
      confirmLabel: 'Defteri Sil',
      onConfirm: () => {
        store.notebooks = store.notebooks.filter(b => b.id !== bookId);
        if (store.activeNotebookId === bookId) {
          store.activeNotebookId = store.notebooks[0].id;
        }
        saveStoreNow();
        loadActivePageIntoView();
        renderSidebar();
      }
    });
  }

  /* ── Sidebar Rendering (Flat Editorial Rows) ── */
  function renderSidebar() {
    if (!dom.booksList || !dom.pagesList) return;
    const activeBook = getActiveNotebook();

    dom.booksList.innerHTML = store.notebooks.map(b => {
      const isAct = b.id === activeBook.id;
      return `
        <div class="nb-book-row ${isAct ? 'is-active' : ''}" data-book-id="${esc(b.id)}">
          <span class="nb-book-badge is-${b.color}">${icon(b.icon, 13)}</span>
          <span class="nb-book-name">${esc(b.name)}</span>
          <span class="nb-book-count">${b.pages.length}</span>
          <div class="nb-book-actions">
            <button type="button" class="nb-mini-btn" data-book-act="edit" title="Defteri Düzenle">${icon('edit', 12)}</button>
            <button type="button" class="nb-mini-btn is-del" data-book-act="del" title="Defteri Sil">${icon('trash', 12)}</button>
          </div>
        </div>
      `;
    }).join('');

    if (dom.sidebarBookName) {
      dom.sidebarBookName.textContent = pageScope === 'all' ? 'Tüm Sayfalar' : activeBook.name;
    }

    dom.scopeChips.querySelectorAll('[data-scope]').forEach(ch => {
      ch.classList.toggle('is-active', ch.dataset.scope === pageScope);
    });

    const q = searchQuery.toLowerCase().trim();
    const entries = [];
    const booksToScan = pageScope === 'all' ? store.notebooks : [activeBook];

    booksToScan.forEach(b => {
      b.pages.forEach((p, idx) => {
        if (pageScope === 'pinned' && !p.pinned) return;
        if (q) {
          const hay = `${p.title || ''} ${stripHtml(p.docHtml)} ${(p.tags || []).join(' ')} ${b.name}`.toLowerCase();
          if (!hay.includes(q)) return;
        }
        entries.push({ book: b, page: p, index: idx });
      });
    });

    if (!entries.length) {
      dom.pagesList.innerHTML = `<div style="padding:16px;text-align:center;font-size:12px;color:var(--text3);">Sayfa bulunamadı.</div>`;
      return;
    }

    dom.pagesList.innerHTML = entries.map(({ book, page, index }) => {
      const isAct = book.id === activeBook.id && index === activeBook.activePageIndex;
      const preview = stripHtml(page.docHtml).slice(0, 56) || 'Boş sayfa';
      const drawCount = page.canvas && Array.isArray(page.canvas.objects) ? page.canvas.objects.length : 0;
      const paperLbl = PAPER_LABELS[page.canvas?.paper || 'ruled'] || 'Çizgili';
      return `
        <div class="nb-page-row ${isAct ? 'is-active' : ''}" data-book-id="${esc(book.id)}" data-page-idx="${index}">
          <div class="nb-page-row-top">
            <span class="nb-page-num">${padPageNum(index + 1)}</span>
            <span class="nb-page-row-title">${esc(page.title || `Sayfa ${index + 1}`)}</span>
            <div class="nb-page-row-actions">
              ${pageScope === 'book' && !q ? `
                <button type="button" class="nb-mini-btn" data-pg-act="up" title="Yukarı">${icon('chevronUp', 12)}</button>
                <button type="button" class="nb-mini-btn" data-pg-act="down" title="Aşağı">${icon('chevronDown', 12)}</button>
              ` : ''}
              <button type="button" class="nb-mini-btn ${page.pinned ? 'is-pinned' : ''}" data-pg-act="pin" title="Sabitle">${icon('pin', 12)}</button>
              <button type="button" class="nb-mini-btn" data-pg-act="dup" title="Çoğalt">${icon('copy', 12)}</button>
              <button type="button" class="nb-mini-btn is-del" data-pg-act="del" title="Sil">${icon('trash', 12)}</button>
            </div>
          </div>
          <div class="nb-page-row-sub">
            <span class="nb-page-row-preview">${esc(preview)}</span>
            <span class="nb-page-row-meta">${pageScope === 'all' ? esc(book.name) + ' · ' : ''}${paperLbl}${drawCount > 0 ? ' · ' + drawCount + ' çizim' : ''}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderPageTags(page) {
    if (!dom.tagRow) return;
    const tags = Array.isArray(page.tags) ? page.tags : [];
    dom.tagRow.innerHTML = `
      ${tags.map((t, idx) => `
        <span class="nb-tag-pill">${esc(t)}<button type="button" data-del-tag="${idx}" aria-label="Etiketi kaldır">&times;</button></span>
      `).join('')}
      <input type="text" class="nb-tag-add-input" id="nb-tag-add-input" placeholder="+ etiket" maxlength="20">
    `;
  }

  /* ── FDil Study Context Inserter ── */
  function gatherStudyContext() {
    const activeScreen = document.querySelector('.screen.active');
    const sid = activeScreen ? activeScreen.id : 'screen-home';
    const items = [];

    if (typeof global.currentUnit !== 'undefined' && global.currentUnit && typeof global.UNITS !== 'undefined' && global.UNITS[global.currentUnit]) {
      items.push(`Ünite ${global.currentUnit}`);
    }

    if (sid === 'screen-flash' && Array.isArray(global.currentCards) && global.currentCards[global.cardIndex]) {
      const w = global.currentCards[global.cardIndex];
      items.push(`Kelime: ${w[0]} — ${w[1]}`);
      if (w[2]) items.push(`Örnek: ${w[2]}`);
    } else if (sid === 'screen-dict') {
      const head = document.querySelector('#screen-dict .dict-hero-word');
      const tr = document.querySelector('#screen-dict .dict-tr-meanings, #screen-dict .dict-def-text');
      if (head && head.textContent.trim()) items.push(`Sözlük: ${head.textContent.trim()}`);
      if (tr && tr.textContent.trim()) items.push(`Anlam: ${tr.textContent.trim().slice(0, 120)}`);
    } else if (sid === 'screen-reading') {
      const rTitle = document.querySelector('#screen-reading .reading-title, #screen-reading h2');
      if (rTitle && rTitle.textContent.trim()) items.push(`Reading: ${rTitle.textContent.trim()}`);
    } else if (sid === 'screen-mc' || sid === 'screen-speed' || sid === 'screen-syn-quiz' || sid === 'screen-ant-quiz') {
      const qWord = activeScreen.querySelector('.mc-q-word');
      if (qWord && qWord.textContent.trim()) items.push(`Soru Kelimesi: ${qWord.textContent.trim()}`);
    }

    if (!items.length) {
      items.push(`FDil Çalışma Notu (${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`);
    }
    return items;
  }

  function insertStudyContext() {
    const lines = gatherStudyContext();
    const html = `<div class="nb-callout is-blue"><div class="nb-callout-title">Çalışma Bağlamı</div><div>${lines.map(l => esc(l)).join('<br>')}</div></div><p><br></p>`;
    dom.rtEditor.focus();
    document.execCommand('insertHTML', false, html);
    syncEditorToNote(true);
    if (typeof showToast === 'function') showToast('Aktif çalışma bağlamı sayfaya eklendi!');
  }

  /* ── Rich Text Helpers ── */
  function syncEditorToNote(triggerSave = true) {
    const page = getActivePage();
    if (!page || !dom.rtEditor) return;
    dom.rtEditor.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb.checked) cb.setAttribute('checked', 'checked');
      else cb.removeAttribute('checked');
      const item = cb.closest('.nb-todo-item');
      if (item) item.classList.toggle('is-done', cb.checked);
    });
    page.docHtml = dom.rtEditor.innerHTML;
    page.updatedAt = Date.now();
    updateTextCounts();
    if (triggerSave) scheduleSave();
    requestAnimationFrame(() => syncPaperBackground());
  }

  function insertRichAction(action) {
    dom.rtEditor.focus();
    if (action === 'todo') {
      document.execCommand('insertHTML', false,
        `<div class="nb-todo-item"><input type="checkbox"><span class="nb-todo-text">Yapılacak madde...</span></div><p><br></p>`
      );
    } else if (action === 'callout') {
      document.execCommand('insertHTML', false,
        `<div class="nb-callout"><div class="nb-callout-title">Önemli Not</div><div>Açıklama yazın...</div></div><p><br></p>`
      );
    } else if (action === 'quote') {
      document.execCommand('formatBlock', false, 'BLOCKQUOTE');
    } else if (action === 'code') {
      document.execCommand('insertHTML', false,
        `<pre>Yapı / Formül: Subject + Verb + Object</pre><p><br></p>`
      );
    } else if (action === 'table') {
      document.execCommand('insertHTML', false,
        `<table><thead><tr><th>Başlık 1</th><th>Başlık 2</th><th>Başlık 3</th></tr></thead><tbody><tr><td>Veri</td><td>Veri</td><td>Veri</td></tr><tr><td></td><td></td><td></td></tr></tbody></table><p><br></p>`
      );
    }
    syncEditorToNote(true);
  }

  function syncCanvasToolUI(tool) {
    document.querySelectorAll('#nb-ribbon-draw [data-tool]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.tool === tool);
    });
  }

  function syncSelectionUI(selected) {
    const hasSel = selected && selected.length > 0;
    dom.selectionBar.classList.toggle('is-visible', hasSel);
    if (hasSel && dom.selLockBtn) {
      const allLocked = selected.every(o => o.locked);
      dom.selLockBtn.innerHTML = icon(allLocked ? 'lockOpen' : 'lock', 14);
      dom.selLockBtn.classList.toggle('is-active', allLocked);
    }
  }

  /* ── Export Helpers ── */
  function htmlToMarkdown(html) {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    const lines = [];
    d.childNodes.forEach(node => {
      if (node.nodeType === 3) {
        if (node.textContent.trim()) lines.push(node.textContent.trim());
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName;
      if (tag === 'H1') lines.push('# ' + node.textContent.trim());
      else if (tag === 'H2') lines.push('## ' + node.textContent.trim());
      else if (tag === 'H3') lines.push('### ' + node.textContent.trim());
      else if (tag === 'BLOCKQUOTE') lines.push('> ' + node.textContent.trim());
      else if (tag === 'PRE') lines.push('```\n' + node.textContent.trim() + '\n```');
      else if (tag === 'UL') {
        node.querySelectorAll('li').forEach(li => lines.push('- ' + li.textContent.trim()));
      } else if (tag === 'OL') {
        node.querySelectorAll('li').forEach((li, i) => lines.push(`${i + 1}. ${li.textContent.trim()}`));
      } else if (node.classList.contains('nb-todo-item')) {
        const cb = node.querySelector('input[type="checkbox"]');
        lines.push(`- [${cb && cb.checked ? 'x' : ' '}] ${node.textContent.trim()}`);
      } else if (tag === 'TABLE') {
        node.querySelectorAll('tr').forEach((tr, ri) => {
          const cells = Array.from(tr.children).map(c => c.textContent.trim());
          lines.push('| ' + cells.join(' | ') + ' |');
          if (ri === 0) lines.push('| ' + cells.map(() => '---').join(' | ') + ' |');
        });
      } else {
        const txt = node.textContent.trim();
        if (txt) lines.push(txt);
      }
    });
    return lines.join('\n\n');
  }

  function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function slugify(str) {
    return (str || 'fdil-defter').toLowerCase().replace(/[^a-z0-9ğüşıöç]+/gi, '-').replace(/^-|-$/g, '') || 'fdil-defter';
  }

  function handleExport(type) {
    closePopovers();
    flushCurrentPageEdits();
    const book = getActiveNotebook();
    const page = getActivePage();
    const bookSlug = slugify(book.name);
    const pageSlug = slugify(page.title || `sayfa-${book.activePageIndex + 1}`);

    if (type === 'png') {
      canvasCtrl.exportPNG(`${bookSlug}-sayfa-${book.activePageIndex + 1}.png`);
    } else if (type === 'svg') {
      canvasCtrl.exportSVG(`${bookSlug}-sayfa-${book.activePageIndex + 1}.svg`);
    } else if (type === 'md') {
      const md = `# ${page.title || 'Sayfa'}\n\n` + htmlToMarkdown(page.docHtml);
      downloadBlob(md, `${pageSlug}.md`, 'text/markdown;charset=utf-8');
    } else if (type === 'txt') {
      const txt = `${page.title || 'Sayfa'}\n\n` + stripHtml(page.docHtml);
      downloadBlob(txt, `${pageSlug}.txt`, 'text/plain;charset=utf-8');
    } else if (type === 'book-md') {
      const parts = [`# ${book.name}\n`];
      book.pages.forEach((p, idx) => {
        parts.push(`---\n\n## Sayfa ${idx + 1}: ${p.title || 'Başlıksız'}\n\n` + htmlToMarkdown(p.docHtml));
      });
      downloadBlob(parts.join('\n\n'), `${bookSlug}.md`, 'text/markdown;charset=utf-8');
    } else if (type === 'json') {
      downloadBlob(JSON.stringify(exportNotebookData(), null, 2), `fdil-defterler-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    }
  }

  /* ── Event Binding ── */
  function bindUIEvents() {
    // 1. Draggable Floating Dock Tab
    let dockDrag = null;
    dom.dock.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      try { dom.dock.setPointerCapture(e.pointerId); } catch (_) {}
      const rect = dom.dock.getBoundingClientRect();
      dockDrag = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        moved: false
      };
    });
    window.addEventListener('pointermove', (e) => {
      if (!dockDrag || e.pointerId !== dockDrag.id) return;
      const dist = Math.hypot(e.clientX - dockDrag.startX, e.clientY - dockDrag.startY);
      if (!dockDrag.moved && dist > 6) {
        dockDrag.moved = true;
        dom.dock.classList.add('is-dragging');
        dom.zones.classList.add('is-visible');
        CORNERS.forEach(c => dom.dock.classList.remove('pos-' + c));
        dom.dock.style.right = 'auto';
        dom.dock.style.bottom = 'auto';
      }
      if (dockDrag.moved) {
        const nx = Math.max(8, Math.min(window.innerWidth - dom.dock.offsetWidth - 8, e.clientX - dockDrag.offsetX));
        const ny = Math.max(8, Math.min(window.innerHeight - dom.dock.offsetHeight - 8, e.clientY - dockDrag.offsetY));
        dom.dock.style.left = nx + 'px';
        dom.dock.style.top = ny + 'px';
        highlightSnapZone(getNearestCorner(e.clientX, e.clientY));
      }
    });
    window.addEventListener('pointerup', (e) => {
      if (!dockDrag || e.pointerId !== dockDrag.id) return;
      const wasMoved = dockDrag.moved;
      dockDrag = null;
      dom.dock.classList.remove('is-dragging');
      dom.zones.classList.remove('is-visible');
      dom.dock.style.left = '';
      dom.dock.style.top = '';
      dom.dock.style.right = '';
      dom.dock.style.bottom = '';
      if (wasMoved) setNotebookCorner(getNearestCorner(e.clientX, e.clientY));
      else openNotebook();
    });

    // 2. Draggable Drawer Header
    let headerDrag = null;
    dom.header.addEventListener('pointerdown', (e) => {
      if (ui.isFullscreen) return;
      if (e.target.closest('button, input, select, label, a, .nb-popover')) return;
      try { dom.header.setPointerCapture(e.pointerId); } catch (_) {}
      const rect = dom.drawer.getBoundingClientRect();
      headerDrag = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        moved: false
      };
    });
    window.addEventListener('pointermove', (e) => {
      if (!headerDrag || e.pointerId !== headerDrag.id) return;
      const dist = Math.hypot(e.clientX - headerDrag.startX, e.clientY - headerDrag.startY);
      if (!headerDrag.moved && dist > 8) {
        headerDrag.moved = true;
        dom.drawer.classList.add('is-header-dragging');
        dom.zones.classList.add('is-visible');
        CORNERS.forEach(c => dom.drawer.classList.remove('pos-' + c));
        dom.drawer.style.right = 'auto';
        dom.drawer.style.bottom = 'auto';
      }
      if (headerDrag.moved) {
        const nx = Math.max(8, Math.min(window.innerWidth - dom.drawer.offsetWidth - 8, e.clientX - headerDrag.offsetX));
        const ny = Math.max(8, Math.min(window.innerHeight - dom.drawer.offsetHeight - 8, e.clientY - headerDrag.offsetY));
        dom.drawer.style.left = nx + 'px';
        dom.drawer.style.top = ny + 'px';
        highlightSnapZone(getNearestCorner(e.clientX, e.clientY));
      }
    });
    window.addEventListener('pointerup', (e) => {
      if (!headerDrag || e.pointerId !== headerDrag.id) return;
      const wasMoved = headerDrag.moved;
      headerDrag = null;
      dom.drawer.classList.remove('is-header-dragging');
      dom.zones.classList.remove('is-visible');
      dom.drawer.style.left = '';
      dom.drawer.style.top = '';
      dom.drawer.style.right = '';
      dom.drawer.style.bottom = '';
      if (wasMoved) setNotebookCorner(getNearestCorner(e.clientX, e.clientY));
      else applyUILayout();
    });

    dom.header.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, input, select, label, a, .nb-popover')) return;
      toggleNotebookFullscreen();
    });

    // 3. Corner-aware Resize Handle
    let resizeDrag = null;
    dom.resizeHandle.addEventListener('pointerdown', (e) => {
      if (ui.isFullscreen) return;
      e.stopPropagation();
      try { dom.resizeHandle.setPointerCapture(e.pointerId); } catch (_) {}
      dom.drawer.classList.add('is-resizing');
      resizeDrag = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startW: dom.drawer.offsetWidth,
        startH: dom.drawer.offsetHeight
      };
    });
    window.addEventListener('pointermove', (e) => {
      if (!resizeDrag || e.pointerId !== resizeDrag.id) return;
      const dx = e.clientX - resizeDrag.startX;
      const dy = e.clientY - resizeDrag.startY;
      const signX = (ui.corner === 'br' || ui.corner === 'tr') ? -1 : 1;
      const signY = (ui.corner === 'br' || ui.corner === 'bl') ? -1 : 1;
      ui.width = Math.round(Math.max(340, Math.min(window.innerWidth - 24, resizeDrag.startW + dx * signX)));
      ui.height = Math.round(Math.max(380, Math.min(window.innerHeight - 24, resizeDrag.startH + dy * signY)));
      dom.drawer.style.setProperty('--nb-w', ui.width + 'px');
      dom.drawer.style.setProperty('--nb-h', ui.height + 'px');
      syncPaperBackground();
    });
    window.addEventListener('pointerup', (e) => {
      if (!resizeDrag || e.pointerId !== resizeDrag.id) return;
      resizeDrag = null;
      dom.drawer.classList.remove('is-resizing');
      saveUI();
      syncPaperBackground();
    });

    // 4. Header Controls & Popovers
    dom.closeBtn.addEventListener('click', closeNotebook);
    dom.fullscreenBtn.addEventListener('click', toggleNotebookFullscreen);
    const toggleSidebar = () => {
      ui.sidebarOpen = !ui.sidebarOpen;
      saveUI();
      applyUILayout();
    };
    dom.sidebarToggle.addEventListener('click', toggleSidebar);
    dom.activeBookPill.addEventListener('click', toggleSidebar);

    dom.header.querySelectorAll('.nb-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setInputMode(btn.dataset.inputMode, true));
    });

    dom.paperBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('paper', dom.paperPopover);
    });
    dom.cornerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('corner', dom.cornerPopover);
    });
    dom.exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('export', dom.exportPopover);
    });

    dom.cornerPopover.querySelectorAll('.nb-corner-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        setNotebookCorner(opt.dataset.corner);
        closePopovers();
      });
    });

    dom.exportPopover.querySelectorAll('[data-export]').forEach(btn => {
      btn.addEventListener('click', () => handleExport(btn.dataset.export));
    });
    document.getElementById('nb-import-json-input').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          importNotebookData(JSON.parse(ev.target.result));
          if (typeof showToast === 'function') showToast('Defter yedeği içe aktarıldı!');
        } catch (_) {
          if (typeof showToast === 'function') showToast('Geçersiz defter dosyası!');
        }
      };
      r.readAsText(file);
      e.target.value = '';
      closePopovers();
    });

    // Current page paper switcher
    dom.paperPopover.addEventListener('click', (e) => {
      const pBtn = e.target.closest('[data-cur-paper]');
      if (pBtn) {
        canvasCtrl.setPaper(pBtn.dataset.curPaper, null);
        renderSidebar();
        closePopovers();
        return;
      }
      const tBtn = e.target.closest('[data-cur-tone]');
      if (tBtn) {
        canvasCtrl.setPaper(null, tBtn.dataset.curTone);
      }
    });

    // New Page Visual Paper Picker
    const openNewPagePicker = (e) => {
      e.stopPropagation();
      togglePopover('newpage', dom.newpagePopover);
    };
    dom.pageAdd.addEventListener('click', openNewPagePicker);
    document.getElementById('nb-sidebar-newpage-btn').addEventListener('click', openNewPagePicker);

    dom.newpagePopover.addEventListener('click', (e) => {
      const toneBtn = e.target.closest('[data-new-tone]');
      if (toneBtn) {
        newPageDraft.tone = toneBtn.dataset.newTone;
        dom.newpagePopover.querySelectorAll('[data-new-tone]').forEach(b => b.classList.toggle('is-active', b === toneBtn));
        return;
      }
      const tplBtn = e.target.closest('[data-new-tpl]');
      if (tplBtn) {
        newPageDraft.templateId = tplBtn.dataset.newTpl;
        dom.newpagePopover.querySelectorAll('[data-new-tpl]').forEach(b => b.classList.toggle('is-active', b === tplBtn));
        return;
      }
      const paperBtn = e.target.closest('[data-new-paper]');
      if (paperBtn) {
        addNewPageWithPaper(paperBtn.dataset.newPaper);
      }
    });

    // Title & Sheet Metadata
    dom.titleInput.addEventListener('input', () => {
      const book = getActiveNotebook();
      const page = getActivePage();
      page.title = dom.titleInput.value;
      page.updatedAt = Date.now();
      scheduleSave();
      syncPageBar(book);
      renderSidebar();
    });

    // 5. Notebooks & Pages Sidebar + Book Modal
    document.getElementById('nb-new-notebook-btn').addEventListener('click', () => openBookModal(null));
    document.getElementById('nb-close-book-modal-btn').addEventListener('click', () => dom.bookModal.classList.remove('is-open'));
    document.getElementById('nb-cancel-book-btn').addEventListener('click', () => dom.bookModal.classList.remove('is-open'));
    dom.bookModal.addEventListener('click', (e) => {
      if (e.target === dom.bookModal) dom.bookModal.classList.remove('is-open');
    });
    document.getElementById('nb-book-color-picker').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-book-color]');
      if (!btn) return;
      bookDraft.color = btn.dataset.bookColor;
      syncBookModalPickers();
    });
    document.getElementById('nb-book-icon-picker').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-book-icon]');
      if (!btn) return;
      bookDraft.icon = btn.dataset.bookIcon;
      syncBookModalPickers();
    });
    document.getElementById('nb-book-form').addEventListener('submit', (e) => {
      e.preventDefault();
      saveBookFromModal();
    });

    dom.booksList.addEventListener('click', (e) => {
      const item = e.target.closest('[data-book-id]');
      if (!item) return;
      const bId = item.dataset.bookId;
      const actBtn = e.target.closest('[data-book-act]');
      if (actBtn) {
        e.stopPropagation();
        if (actBtn.dataset.bookAct === 'edit') openBookModal(bId);
        else if (actBtn.dataset.bookAct === 'del') deleteNotebook(bId);
        return;
      }
      selectNotebook(bId);
    });

    dom.scopeChips.addEventListener('click', (e) => {
      const ch = e.target.closest('[data-scope]');
      if (!ch) return;
      pageScope = ch.dataset.scope;
      renderSidebar();
    });

    dom.searchInput.addEventListener('input', () => {
      searchQuery = dom.searchInput.value;
      renderSidebar();
    });

    dom.pagesList.addEventListener('click', (e) => {
      const card = e.target.closest('[data-page-idx]');
      if (!card) return;
      const bId = card.dataset.bookId;
      const pIdx = Number(card.dataset.pageIdx);
      const actBtn = e.target.closest('[data-pg-act]');
      if (actBtn) {
        e.stopPropagation();
        const act = actBtn.dataset.pgAct;
        if (act === 'pin') togglePinPage(bId, pIdx);
        else if (act === 'up') movePage(pIdx, -1);
        else if (act === 'down') movePage(pIdx, 1);
        else if (act === 'dup') {
          if (bId !== store.activeNotebookId) store.activeNotebookId = bId;
          duplicatePage(pIdx);
        } else if (act === 'del') {
          if (bId !== store.activeNotebookId) store.activeNotebookId = bId;
          deletePage(pIdx);
        }
        return;
      }
      jumpToNotebookPage(bId, pIdx);
    });

    dom.tagRow.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-del-tag]');
      if (!delBtn) return;
      const page = getActivePage();
      page.tags.splice(Number(delBtn.dataset.delTag), 1);
      saveStoreNow();
      renderPageTags(page);
      renderSidebar();
    });

    dom.tagRow.addEventListener('keydown', (e) => {
      if (e.target.id === 'nb-tag-add-input' && e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (!val) return;
        const page = getActivePage();
        if (!Array.isArray(page.tags)) page.tags = [];
        if (!page.tags.includes(val)) page.tags.push(val);
        saveStoreNow();
        renderPageTags(page);
        renderSidebar();
      }
    });

    // 6. Write Ribbon & Editor Events
    dom.ribbonWrite.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cmd], [data-action]');
      if (!btn) return;
      if (btn.dataset.cmd) {
        dom.rtEditor.focus();
        document.execCommand(btn.dataset.cmd, false, null);
        syncEditorToNote(true);
      } else if (btn.dataset.action) {
        insertRichAction(btn.dataset.action);
      }
    });

    dom.rtBlock.addEventListener('change', () => {
      dom.rtEditor.focus();
      document.execCommand('formatBlock', false, dom.rtBlock.value);
      syncEditorToNote(true);
    });

    document.getElementById('nb-rt-forecolor').addEventListener('input', (e) => {
      dom.rtEditor.focus();
      document.execCommand('foreColor', false, e.target.value);
      syncEditorToNote(true);
    });
    document.getElementById('nb-rt-hilite').addEventListener('input', (e) => {
      dom.rtEditor.focus();
      document.execCommand('hiliteColor', false, e.target.value);
      syncEditorToNote(true);
    });

    dom.rtFontToggle.addEventListener('click', () => {
      const page = getActivePage();
      page.docFont = page.docFont === 'serif' ? 'sans' : 'serif';
      syncEditorTypography(page);
      scheduleSave();
    });
    document.getElementById('nb-insert-context-btn').addEventListener('click', insertStudyContext);

    dom.rtEditor.addEventListener('input', () => syncEditorToNote(true));
    dom.rtEditor.addEventListener('change', (e) => {
      if (e.target && e.target.type === 'checkbox') syncEditorToNote(true);
    });
    dom.rtEditor.addEventListener('paste', (e) => {
      const html = e.clipboardData && e.clipboardData.getData('text/html');
      if (html) {
        e.preventDefault();
        document.execCommand('insertHTML', false, sanitizeNotebookHtml(html));
        syncEditorToNote(true);
      }
    });

    // 7. Draw Ribbon & Style Popover
    dom.ribbonDraw.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tool]');
      if (!btn) return;
      const tool = btn.dataset.tool;
      if (tool === 'shape') {
        canvasCtrl.setTool('shape');
        togglePopover('shapes', dom.shapesPopover);
        return;
      }
      if (tool === 'line') {
        canvasCtrl.setTool('line');
        togglePopover('lines', dom.linesPopover);
        return;
      }
      if (tool === 'eraser') {
        if (canvasCtrl.tool === 'eraser') togglePopover('eraser', dom.eraserPopover);
        else { closePopovers(); canvasCtrl.setTool('eraser'); }
        return;
      }
      if (tool === 'image') {
        closePopovers();
        document.getElementById('nb-c-img-input').click();
        return;
      }
      closePopovers();
      canvasCtrl.setTool(tool);
    });

    document.getElementById('nb-style-popover-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopover('style', dom.stylePopover);
    });

    dom.shapesPopover.addEventListener('click', (e) => {
      const ch = e.target.closest('[data-shape]');
      if (!ch) return;
      canvasCtrl.setShapeKind(ch.dataset.shape);
      dom.shapesPopover.querySelectorAll('.nb-shape-choice').forEach(x => x.classList.toggle('is-active', x === ch));
      closePopovers();
    });
    dom.linesPopover.addEventListener('click', (e) => {
      const ch = e.target.closest('[data-line]');
      if (!ch) return;
      canvasCtrl.setLineKind(ch.dataset.line);
      dom.linesPopover.querySelectorAll('.nb-shape-choice').forEach(x => x.classList.toggle('is-active', x === ch));
      closePopovers();
    });
    dom.eraserPopover.addEventListener('click', (e) => {
      const ch = e.target.closest('[data-eraser]');
      if (!ch) return;
      canvasCtrl.setEraserMode(ch.dataset.eraser);
      closePopovers();
    });

    document.getElementById('nb-c-img-input').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      compressAndAddImage(file);
      e.target.value = '';
    });

    document.getElementById('nb-c-undo').addEventListener('click', () => canvasCtrl.undo());
    document.getElementById('nb-c-redo').addEventListener('click', () => canvasCtrl.redo());
    document.getElementById('nb-c-clear').addEventListener('click', () => {
      if (!canvasCtrl.page.objects.length) {
        if (typeof showToast === 'function') showToast('Bu sayfada temizlenecek çizim yok.');
        return;
      }
      openConfirmModal({
        title: 'Çizimleri Temizle',
        desc: 'Bu sayfadaki çizim öğeleri temizlensin mi? (Geri Al ile tekrar getirebilirsin.)',
        confirmLabel: 'Temizle',
        onConfirm: () => canvasCtrl.clearPage()
      });
    });

    document.getElementById('nb-confirm-close-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('nb-confirm-cancel').addEventListener('click', closeConfirmModal);
    dom.confirmModal.addEventListener('click', (e) => {
      if (e.target === dom.confirmModal) closeConfirmModal();
    });
    dom.confirmOk.addEventListener('click', () => {
      const fn = pendingConfirmAction;
      closeConfirmModal();
      if (fn) fn();
    });

    document.getElementById('nb-stroke-swatches').addEventListener('click', (e) => {
      const sw = e.target.closest('[data-stroke]');
      if (!sw) return;
      document.querySelectorAll('#nb-stroke-swatches .nb-swatch').forEach(x => x.classList.toggle('is-active', x === sw));
      canvasCtrl.updateProps({ strokeColor: sw.dataset.stroke });
    });
    document.getElementById('nb-c-stroke-picker').addEventListener('input', (e) => {
      document.querySelectorAll('#nb-stroke-swatches .nb-swatch').forEach(x => x.classList.remove('is-active'));
      canvasCtrl.updateProps({ strokeColor: e.target.value });
    });
    document.getElementById('nb-fill-swatches').addEventListener('click', (e) => {
      const sw = e.target.closest('[data-fill]');
      if (!sw) return;
      document.querySelectorAll('#nb-fill-swatches .nb-swatch').forEach(x => x.classList.toggle('is-active', x === sw));
      canvasCtrl.updateProps({ fillColor: sw.dataset.fill, stickyColor: sw.dataset.fill !== 'transparent' ? sw.dataset.fill : '#FEF3C7' });
    });

    const widthRange = document.getElementById('nb-c-width');
    const widthVal = document.getElementById('nb-c-width-val');
    widthRange.addEventListener('input', () => {
      const v = Number(widthRange.value);
      widthVal.textContent = v + 'px';
      canvasCtrl.updateProps({ strokeWidth: v });
    });

    const opRange = document.getElementById('nb-c-opacity');
    const opVal = document.getElementById('nb-c-opacity-val');
    opRange.addEventListener('input', () => {
      const v = Number(opRange.value);
      opVal.textContent = v + '%';
      canvasCtrl.updateProps({ opacity: v / 100 });
    });

    document.getElementById('nb-c-style').addEventListener('change', (e) => {
      canvasCtrl.updateProps({ strokeStyle: e.target.value });
    });
    document.getElementById('nb-c-snap-btn').addEventListener('click', () => {
      canvasCtrl.setGridSnap(!canvasCtrl.gridSnap);
    });

    dom.selectionBar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-sel]');
      if (!btn) return;
      const act = btn.dataset.sel;
      if (act === 'front') canvasCtrl.bringToFront();
      else if (act === 'back') canvasCtrl.sendToBack();
      else if (act === 'duplicate') canvasCtrl.duplicateSelected();
      else if (act === 'lock') canvasCtrl.toggleLockSelected();
      else if (act === 'delete') canvasCtrl.deleteSelected();
    });

    // 8. Bottom Page-Flip Bar
    dom.pagePrev.addEventListener('click', () => goToPage((getActiveNotebook().activePageIndex || 0) - 1));
    dom.pageNext.addEventListener('click', () => goToPage((getActiveNotebook().activePageIndex || 0) + 1));
    dom.pageSelect.addEventListener('change', () => goToPage(Number(dom.pageSelect.value)));
    document.getElementById('nb-page-dup').addEventListener('click', () => duplicatePage(getActiveNotebook().activePageIndex || 0));
    dom.pageDel.addEventListener('click', () => deletePage(getActiveNotebook().activePageIndex || 0));

    dom.drawer.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.nb-popover, #nb-paper-btn, #nb-corner-btn, #nb-export-btn, #nb-style-popover-btn, #nb-shapes-btn, #nb-lines-btn, #nb-eraser-btn, #nb-page-add, #nb-sidebar-newpage-btn')) {
        closePopovers();
      }
    });

    window.addEventListener('fdil-theme-change', () => {
      syncPaperBackground();
      if (canvasCtrl) canvasCtrl.requestRender();
    });

    window.addEventListener('paste', (e) => {
      if (!ui.isOpen) return;
      const target = e.target;
      if (target && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const f = items[i].getAsFile();
          if (f) {
            setInputMode('draw', true);
            compressAndAddImage(f);
            e.preventDefault();
          }
          break;
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        toggleNotebook();
        return;
      }
      if (!ui.isOpen) return;
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        const page = getActivePage();
        setInputMode(page && page.inputMode === 'draw' ? 'write' : 'draw', true);
        return;
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPage((getActiveNotebook().activePageIndex || 0) - 1);
        return;
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goToPage((getActiveNotebook().activePageIndex || 0) + 1);
        return;
      }

      const target = e.target;
      const isEditingText = target && (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
      if (isEditingText) return;
      const page = getActivePage();
      if (!page || page.inputMode !== 'draw') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) canvasCtrl.redo();
        else canvasCtrl.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        canvasCtrl.redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        canvasCtrl.duplicateSelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        canvasCtrl.copySelected();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        canvasCtrl.pasteClipboard();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvasCtrl.selectedIds.size) {
          e.preventDefault();
          canvasCtrl.deleteSelected();
        }
        return;
      }

      const keyMap = {
        v: 'select', p: 'pen', m: 'highlighter',
        e: 'eraser', s: 'shape', l: 'line', t: 'text', n: 'sticky', z: 'laser'
      };
      const k = e.key.toLowerCase();
      if (!e.ctrlKey && !e.metaKey && !e.altKey && keyMap[k]) {
        canvasCtrl.setTool(keyMap[k]);
      }
    });

    window.addEventListener('resize', () => {
      if (ui.isOpen) syncPaperBackground();
    });
  }

  function compressAndAddImage(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 900;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxSide || h > maxSide) {
          const s = maxSide / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const ctx = off.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = off.toDataURL('image/jpeg', 0.78);
        canvasCtrl.addImageFromDataUrl(compressed);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleNotebookEscape() {
    if (!ui || !ui.isOpen) return false;
    if (dom.confirmModal && dom.confirmModal.classList.contains('is-open')) {
      closeConfirmModal();
      return true;
    }
    if (dom.bookModal && dom.bookModal.classList.contains('is-open')) {
      dom.bookModal.classList.remove('is-open');
      return true;
    }
    if (activePopover) {
      closePopovers();
      return true;
    }
    if (canvasCtrl && canvasCtrl.editingObjId) {
      canvasCtrl.commitTextEdit();
      return true;
    }
    if (canvasCtrl && canvasCtrl.selectedIds.size > 0) {
      canvasCtrl.selectedIds.clear();
      canvasCtrl._notifySelection();
      canvasCtrl.requestRender();
      return true;
    }
    if (ui.isFullscreen) {
      toggleNotebookFullscreen();
      return true;
    }
    closeNotebook();
    return true;
  }

  function exportNotebookData() {
    flushCurrentPageEdits();
    return cloneDeep(store);
  }

  function importNotebookData(payload) {
    if (!payload) return;
    if (Array.isArray(payload.notebooks) && payload.notebooks.length) {
      store = normalizeStore(cloneDeep(payload));
    } else if (Array.isArray(payload.notes) && payload.notes.length) {
      store = normalizeStore(migrateV1ToV2(payload));
    } else {
      return;
    }
    saveStoreNow();
    loadActivePageIntoView();
    renderSidebar();
  }

  function initNotebook() {
    loadState();
    buildDOM();
  }

  global.initNotebook = initNotebook;
  global.openNotebook = openNotebook;
  global.closeNotebook = closeNotebook;
  global.toggleNotebook = toggleNotebook;
  global.toggleNotebookFullscreen = toggleNotebookFullscreen;
  global.setNotebookCorner = setNotebookCorner;
  global.handleNotebookEscape = handleNotebookEscape;
  global.exportNotebookData = exportNotebookData;
  global.importNotebookData = importNotebookData;
  global._nbMigrateV1ToV2 = migrateV1ToV2;
})(window);
