// Ember Duel — semua gambar di canvas: meja, kartu, ikon elemen, layar.
// Elemen dibedakan warna DAN bentuk (bukan teks saja): api, daun, tetes.

import { ELEMENTS } from './cards.js';

export const W = 1280;
export const H = 720;
export const CARD_W = 132;
export const CARD_H = 188;

/** Sudut membulat. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Ikon elemen: api (Ember), daun (Leaf), tetes air (Tide). */
export function drawElementGlyph(ctx, glyph, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineJoin = 'round';
  if (glyph === 'flame') {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.bezierCurveTo(size * 0.42, -size * 0.1, size * 0.5, size * 0.28, size * 0.28, size * 0.5);
    ctx.bezierCurveTo(size * 0.1, size * 0.62, -size * 0.18, size * 0.62, -size * 0.3, size * 0.42);
    ctx.bezierCurveTo(-size * 0.5, size * 0.18, -size * 0.34, -size * 0.28, 0, -size * 0.55);
    ctx.fill();
  } else if (glyph === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.bezierCurveTo(size * 0.55, -size * 0.25, size * 0.5, size * 0.4, 0, size * 0.55);
    ctx.bezierCurveTo(-size * 0.5, size * 0.4, -size * 0.55, -size * 0.25, 0, -size * 0.55);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.42);
    ctx.lineTo(0, size * 0.45);
    ctx.stroke();
  } else {
    // drop
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.55);
    ctx.bezierCurveTo(size * 0.42, -size * 0.05, size * 0.5, size * 0.2, size * 0.34, size * 0.42);
    ctx.bezierCurveTo(size * 0.2, size * 0.58, -size * 0.2, size * 0.58, -size * 0.34, size * 0.42);
    ctx.bezierCurveTo(-size * 0.5, size * 0.2, -size * 0.42, -size * 0.05, 0, -size * 0.55);
    ctx.fill();
  }
  ctx.restore();
}

/** Kartu menghadap ke atas: nilai besar, ikon elemen, nama, elemen. */
export function drawCardFace(ctx, card, x, y, w, h) {
  const el = ELEMENTS[card.element];
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = '#fdf6e3';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = el.color;
  ctx.stroke();

  // Pita elemen di atas.
  roundRect(ctx, x + 6, y + 6, w - 12, 34, 8);
  ctx.fillStyle = el.color;
  ctx.fill();
  drawElementGlyph(ctx, el.glyph, x + 24, y + 23, 20, '#ffffff');
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(el.name.toUpperCase(), x + 40, y + 24);

  // Nilai attack besar di tengah.
  ctx.fillStyle = '#22201c';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(card.attack), x + w / 2, y + h / 2 - 10);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#6b6455';
  ctx.fillText('ATTACK', x + w / 2, y + h / 2 + 28);

  // Ikon elemen di bawah label.
  drawElementGlyph(ctx, el.glyph, x + w / 2, y + h - 38, 24, el.color);

  // Nama kartu.
  ctx.fillStyle = '#22201c';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(card.name, x + w / 2, y + h - 12);
  ctx.restore();
}

/** Kartu tertutup (tangan lawan): punggung berpola. */
export function drawCardBack(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = '#3d2b63';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#f2b705';
  ctx.stroke();
  roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 8);
  ctx.strokeStyle = 'rgba(242,183,5,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawElementGlyph(ctx, 'flame', x + w / 2, y + h / 2, 52, '#f2b705');
  ctx.restore();
}

/** Bilah nyawa + angka besar. flip=true: angka di kiri bilah (untuk sisi kanan). */
export function drawLifeBar(ctx, x, y, w, label, life, maxLife, color, flip = false) {
  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  if (flip) {
    ctx.textAlign = 'right';
    ctx.fillText(label, x + w, y - 16);
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`${life}`, x - 14, y + 10);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(label, x, y - 16);
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`${life}`, x + w + 14, y + 10);
  }
  roundRect(ctx, x, y, w, 20, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();
  const frac = Math.max(0, life / maxLife);
  if (frac > 0) {
    roundRect(ctx, x, y, Math.max(20, w * frac), 20, 10);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

/** Tombol persegi membulat; kembalikan true kalau titik (mx,my) di dalamnya. */
export function drawButton(ctx, x, y, w, h, label, sub, hover) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = hover ? 14 : 8;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = hover ? '#f2b705' : '#e8a90c';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7a5b00';
  ctx.stroke();
  ctx.fillStyle = '#2b1f00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(label, x + w / 2, sub ? y + h / 2 - 10 : y + h / 2 + 1);
  if (sub) {
    ctx.font = '15px sans-serif';
    ctx.fillText(sub, x + w / 2, y + h / 2 + 18);
  }
  ctx.restore();
  return { x, y, w, h };
}

/** Meja hijau felt dengan vignette. */
export function drawTable(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 760);
  g.addColorStop(0, '#2e7d4f');
  g.addColorStop(0.7, '#1f5c38');
  g.addColorStop(1, '#123a22');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(242,183,5,0.35)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 560, 290, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2, 520, 258, 0, 0, Math.PI * 2);
  ctx.stroke();
}
