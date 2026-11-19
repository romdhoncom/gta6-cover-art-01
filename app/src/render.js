// The cover renderer: one function draws the whole cover — panels, photos,
// grade, sun, palms, dots and caption — onto any canvas at any size. The
// preview and the exported PNG are the same drawing at different sizes.

import { layoutById, panelBounds } from './layouts.js';
import { gradeById } from './grades.js';

/** Export sizes, in pixels. */
export const SIZES = {
  square: { id: 'square', name: 'Square', width: 1080, height: 1080, label: '1080 × 1080' },
  portrait: { id: 'portrait', name: 'Portrait', width: 1080, height: 1350, label: '1080 × 1350' },
  wide: { id: 'wide', name: 'Wide', width: 1920, height: 1080, label: '1920 × 1080' },
};

export const SIZE_LIST = [SIZES.square, SIZES.portrait, SIZES.wide];

/** Caption ink colours. */
export const INKS = {
  white: '#fff6e8',
  gold: '#ffc46b',
  pink: '#ff7ab8',
};

function tracePolygon(ctx, polygon, width, height) {
  ctx.beginPath();
  polygon.forEach(([x, y], i) => {
    if (i === 0) ctx.moveTo(x * width, y * height);
    else ctx.lineTo(x * width, y * height);
  });
  ctx.closePath();
}

function linearGradient(ctx, width, height, angleDeg, stops) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.hypot(width, height) / 2;
  const x0 = cx - Math.cos(angle) * radius;
  const y0 = cy - Math.sin(angle) * radius;
  const x1 = cx + Math.cos(angle) * radius;
  const y1 = cy + Math.sin(angle) * radius;
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
  return gradient;
}

/** Draw one panel's photo, cover-fit with its zoom and pan. */
function drawPanelPhoto(ctx, image, polygon, slot, width, height, filter) {
  const bounds = panelBounds(polygon);
  const bx = bounds.x * width;
  const by = bounds.y * height;
  const bw = bounds.width * width;
  const bh = bounds.height * height;
  ctx.save();
  tracePolygon(ctx, polygon, width, height);
  ctx.clip();
  if (image) {
    const scale = Math.max(bw / image.naturalWidth, bh / image.naturalHeight) * slot.zoom;
    const drawW = image.naturalWidth * scale;
    const drawH = image.naturalHeight * scale;
    const dx = bx + (bw - drawW) / 2 + slot.panX * bw;
    const dy = by + (bh - drawH) / 2 + slot.panY * bh;
    ctx.filter = filter;
    ctx.drawImage(image, dx, dy, drawW, drawH);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#3a1c5c';
    ctx.fillRect(bx, by, bw, bh);
  }
  ctx.restore();
}

/** A retro sun: a striped disc, tucked into the top corner of the first panel. */
function drawSun(ctx, layout, width, height) {
  const first = layout.panels[0];
  const bounds = panelBounds(first);
  const cx = (bounds.x + bounds.width * 0.8) * width;
  const cy = (bounds.y + bounds.height * 0.16) * height;
  const radius = Math.min(width, height) * 0.13;
  const gradient = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
  gradient.addColorStop(0, '#ffe9a8');
  gradient.addColorStop(0.55, '#ff7a3d');
  gradient.addColorStop(1, '#ff2e88');
  ctx.save();
  tracePolygon(ctx, first, width, height);
  ctx.clip();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(42, 16, 64, 0.9)';
  for (let i = 0; i < 4; i++) {
    const slitY = cy + radius * (0.05 + i * 0.22);
    const slitH = radius * (0.03 + i * 0.025);
    ctx.fillRect(cx - radius, slitY, radius * 2, slitH);
  }
  ctx.restore();
}

