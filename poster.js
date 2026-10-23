// Canvas renderer for the Shadmot Mehola weekly Shabbat-times poster.
// The preview canvas IS the exported bitmap: what he sees is what downloads.
// data: { greeting, parasha, footer, rows: [{center, centerNote, side, sideNote} x5], weekday: [{value, note} x6] }

export const BG_OPTIONS = [
  { key: 'sunset', label: 'שקיעה' },
  { key: 'dawn', label: 'שחר' },
  { key: 'night', label: 'לילה' },
  { key: 'arch', label: 'קשת' },
];

export const ROW_META = [
  { label: 'הדלקת נרות', color: '#d97706' },
  { label: 'מנחה וקבלת שבת', color: '#1d4ed8' },
  { label: 'שחרית שבת', color: '#0f766e' },
  { label: 'מנחה שבת', color: '#7c3aed' },
  { label: 'ערבית וצאת שבת', color: '#12294d' },
];
export const WEEK_LABELS = ['שחרית', "ימי ב', ה'", 'שאר הימים', "ימים ג', ו'", 'מנחה', 'ערבית'];

export const DEFAULT_DATA = {
  greeting: '✦ שבת שלום ✦',
  parasha: 'פרשת לך לך התשפ״ז',
  footer: 'שבת שלום ומבורך',
  rows: [
    { center: '17:26', centerNote: '', side: '—', sideNote: '' },
    { center: '17:41', centerNote: '', side: '17:30', sideNote: '' },
    { center: '06:30, 08:00, 08:40', centerNote: '(בסניף)', side: '07:30', sideNote: '' },
    { center: '13:15, 17:15', centerNote: '', side: '17:00', sideNote: '' },
    { center: '18:33', centerNote: '', side: '18:25', sideNote: '(מזמורים)' },
  ],
  weekday: [
    { value: '06:00', note: '' },
    { value: '06:45', note: '' },
    { value: '06:55', note: '' },
    { value: '07:30, 08:15', note: '' },
    { value: '16:40', note: '' },
    { value: '17:20, 22:00', note: '(בקראוונים)' },
  ],
};

export const POSTER_W = 941;
export const POSTER_H = 1672;
const TITLE = 'זמני תפילות שדמות מחולה';

const LAYOUTS = {
  sunset: { skyTop: 26, titleSize: 66, twoLineTitle: false, badge: true, tableTop: 700, weekTop: 1158, footerLogo: false },
  dawn:   { skyTop: 26, titleSize: 66, twoLineTitle: false, badge: true, tableTop: 700, weekTop: 1158, footerLogo: false },
  night:  { skyTop: 26, titleSize: 66, twoLineTitle: false, badge: true, tableTop: 742, weekTop: 1200, footerLogo: false },
  arch:   { skyTop: 64, titleSize: 50, twoLineTitle: true, badge: false, tableTop: 742, weekTop: 1200, footerLogo: true },
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, cx, cy, maxW, lineH) {
  if (ctx.measureText(text).width <= maxW) { ctx.fillText(text, cx, cy); return; }
  const words = text.split(' ');
  if (words.length < 2) { ctx.fillText(text, cx, cy); return; }
  const mid = Math.ceil(words.length / 2);
  ctx.fillText(words.slice(0, mid).join(' '), cx, cy - lineH / 2 + 2);
  ctx.fillText(words.slice(mid).join(' '), cx, cy + lineH / 2 + 2);
}

