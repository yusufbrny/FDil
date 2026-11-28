// Object-based vector & freehand canvas studio engine for FDil Notebook
(function (global) {
  'use strict';

  const GRID_STEP = 20;
  const MAX_HISTORY = 50;
  const SHAPE_TYPES = new Set([
    'rect', 'roundRect', 'ellipse', 'triangle',
    'diamond', 'pentagon', 'hexagon', 'star', 'callout'
  ]);
  const LINE_TYPES = new Set(['line', 'arrow', 'doubleArrow']);

  function uid(prefix) {
    return (prefix || 'obj') + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  function cloneDeep(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function isDarkThemeActive() {
    return document.documentElement.classList.contains('dark');
  }

  function resolvePaperPalette(paperTone) {
    const tone = paperTone || 'auto';
    if (tone === 'warm') {
      return { bg: '#F7F3E6', grid: 'rgba(63, 98, 26, 0.16)', rule: 'rgba(63, 98, 26, 0.14)', isDark: false };
    }
    if (tone === 'white') {
      return { bg: '#FFFFFF', grid: 'rgba(24, 32, 23, 0.14)', rule: 'rgba(24, 32, 23, 0.12)', isDark: false };
    }
    if (tone === 'dark') {
      return { bg: '#161B15', grid: 'rgba(155, 196, 114, 0.16)', rule: 'rgba(155, 196, 114, 0.14)', isDark: true };
    }
    if (isDarkThemeActive()) {
      return { bg: '#192018', grid: 'rgba(155, 196, 114, 0.16)', rule: 'rgba(155, 196, 114, 0.14)', isDark: true };
    }
    return { bg: '#FDFCF8', grid: 'rgba(63, 98, 26, 0.15)', rule: 'rgba(63, 98, 26, 0.13)', isDark: false };
  }

  function resolveInkColor(color, paperIsDark) {
    if (!color || color === 'auto') {
      return paperIsDark ? '#F2ECE0' : '#182017';
    }
    return color;
  }

  function distPtToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    const t = clamp(((px - x1) * dx + (py - y1) * dy) / lenSq, 0, 1);
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function getObjBounds(obj) {
    if (!obj) return { x: 0, y: 0, w: 0, h: 0 };
    if (obj.type === 'freehand' || obj.type === 'highlighter') {
      const pts = obj.points || [];
      if (!pts.length) return { x: 0, y: 0, w: 0, h: 0 };
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].x < minX) minX = pts[i].x;
        if (pts[i].y < minY) minY = pts[i].y;
        if (pts[i].x > maxX) maxX = pts[i].x;
        if (pts[i].y > maxY) maxY = pts[i].y;
      }
      const pad = Math.max(4, (obj.strokeWidth || 3) * 0.5);
      return {
        x: minX - pad,
        y: minY - pad,
        w: Math.max(12, maxX - minX + pad * 2),
        h: Math.max(12, maxY - minY + pad * 2)
      };
    }
    if (LINE_TYPES.has(obj.type)) {
      const minX = Math.min(obj.x1, obj.x2);
      const minY = Math.min(obj.y1, obj.y2);
      const maxX = Math.max(obj.x1, obj.x2);
      const maxY = Math.max(obj.y1, obj.y2);
      return {
        x: minX,
        y: minY,
        w: Math.max(8, maxX - minX),
        h: Math.max(8, maxY - minY)
      };
    }
    return {
      x: obj.x || 0,
      y: obj.y || 0,
      w: Math.max(12, obj.w || 20),
      h: Math.max(12, obj.h || 20)
    };
  }

  function rotatePoint(px, py, cx, cy, angle) {
    if (!angle) return { x: px, y: py };
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: cx + dx * c - dy * s,
      y: cy + dx * s + dy * c
    };
  }

  function wrapLines(ctx, text, maxWidth) {
    const rawLines = String(text || '').split('\n');
    const out = [];
    for (let r = 0; r < rawLines.length; r++) {
      const line = rawLines[r];
      if (!line) {
        out.push('');
        continue;
      }
      const words = line.split(' ');
      let cur = '';
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const test = cur ? cur + ' ' + word : word;
        if (ctx.measureText(test).width <= maxWidth) {
          cur = test;
        } else {
          if (cur) out.push(cur);
          if (ctx.measureText(word).width > maxWidth) {
            let chunk = '';
            for (let c = 0; c < word.length; c++) {
              if (ctx.measureText(chunk + word[c]).width > maxWidth && chunk) {
                out.push(chunk);
                chunk = word[c];
              } else {
                chunk += word[c];
              }
            }
            cur = chunk;
          } else {
            cur = word;
          }
        }
      }
      out.push(cur);
    }
    return out;
  }

  function buildPolygonVertices(type, x, y, w, h) {
    if (type === 'triangle') {
      return [
        { x: x + w / 2, y: y },
        { x: x + w, y: y + h },
        { x: x, y: y + h }
      ];
    }
    if (type === 'diamond') {
      return [
        { x: x + w / 2, y: y },
        { x: x + w, y: y + h / 2 },
        { x: x + w / 2, y: y + h },
        { x: x, y: y + h / 2 }
      ];
    }
    if (type === 'pentagon' || type === 'hexagon') {
      const sides = type === 'pentagon' ? 5 : 6;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rx = w / 2;
      const ry = h / 2;
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / sides;
        pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
      }
      return pts;
    }
    if (type === 'star') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rx = w / 2;
      const ry = h / 2;
      const irx = rx * 0.42;
      const iry = ry * 0.42;
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const radX = i % 2 === 0 ? rx : irx;
        const radY = i % 2 === 0 ? ry : iry;
        pts.push({ x: cx + Math.cos(a) * radX, y: cy + Math.sin(a) * radY });
      }
      return pts;
    }
    return [];
  }

  function traceRoundRect(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function traceCallout(ctx, x, y, w, h) {
    const tailH = Math.min(20, h * 0.24);
    const boxH = Math.max(16, h - tailH);
    const r = Math.min(14, w * 0.16, boxH * 0.25);
    const tailX = x + Math.min(w * 0.28, 36);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + boxH - r);
    ctx.quadraticCurveTo(x + w, y + boxH, x + w - r, y + boxH);
    ctx.lineTo(tailX + 18, y + boxH);
    ctx.lineTo(tailX, y + h);
    ctx.lineTo(tailX + 4, y + boxH);
    ctx.lineTo(x + r, y + boxH);
    ctx.quadraticCurveTo(x, y + boxH, x, y + boxH - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function escXml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  class NotebookCanvas {
    constructor(stageEl, canvasEl, textareaEl, callbacks, options) {
      this.stage = stageEl;
      this.canvas = canvasEl;
      this.ctx = canvasEl.getContext('2d');
      this.textarea = textareaEl;
      this.callbacks = callbacks || {};
      this.options = options || {};

      this.page = { id: 'pg_1', paper: 'dots', paperTone: 'auto', objects: [] };
      this.view = { x: 0, y: 0, zoom: 1 };

      this.tool = 'pen';
      this.shapeKind = 'rect';
      this.lineKind = 'arrow';
      this.eraserMode = 'object'; // 'object' | 'partial'
      this.gridSnap = false;

      this.props = {
        strokeColor: 'auto',
        fillColor: 'transparent',
        strokeWidth: 3,
        strokeStyle: 'solid',
        opacity: 1,
        fontSize: 16,
        fontFamily: 'sans',
        stickyColor: '#FEF3C7'
      };

      this.selectedIds = new Set();
      this.undoStack = [];
      this.redoStack = [];
      this.clipboard = [];

      this.imageCache = new Map();
      this.laserTrail = [];
      this.laserRaf = 0;
      this.renderPending = false;

      this.activePointers = new Map();
      this.pinchState = null;
      this.dragState = null;
      this.spacePanning = false;
      this.editingObjId = null;

      this._bindEvents();
      this.resize();
    }

    _bindEvents() {
      this._onPointerDown = this._handlePointerDown.bind(this);
      this._onPointerMove = this._handlePointerMove.bind(this);
      this._onPointerUp = this._handlePointerUp.bind(this);
      this._onWheel = this._handleWheel.bind(this);
      this._onDblClick = this._handleDblClick.bind(this);

      this.canvas.addEventListener('pointerdown', this._onPointerDown);
      window.addEventListener('pointermove', this._onPointerMove);
      window.addEventListener('pointerup', this._onPointerUp);
      window.addEventListener('pointercancel', this._onPointerUp);
      this.canvas.addEventListener('wheel', this._onWheel, { passive: false });
      this.canvas.addEventListener('dblclick', this._onDblClick);

      if (this.textarea) {
        this.textarea.addEventListener('blur', () => this.commitTextEdit());
        this.textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            this.commitTextEdit();
          } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.commitTextEdit();
          }
        });
        this.textarea.addEventListener('input', () => {
          if (!this.editingObjId) return;
          const obj = this._findObj(this.editingObjId);
          if (obj && obj.type === 'text') {
            this.textarea.style.height = 'auto';
            const h = Math.max(36, this.textarea.scrollHeight);
            this.textarea.style.height = h + 'px';
            obj.h = Math.max(obj.h || 36, h / this.view.zoom);
          }
        });
      }

      if (typeof ResizeObserver !== 'undefined') {
        this._ro = new ResizeObserver(() => this.resize());
        this._ro.observe(this.stage);
      }
    }

    destroy() {
      this.canvas.removeEventListener('pointerdown', this._onPointerDown);
      window.removeEventListener('pointermove', this._onPointerMove);
      window.removeEventListener('pointerup', this._onPointerUp);
      window.removeEventListener('pointercancel', this._onPointerUp);
      this.canvas.removeEventListener('wheel', this._onWheel);
      this.canvas.removeEventListener('dblclick', this._onDblClick);
      if (this._ro) this._ro.disconnect();
      if (this.laserRaf) cancelAnimationFrame(this.laserRaf);
    }

    resize() {
      if (!this.stage || !this.canvas) return;
      const rect = this.stage.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;
      if (this.canvas.width !== Math.floor(w * dpr) || this.canvas.height !== Math.floor(h * dpr)) {
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
      }
      this.cssWidth = w;
      this.cssHeight = h;
      this.dpr = dpr;
      this.requestRender();
    }

    setPage(pageObj, resetHistory = true) {
      this.commitTextEdit();
      this.page = pageObj || { id: uid('pg'), paper: 'dots', paperTone: 'auto', objects: [] };
      if (!Array.isArray(this.page.objects)) this.page.objects = [];
      this.selectedIds.clear();
      if (resetHistory) {
        this.undoStack = [];
        this.redoStack = [];
      }
      this._notifySelection();
      this._notifyHistory();
      this._notifyPageMeta();
      this.requestRender();
    }

    getPage() {
      return this.page;
    }

    setTool(tool) {
      this.commitTextEdit();
      this.tool = tool;
      if (tool !== 'select') {
        this.selectedIds.clear();
        this._notifySelection();
      }
      this._updateCursor();
      if (this.callbacks.onToolChange) this.callbacks.onToolChange(tool);
      this.requestRender();
    }

    setShapeKind(kind) {
      this.shapeKind = kind;
      this.setTool('shape');
    }

    setLineKind(kind) {
      this.lineKind = kind;
      this.setTool('line');
    }

    setEraserMode(mode) {
      this.eraserMode = mode === 'partial' ? 'partial' : 'object';
      this.setTool('eraser');
    }

    setGridSnap(enabled) {
      this.gridSnap = !!enabled;
      this._notifyPageMeta();
    }

    setPaper(paper, paperTone) {
      if (paper) this.page.paper = paper;
      if (paperTone) this.page.paperTone = paperTone;
      this._notifyChange();
      this._notifyPageMeta();
      this.requestRender();
    }

    updateProps(partial, applyToSelection = true) {
      Object.assign(this.props, partial);
      if (applyToSelection && this.selectedIds.size > 0) {
        this._pushUndo();
        let touched = false;
        this.page.objects.forEach(obj => {
          if (!this.selectedIds.has(obj.id) || obj.locked) return;
          if (partial.strokeColor !== undefined) obj.strokeColor = partial.strokeColor;
          if (partial.fillColor !== undefined && obj.type !== 'freehand' && obj.type !== 'highlighter' && !LINE_TYPES.has(obj.type)) {
            obj.fillColor = partial.fillColor;
          }
          if (partial.strokeWidth !== undefined) obj.strokeWidth = partial.strokeWidth;
          if (partial.strokeStyle !== undefined) obj.strokeStyle = partial.strokeStyle;
          if (partial.opacity !== undefined) obj.opacity = partial.opacity;
          if (partial.fontSize !== undefined) obj.fontSize = partial.fontSize;
          if (partial.fontFamily !== undefined) obj.fontFamily = partial.fontFamily;
          touched = true;
        });
        if (touched) {
          this._notifyChange();
          this.requestRender();
        }
      }
    }

    setSpacePanning(active) {
      this.spacePanning = !!active;
      this._updateCursor();
    }

    _updateCursor() {
      if (this.spacePanning || this.tool === 'hand') {
        this.canvas.style.cursor = 'grab';
      } else if (this.tool === 'select') {
        this.canvas.style.cursor = 'default';
      } else if (this.tool === 'text') {
        this.canvas.style.cursor = 'text';
      } else {
        this.canvas.style.cursor = 'crosshair';
      }
    }

    screenToWorld(sx, sy) {
      return {
        x: (sx - this.view.x) / this.view.zoom,
        y: (sy - this.view.y) / this.view.zoom
      };
    }

    worldToScreen(wx, wy) {
      return {
        x: wx * this.view.zoom + this.view.x,
        y: wy * this.view.zoom + this.view.y
      };
    }

    _snapVal(v) {
      return this.gridSnap ? Math.round(v / GRID_STEP) * GRID_STEP : v;
    }

    _findObj(id) {
      return this.page.objects.find(o => o.id === id) || null;
    }

    _pushUndo() {
      this.undoStack.push(cloneDeep(this.page.objects));
      if (this.undoStack.length > MAX_HISTORY) this.undoStack.shift();
      this.redoStack = [];
      this._notifyHistory();
    }

    undo() {
      if (!this.undoStack.length) return false;
      this.commitTextEdit();
      this.redoStack.push(cloneDeep(this.page.objects));
      this.page.objects = this.undoStack.pop();
      this.selectedIds.clear();
      this._notifySelection();
      this._notifyHistory();
      this._notifyChange();
      this.requestRender();
      return true;
    }

    redo() {
      if (!this.redoStack.length) return false;
      this.commitTextEdit();
      this.undoStack.push(cloneDeep(this.page.objects));
      this.page.objects = this.redoStack.pop();
      this.selectedIds.clear();
      this._notifySelection();
      this._notifyHistory();
      this._notifyChange();
      this.requestRender();
      return true;
    }

    canUndo() { return this.undoStack.length > 0; }
    canRedo() { return this.redoStack.length > 0; }

    deleteSelected() {
      if (!this.selectedIds.size) return;
      const hasUnlocked = this.page.objects.some(o => this.selectedIds.has(o.id) && !o.locked);
      if (!hasUnlocked) return;
      this._pushUndo();
      this.page.objects = this.page.objects.filter(o => !(this.selectedIds.has(o.id) && !o.locked));
      this.selectedIds.clear();
      this._notifySelection();
      this._notifyChange();
      this.requestRender();
    }

    duplicateSelected() {
      if (!this.selectedIds.size) return;
      this._pushUndo();
      const newIds = new Set();
      this.page.objects.forEach(obj => {
        if (!this.selectedIds.has(obj.id)) return;
        const copy = cloneDeep(obj);
        copy.id = uid(copy.type);
        copy.locked = false;
        this._offsetObj(copy, 22, 22);
        this.page.objects.push(copy);
        newIds.add(copy.id);
      });
      this.selectedIds = newIds;
      this._notifySelection();
      this._notifyChange();
      this.requestRender();
    }

    copySelected() {
      if (!this.selectedIds.size) return;
      this.clipboard = this.page.objects
        .filter(o => this.selectedIds.has(o.id))
        .map(o => cloneDeep(o));
    }

    pasteClipboard() {
      if (!this.clipboard.length) return;
      this._pushUndo();
      const newIds = new Set();
      this.clipboard.forEach(item => {
        const copy = cloneDeep(item);
        copy.id = uid(copy.type);
        copy.locked = false;
        this._offsetObj(copy, 26, 26);
        this.page.objects.push(copy);
        newIds.add(copy.id);
      });
      this.selectedIds = newIds;
      this._notifySelection();
      this._notifyChange();
      this.requestRender();
    }

    toggleLockSelected() {
      if (!this.selectedIds.size) return;
      this._pushUndo();
      const objs = this.page.objects.filter(o => this.selectedIds.has(o.id));
      const allLocked = objs.every(o => o.locked);
      objs.forEach(o => { o.locked = !allLocked; });
      this._notifySelection();
      this._notifyChange();
      this.requestRender();
    }

    bringForward() {
      if (!this.selectedIds.size) return;
      this._pushUndo();
      const objs = this.page.objects;
      for (let i = objs.length - 2; i >= 0; i--) {
        if (this.selectedIds.has(objs[i].id) && !this.selectedIds.has(objs[i + 1].id)) {
          const tmp = objs[i];
          objs[i] = objs[i + 1];
          objs[i + 1] = tmp;
        }
      }
      this._notifyChange();
      this.requestRender();
    }

    sendBackward() {
      if (!this.selectedIds.size) return;
      this._pushUndo();
      const objs = this.page.objects;
      for (let i = 1; i < objs.length; i++) {
        if (this.selectedIds.has(objs[i].id) && !this.selectedIds.has(objs[i - 1].id)) {
          const tmp = objs[i];
          objs[i] = objs[i - 1];
          objs[i - 1] = tmp;
        }
      }
      this._notifyChange();
      this.requestRender();
    }

    bringToFront() {
      if (!this.selectedIds.size) return;
      this._pushUndo();
      const stay = [];
      const move = [];
      this.page.objects.forEach(o => (this.selectedIds.has(o.id) ? move : stay).push(o));
      this.page.objects = stay.concat(move);
      this._notifyChange();
      this.requestRender();
    }

    sendToBack() {
      if (!this.selectedIds.size) return;
      this._pushUndo();
      const stay = [];
      const move = [];
      this.page.objects.forEach(o => (this.selectedIds.has(o.id) ? move : stay).push(o));
      this.page.objects = move.concat(stay);
      this._notifyChange();
      this.requestRender();
    }

    clearPage() {
      if (!this.page.objects.length) return;
      this._pushUndo();
      this.page.objects = [];
      this.selectedIds.clear();
      this._notifySelection();
      this._notifyChange();
      this.requestRender();
    }

    addImageFromDataUrl(dataUrl) {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(dataUrl, img);
        const maxSide = 320;
        let w = img.naturalWidth || 240;
        let h = img.naturalHeight || 180;
        if (w > maxSide || h > maxSide) {
          const scale = maxSide / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const center = this.screenToWorld((this.cssWidth || 400) / 2, (this.cssHeight || 300) / 2);
        this._pushUndo();
        const obj = {
          id: uid('img'),
          type: 'image',
          x: Math.round(center.x - w / 2),
          y: Math.round(center.y - h / 2),
          w: w,
          h: h,
          src: dataUrl,
          opacity: 1,
          rotation: 0
        };
        this.page.objects.push(obj);
        this.selectedIds = new Set([obj.id]);
        this.setTool('select');
        this._notifySelection();
        this._notifyChange();
        this.requestRender();
      };
      img.src = dataUrl;
    }

    addStickyAtCenter(text, fillColor) {
      const center = this.screenToWorld((this.cssWidth || 400) / 2, (this.cssHeight || 300) / 2);
      this._pushUndo();
      const obj = {
        id: uid('sticky'),
        type: 'sticky',
        x: Math.round(center.x - 95),
        y: Math.round(center.y - 75),
        w: 190,
        h: 150,
        text: text || 'Yeni yapışkan not...',
        fillColor: fillColor || this.props.stickyColor || '#FEF3C7',
        strokeColor: '#182017',
        strokeWidth: 1.5,
        opacity: 1,
        fontSize: 14,
        fontFamily: 'sans',
        rotation: 0
      };
      this.page.objects.push(obj);
      this.selectedIds = new Set([obj.id]);
      this._notifySelection();
      this._notifyChange();
      this.requestRender();
      return obj;
    }

    zoomBy(factor, cx, cy) {
      const oldZoom = this.view.zoom;
      const newZoom = clamp(oldZoom * factor, 0.25, 3.0);
      const anchorX = cx !== undefined ? cx : (this.cssWidth || 400) / 2;
      const anchorY = cy !== undefined ? cy : (this.cssHeight || 300) / 2;
      const wx = (anchorX - this.view.x) / oldZoom;
      const wy = (anchorY - this.view.y) / oldZoom;
      this.view.zoom = newZoom;
      this.view.x = anchorX - wx * newZoom;
      this.view.y = anchorY - wy * newZoom;
      this._notifyView();
      this.requestRender();
    }

    resetZoom() {
      this.view = { x: 0, y: 0, zoom: 1 };
      this._notifyView();
      this.requestRender();
    }

    fitToContent() {
      const objs = this.page.objects;
      if (!objs.length) {
        this.resetZoom();
        return;
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      objs.forEach(o => {
        const b = getObjBounds(o);
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w);
        maxY = Math.max(maxY, b.y + b.h);
      });
      const cw = Math.max(40, maxX - minX);
      const ch = Math.max(40, maxY - minY);
      const pad = 40;
      const sw = Math.max(100, (this.cssWidth || 400) - pad * 2);
      const sh = Math.max(100, (this.cssHeight || 300) - pad * 2);
      const z = clamp(Math.min(sw / cw, sh / ch), 0.25, 2.0);
      this.view.zoom = z;
      this.view.x = (this.cssWidth || 400) / 2 - (minX + cw / 2) * z;
      this.view.y = (this.cssHeight || 300) / 2 - (minY + ch / 2) * z;
      this._notifyView();
      this.requestRender();
    }

    /* ── Pointer & Wheel Handlers ── */
    _getLocalPt(e) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    _handlePointerDown(e) {
      if (this.editingObjId) {
        this.commitTextEdit();
      }
      if (this.callbacks.onStageInteract) this.callbacks.onStageInteract();

      const local = this._getLocalPt(e);
      this.activePointers.set(e.pointerId, local);

      // Two-finger pinch zoom/pan
      if (this.activePointers.size === 2) {
        const pts = Array.from(this.activePointers.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        this.dragState = null;
        this.pinchState = {
          startDist: Math.max(10, dist),
          startZoom: this.view.zoom,
          startMid: mid,
          startViewX: this.view.x,
          startViewY: this.view.y
        };
        return;
      }

      if (e.button === 1 || this.spacePanning || this.tool === 'hand') {
        try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}
        this.dragState = {
          mode: 'pan',
          startLocal: local,
          startViewX: this.view.x,
          startViewY: this.view.y
        };
        this.canvas.style.cursor = 'grabbing';
        return;
      }

      if (e.button !== 0 && e.pointerType === 'mouse') return;
      try { this.canvas.setPointerCapture(e.pointerId); } catch (_) {}

      const world = this.screenToWorld(local.x, local.y);

      if (this.tool === 'select') {
        this._startSelectDown(world, e.shiftKey);
        return;
      }

      if (this.tool === 'pen' || this.tool === 'highlighter') {
        this._pushUndo();
        const isHl = this.tool === 'highlighter';
        const obj = {
          id: uid(isHl ? 'hl' : 'pen'),
          type: isHl ? 'highlighter' : 'freehand',
          points: [{ x: world.x, y: world.y, p: e.pressure || 0.5 }],
          strokeColor: this.props.strokeColor,
          strokeWidth: isHl ? Math.max(12, this.props.strokeWidth * 3) : this.props.strokeWidth,
          strokeStyle: isHl ? 'solid' : this.props.strokeStyle,
          opacity: isHl ? 0.36 : this.props.opacity
        };
        this.page.objects.push(obj);
        this.dragState = { mode: 'drawFreehand', obj };
        this.requestRender();
        return;
      }

      if (this.tool === 'eraser') {
        this._pushUndo();
        this.dragState = { mode: 'erase', erasedAny: false, lastWorld: world };
        this._eraseAt(world);
        this.requestRender();
        return;
      }

      if (this.tool === 'shape') {
        this._pushUndo();
        const sx = this._snapVal(world.x);
        const sy = this._snapVal(world.y);
        const obj = {
          id: uid('shp'),
          type: this.shapeKind,
          x: sx,
          y: sy,
          w: 4,
          h: 4,
          strokeColor: this.props.strokeColor,
          fillColor: this.props.fillColor,
          strokeWidth: this.props.strokeWidth,
          strokeStyle: this.props.strokeStyle,
          opacity: this.props.opacity,
          rotation: 0,
          text: '',
          fontSize: this.props.fontSize,
          fontFamily: this.props.fontFamily
        };
        this.page.objects.push(obj);
        this.dragState = { mode: 'drawShape', obj, originX: sx, originY: sy };
        this.requestRender();
        return;
      }

      if (this.tool === 'line') {
        this._pushUndo();
        const sx = this._snapVal(world.x);
        const sy = this._snapVal(world.y);
        const obj = {
          id: uid('ln'),
          type: this.lineKind,
          x1: sx,
          y1: sy,
          x2: sx,
          y2: sy,
          strokeColor: this.props.strokeColor,
          strokeWidth: this.props.strokeWidth,
          strokeStyle: this.props.strokeStyle,
          opacity: this.props.opacity
        };
        this.page.objects.push(obj);
        this.dragState = { mode: 'drawLine', obj, originX: sx, originY: sy };
        this.requestRender();
        return;
      }

      if (this.tool === 'text') {
        this._pushUndo();
        const obj = {
          id: uid('txt'),
          type: 'text',
          x: Math.round(world.x),
          y: Math.round(world.y - 12),
          w: 180,
          h: 40,
          text: '',
          strokeColor: this.props.strokeColor,
          opacity: this.props.opacity,
          fontSize: this.props.fontSize || 16,
          fontFamily: this.props.fontFamily || 'sans',
          rotation: 0
        };
        this.page.objects.push(obj);
        this.selectedIds = new Set([obj.id]);
        this.setTool('select');
        this._openTextEditor(obj);
        return;
      }

      if (this.tool === 'sticky') {
        this._pushUndo();
        const obj = {
          id: uid('stk'),
          type: 'sticky',
          x: Math.round(world.x - 95),
          y: Math.round(world.y - 75),
          w: 190,
          h: 150,
          text: '',
          fillColor: this.props.stickyColor || '#FEF3C7',
          strokeColor: '#182017',
          strokeWidth: 1.5,
          opacity: 1,
          fontSize: 14,
          fontFamily: 'sans',
          rotation: 0
        };
        this.page.objects.push(obj);
        this.selectedIds = new Set([obj.id]);
        this.setTool('select');
        this._openTextEditor(obj);
        return;
      }

      if (this.tool === 'laser') {
        this.dragState = { mode: 'laser' };
        this._pushLaserPoint(world);
      }
    }

    _startSelectDown(world, shiftKey) {
      // Check resize/rotate handle on single unlocked selection first
      if (this.selectedIds.size === 1) {
        const onlyId = Array.from(this.selectedIds)[0];
        const sel = this._findObj(onlyId);
        if (sel && !sel.locked) {
          const handle = this._hitTestHandle(sel, world);
          if (handle) {
            this._pushUndo();
            if (handle === 'rot') {
              const b = getObjBounds(sel);
              this.dragState = {
                mode: 'rotate',
                obj: sel,
                cx: b.x + b.w / 2,
                cy: b.y + b.h / 2
              };
            } else if (LINE_TYPES.has(sel.type)) {
              this.dragState = { mode: 'resizeLine', obj: sel, endpoint: handle };
            } else {
              this.dragState = {
                mode: 'resize',
                obj: sel,
                handle: handle,
                orig: cloneDeep(sel)
              };
            }
            return;
          }
        }
      }

      const hit = this._hitTestObjects(world);
      if (hit) {
        if (shiftKey) {
          if (this.selectedIds.has(hit.id)) this.selectedIds.delete(hit.id);
          else this.selectedIds.add(hit.id);
        } else if (!this.selectedIds.has(hit.id)) {
          this.selectedIds = new Set([hit.id]);
        }
        this._notifySelection();

        const movable = this.page.objects.filter(o => this.selectedIds.has(o.id) && !o.locked);
        if (movable.length) {
          this._pushUndo();
          this.dragState = {
            mode: 'move',
            startWorld: world,
            snapshots: movable.map(o => ({ obj: o, orig: cloneDeep(o) })),
            moved: false
          };
        }
      } else {
        if (!shiftKey) {
          this.selectedIds.clear();
          this._notifySelection();
        }
        this.dragState = {
          mode: 'marquee',
          startWorld: world,
          curWorld: world
        };
      }
      this.requestRender();
    }

    _handlePointerMove(e) {
      if (!this.activePointers.has(e.pointerId)) return;
      const local = this._getLocalPt(e);
      this.activePointers.set(e.pointerId, local);

      if (this.pinchState && this.activePointers.size === 2) {
        const pts = Array.from(this.activePointers.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        const scale = dist / this.pinchState.startDist;
        const newZoom = clamp(this.pinchState.startZoom * scale, 0.25, 3.0);
        const wx = (this.pinchState.startMid.x - this.pinchState.startViewX) / this.pinchState.startZoom;
        const wy = (this.pinchState.startMid.y - this.pinchState.startViewY) / this.pinchState.startZoom;
        this.view.zoom = newZoom;
        this.view.x = mid.x - wx * newZoom;
        this.view.y = mid.y - wy * newZoom;
        this._notifyView();
        this.requestRender();
        return;
      }

      if (!this.dragState) return;
      const world = this.screenToWorld(local.x, local.y);

      if (this.dragState.mode === 'pan') {
        this.view.x = this.dragState.startViewX + (local.x - this.dragState.startLocal.x);
        this.view.y = this.dragState.startViewY + (local.y - this.dragState.startLocal.y);
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'drawFreehand') {
        const pts = this.dragState.obj.points;
        const last = pts[pts.length - 1];
        if (Math.hypot(world.x - last.x, world.y - last.y) >= 1.5 / this.view.zoom) {
          pts.push({ x: world.x, y: world.y, p: e.pressure || 0.5 });
          this.requestRender();
        }
        return;
      }

      if (this.dragState.mode === 'erase') {
        this._eraseAt(world);
        this.dragState.lastWorld = world;
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'drawShape') {
        const o = this.dragState.obj;
        let wx = this._snapVal(world.x);
        let wy = this._snapVal(world.y);
        let dx = wx - this.dragState.originX;
        let dy = wy - this.dragState.originY;
        if (e.shiftKey) {
          const s = Math.max(Math.abs(dx), Math.abs(dy));
          dx = (dx >= 0 ? 1 : -1) * s;
          dy = (dy >= 0 ? 1 : -1) * s;
        }
        o.x = dx >= 0 ? this.dragState.originX : this.dragState.originX + dx;
        o.y = dy >= 0 ? this.dragState.originY : this.dragState.originY + dy;
        o.w = Math.max(12, Math.abs(dx));
        o.h = Math.max(12, Math.abs(dy));
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'drawLine') {
        const o = this.dragState.obj;
        let tx = this._snapVal(world.x);
        let ty = this._snapVal(world.y);
        if (e.shiftKey) {
          const dx = tx - o.x1;
          const dy = ty - o.y1;
          const len = Math.hypot(dx, dy);
          const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 12)) * (Math.PI / 12);
          tx = o.x1 + Math.cos(ang) * len;
          ty = o.y1 + Math.sin(ang) * len;
        }
        o.x2 = tx;
        o.y2 = ty;
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'move') {
        let dx = world.x - this.dragState.startWorld.x;
        let dy = world.y - this.dragState.startWorld.y;
        if (this.gridSnap) {
          dx = Math.round(dx / GRID_STEP) * GRID_STEP;
          dy = Math.round(dy / GRID_STEP) * GRID_STEP;
        }
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) this.dragState.moved = true;
        this.dragState.snapshots.forEach(({ obj, orig }) => {
          this._restoreAndOffset(obj, orig, dx, dy);
        });
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'resize') {
        this._applyBoxResize(this.dragState.obj, this.dragState.orig, this.dragState.handle, world, e.shiftKey);
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'resizeLine') {
        const o = this.dragState.obj;
        let tx = this._snapVal(world.x);
        let ty = this._snapVal(world.y);
        if (this.dragState.endpoint === 'p1') {
          o.x1 = tx;
          o.y1 = ty;
        } else {
          o.x2 = tx;
          o.y2 = ty;
        }
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'rotate') {
        let ang = Math.atan2(world.y - this.dragState.cy, world.x - this.dragState.cx) + Math.PI / 2;
        if (e.shiftKey) {
          const step = Math.PI / 12;
          ang = Math.round(ang / step) * step;
        }
        this.dragState.obj.rotation = ang;
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'marquee') {
        this.dragState.curWorld = world;
        this.requestRender();
        return;
      }

      if (this.dragState.mode === 'laser') {
        this._pushLaserPoint(world);
      }
    }

    _handlePointerUp(e) {
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) {
        this.pinchState = null;
      }
      if (!this.dragState) return;
      const st = this.dragState;
      this.dragState = null;
      this._updateCursor();

      if (st.mode === 'drawFreehand') {
        if (st.obj.points.length === 1) {
          const p = st.obj.points[0];
          st.obj.points.push({ x: p.x + 0.5, y: p.y + 0.5, p: p.p });
        }
        this._notifyChange();
      } else if (st.mode === 'drawShape') {
        if (st.obj.w < 16 && st.obj.h < 16) {
          st.obj.w = 110;
          st.obj.h = 76;
        }
        this.selectedIds = new Set([st.obj.id]);
        this._notifySelection();
        this._notifyChange();
      } else if (st.mode === 'drawLine') {
        if (Math.hypot(st.obj.x2 - st.obj.x1, st.obj.y2 - st.obj.y1) < 8) {
          st.obj.x2 = st.obj.x1 + 90;
          st.obj.y2 = st.obj.y1;
        }
        this.selectedIds = new Set([st.obj.id]);
        this._notifySelection();
        this._notifyChange();
      } else if (st.mode === 'move') {
        if (!st.moved) {
          this.undoStack.pop();
          this._notifyHistory();
        } else {
          this._notifyChange();
        }
      } else if (st.mode === 'resize' || st.mode === 'resizeLine' || st.mode === 'rotate') {
        this._notifyChange();
      } else if (st.mode === 'erase') {
        if (!st.erasedAny) {
          this.undoStack.pop();
          this._notifyHistory();
        } else {
          this._notifyChange();
        }
      } else if (st.mode === 'marquee') {
        const x1 = Math.min(st.startWorld.x, st.curWorld.x);
        const y1 = Math.min(st.startWorld.y, st.curWorld.y);
        const x2 = Math.max(st.startWorld.x, st.curWorld.x);
        const y2 = Math.max(st.startWorld.y, st.curWorld.y);
        if (x2 - x1 > 4 || y2 - y1 > 4) {
          this.page.objects.forEach(o => {
            const b = getObjBounds(o);
            if (b.x + b.w >= x1 && b.x <= x2 && b.y + b.h >= y1 && b.y <= y2) {
              this.selectedIds.add(o.id);
            }
          });
          this._notifySelection();
        }
      }
      this.requestRender();
    }

    _handleWheel(e) {
      if (this.options.scrollMode && !e.ctrlKey && !e.metaKey) {
        return;
      }
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        if (this.options.scrollMode) return;
        const local = this._getLocalPt(e);
        const factor = e.deltaY < 0 ? 1.1 : 0.91;
        this.zoomBy(factor, local.x, local.y);
      } else {
        this.view.x -= e.deltaX;
        this.view.y -= e.deltaY;
        this.requestRender();
      }
    }

    _handleDblClick(e) {
      if (this.tool !== 'select') return;
      const local = this._getLocalPt(e);
      const world = this.screenToWorld(local.x, local.y);
      const hit = this._hitTestObjects(world);
      if (hit && !hit.locked && (hit.type === 'text' || hit.type === 'sticky' || SHAPE_TYPES.has(hit.type))) {
        this._openTextEditor(hit);
      }
    }

    /* ── Inline Text Editor ── */
    _openTextEditor(obj) {
      if (!this.textarea) return;
      this.editingObjId = obj.id;
      const b = getObjBounds(obj);
      const tl = this.worldToScreen(b.x, b.y);
      const ta = this.textarea;
      const z = this.view.zoom;
      const fontSize = Math.max(11, (obj.fontSize || 15) * z);
      ta.style.display = 'block';
      ta.style.left = Math.round(tl.x) + 'px';
      ta.style.top = Math.round(tl.y) + 'px';
      ta.style.width = Math.max(110, Math.round(b.w * z)) + 'px';
      ta.style.minHeight = Math.max(34, Math.round(b.h * z)) + 'px';
      ta.style.height = Math.max(34, Math.round(b.h * z)) + 'px';
      ta.style.fontSize = fontSize + 'px';
      ta.style.fontFamily = obj.fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)';
      ta.style.textAlign = SHAPE_TYPES.has(obj.type) ? 'center' : 'left';
      ta.value = obj.text || '';
      setTimeout(() => {
        ta.focus();
        ta.select();
      }, 10);
      this.requestRender();
    }

    commitTextEdit() {
      if (!this.editingObjId || !this.textarea) return;
      const obj = this._findObj(this.editingObjId);
      const val = this.textarea.value;
      this.textarea.style.display = 'none';
      this.editingObjId = null;

      if (obj) {
        if (obj.type === 'text' && !val.trim()) {
          this.page.objects = this.page.objects.filter(o => o.id !== obj.id);
          this.selectedIds.delete(obj.id);
          this._notifySelection();
        } else {
          obj.text = val;
          if (obj.type === 'text') {
            this.ctx.save();
            const ff = obj.fontFamily === 'serif' ? 'Newsreader, Georgia, serif' : 'Lexend, sans-serif';
            this.ctx.font = `${obj.fontSize || 16}px ${ff}`;
            const lines = wrapLines(this.ctx, val, Math.max(40, (obj.w || 180) - 12));
            this.ctx.restore();
            obj.h = Math.max(32, lines.length * ((obj.fontSize || 16) * 1.38) + 12);
          }
        }
        this._notifyChange();
      }
      this.requestRender();
    }

    /* ── Object Geometry Helpers ── */
    _offsetObj(obj, dx, dy) {
      if (obj.type === 'freehand' || obj.type === 'highlighter') {
        (obj.points || []).forEach(p => { p.x += dx; p.y += dy; });
      } else if (LINE_TYPES.has(obj.type)) {
        obj.x1 += dx; obj.y1 += dy; obj.x2 += dx; obj.y2 += dy;
      } else {
        obj.x += dx; obj.y += dy;
      }
    }

    _restoreAndOffset(obj, orig, dx, dy) {
      if (obj.type === 'freehand' || obj.type === 'highlighter') {
        obj.points = orig.points.map(p => ({ x: p.x + dx, y: p.y + dy, p: p.p }));
      } else if (LINE_TYPES.has(obj.type)) {
        obj.x1 = orig.x1 + dx; obj.y1 = orig.y1 + dy;
        obj.x2 = orig.x2 + dx; obj.y2 = orig.y2 + dy;
      } else {
        obj.x = orig.x + dx; obj.y = orig.y + dy;
      }
    }

    _applyBoxResize(obj, orig, handle, world, preserveAspect) {
      if (obj.type === 'freehand' || obj.type === 'highlighter') {
        const ob = getObjBounds(orig);
        let nx = ob.x, ny = ob.y, nw = ob.w, nh = ob.h;
        if (handle.includes('e')) nw = Math.max(20, world.x - ob.x);
        if (handle.includes('s')) nh = Math.max(20, world.y - ob.y);
        if (handle.includes('w')) { nw = Math.max(20, ob.x + ob.w - world.x); nx = ob.x + ob.w - nw; }
        if (handle.includes('n')) { nh = Math.max(20, ob.y + ob.h - world.y); ny = ob.y + ob.h - nh; }
        const sx = nw / ob.w;
        const sy = nh / ob.h;
        obj.points = orig.points.map(p => ({
          x: nx + (p.x - ob.x) * sx,
          y: ny + (p.y - ob.y) * sy,
          p: p.p
        }));
        return;
      }

      let x = orig.x, y = orig.y, w = orig.w, h = orig.h;
      const wx = this._snapVal(world.x);
      const wy = this._snapVal(world.y);

      if (handle.includes('e')) w = Math.max(20, wx - orig.x);
      if (handle.includes('s')) h = Math.max(20, wy - orig.y);
      if (handle.includes('w')) {
        w = Math.max(20, orig.x + orig.w - wx);
        x = orig.x + orig.w - w;
      }
      if (handle.includes('n')) {
        h = Math.max(20, orig.y + orig.h - wy);
        y = orig.y + orig.h - h;
      }

      if (preserveAspect && orig.w > 0 && orig.h > 0) {
        const ratio = orig.w / orig.h;
        if (w / h > ratio) h = Math.max(20, w / ratio);
        else w = Math.max(20, h * ratio);
      }
      obj.x = x; obj.y = y; obj.w = w; obj.h = h;
    }

    _hitTestHandle(obj, world) {
      const tol = 10 / this.view.zoom;
      if (LINE_TYPES.has(obj.type)) {
        if (Math.hypot(world.x - obj.x1, world.y - obj.y1) <= tol) return 'p1';
        if (Math.hypot(world.x - obj.x2, world.y - obj.y2) <= tol) return 'p2';
        return null;
      }
      const b = getObjBounds(obj);
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const pt = rotatePoint(world.x, world.y, cx, cy, -(obj.rotation || 0));

      const rotY = b.y - 24 / this.view.zoom;
      if (Math.hypot(pt.x - cx, pt.y - rotY) <= tol * 1.2) return 'rot';

      const handles = [
        ['nw', b.x, b.y],
        ['n', cx, b.y],
        ['ne', b.x + b.w, b.y],
        ['e', b.x + b.w, cy],
        ['se', b.x + b.w, b.y + b.h],
        ['s', cx, b.y + b.h],
        ['sw', b.x, b.y + b.h],
        ['w', b.x, cy]
      ];
      for (let i = 0; i < handles.length; i++) {
        if (Math.hypot(pt.x - handles[i][1], pt.y - handles[i][2]) <= tol) {
          return handles[i][0];
        }
      }
      return null;
    }

    _hitTestObj(obj, world) {
      const tol = Math.max(6, (obj.strokeWidth || 2)) / this.view.zoom + 4 / this.view.zoom;
      if (obj.type === 'freehand' || obj.type === 'highlighter') {
        const pts = obj.points || [];
        for (let i = 0; i < pts.length - 1; i++) {
          if (distPtToSegment(world.x, world.y, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) <= tol) {
            return true;
          }
        }
        return pts.length === 1 && Math.hypot(world.x - pts[0].x, world.y - pts[0].y) <= tol;
      }
      if (LINE_TYPES.has(obj.type)) {
        return distPtToSegment(world.x, world.y, obj.x1, obj.y1, obj.x2, obj.y2) <= tol;
      }
      const b = getObjBounds(obj);
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const pt = rotatePoint(world.x, world.y, cx, cy, -(obj.rotation || 0));
      return pt.x >= b.x - 4 && pt.x <= b.x + b.w + 4 && pt.y >= b.y - 4 && pt.y <= b.y + b.h + 4;
    }

    _hitTestObjects(world) {
      for (let i = this.page.objects.length - 1; i >= 0; i--) {
        if (this._hitTestObj(this.page.objects[i], world)) {
          return this.page.objects[i];
        }
      }
      return null;
    }

    _eraseAt(world) {
      const radius = Math.max(12, this.props.strokeWidth * 3) / this.view.zoom;
      if (this.eraserMode === 'partial') {
        const nextObjects = [];
        let changed = false;
        for (let i = 0; i < this.page.objects.length; i++) {
          const obj = this.page.objects[i];
          if (obj.locked) {
            nextObjects.push(obj);
            continue;
          }
          if (obj.type === 'freehand' || obj.type === 'highlighter') {
            const pts = obj.points || [];
            let segments = [];
            let currentSeg = [];
            let split = false;
            for (let j = 0; j < pts.length; j++) {
              const p = pts[j];
              if (Math.hypot(p.x - world.x, p.y - world.y) <= radius) {
                split = true;
                if (currentSeg.length >= 2) segments.push(currentSeg);
                currentSeg = [];
              } else {
                currentSeg.push(p);
              }
            }
            if (currentSeg.length >= 2) segments.push(currentSeg);
            if (!split) {
              nextObjects.push(obj);
            } else {
              changed = true;
              segments.forEach((seg, idx) => {
                const segCopy = idx === 0 ? obj : cloneDeep(obj);
                if (idx > 0) segCopy.id = uid(obj.type);
                segCopy.points = seg;
                nextObjects.push(segCopy);
              });
            }
          } else if (this._hitTestObj(obj, world)) {
            changed = true;
            this.selectedIds.delete(obj.id);
          } else {
            nextObjects.push(obj);
          }
        }
        if (changed) {
          this.page.objects = nextObjects;
          if (this.dragState) this.dragState.erasedAny = true;
        }
        return;
      }

      // Object eraser
      const before = this.page.objects.length;
      this.page.objects = this.page.objects.filter(obj => {
        if (obj.locked) return true;
        if (this._hitTestObj(obj, world)) {
          this.selectedIds.delete(obj.id);
          return false;
        }
        return true;
      });
      if (this.page.objects.length !== before && this.dragState) {
        this.dragState.erasedAny = true;
      }
    }

    _pushLaserPoint(world) {
      this.laserTrail.push({ x: world.x, y: world.y, t: performance.now() });
      if (!this.laserRaf) {
        const tick = () => {
          const now = performance.now();
          this.laserTrail = this.laserTrail.filter(p => now - p.t < 850);
          this.requestRender();
          if (this.laserTrail.length > 0) {
            this.laserRaf = requestAnimationFrame(tick);
          } else {
            this.laserRaf = 0;
          }
        };
        this.laserRaf = requestAnimationFrame(tick);
      }
    }

    /* ── Rendering ── */
    requestRender() {
      if (this.renderPending) return;
      this.renderPending = true;
      requestAnimationFrame(() => {
        this.renderPending = false;
        this.render();
      });
    }

    render() {
      if (!this.ctx || !this.cssWidth || !this.cssHeight) return;
      this._renderScene(this.ctx, this.cssWidth, this.cssHeight, this.dpr || 1, this.view, true);
    }

    _renderScene(ctx, width, height, dpr, view, drawOverlays) {
      const palette = resolvePaperPalette(this.page.paperTone);
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (this.options.transparentBackground && drawOverlays) {
        ctx.clearRect(0, 0, width, height);
      } else {
        // 1. Paper fill
        ctx.fillStyle = palette.bg;
        ctx.fillRect(0, 0, width, height);

        // 2. Paper pattern
        NotebookCanvas._drawPaperPatternOnCtx(ctx, width, height, view, this.page.paper || 'dots', palette);
      }

      // 3. World transform for objects
      ctx.save();
      ctx.translate(view.x, view.y);
      ctx.scale(view.zoom, view.zoom);

      for (let i = 0; i < this.page.objects.length; i++) {
        const obj = this.page.objects[i];
        this._drawObject(ctx, obj, palette.isDark, obj.id === this.editingObjId);
      }

      if (drawOverlays) {
        // 4. Selection outlines & handles
        if (this.selectedIds.size > 0) {
          this.page.objects.forEach(obj => {
            if (this.selectedIds.has(obj.id)) {
              this._drawSelectionBox(ctx, obj, view.zoom, this.selectedIds.size === 1);
            }
          });
        }

        // 5. Marquee box
        if (this.dragState && this.dragState.mode === 'marquee') {
          const x = Math.min(this.dragState.startWorld.x, this.dragState.curWorld.x);
          const y = Math.min(this.dragState.startWorld.y, this.dragState.curWorld.y);
          const w = Math.abs(this.dragState.curWorld.x - this.dragState.startWorld.x);
          const h = Math.abs(this.dragState.curWorld.y - this.dragState.startWorld.y);
          ctx.save();
          ctx.fillStyle = 'rgba(63, 98, 26, 0.10)';
          ctx.strokeStyle = '#3F621A';
          ctx.lineWidth = 1.5 / view.zoom;
          ctx.setLineDash([4 / view.zoom, 4 / view.zoom]);
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
          ctx.restore();
        }

        // 6. Laser trail
        if (this.laserTrail.length > 1) {
          const now = performance.now();
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          for (let i = 1; i < this.laserTrail.length; i++) {
            const p0 = this.laserTrail[i - 1];
            const p1 = this.laserTrail[i];
            const life = 1 - (now - p1.t) / 850;
            if (life <= 0) continue;
            ctx.strokeStyle = `rgba(220, 38, 38, ${clamp(life, 0, 1)})`;
            ctx.lineWidth = (5 * life + 1.5) / view.zoom;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      ctx.restore();
      ctx.restore();
    }

    static _drawPaperPatternOnCtx(ctx, width, height, view, paper, palette) {
      if (paper === 'plain') return;
      const step = 24 * view.zoom;
      if (step < 6) return;
      const offX = ((view.x % step) + step) % step;
      const offY = ((view.y % step) + step) % step;

      ctx.save();
      if (paper === 'dots') {
        ctx.fillStyle = palette.grid;
        const r = Math.max(1, 1.15 * Math.min(view.zoom, 1.3));
        for (let x = offX; x < width; x += step) {
          for (let y = offY; y < height; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (paper === 'grid') {
        ctx.strokeStyle = palette.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = offX; x < width; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = offY; y < height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (paper === 'ruled') {
        const lineStep = 32 * view.zoom;
        const startOffset = 20 * view.zoom;
        const lineOffY = (((view.y + startOffset) % lineStep) + lineStep) % lineStep;
        ctx.strokeStyle = palette.rule;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = lineOffY; y < height; y += lineStep) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Subtle stationery margin line
        const marginX = 44 * view.zoom + view.x;
        if (marginX > 0 && marginX < width) {
          ctx.strokeStyle = palette.isDark ? 'rgba(155, 196, 114, 0.14)' : 'rgba(185, 28, 28, 0.12)';
          ctx.beginPath();
          ctx.moveTo(marginX, 0);
          ctx.lineTo(marginX, height);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    static renderPaperBackground(bgCanvas, width, height, paper, paperTone) {
      if (!bgCanvas || !width || !height) return;
      const dpr = window.devicePixelRatio || 1;
      const pw = Math.max(1, Math.floor(width * dpr));
      const ph = Math.max(1, Math.floor(height * dpr));
      if (bgCanvas.width !== pw || bgCanvas.height !== ph) {
        bgCanvas.width = pw;
        bgCanvas.height = ph;
      }
      const ctx = bgCanvas.getContext('2d');
      const palette = resolvePaperPalette(paperTone);
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, width, height);
      NotebookCanvas._drawPaperPatternOnCtx(ctx, width, height, { x: 0, y: 0, zoom: 1 }, paper || 'dots', palette);
      ctx.restore();
    }

    static resolvePaperPalette(paperTone) {
      return resolvePaperPalette(paperTone);
    }

    _drawObject(ctx, obj, paperIsDark, hideText) {
      ctx.save();
      ctx.globalAlpha = obj.opacity !== undefined ? clamp(obj.opacity, 0.05, 1) : 1;
      if (obj.type === 'highlighter' && !paperIsDark) {
        ctx.globalCompositeOperation = 'multiply';
      }

      const stroke = resolveInkColor(obj.strokeColor, paperIsDark);
      const fill = obj.fillColor && obj.fillColor !== 'transparent' ? obj.fillColor : null;
      const sw = obj.strokeWidth || 2;

      if (obj.strokeStyle === 'dashed') ctx.setLineDash([sw * 3.5, sw * 2.5]);
      else if (obj.strokeStyle === 'dotted') ctx.setLineDash([sw * 1.1, sw * 2.2]);

      if (obj.type === 'freehand' || obj.type === 'highlighter') {
        const pts = obj.points || [];
        if (pts.length) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = sw;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
          }
          const last = pts[pts.length - 1];
          ctx.lineTo(last.x, last.y);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      if (LINE_TYPES.has(obj.type)) {
        ctx.strokeStyle = stroke;
        ctx.fillStyle = stroke;
        ctx.lineWidth = sw;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(obj.x1, obj.y1);
        ctx.lineTo(obj.x2, obj.y2);
        ctx.stroke();

        ctx.setLineDash([]);
        if (obj.type === 'arrow' || obj.type === 'doubleArrow') {
          this._drawArrowHead(ctx, obj.x1, obj.y1, obj.x2, obj.y2, sw);
        }
        if (obj.type === 'doubleArrow') {
          this._drawArrowHead(ctx, obj.x2, obj.y2, obj.x1, obj.y1, sw);
        }
        ctx.restore();
        return;
      }

      const x = obj.x || 0;
      const y = obj.y || 0;
      const w = obj.w || 100;
      const h = obj.h || 60;
      const cx = x + w / 2;
      const cy = y + h / 2;
      if (obj.rotation) {
        ctx.translate(cx, cy);
        ctx.rotate(obj.rotation);
        ctx.translate(-cx, -cy);
      }

      if (obj.type === 'image') {
        let img = this.imageCache.get(obj.src);
        if (!img) {
          img = new Image();
          img.onload = () => this.requestRender();
          img.src = obj.src;
          this.imageCache.set(obj.src, img);
        }
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, x, y, w, h);
        } else {
          ctx.fillStyle = 'rgba(150, 167, 141, 0.2)';
          ctx.fillRect(x, y, w, h);
        }
        ctx.restore();
        return;
      }

      if (obj.type === 'sticky') {
        ctx.shadowColor = 'rgba(0,0,0,0.14)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = fill || '#FEF3C7';
        traceRoundRect(ctx, x, y, w, h, 10);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(24, 32, 23, 0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (!hideText && obj.text) {
          this._drawTextInBox(ctx, obj.text, x + 12, y + 12, w - 24, h - 24, '#182017', obj.fontSize || 14, obj.fontFamily, 'left', 'top');
        }
        ctx.restore();
        return;
      }

      if (obj.type === 'text') {
        if (!hideText && obj.text) {
          this._drawTextInBox(ctx, obj.text, x + 4, y + 4, Math.max(40, w - 8), Math.max(24, h - 8), stroke, obj.fontSize || 16, obj.fontFamily, 'left', 'top');
        }
        ctx.restore();
        return;
      }

      // Geometric shapes
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.lineJoin = 'round';

      if (obj.type === 'rect') {
        ctx.beginPath();
        ctx.rect(x, y, w, h);
      } else if (obj.type === 'roundRect') {
        traceRoundRect(ctx, x, y, w, h, Math.min(16, w * 0.2, h * 0.2));
      } else if (obj.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
      } else if (obj.type === 'callout') {
        traceCallout(ctx, x, y, w, h);
      } else {
        const pts = buildPolygonVertices(obj.type, x, y, w, h);
        if (pts.length) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
        }
      }

      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.stroke();

      if (!hideText && obj.text) {
        const textH = obj.type === 'callout' ? h * 0.74 : h - 12;
        this._drawTextInBox(ctx, obj.text, x + 8, y + 6, Math.max(20, w - 16), Math.max(16, textH), stroke, obj.fontSize || 14, obj.fontFamily, 'center', 'middle');
      }

      ctx.restore();
    }

    _drawArrowHead(ctx, fromX, fromY, toX, toY, sw) {
      const headLen = Math.max(10, sw * 3.2);
      const ang = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLen * Math.cos(ang - Math.PI / 6), toY - headLen * Math.sin(ang - Math.PI / 6));
      ctx.lineTo(toX - headLen * Math.cos(ang + Math.PI / 6), toY - headLen * Math.sin(ang + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }

    _drawTextInBox(ctx, text, x, y, w, h, color, fontSize, fontFamily, align, valign) {
      ctx.save();
      const ff = fontFamily === 'serif' ? 'Newsreader, Georgia, serif' : 'Lexend, system-ui, sans-serif';
      ctx.font = `${fontSize}px ${ff}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';
      ctx.textAlign = align || 'left';

      const lineH = fontSize * 1.35;
      const lines = wrapLines(ctx, text, w);
      const totalH = lines.length * lineH;
      let startY = y;
      if (valign === 'middle') {
        startY = y + Math.max(0, (h - totalH) / 2);
      }
      const drawX = align === 'center' ? x + w / 2 : x;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], drawX, startY + i * lineH);
      }
      ctx.restore();
    }

    _drawSelectionBox(ctx, obj, zoom, showHandles) {
      ctx.save();
      const invZ = 1 / zoom;
      ctx.strokeStyle = obj.locked ? '#B45309' : '#3F621A';
      ctx.lineWidth = 1.5 * invZ;

      if (LINE_TYPES.has(obj.type)) {
        ctx.setLineDash([4 * invZ, 4 * invZ]);
        ctx.beginPath();
        ctx.moveTo(obj.x1, obj.y1);
        ctx.lineTo(obj.x2, obj.y2);
        ctx.stroke();
        if (showHandles && !obj.locked) {
          ctx.setLineDash([]);
          const r = 5 * invZ;
          [[obj.x1, obj.y1], [obj.x2, obj.y2]].forEach(([hx, hy]) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(hx, hy, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        }
        ctx.restore();
        return;
      }

      const b = getObjBounds(obj);
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      if (obj.rotation) {
        ctx.translate(cx, cy);
        ctx.rotate(obj.rotation);
        ctx.translate(-cx, -cy);
      }

      ctx.setLineDash([5 * invZ, 4 * invZ]);
      ctx.strokeRect(b.x, b.y, b.w, b.h);

      if (showHandles && !obj.locked) {
        ctx.setLineDash([]);
        const hs = 8 * invZ;
        const half = hs / 2;
        const pts = [
          [b.x, b.y], [cx, b.y], [b.x + b.w, b.y],
          [b.x + b.w, cy], [b.x + b.w, b.y + b.h],
          [cx, b.y + b.h], [b.x, b.y + b.h], [b.x, cy]
        ];
        ctx.fillStyle = '#FFFFFF';
        pts.forEach(([hx, hy]) => {
          ctx.fillRect(hx - half, hy - half, hs, hs);
          ctx.strokeRect(hx - half, hy - half, hs, hs);
        });

        // Rotation handle
        const rotY = b.y - 24 * invZ;
        ctx.beginPath();
        ctx.moveTo(cx, b.y);
        ctx.lineTo(cx, rotY);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, rotY, 5 * invZ, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ── Exporters ── */
    _getExportBox() {
      const objs = this.page.objects;
      if (!objs.length) {
        return { x: 0, y: 0, w: Math.max(600, this.cssWidth || 600), h: Math.max(400, this.cssHeight || 400) };
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      objs.forEach(o => {
        const b = getObjBounds(o);
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w);
        maxY = Math.max(maxY, b.y + b.h);
      });
      const pad = 36;
      return {
        x: minX - pad,
        y: minY - pad,
        w: Math.max(240, maxX - minX + pad * 2),
        h: Math.max(180, maxY - minY + pad * 2)
      };
    }

    exportPNG(filename) {
      const box = this._getExportBox();
      const scale = 2;
      const off = document.createElement('canvas');
      off.width = Math.round(box.w * scale);
      off.height = Math.round(box.h * scale);
      const octx = off.getContext('2d');
      this._renderScene(octx, box.w, box.h, scale, { x: -box.x, y: -box.y, zoom: 1 }, false);
      const url = off.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'fdil-cizim.png';
      a.click();
    }

    exportSVG(filename) {
      const box = this._getExportBox();
      const palette = resolvePaperPalette(this.page.paperTone);
      const parts = [];
      parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(box.w)}" height="${Math.round(box.h)}" viewBox="${Math.round(box.x)} ${Math.round(box.y)} ${Math.round(box.w)} ${Math.round(box.h)}">`);
      parts.push(`<rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" fill="${palette.bg}"/>`);

      this.page.objects.forEach(obj => {
        const opacity = obj.opacity !== undefined ? clamp(obj.opacity, 0.05, 1) : 1;
        const stroke = resolveInkColor(obj.strokeColor, palette.isDark);
        const fill = obj.fillColor && obj.fillColor !== 'transparent' ? obj.fillColor : 'none';
        const sw = obj.strokeWidth || 2;
        const dash = obj.strokeStyle === 'dashed' ? ` stroke-dasharray="${sw * 3.5} ${sw * 2.5}"` : obj.strokeStyle === 'dotted' ? ` stroke-dasharray="${sw} ${sw * 2}"` : '';

        if (obj.type === 'freehand' || obj.type === 'highlighter') {
          const pts = obj.points || [];
          if (!pts.length) return;
          let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
          for (let i = 1; i < pts.length; i++) {
            d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
          }
          parts.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"${dash}/>`);
        } else if (LINE_TYPES.has(obj.type)) {
          parts.push(`<line x1="${obj.x1}" y1="${obj.y1}" x2="${obj.x2}" y2="${obj.y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="${opacity}"${dash}/>`);
        } else if (obj.type === 'image') {
          parts.push(`<image href="${escXml(obj.src)}" x="${obj.x}" y="${obj.y}" width="${obj.w}" height="${obj.h}" opacity="${opacity}"/>`);
        } else {
          const b = getObjBounds(obj);
          const rot = obj.rotation ? ` transform="rotate(${(obj.rotation * 180 / Math.PI).toFixed(1)} ${b.x + b.w / 2} ${b.y + b.h / 2})"` : '';
          parts.push(`<g opacity="${opacity}"${rot}>`);
          if (obj.type === 'rect' || obj.type === 'roundRect' || obj.type === 'sticky') {
            const rx = obj.type === 'roundRect' ? 14 : obj.type === 'sticky' ? 10 : 0;
            const boxFill = obj.type === 'sticky' ? (obj.fillColor || '#FEF3C7') : fill;
            const boxStroke = obj.type === 'sticky' ? 'rgba(24,32,23,0.2)' : stroke;
            parts.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${rx}" fill="${boxFill}" stroke="${boxStroke}" stroke-width="${sw}"${dash}/>`);
          } else if (obj.type === 'ellipse') {
            parts.push(`<ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash}/>`);
          } else if (SHAPE_TYPES.has(obj.type)) {
            const pts = buildPolygonVertices(obj.type, b.x, b.y, b.w, b.h);
            if (pts.length) {
              const pStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              parts.push(`<polygon points="${pStr}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash}/>`);
            } else {
              parts.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash}/>`);
            }
          }
          if (obj.text) {
            const lines = String(obj.text).split('\n');
            const fs = obj.fontSize || 14;
            const textColor = obj.type === 'sticky' ? '#182017' : stroke;
            const tx = SHAPE_TYPES.has(obj.type) ? b.x + b.w / 2 : b.x + 10;
            const anchor = SHAPE_TYPES.has(obj.type) ? 'middle' : 'start';
            lines.forEach((ln, idx) => {
              const ty = b.y + 18 + idx * (fs * 1.35);
              parts.push(`<text x="${tx}" y="${ty}" fill="${textColor}" font-family="Lexend, sans-serif" font-size="${fs}" text-anchor="${anchor}">${escXml(ln)}</text>`);
            });
          }
          parts.push('</g>');
        }
      });

      parts.push('</svg>');
      const blob = new Blob([parts.join('\n')], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'fdil-cizim.svg';
      a.click();
      URL.revokeObjectURL(url);
    }

    /* ── Notifications ── */
    _notifyChange() {
      if (this.callbacks.onChange) this.callbacks.onChange(this.page);
    }
    _notifySelection() {
      if (this.callbacks.onSelectionChange) {
        const selected = this.page.objects.filter(o => this.selectedIds.has(o.id));
        this.callbacks.onSelectionChange(selected);
      }
    }
    _notifyHistory() {
      if (this.callbacks.onHistoryChange) {
        this.callbacks.onHistoryChange(this.canUndo(), this.canRedo());
      }
    }
    _notifyView() {
      if (this.callbacks.onViewChange) this.callbacks.onViewChange(this.view);
    }
    _notifyPageMeta() {
      if (this.callbacks.onPageMetaChange) this.callbacks.onPageMetaChange(this.page, this.gridSnap);
    }
  }

  global.NotebookCanvas = NotebookCanvas;
})(window);
