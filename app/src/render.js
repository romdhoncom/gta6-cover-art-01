// Cover rendering for Sunset Cover Studio: colour grades, the seven
// layouts, the retro sun, palm silhouettes, halftone dots, grain and the
// three caption styles. Everything is drawn with canvas shapes; there are
// no image assets. drawCover(ctx, W, H, state) paints one finished cover
// at any size, so the preview and the PNG exports use the same drawing.

// Six colour grades. Each one sets the sky, the sun, the caption band, the
// accent, the halftone dots and the caption ink together.
const GRADES = {
  sunset: { name: 'Sunset', skyTop: '#3b1d5e', skyBottom: '#ff9a3c', sun: '#ffd23e', band: '#1b1035', accent: '#ff4d6d', dot: '#ffd23e', ink: '#fff3f0', photoFilter: '' },
  neon: { name: 'Neon Nights', skyTop: '#12002e', skyBottom: '#3d0a5e', sun: '#ff2ea6', band: '#0a0a18', accent: '#00e5ff', dot: '#00e5ff', ink: '#f0faff', photoFilter: '' },
  golden: { name: 'Golden Hour', skyTop: '#8a5a1d', skyBottom: '#f7e08b', sun: '#fff3b0', band: '#3a2408', accent: '#d97b29', dot: '#fff3b0', ink: '#fff8e6', photoFilter: '' },
  noir: { name: 'Noir', skyTop: '#e8e8e8', skyBottom: '#8a8a8a', sun: '#ffffff', band: '#111111', accent: '#d21f2b', dot: '#ffffff', ink: '#f5f5f5', photoFilter: 'grayscale(1)' },
  vice: { name: 'Vice Nights', skyTop: '#2b0a4a', skyBottom: '#0d3b4d', sun: '#b967ff', band: '#12041f', accent: '#00d1c1', dot: '#b967ff', ink: '#f2ecff', photoFilter: '' },
  desert: { name: 'Desert Heat', skyTop: '#7a2e1d', skyBottom: '#f2c078', sun: '#ffe9a8', band: '#4a2410', accent: '#b4552d', dot: '#ffe9a8', ink: '#fff3e0', photoFilter: '' },
};

const LAYOUTS = {
  classic: 'Classic split',
  fullbleed: 'Full bleed',
  trio: 'Trio',
  diagonal: 'Duo diagonal',
  poster: 'Poster',
  strip: 'Strip',
  sunframe: 'Sunset frame',
};

const CAPTION_FONTS = {
  display: { family: 'CoverDisplay', weight: 700 },
  clean: { family: 'CoverClean', weight: 400 },
  serif: { family: 'CoverSerif', weight: 700 },
};

// A retro sun: a filled circle with horizontal cut lines across its lower
// half, so it reads as a setting sun. cutColor is painted over the circle.
function drawRetroSun(ctx, cx, cy, r, color, cutColor) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cutColor;
  const cuts = 4;
  for (let i = 0; i < cuts; i++) {
    const y = cy + (i * r) / cuts;
    const half = Math.sqrt(Math.max(0, r * r - (y - cy) * (y - cy)));
    ctx.fillRect(cx - half, y, half * 2, r * 0.055 * (i + 1));
  }
  ctx.restore();
}

