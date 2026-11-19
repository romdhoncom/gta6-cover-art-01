// Sunset Cover Studio: boot, state, controls, live preview and export.
// The cover itself is drawn by render.js; this file only wires the editor.

import { LAYOUTS, layoutById, panelBounds, pointInPanel } from './layouts.js';
import { GRADES, gradeById } from './grades.js';
import { drawCover, SIZES, SIZE_LIST } from './render.js';
import {
  createShelf,
  fitPanelSlots,
  addFiles,
  addSample,
  photoById,
  assignPhoto,
  fillEmptyPanels,
  recenterPanel,
} from './photos.js';
import { applyShot } from './shots.js';

const state = {
  layoutId: 'diagonal',
  gradeId: 'sunset',
  sizeId: 'square',
  caption: {
    title: 'SUNSET DRIVE',
    sub: 'A STORY IN THREE ACTS',
    kicker: 'SUNSET COVER STUDIO',
    sizePct: 100,
    place: 'bottom',
    ink: 'white',
  },
  effects: { sun: true, palms: true, dots: false },
  shelf: createShelf(),
  selectedPanel: 0,
};

const $ = (id) => document.getElementById(id);
const preview = $('preview');
const previewCtx = preview.getContext('2d');

let previewQueued = false;
function requestPreview() {
  if (previewQueued) return;
  previewQueued = true;
  requestAnimationFrame(() => {
    previewQueued = false;
    renderPreview();
  });
}

function currentSize() {
  return SIZE_LIST.find((size) => size.id === state.sizeId) || SIZES.square;
}

function renderPreview() {
  const size = currentSize();
  const longSide = 1080;
  const scale = Math.min(1, longSide / Math.max(size.width, size.height));
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  if (preview.width !== width || preview.height !== height) {
    preview.width = width;
    preview.height = height;
  }
  const layout = layoutById(state.layoutId);
  fitPanelSlots(state.shelf, layout.panels.length);
  drawCover(previewCtx, state, width, height, { highlightPanel: state.selectedPanel });
}

/** Rebuild the layout/grade/size pickers from their definitions. */
function buildPickers() {
  const layoutPicker = $('layout-picker');
  layoutPicker.innerHTML = '';
  for (const layout of LAYOUTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.layout = layout.id;
    button.setAttribute('aria-pressed', String(layout.id === state.layoutId));
    if (layout.id === state.layoutId) button.classList.add('active');
    const thumb = document.createElement('canvas');
    thumb.width = 56;
    thumb.height = 40;
    drawLayoutThumb(thumb.getContext('2d'), layout);
    button.appendChild(thumb);
    button.appendChild(document.createTextNode(layout.name));
    button.addEventListener('click', () => {
      state.layoutId = layout.id;
      state.selectedPanel = 0;
      syncPickers();
      requestPreview();
    });
    layoutPicker.appendChild(button);
  }

  const gradePicker = $('grade-picker');
  gradePicker.innerHTML = '';
  for (const grade of GRADES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.grade = grade.id;
    button.setAttribute('aria-pressed', String(grade.id === state.gradeId));
    if (grade.id === state.gradeId) button.classList.add('active');
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = grade.swatch;
    button.appendChild(swatch);
    button.appendChild(document.createTextNode(grade.name));
    button.addEventListener('click', () => {
      state.gradeId = grade.id;
      syncPickers();
      requestPreview();
    });
    gradePicker.appendChild(button);
  }

  const sizePicker = $('size-picker');
  sizePicker.innerHTML = '';
  for (const size of SIZE_LIST) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.size = size.id;
    button.setAttribute('aria-pressed', String(size.id === state.sizeId));
    if (size.id === state.sizeId) button.classList.add('active');
    button.appendChild(document.createTextNode(`${size.name} · ${size.label}`));
    button.addEventListener('click', () => {
      state.sizeId = size.id;
      syncPickers();
      requestPreview();
    });
    sizePicker.appendChild(button);
  }
}

