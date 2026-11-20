// Sunset Cover Studio: editor state, controls, live preview and PNG export.
// The cover itself is drawn by drawCover in render.js; this file wires the
// page to it. The preview canvas redraws on every change, and exports render
// the same drawing at the exact post sizes.

const PREVIEW_SIZES = {
  square: { w: 720, h: 720 },
  portrait: { w: 576, h: 720 },
  wide: { w: 720, h: 405 },
};

const EXPORT_SIZES = [
  { key: 'square', w: 1080, h: 1080, name: 'sunset-cover-square.png' },
  { key: 'portrait', w: 1080, h: 1350, name: 'sunset-cover-portrait.png' },
  { key: 'wide', w: 1920, h: 1080, name: 'sunset-cover-wide.png' },
];

const state = {
  layout: 'classic',
  grade: 'sunset',
  caption: 'VICE CITY NIGHTS',
  sub: 'A STORY IN THREE ACTS',
  captionStyle: 'outline',
  captionFont: 'display',
  captionSize: 1,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  filter: 'none',
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  sample: 'beach',
  photo: null,
  preview: 'square',
};

const preview = document.getElementById('preview');
const pctx = preview.getContext('2d');
const statusEl = document.getElementById('status');

function setStatus(text) {
  statusEl.textContent = text;
}

function renderPreview() {
  const size = PREVIEW_SIZES[state.preview];
  if (preview.width !== size.w || preview.height !== size.h) {
    preview.width = size.w;
    preview.height = size.h;
  }
  drawCover(pctx, size.w, size.h, state);
}

function render() {
  if (!state.photo) return;
  renderPreview();
}

function markActive(rowId, attr, value) {
  const row = document.getElementById(rowId);
  if (!row) return;
  for (const btn of row.querySelectorAll('button')) {
    btn.classList.toggle('active', btn.dataset[attr] === value);
  }
}

function setLayout(layout) {
  state.layout = layout;
  markActive('layoutRow', 'layout', layout);
  render();
}

function setGrade(grade) {
  state.grade = grade;
  markActive('gradeRow', 'grade', grade);
  render();
}

function setPreview(key) {
  state.preview = key;
  document.querySelectorAll('[data-preview]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.preview === key);
  });
  render();
}

function setSample(key) {
  state.sample = key;
  state.offsetX = 0;
  state.offsetY = 0;
  state.zoom = 1;
  document.getElementById('zoom').value = '1';
  state.photo = makeSampleCanvas(key, 1200, 800);
  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.sample === key);
  });
  render();
}

function randomize() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  setLayout(pick(Object.keys(LAYOUTS)));
  setGrade(pick(Object.keys(GRADES)));
  state.captionStyle = pick(['outline', 'shadow', 'gradient']);
  markActive('styleRow', 'style', state.captionStyle);
  state.captionFont = pick(['display', 'clean', 'serif']);
  markActive('fontRow', 'font', state.captionFont);
  state.filter = pick(['none', 'warm', 'cool', 'faded']);
  markActive('filterRow', 'filter', state.filter);
  setSample(pick(Object.keys(SAMPLES)));
  setStatus('Randomized — a fresh look, ready to export.');
}

function resetAll() {
  state.layout = 'classic';
  state.grade = 'sunset';
  state.caption = 'VICE CITY NIGHTS';
  state.sub = 'A STORY IN THREE ACTS';
  state.captionStyle = 'outline';
  state.captionFont = 'display';
  state.captionSize = 1;
  state.brightness = 1;
  state.contrast = 1;
  state.saturation = 1;
  state.filter = 'none';
  state.zoom = 1;
  state.offsetX = 0;
  state.offsetY = 0;
  document.getElementById('captionText').value = state.caption;
  document.getElementById('subText').value = state.sub;
  document.getElementById('captionSize').value = '1';
  document.getElementById('brightness').value = '1';
  document.getElementById('contrast').value = '1';
  document.getElementById('saturation').value = '1';
  document.getElementById('zoom').value = '1';
  markActive('layoutRow', 'layout', 'classic');
  markActive('gradeRow', 'grade', 'sunset');
  markActive('styleRow', 'style', 'outline');
  markActive('fontRow', 'font', 'display');
  markActive('filterRow', 'filter', 'none');
  setSample('beach');
  setStatus('Reset to the classic look.');
}

// Export one size: render the cover at the exact post size and download it.
function exportSize(size, done) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  drawCover(ctx, size.w, size.h, state);
  canvas.toBlob((blob) => {
    if (!blob) {
      setStatus('Export failed — the browser could not write the PNG.');
      if (done) done(false);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = size.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    if (done) done(true);
  }, 'image/png');
}

function exportAll() {
  setStatus('Exporting all three sizes…');
  let i = 0;
  const next = () => {
    if (i >= EXPORT_SIZES.length) {
      setStatus('All three sizes downloaded.');
      return;
    }
    exportSize(EXPORT_SIZES[i], (ok) => {
      if (!ok) return;
      i++;
      setTimeout(next, 350);
    });
  };
  next();
}