/** One palm silhouette, drawn from filled shapes — original line work, no artwork. */
function drawPalm(ctx, x, y, size, flip) {
  const dir = flip ? -1 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * size, size);
  ctx.fillStyle = 'rgba(22, 10, 36, 0.92)';
  // Trunk: a tapered curve leaning outwards.
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.quadraticCurveTo(-4, -55, 8, -105);
  ctx.lineTo(20, -100);
  ctx.quadraticCurveTo(10, -50, 7, 0);
  ctx.closePath();
  ctx.fill();
  // Fronds: filled leaves fanning and drooping from the crown.
  const crown = [14, -102];
  const fronds = [
    [[-34, -138], [-96, -112], [-38, -104]],
    [[-52, -152], [-104, -146], [-46, -118]],
    [[-16, -164], [-46, -182], [-8, -128]],
    [[22, -162], [30, -186], [34, -128]],
    [[58, -146], [104, -146], [52, -116]],
    [[76, -118], [122, -100], [58, -100]],
    [[78, -84], [112, -52], [52, -84]],
  ];
  for (const [bend, tip, back] of fronds) {
    ctx.beginPath();
    ctx.moveTo(crown[0], crown[1]);
    ctx.quadraticCurveTo(bend[0], bend[1], tip[0], tip[1]);
    ctx.quadraticCurveTo(back[0], back[1], crown[0], crown[1]);
    ctx.closePath();
    ctx.fill();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(10, -94, 5, 0, Math.PI * 2);
  ctx.arc(22, -92, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A halftone dot print over the whole cover. */
function drawDots(ctx, width, height) {
  const step = Math.max(12, Math.round(width / 78));
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#ffffff';
  for (let gy = step / 2; gy < height; gy += step) {
    for (let gx = step / 2; gx < width; gx += step) {
      const wave = 0.5 + 0.5 * Math.sin(gx * 0.021 + gy * 0.013);
      const radius = 0.8 + wave * 2.1;
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Fit a line of Anton to a width, shrinking it when it is too long. */
function fittedFont(ctx, text, baseSize, maxWidth) {
  let size = baseSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size *= 0.94;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/** The caption block: kicker, big title, subtitle, top or bottom. */
function drawCaption(ctx, caption, width, height) {
  const ink = INKS[caption.ink] || INKS.white;
  const dark = '#1c0b2e';
  const base = width * 0.115 * (caption.sizePct / 100);
  const bandH = height * 0.26;
  const bandY = caption.place === 'top' ? 0 : height - bandH;

  ctx.save();
  const band = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (caption.place === 'top') {
    band.addColorStop(0, 'rgba(12, 4, 22, 0.62)');
    band.addColorStop(1, 'rgba(12, 4, 22, 0)');
  } else {
    band.addColorStop(0, 'rgba(12, 4, 22, 0)');
    band.addColorStop(1, 'rgba(12, 4, 22, 0.62)');
  }
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, width, bandH);

  const cx = width / 2;
  const pad = width * 0.045;
  const maxText = width - pad * 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const title = (caption.title || 'UNTITLED').toUpperCase();
  const titleSize = fittedFont(ctx, title, base, maxText);
  const titleY = caption.place === 'top' ? bandY + titleSize * 1.55 : height - height * 0.055 - base * 0.42;
  const subSize = Math.max(16, width * 0.024);
  const kickSize = Math.max(14, width * 0.02);

  ctx.save();
  ctx.translate(cx, titleY);
  ctx.rotate((-1.4 * Math.PI) / 180);
  ctx.translate(-cx, -titleY);
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(4, titleSize * 0.11);
  ctx.strokeText(title, cx, titleY);
  ctx.shadowColor = 'rgba(12, 4, 22, 0.55)';
  ctx.shadowBlur = titleSize * 0.12;
  ctx.shadowOffsetY = titleSize * 0.05;
  ctx.fillStyle = ink;
  ctx.fillText(title, cx, titleY);
  ctx.restore();

  ctx.font = `${subSize}px Anton, sans-serif`;
  try {
    ctx.letterSpacing = `${Math.round(subSize * 0.22)}px`;
  } catch {
    /* letterSpacing is Chrome-only; the caption still draws without it. */
  }
  ctx.fillStyle = '#ffe9a8';
  const subY = caption.place === 'top' ? titleY + subSize * 1.9 : titleY + subSize * 1.9;
  if (caption.sub) ctx.fillText(caption.sub.toUpperCase(), cx, subY);
  try {
    ctx.letterSpacing = '0px';
  } catch {
    /* ignore */
  }

  ctx.font = `${kickSize}px Anton, sans-serif`;
  try {
    ctx.letterSpacing = `${Math.round(kickSize * 0.42)}px`;
  } catch {
    /* ignore */
  }
  ctx.fillStyle = 'rgba(255, 246, 232, 0.9)';
  const kickY = caption.place === 'top' ? titleY - titleSize * 0.95 : titleY - titleSize * 1.05;
  if (caption.kicker) ctx.fillText(caption.kicker.toUpperCase(), cx, kickY);
  try {
    ctx.letterSpacing = '0px';
  } catch {
    /* ignore */
  }
  ctx.restore();
}

/**
 * Draw the whole cover.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state — { layoutId, gradeId, shelf, caption, effects }
 * @param {number} width
 * @param {number} height
 * @param {{ highlightPanel?: number }} [options]
 */
export function drawCover(ctx, state, width, height, options = {}) {
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1d0e2b';
  ctx.fillRect(0, 0, width, height);

  layout.panels.forEach((polygon, i) => {
    const slot = state.shelf.panels[i] || { photoId: null, zoom: 1, panX: 0, panY: 0 };
    const photo = slot.photoId === null ? null : state.shelf.photos.find((p) => p.id === slot.photoId) || null;
    drawPanelPhoto(ctx, photo ? photo.image : null, polygon, slot, width, height, grade.filter);
  });

  if (state.effects.sun) drawSun(ctx, layout, width, height);

  // Grade washes over the photos.
  for (const wash of grade.washes) {
    ctx.save();
    ctx.globalCompositeOperation = wash.blend;
    ctx.globalAlpha = wash.alpha;
    if (wash.kind === 'radial') {
      const radial = ctx.createRadialGradient(
        width * 0.75, height * 0.18, 0,
        width * 0.75, height * 0.18, width * 0.65,
      );
      for (const [offset, colour] of wash.stops) radial.addColorStop(offset, colour);
      ctx.fillStyle = radial;
    } else {
      ctx.fillStyle = linearGradient(ctx, width, height, wash.angle, wash.stops);
    }
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Panel seams: a cream line around every panel.
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 244, 220, 0.92)';
  ctx.lineWidth = Math.max(2, width * 0.005);
  ctx.lineJoin = 'round';
  for (const polygon of layout.panels) {
    tracePolygon(ctx, polygon, width, height);
    ctx.stroke();
  }
  ctx.restore();

  if (state.effects.palms) {
    const palmSize = width * 0.0011;
    drawPalm(ctx, width * 0.015, height * 0.995, palmSize, false);
    drawPalm(ctx, width * 0.985, height * 0.995, palmSize * 0.85, true);
  }
  if (state.effects.dots) drawDots(ctx, width, height);

  drawCaption(ctx, state.caption, width, height);

  // Vignette.
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.hypot(width, height) * 0.62,
  );
  vignette.addColorStop(0, 'rgba(10, 4, 20, 0)');
  vignette.addColorStop(1, `rgba(10, 4, 20, ${grade.vignette})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  // Thin frame.
  ctx.strokeStyle = 'rgba(255, 244, 220, 0.55)';
  ctx.lineWidth = Math.max(2, width * 0.003);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, width - ctx.lineWidth, height - ctx.lineWidth);

  // Selected-panel highlight, preview only.
  if (typeof options.highlightPanel === 'number') {
    const polygon = layout.panels[options.highlightPanel];
    if (polygon) {
      ctx.save();
      ctx.strokeStyle = '#ffc46b';
      ctx.lineWidth = Math.max(3, width * 0.008);
      ctx.setLineDash([width * 0.02, width * 0.012]);
      tracePolygon(ctx, polygon, width, height);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}