/** A tiny line drawing of a layout's panels, for its picker button. */
function drawLayoutThumb(ctx, layout) {
  ctx.fillStyle = '#2b0f3a';
  ctx.fillRect(0, 0, 56, 40);
  const colours = ['#ff7a3d', '#ff2e88', '#ffc46b', '#19e3ff'];
  layout.panels.forEach((polygon, i) => {
    ctx.beginPath();
    polygon.forEach(([x, y], j) => {
      if (j === 0) ctx.moveTo(x * 56, y * 40);
      else ctx.lineTo(x * 56, y * 40);
    });
    ctx.closePath();
    ctx.fillStyle = colours[i % colours.length];
    ctx.fill();
    ctx.strokeStyle = '#f6ead8';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function syncPickers() {
  for (const button of $('layout-picker').children) {
    const active = button.dataset.layout === state.layoutId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  for (const button of $('grade-picker').children) {
    const active = button.dataset.grade === state.gradeId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  for (const button of $('size-picker').children) {
    const active = button.dataset.size === state.sizeId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}

/** Rebuild the photo strip and the panel's photo dropdown. */
function syncPhotos() {
  const strip = $('photo-strip');
  strip.innerHTML = '';
  for (const photo of state.shelf.photos) {
    const thumb = document.createElement('img');
    thumb.src = photo.image.src;
    thumb.alt = photo.name;
    thumb.title = photo.name;
    thumb.addEventListener('click', () => {
      assignPhoto(state.shelf, state.selectedPanel, photo.id);
      syncPhotos();
      requestPreview();
    });
    strip.appendChild(thumb);
  }
  $('photo-count').textContent =
    state.shelf.photos.length === 0
      ? 'No photos yet — add one, or try a sample.'
      : `${state.shelf.photos.length} photo${state.shelf.photos.length > 1 ? 's' : ''} on the shelf — click one to put it in the selected panel.`;

  const select = $('panel-photo');
  select.innerHTML = '';
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'Empty panel';
  select.appendChild(none);
  for (const photo of state.shelf.photos) {
    const option = document.createElement('option');
    option.value = String(photo.id);
    option.textContent = photo.name;
    select.appendChild(option);
  }
  const slot = state.shelf.panels[state.selectedPanel];
  select.value = slot && slot.photoId !== null ? String(slot.photoId) : '';
}

/** Show the selected panel's crop controls. */
function syncPanelEditor() {
  const layout = layoutById(state.layoutId);
  $('panel-title').textContent = `Panel ${state.selectedPanel + 1} of ${layout.panels.length}`;
  const slot = state.shelf.panels[state.selectedPanel];
  $('panel-zoom').value = slot ? String(Math.round(slot.zoom * 100)) : '100';
  syncPhotos();
}

/** Clamp a panel's pan so its photo never leaves the panel bare. */
function clampPan(slot, image, bounds) {
  if (!image) return;
  const base = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
  const drawnW = image.naturalWidth * base * slot.zoom;
  const drawnH = image.naturalHeight * base * slot.zoom;
  const maxX = Math.max(0, (drawnW - bounds.width) / 2 / bounds.width);
  const maxY = Math.max(0, (drawnH - bounds.height) / 2 / bounds.height);
  slot.panX = Math.max(-maxX, Math.min(maxX, slot.panX));
  slot.panY = Math.max(-maxY, Math.min(maxY, slot.panY));
}

/** Which panel, if any, is under a point on the preview canvas. */
function panelAt(clientX, clientY) {
  const rect = preview.getBoundingClientRect();
  const px = (clientX - rect.left) / rect.width;
  const py = (clientY - rect.top) / rect.height;
  const layout = layoutById(state.layoutId);
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    if (pointInPanel(px, py, layout.panels[i])) return i;
  }
  return -1;
}

function bindPreviewDrag() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  preview.addEventListener('pointerdown', (event) => {
    const index = panelAt(event.clientX, event.clientY);
    if (index < 0) return;
    state.selectedPanel = index;
    syncPanelEditor();
    requestPreview();
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    preview.setPointerCapture(event.pointerId);
  });

  preview.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const rect = preview.getBoundingClientRect();
    const slot = state.shelf.panels[state.selectedPanel];
    const photo = slot ? photoById(state.shelf, slot.photoId) : null;
    if (!slot || !photo) return;
    const layout = layoutById(state.layoutId);
    const bounds = panelBounds(layout.panels[state.selectedPanel]);
    slot.panX += (event.clientX - lastX) / rect.width / bounds.width;
    slot.panY += (event.clientY - lastY) / rect.height / bounds.height;
    clampPan(slot, photo.image, { width: bounds.width * preview.width, height: bounds.height * preview.height });
    lastX = event.clientX;
    lastY = event.clientY;
    requestPreview();
  });

  preview.addEventListener('pointerup', () => {
    dragging = false;
  });

  preview.addEventListener('wheel', (event) => {
    event.preventDefault();
    const slot = state.shelf.panels[state.selectedPanel];
    if (!slot) return;
    slot.zoom = Math.max(1, Math.min(2.5, slot.zoom * (event.deltaY < 0 ? 1.08 : 0.92)));
    $('panel-zoom').value = String(Math.round(slot.zoom * 100));
    requestPreview();
  }, { passive: false });
}

function bindControls() {
  $('photo-files').addEventListener('change', async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    try {
      await addFiles(state.shelf, files);
      fillEmptyPanels(state.shelf);
      syncPhotos();
      syncPanelEditor();
      requestPreview();
    } catch (error) {
      $('photo-count').textContent = error.message;
    }
    event.target.value = '';
  });

  $('sample-boulevard').addEventListener('click', async () => {
    await addSample(state.shelf, 'Boulevard', 'samples/boulevard.jpg');
    fillEmptyPanels(state.shelf);
    syncPhotos();
    syncPanelEditor();
    requestPreview();
  });
  $('sample-pier').addEventListener('click', async () => {
    await addSample(state.shelf, 'Pier', 'samples/pier.jpg');
    fillEmptyPanels(state.shelf);
    syncPhotos();
    syncPanelEditor();
    requestPreview();
  });

  $('panel-photo').addEventListener('change', (event) => {
    const value = event.target.value;
    assignPhoto(state.shelf, state.selectedPanel, value === '' ? null : Number(value));
    requestPreview();
  });
  $('panel-fit').addEventListener('click', () => {
    recenterPanel(state.shelf, state.selectedPanel);
    syncPanelEditor();
    requestPreview();
  });
  $('panel-zoom').addEventListener('input', (event) => {
    const slot = state.shelf.panels[state.selectedPanel];
    if (!slot) return;
    slot.zoom = Number(event.target.value) / 100;
    requestPreview();
  });

  $('caption-title').addEventListener('input', (event) => {
    state.caption.title = event.target.value;
    requestPreview();
  });
  $('caption-sub').addEventListener('input', (event) => {
    state.caption.sub = event.target.value;
    requestPreview();
  });
  $('caption-kicker').addEventListener('input', (event) => {
    state.caption.kicker = event.target.value;
    requestPreview();
  });
  $('caption-size').addEventListener('input', (event) => {
    state.caption.sizePct = Number(event.target.value);
    requestPreview();
  });
  $('caption-place').addEventListener('change', (event) => {
    state.caption.place = event.target.value;
    requestPreview();
  });
  $('caption-ink').addEventListener('change', (event) => {
    state.caption.ink = event.target.value;
    requestPreview();
  });

  $('fx-sun').addEventListener('change', (event) => {
    state.effects.sun = event.target.checked;
    requestPreview();
  });
  $('fx-palms').addEventListener('change', (event) => {
    state.effects.palms = event.target.checked;
    requestPreview();
  });
  $('fx-dots').addEventListener('change', (event) => {
    state.effects.dots = event.target.checked;
    requestPreview();
  });

  $('export-btn').addEventListener('click', () => {
    void exportCover();
  });
}

/** Render the cover at the chosen export size and download it as a PNG. */
async function exportCover() {
  const size = currentSize();
  const button = $('export-btn');
  button.disabled = true;
  $('export-note').textContent = 'Rendering your cover…';
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    drawCover(canvas.getContext('2d'), state, size.width, size.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sunset-cover-${size.id}-${size.width}x${size.height}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    $('export-note').textContent = `Exported ${size.label} PNG — check your downloads.`;
  } catch (error) {
    $('export-note').textContent = `Export failed: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

/** Let the driver (and the shots module) reach the live app. */
window.__coverStudio = { state, exportCover, renderPreview };

async function boot() {
  buildPickers();
  bindControls();
  bindPreviewDrag();
  fitPanelSlots(state.shelf, layoutById(state.layoutId).panels.length);
  syncPanelEditor();
  try {
    await document.fonts.load('100px Anton');
  } catch {
    /* The caption still draws in the fallback sans. */
  }
  requestPreview();
  await applyShot(state, () => {
    buildPickers();
    syncPickers();
    syncPanelEditor();
    requestPreview();
    document.title = 'ready';
  });
}

void boot();