// Drag the preview to reposition the photo inside its frame.
let dragging = null;
preview.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY, ox: state.offsetX, oy: state.offsetY };
  preview.setPointerCapture(e.pointerId);
});
preview.addEventListener('pointermove', (e) => {
  if (!dragging || !state.photo) return;
  const rect = preview.getBoundingClientRect();
  const scale = state.zoom * Math.max(rect.width / state.photo.width, rect.height / state.photo.height);
  state.offsetX = dragging.ox + (e.clientX - dragging.x) / (state.photo.width * scale);
  state.offsetY = dragging.oy + (e.clientY - dragging.y) / (state.photo.height * scale);
  state.offsetX = Math.max(-0.5, Math.min(0.5, state.offsetX));
  state.offsetY = Math.max(-0.5, Math.min(0.5, state.offsetY));
  render();
});
preview.addEventListener('pointerup', () => { dragging = null; });

function bindControls() {
  document.getElementById('layoutRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-layout]');
    if (btn) setLayout(btn.dataset.layout);
  });
  document.getElementById('gradeRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-grade]');
    if (btn) setGrade(btn.dataset.grade);
  });
  document.getElementById('styleRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-style]');
    if (btn) {
      state.captionStyle = btn.dataset.style;
      markActive('styleRow', 'style', state.captionStyle);
      render();
    }
  });
  document.getElementById('fontRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-font]');
    if (btn) {
      state.captionFont = btn.dataset.font;
      markActive('fontRow', 'font', state.captionFont);
      render();
    }
  });
  document.getElementById('filterRow').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (btn) {
      state.filter = btn.dataset.filter;
      markActive('filterRow', 'filter', state.filter);
      render();
    }
  });
  document.querySelectorAll('[data-preview]').forEach((btn) => {
    btn.addEventListener('click', () => setPreview(btn.dataset.preview));
  });
  document.querySelectorAll('[data-sample]').forEach((btn) => {
    btn.addEventListener('click', () => setSample(btn.dataset.sample));
  });
  document.getElementById('photoFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    loadPhotoFile(file, (canvas) => {
      if (!canvas) {
        setStatus('That photo could not be read — try another file.');
        return;
      }
      state.photo = canvas;
      state.sample = '';
      document.querySelectorAll('[data-sample]').forEach((btn) => btn.classList.remove('active'));
      setStatus('Photo loaded — drag it to position, then export.');
      render();
    });
  });
  document.getElementById('captionText').addEventListener('input', (e) => {
    state.caption = e.target.value.toUpperCase();
    render();
  });
  document.getElementById('subText').addEventListener('input', (e) => {
    state.sub = e.target.value.toUpperCase();
    render();
  });
  const bindSlider = (id, key) => {
    document.getElementById(id).addEventListener('input', (e) => {
      state[key] = parseFloat(e.target.value);
      render();
    });
  };
  bindSlider('captionSize', 'captionSize');
  bindSlider('brightness', 'brightness');
  bindSlider('contrast', 'contrast');
  bindSlider('saturation', 'saturation');
  bindSlider('zoom', 'zoom');
  document.getElementById('randomize').addEventListener('click', randomize);
  document.getElementById('reset').addEventListener('click', resetAll);
  document.getElementById('exportSquare').addEventListener('click', () => {
    exportSize(EXPORT_SIZES[0], () => setStatus('Square cover downloaded (1080 x 1080).'));
  });
  document.getElementById('exportPortrait').addEventListener('click', () => {
    exportSize(EXPORT_SIZES[1], () => setStatus('Portrait cover downloaded (1080 x 1350).'));
  });
  document.getElementById('exportWide').addEventListener('click', () => {
    exportSize(EXPORT_SIZES[2], () => setStatus('Wide cover downloaded (1920 x 1080).'));
  });
  document.getElementById('exportAll').addEventListener('click', exportAll);
}

// A small handle for automated checks: the shot driver and the playtest use
// it to change the editor's state and to read back what is on screen.
window.SunsetCover = {
  state,
  setLayout,
  setGrade,
  setPreview,
  setSample,
  randomize,
  exportSize,
  EXPORT_SIZES,
  render,
};

// Start only once the shipped fonts are ready, so the canvas lettering uses
// them from the very first frame.
bindControls();
if (document.fonts && document.fonts.ready) {
  Promise.all([
    document.fonts.load('700 40px CoverDisplay'),
    document.fonts.load('400 40px CoverClean'),
    document.fonts.load('700 40px CoverSerif'),
    document.fonts.ready,
  ]).then(() => {
    setSample('beach');
    setStatus('Ready — pick a photo, pick a look, download your cover.');
  }).catch(() => {
    setSample('beach');
    setStatus('Ready — pick a photo, pick a look, download your cover.');
  });
} else {
  setSample('beach');
}
