// Photo handling for Sunset Cover Studio: loading a person's own photo from
// their machine, the quick filters, and drag-to-reposition with zoom. The
// photo is kept as a canvas so the cover renderer can draw it at any size.

// Quick filters: each one is a tint overlay plus a small change to the
// canvas filter string the renderer applies.
const PHOTO_FILTERS = {
  none: { tint: null, extra: '' },
  warm: { tint: 'rgba(255,150,50,0.14)', extra: 'sepia(0.25)' },
  cool: { tint: 'rgba(80,140,255,0.14)', extra: 'hue-rotate(-12deg)' },
  faded: { tint: 'rgba(255,255,255,0.20)', extra: 'contrast(0.85) brightness(1.06)' },
};

// The canvas filter string for the current photo settings.
function photoFilterString(state, grade) {
  const parts = [];
  if (grade.photoFilter) parts.push(grade.photoFilter);
  parts.push(`brightness(${state.brightness})`);
  parts.push(`contrast(${state.contrast})`);
  parts.push(`saturate(${state.saturation})`);
  const extra = PHOTO_FILTERS[state.filter].extra;
  if (extra) parts.push(extra);
  return parts.join(' ');
}

// Draw the current photo cover-fit into rect (x, y, w, h) on ctx, honouring
// zoom and the drag offset (fractions of the photo's own size). The photo is
// a canvas; its own aspect decides the fit.
function drawPhotoInto(ctx, photo, rect, state) {
  if (!photo) return;
  const scale = Math.max(rect.w / photo.width, rect.h / photo.height) * state.zoom;
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  const dx = rect.x + (rect.w - dw) / 2 + state.offsetX * dw;
  const dy = rect.y + (rect.h - dh) / 2 + state.offsetY * dh;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(photo, dx, dy, dw, dh);
  const tint = PHOTO_FILTERS[state.filter].tint;
  if (tint) {
    ctx.fillStyle = tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.restore();
}

// Load a person's photo file into an offscreen canvas, capped at 1600 px on
// its long side so exports stay fast. Calls done(canvas) when ready.
function loadPhotoFile(file, done) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    done(canvas);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    done(null);
  };
  img.src = url;
}