// Halftone dots along the bottom of the cover, growing toward the edge.
function drawHalftone(ctx, W, H, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  const rows = 5;
  for (let row = 0; row < rows; row++) {
    const y = H * (0.9 + row * 0.02);
    const r = (W / 1080) * (1.2 + row * 1.1);
    const step = (W / 1080) * (16 + row * 3);
    for (let x = step / 2; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// A subtle grain overlay, from a fixed-seed generator so the same cover
// always draws the same grain.
function drawGrain(ctx, W, H) {
  ctx.save();
  let seed = 1234567;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 900; i++) {
    const v = next();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(next() * W, next() * H, 2, 2);
  }
  ctx.restore();
}

// Split text into lines that fit maxW at the current font.
function wrapLines(ctx, text, maxW) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let line = words[0];
  for (const word of words.slice(1)) {
    const test = line + ' ' + word;
    if (ctx.measureText(test).width <= maxW) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines;
}

// Draw one caption (main text plus an optional smaller sub line) centred at
// (cx, cy), in one of the three styles. Returns nothing.
function drawCaption(ctx, text, sub, cx, cy, maxW, px, style, font, grade) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const family = CAPTION_FONTS[font].family;
  const weight = CAPTION_FONTS[font].weight;
  let size = px;
  ctx.font = `${weight} ${size}px ${family}`;
  let lines = wrapLines(ctx, text, maxW);
  while (lines.length > 2 && size > px * 0.6) {
    size *= 0.9;
    ctx.font = `${weight} ${size}px ${family}`;
    lines = wrapLines(ctx, text, maxW);
  }
  const lineH = size * 1.12;
  const subPx = Math.max(14, size * 0.34);
  const totalH = lines.length * lineH + (sub ? subPx * 1.6 : 0);
  let y = cy - totalH / 2 + lineH / 2;
  for (const line of lines) {
    drawCaptionLine(ctx, line, cx, y, size, style, font, grade);
    y += lineH;
  }
  if (sub) {
    // The sub-caption must fit the same width as the caption: drop the
    // letter spacing and shrink it until it fits.
    let subSize = subPx;
    let spacing = 3;
    ctx.font = `400 ${subSize}px CoverClean`;
    try { ctx.letterSpacing = `${spacing}px`; } catch (e) { /* older canvas: no letter spacing */ }
    while (ctx.measureText(sub.toUpperCase()).width > maxW && subSize > 10) {
      if (spacing > 0) {
        spacing = 0;
        try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
      } else {
        subSize *= 0.9;
        ctx.font = `400 ${subSize}px CoverClean`;
      }
    }
    ctx.fillStyle = grade.accent;
    ctx.fillText(sub.toUpperCase(), cx, y + subSize * 0.4);
    try { ctx.letterSpacing = '0px'; } catch (e) { /* ignore */ }
  }
  ctx.restore();
}

function drawCaptionLine(ctx, line, x, y, size, style, font, grade) {
  const family = CAPTION_FONTS[font].family;
  const weight = CAPTION_FONTS[font].weight;
  ctx.font = `${weight} ${size}px ${family}`;
  if (style === 'outline') {
    ctx.lineWidth = Math.max(2, size * 0.14);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#14081f';
    ctx.strokeText(line, x, y);
    ctx.fillStyle = grade.ink;
    ctx.fillText(line, x, y);
  } else if (style === 'shadow') {
    // A long drop shadow: the same letters, stepped down-right in fading ink.
    for (let i = 7; i >= 1; i--) {
      ctx.fillStyle = `rgba(20,8,31,${0.28 - i * 0.02})`;
      ctx.fillText(line, x + size * 0.045 * i, y + size * 0.055 * i);
    }
    ctx.fillStyle = grade.ink;
    ctx.fillText(line, x, y);
  } else {
    // Gradient fill: the grade's accent at the top fading to white.
    const g = ctx.createLinearGradient(0, y - size * 0.5, 0, y + size * 0.5);
    g.addColorStop(0, grade.accent);
    g.addColorStop(1, '#ffffff');
    ctx.fillStyle = g;
    ctx.fillText(line, x, y);
  }
}

// Draw text along a circular arc (used by the Sunset frame layout): the
// text follows the bottom of a circle centred at (cx, cy) with radius r.
function drawArcText(ctx, text, cx, cy, r, px, font, grade) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const family = CAPTION_FONTS[font].family;
  const weight = CAPTION_FONTS[font].weight;
  ctx.font = `${weight} ${px}px ${family}`;
  const chars = String(text || '').split('');
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  // Along the bottom of the circle, left-to-right means the angle falls:
  // at the bottom point (angle PI/2) a character stands upright, and its
  // top points toward the centre, so its rotation is angle - PI/2.
  let angle = Math.PI / 2 + total / (2 * r);
  ctx.fillStyle = grade.ink;
  ctx.strokeStyle = '#14081f';
  ctx.lineWidth = Math.max(2, px * 0.12);
  ctx.lineJoin = 'round';
  for (let i = 0; i < chars.length; i++) {
    const a = angle - widths[i] / (2 * r);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a - Math.PI / 2);
    ctx.strokeText(chars[i], 0, 0);
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
    angle -= widths[i] / r;
  }
  ctx.restore();
}