// images: { bg: {sunset,dawn,night,arch: HTMLImageElement}, logo: HTMLImageElement }
export function drawPoster(canvas, data, bgKey, images, scale) {
  scale = scale || 2;
  const L = LAYOUTS[bgKey] || LAYOUTS.sunset;
  canvas.width = POSTER_W * scale;
  canvas.height = POSTER_H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.direction = 'rtl';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  ctx.drawImage(images.bg[bgKey], 0, 0, POSTER_W, POSTER_H);
  const cx = POSTER_W / 2;

  // ---- sky header ----
  let y = L.skyTop;
  ctx.letterSpacing = '2px';
  ctx.font = "600 25px Heebo, sans-serif";
  ctx.fillStyle = '#ffd98a';
  ctx.shadowColor = 'rgba(0,20,60,.6)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 1;
  ctx.fillText(data.greeting, cx, y + 13);
  ctx.letterSpacing = '0px';
  ctx.font = '900 ' + L.titleSize + 'px FrankRuhl, serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,20,60,.75)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 2;
  if (L.twoLineTitle) {
    ctx.fillText('זמני תפילות', cx, y + 13 + 34);
    ctx.fillText('שדמות מחולה', cx, y + 13 + 34 + L.titleSize * 1.14);
    y += 13 + 34 + L.titleSize * 1.14 + L.titleSize * 0.62;
  } else {
    ctx.fillText(TITLE, cx, y + 13 + 30 + L.titleSize * 0.62);
    y += 13 + 30 + L.titleSize * 1.24;
  }
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // parasha pill
  ctx.font = "600 24px Heebo, sans-serif";
  const pw = ctx.measureText(data.parasha).width + 52;
  const ph = 40, py = y + 14;
  rr(ctx, cx - pw / 2, py, pw, ph, ph / 2);
  ctx.fillStyle = 'rgba(0,30,70,.28)'; ctx.fill();
  ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#ffe9bd';
  ctx.fillText(data.parasha, cx, py + ph / 2 + 1);

  // ---- logo badge ----
  if (L.badge) {
    const lh = 64, lw = lh * 332 / 122;
    const bw = lw + 44, bh = lh + 18, bx = cx - bw / 2, by = 596;
    ctx.save();
    ctx.shadowColor = 'rgba(20,40,80,.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
    rr(ctx, bx, by, bw, bh, 16);
    ctx.fillStyle = '#fffdf6'; ctx.fill();
    ctx.restore();
    ctx.drawImage(images.logo, cx - lw / 2, by + 9, lw, lh);
  }

  // ---- table ----
  const TX = 42, TW = 857, CHIP = 228, SIDEW = 200;
  let ty = L.tableTop;
  ctx.font = "700 19px Heebo, sans-serif"; ctx.fillStyle = '#7a6430';
  ctx.fillText('אירוע / תפילה', TX + TW - CHIP / 2, ty + 12);
  ctx.fillText('בית הכנסת המרכזי', TX + SIDEW + (TW - SIDEW - CHIP) / 2, ty + 12);
  ctx.fillText('מניין ספרדי', TX + SIDEW / 2, ty + 12);
  ty += 30;
  const ROW_H = 78, ROW_GAP = 8;
  data.rows.forEach(function (r, i) {
    const meta = ROW_META[i] || ROW_META[0];
    ctx.save();
    ctx.shadowColor = 'rgba(20,40,80,.13)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
    rr(ctx, TX, ty, TW, ROW_H, 16);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();
    ctx.save();
    rr(ctx, TX, ty, TW, ROW_H, 16); ctx.clip();
    ctx.fillStyle = meta.color;
    ctx.fillRect(TX + TW - CHIP, ty, CHIP, ROW_H);
    ctx.restore();
    ctx.fillStyle = '#ffffff'; ctx.font = "800 24px Heebo, sans-serif";
    wrapText(ctx, meta.label, TX + TW - CHIP / 2, ty + ROW_H / 2, CHIP - 16, 26);
    const cy = ty + ROW_H / 2;
    const ccx = TX + SIDEW + (TW - SIDEW - CHIP) / 2;
    ctx.fillStyle = '#1b2a4a'; ctx.font = "700 29px Heebo, sans-serif";
    if (r.centerNote) {
      ctx.fillText(r.center, ccx, cy - 11);
      ctx.fillStyle = '#8a6d1f'; ctx.font = "600 17px Heebo, sans-serif";
      ctx.fillText(r.centerNote, ccx, cy + 16);
    } else ctx.fillText(r.center, ccx, cy);
    const scx = TX + SIDEW / 2;
    ctx.fillStyle = '#33415e'; ctx.font = "600 27px Heebo, sans-serif";
    if (r.sideNote) {
      ctx.fillText(r.side, scx, cy - 11);
      ctx.fillStyle = '#8a6d1f'; ctx.font = "600 16px Heebo, sans-serif";
      ctx.fillText(r.sideNote, scx, cy + 16);
    } else ctx.fillText(r.side, scx, cy);
    ctx.save();
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#e6dcc2'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(TX + SIDEW, ty + 10); ctx.lineTo(TX + SIDEW, ty + ROW_H - 10); ctx.stroke();
    ctx.restore();
    ty += ROW_H + ROW_GAP;
  });

  // ---- weekday panel ----
  const WX = 42, WW = 857, wy = L.weekTop;
  const panelH = 16 + 27 + 9 + data.weekday.length * 42 + (data.weekday.length - 1) * 6 + 14;
  ctx.save();
  ctx.shadowColor = 'rgba(10,30,70,.28)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  rr(ctx, WX, wy, WW, panelH, 22);
  const g = ctx.createLinearGradient(WX + WW, wy, WX, wy + panelH);
  g.addColorStop(0, '#0e2f63'); g.addColorStop(0.6, '#0a2350'); g.addColorStop(1, '#081d42');
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffd98a'; ctx.font = "800 27px FrankRuhl, serif";
  ctx.fillText('זמני תפילות בימי חול', cx, wy + 16 + 16);
  let ry = wy + 16 + 27 + 9;
  data.weekday.forEach(function (w, i) {
    rr(ctx, WX + 22, ry, WW - 44, 42, 12);
    ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,217,138,.14)'; ctx.lineWidth = 1; ctx.stroke();
    const label = (WEEK_LABELS[i] || '') + ':';
    ctx.font = "700 21px Heebo, sans-serif";
    const wl = ctx.measureText(label).width;
    ctx.font = "600 22px Heebo, sans-serif";
    const wv = ctx.measureText(w.value).width;
    const gap = 10;
    let wn = 0;
    if (w.note) { ctx.font = "500 17px Heebo, sans-serif"; wn = ctx.measureText(w.note).width; }
    const total = wl + gap + wv + (w.note ? gap + wn : 0);
    let xr = cx + total / 2;
    ctx.textAlign = 'right';
    ctx.font = "700 21px Heebo, sans-serif"; ctx.fillStyle = '#ffd98a';
    ctx.fillText(label, xr, ry + 22); xr -= wl + gap;
    ctx.font = "600 22px Heebo, sans-serif"; ctx.fillStyle = '#ffffff';
    ctx.fillText(w.value, xr, ry + 22); xr -= wv + gap;
    if (w.note) {
      ctx.font = "500 17px Heebo, sans-serif"; ctx.fillStyle = '#c8b98a';
      ctx.fillText(w.note, xr, ry + 22);
    }
    ctx.textAlign = 'center';
    ry += 42 + 6;
  });

  // ---- footer ----
  ctx.font = "900 46px FrankRuhl, serif"; ctx.fillStyle = '#a97e12';
  const fy = POSTER_H - 16 - 24;
  if (L.footerLogo) {
    const lh = 34, lw = lh * 332 / 122, gap2 = 16;
    const tw = ctx.measureText(data.footer).width;
    const total = lw + gap2 + tw;
    ctx.drawImage(images.logo, cx - total / 2, fy - lh / 2, lw, lh);
    ctx.textAlign = 'left'; ctx.direction = 'ltr';
    ctx.fillText(data.footer, cx - total / 2 + lw + gap2, fy);
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
  } else {
    ctx.fillText(data.footer, cx, fy);
  }
}
