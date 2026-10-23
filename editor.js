// Vanilla-JS port of the Files React editor - same state keys, same renderer.
import { BG_OPTIONS, DEFAULT_DATA, ROW_META, WEEK_LABELS, drawPoster } from './poster.js';
import { BG_SUNSET, BG_DAWN, BG_NIGHT, BG_ARCH, LOGO, FONT_HEEBO, FONT_FRANK } from './assets.js';

const ROW_LABELS = ['הדלקת נרות', 'מנחה וקבלת שבת', 'שחרית שבת', 'מנחה שבת', 'ערבית וצאת שבת'];
const BG_SRC = { sunset: BG_SUNSET, dawn: BG_DAWN, night: BG_NIGHT, arch: BG_ARCH };
const DATA_KEY = 'shabbat-poster-data.v1';
const BG_KEY = 'shabbat-poster-bg.v1';

function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) {}
  return fallback;
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

const data = loadJSON(DATA_KEY, structuredClone(DEFAULT_DATA));
let bg = loadJSON(BG_KEY, 'sunset');
let assets = null;
let canvas = null;
let savedEl = null;
let savedTimer = null;

function markSaved() {
  if (!savedEl) return;
  savedEl.textContent = '✓ נשמר במכשיר';
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { savedEl.textContent = ''; }, 2500);
}
function redraw() {
  if (assets && canvas) drawPoster(canvas, data, bg, assets, 2);
}
function onDataChange() { save(DATA_KEY, data); redraw(); markSaved(); }
function onBgChange() { save(BG_KEY, bg); redraw(); markSaved(); syncBgButtons(); }

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function field(labelText, value, onInput) {
  const label = el('label', 'ed-f');
  label.appendChild(el('span', null, labelText));
  const input = document.createElement('input');
  input.dir = 'rtl';
  input.value = value;
  input.addEventListener('input', () => onInput(input.value));
  label.appendChild(input);
  return label;
}

const bgButtons = {};
function syncBgButtons() {
  for (const [key, btn] of Object.entries(bgButtons)) {
    btn.classList.toggle('is-on', key === bg);
    btn.setAttribute('aria-pressed', key === bg ? 'true' : 'false');
  }
}

function build(root) {
  const ed = el('div', 'ed');

  ed.appendChild(el('div', 'ed-label', 'רקע'));
  const bgs = el('div', 'ed-bgs');
  bgs.setAttribute('role', 'group');
  bgs.setAttribute('aria-label', 'בחירת רקע');
  for (const o of BG_OPTIONS) {
    const b = el('button', 'ed-bg');
    b.type = 'button';
    const img = document.createElement('img');
    img.src = BG_SRC[o.key]; img.alt = o.label;
    b.appendChild(img);
    b.appendChild(el('span', null, o.label));
    b.addEventListener('click', () => { if (bg !== o.key) { bg = o.key; onBgChange(); } });
    bgButtons[o.key] = b;
    bgs.appendChild(b);
  }
  ed.appendChild(bgs);
  syncBgButtons();

  const preview = el('div', 'ed-preview');
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'תצוגה מקדימה של הכרזה');
  preview.appendChild(canvas);
  ed.appendChild(preview);

  const dl = el('button', 'ed-dl', '⬇ הורדת PNG מוכן לשיתוף');
  dl.type = 'button';
  dl.addEventListener('click', () => {
    dl.disabled = true; dl.textContent = 'מייצר...';
    canvas.toBlob(blob => {
      dl.disabled = false; dl.textContent = '⬇ הורדת PNG מוכן לשיתוף';
      if (!blob) return;
      const a = document.createElement('a');
      a.download = 'shabbat-times-shadmot.png';
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, 'image/png');
  });
  ed.appendChild(dl);

  ed.appendChild(el('div', 'ed-label', 'השבוע'));
  ed.appendChild(field('פרשת השבוע', data.parasha, v => { data.parasha = v; onDataChange(); }));
  ed.appendChild(field('ברכת פתיחה', data.greeting, v => { data.greeting = v; onDataChange(); }));
  ed.appendChild(field('ברכת סיום', data.footer, v => { data.footer = v; onDataChange(); }));

  ed.appendChild(el('div', 'ed-label', 'זמני שבת'));
  data.rows.forEach((r, i) => {
    const fs = el('fieldset', 'ed-row');
    fs.appendChild(el('legend', null, ROW_LABELS[i]));
    const grid = el('div', 'ed-grid');
    grid.appendChild(field('בית הכנסת המרכזי', r.center, v => { r.center = v; onDataChange(); }));
    grid.appendChild(field('הערה (מרכזי)', r.centerNote, v => { r.centerNote = v; onDataChange(); }));
    grid.appendChild(field('מניין ספרדי', r.side, v => { r.side = v; onDataChange(); }));
    grid.appendChild(field('הערה (ספרדי)', r.sideNote, v => { r.sideNote = v; onDataChange(); }));
    fs.appendChild(grid);
    ed.appendChild(fs);
  });

  ed.appendChild(el('div', 'ed-label', 'ימי חול'));
  data.weekday.forEach((w, i) => {
    const fs = el('fieldset', 'ed-row');
    fs.appendChild(el('legend', null, WEEK_LABELS[i]));
    const grid = el('div', 'ed-grid');
    grid.appendChild(field('זמן', w.value, v => { w.value = v; onDataChange(); }));
    grid.appendChild(field('הערה', w.note, v => { w.note = v; onDataChange(); }));
    fs.appendChild(grid);
    ed.appendChild(fs);
  });

  const reset = el('button', 'ed-reset', 'איפוס לברירת המחדל של השבוע');
  reset.type = 'button';
  reset.addEventListener('click', () => {
    Object.assign(data, structuredClone(DEFAULT_DATA));
    bg = 'sunset';
    save(DATA_KEY, data); onBgChange();
    root.querySelectorAll('input').forEach(inp => inp.dispatchEvent(new Event('refresh')));
    rebuildFields(root);
    redraw(); markSaved();
  });
  ed.appendChild(reset);

  savedEl = el('p', 'ed-saved', '');
  savedEl.setAttribute('role', 'status');
  ed.appendChild(savedEl);

  root.replaceChildren(ed);
}

function rebuildFields(root) {
  // Rebuild the editor so inputs reflect reset values.
  build(root);
}

async function boot() {
  const root = document.getElementById('editor');
  build(root);
  try {
    await Promise.all([
      new FontFace('Heebo', `url(${FONT_HEEBO})`, { weight: '100 900' }).load().then(f => document.fonts.add(f)),
      new FontFace('FrankRuhl', `url(${FONT_FRANK})`, { weight: '100 900' }).load().then(f => document.fonts.add(f)),
    ]);
    const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const [sunset, dawn, night, arch, logo] = await Promise.all(
      [BG_SUNSET, BG_DAWN, BG_NIGHT, BG_ARCH, LOGO].map(loadImage));
    assets = { bg: { sunset, dawn, night, arch }, logo };
    redraw();
  } catch (e) {
    root.prepend(el('p', 'ed-saved', 'שגיאה בטעינת גופנים או רקעים - נסו לרענן.'));
  }
}

boot();