// Paint one finished cover of size W x H on ctx, from the editor state.
function drawCover(ctx, W, H, state) {
  const grade = GRADES[state.grade];
  const photo = state.photo;
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // Sky background for the layouts that show it.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, grade.skyTop);
  sky.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const drawPhoto = (rect) => {
    ctx.save();
    ctx.filter = photoFilterString(state, grade);
    drawPhotoInto(ctx, photo, rect, state);
    ctx.restore();
  };
  const captionPx = W * 0.085 * state.captionSize;
  const palmColor = 'rgba(12,6,22,0.6)';

  if (state.layout === 'classic') {
    drawPhoto({ x: 0, y: 0, w: W, h: H * 0.66 });
    drawRetroSun(ctx, W * 0.5, H * 0.66, W * 0.13, grade.sun, grade.skyBottom);
    ctx.fillStyle = grade.band;
    ctx.fillRect(0, H * 0.66, W, H * 0.34);
    drawCaption(ctx, state.caption, state.sub, W / 2, H * 0.8, W * 0.88, captionPx, state.captionStyle, state.captionFont, grade);
    paintPalm(ctx, W * 0.05, H * 0.99, H * 0.16, palmColor);
    paintPalm(ctx, W * 0.95, H * 0.99, H * 0.13, palmColor);
    drawHalftone(ctx, W, H, grade.dot);
  } else if (state.layout === 'fullbleed') {
    drawPhoto({ x: 0, y: 0, w: W, h: H });
    drawRetroSun(ctx, W * 0.86, H * 0.12, W * 0.09, grade.sun, 'rgba(0,0,0,0)');
    ctx.fillStyle = 'rgba(10,8,20,0.55)';
    ctx.fillRect(0, H * 0.64, W, H * 0.36);
    drawCaption(ctx, state.caption, state.sub, W / 2, H * 0.8, W * 0.88, captionPx, state.captionStyle, state.captionFont, grade);
    paintPalm(ctx, W * 0.06, H * 0.99, H * 0.15, palmColor);
    drawHalftone(ctx, W, H, grade.dot);
  } else if (state.layout === 'trio') {
    drawPhoto({ x: 0, y: 0, w: (W * 2) / 3, h: H });
    ctx.fillStyle = grade.band;
    ctx.fillRect((W * 2) / 3, 0, W / 3, H);
    drawRetroSun(ctx, (W * 5) / 6, H * 0.16, W * 0.09, grade.sun, grade.band);
    drawCaption(ctx, state.caption, state.sub, (W * 5) / 6, H * 0.55, W * 0.28, W * 0.062 * state.captionSize, state.captionStyle, state.captionFont, grade);
    drawHalftone(ctx, W, H, grade.dot);
  } else if (state.layout === 'diagonal') {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.6, 0);
    ctx.lineTo(W * 0.46, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.clip();
    ctx.filter = photoFilterString(state, grade);
    drawPhotoInto(ctx, photo, { x: 0, y: 0, w: W * 0.6, h: H }, state);
    ctx.restore();
    ctx.fillStyle = grade.band;
    ctx.beginPath();
    ctx.moveTo(W * 0.6, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    ctx.lineTo(W * 0.46, H);
    ctx.closePath();
    ctx.fill();
    drawRetroSun(ctx, W * 0.82, H * 0.14, W * 0.08, grade.sun, grade.band);
    drawCaption(ctx, state.caption, state.sub, W * 0.76, H * 0.55, W * 0.4, W * 0.07 * state.captionSize, state.captionStyle, state.captionFont, grade);
    drawHalftone(ctx, W, H, grade.dot);
  } else if (state.layout === 'poster') {
    ctx.fillStyle = grade.band;
    ctx.fillRect(0, 0, W, H);
    drawCaption(ctx, state.caption, '', W / 2, H * 0.09, W * 0.88, captionPx * 0.95, state.captionStyle, state.captionFont, grade);
    drawPhoto({ x: W * 0.09, y: H * 0.18, w: W * 0.82, h: H * 0.58 });
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(2, W * 0.004);
    ctx.strokeRect(W * 0.09, H * 0.18, W * 0.82, H * 0.58);
    ctx.save();
    ctx.font = `400 ${Math.max(14, W * 0.028)}px CoverClean`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.accent;
    ctx.fillText((state.sub || '').toUpperCase(), W / 2, H * 0.83);
    ctx.restore();
    drawRetroSun(ctx, W * 0.93, H * 0.94, W * 0.04, grade.sun, grade.band);
    drawHalftone(ctx, W, H, grade.dot);
  } else if (state.layout === 'strip') {
    // Five horizontal strips of the same photo, each shifted sideways.
    const stripH = H / 5;
    if (photo) {
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, i * stripH, W, stripH);
        ctx.clip();
        ctx.filter = photoFilterString(state, grade);
        // Each strip shifts sideways and a little up or down, so the five
        // slices read as one photo pulled apart, not five copies.
        const shift = (i % 2 === 0 ? 1 : -1) * W * 0.05;
        const vshift = (i - 2) * H * 0.05;
        const scale = Math.max(W / photo.width, H / photo.height) * state.zoom;
        const dw = photo.width * scale;
        const dh = photo.height * scale;
        const dx = (W - dw) / 2 + state.offsetX * dw + shift;
        const dy = (H - dh) / 2 + state.offsetY * dh + vshift;
        ctx.drawImage(photo, dx, dy, dw, dh);
        ctx.restore();
      }
    }
    ctx.fillStyle = grade.band;
    ctx.fillRect(0, H * 0.4, W, H * 0.2);
    drawCaption(ctx, state.caption, '', W / 2, H * 0.5, W * 0.88, captionPx, state.captionStyle, state.captionFont, grade);
    drawHalftone(ctx, W, H, grade.dot);
  } else {
    // Sunset frame: the photo inside a large retro sun, caption on an arc.
    drawRetroSun(ctx, W * 0.5, H * 0.4, W * 0.34, grade.sun, grade.skyBottom);
    ctx.save();
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.4, W * 0.34, 0, Math.PI * 2);
    ctx.clip();
    ctx.filter = photoFilterString(state, grade);
    drawPhotoInto(ctx, photo, { x: W * 0.16, y: H * 0.06, w: W * 0.68, h: H * 0.68 }, state);
    ctx.restore();
    ctx.strokeStyle = grade.accent;
    ctx.lineWidth = Math.max(3, W * 0.006);
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.4, W * 0.34, 0, Math.PI * 2);
    ctx.stroke();
    drawArcText(ctx, state.caption, W * 0.5, H * 0.4, W * 0.34 + H * 0.07, captionPx * 0.9, state.captionFont, grade);
    ctx.save();
    ctx.font = `400 ${Math.max(14, W * 0.028)}px CoverClean`;
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.accent;
    ctx.fillText((state.sub || '').toUpperCase(), W / 2, H * 0.94);
    ctx.restore();
    paintPalm(ctx, W * 0.05, H * 0.99, H * 0.15, palmColor);
    paintPalm(ctx, W * 0.95, H * 0.99, H * 0.12, palmColor);
    drawHalftone(ctx, W, H, grade.dot);
  }

  drawGrain(ctx, W, H);
  ctx.restore();
}
