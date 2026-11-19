// Screenshot staging: ?shot=<name> drives the app into a fixed state so a
// screenshot is a real render of the app's own code, not a composite.
// The presets use only the bundled sample photos and fixed captions.

import { addSample, fillEmptyPanels, fitPanelSlots } from './photos.js';
import { drawCover, SIZES } from './render.js';

/**
 * Apply a staging preset, then call done().
 * @param {object} state — the app state
 * @param {(canvas: HTMLCanvasElement | null) => void} done
 */
export async function applyShot(state, done) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) {
    done(null);
    return;
  }

  const presets = {
    editor: {
      layoutId: 'diagonal',
      gradeId: 'sunset',
      sizeId: 'square',
      caption: { title: 'SUNSET DRIVE', sub: 'A STORY IN THREE ACTS', kicker: 'SUNSET COVER STUDIO', sizePct: 100, place: 'bottom', ink: 'white' },
      effects: { sun: true, palms: true, dots: false },
      exportSize: null,
    },
    'export-wide': {
      layoutId: 'diagonal',
      gradeId: 'sunset',
      sizeId: 'wide',
      caption: { title: 'SUNSET DRIVE', sub: 'A STORY IN THREE ACTS', kicker: 'SUNSET COVER STUDIO', sizePct: 100, place: 'bottom', ink: 'white' },
      effects: { sun: true, palms: true, dots: false },
      exportSize: SIZES.wide,
    },
    'export-portrait': {
      layoutId: 'quad',
      gradeId: 'neon',
      sizeId: 'portrait',
      caption: { title: 'NEON NIGHTS', sub: 'THE CITY NEVER SLEEPS', kicker: 'AFTER DARK', sizePct: 100, place: 'bottom', ink: 'pink' },
      effects: { sun: false, palms: true, dots: true },
      exportSize: SIZES.portrait,
    },
    'export-square': {
      layoutId: 'hero',
      gradeId: 'golden',
      sizeId: 'square',
      caption: { title: 'GOLDEN HOUR', sub: 'ONE LAST RIDE', kicker: 'HIGHWAY 9', sizePct: 100, place: 'bottom', ink: 'gold' },
      effects: { sun: true, palms: true, dots: false },
      exportSize: SIZES.square,
    },
  };

  const preset = presets[shot];
  if (!preset) {
    done(null);
    return;
  }

  state.layoutId = preset.layoutId;
  state.gradeId = preset.gradeId;
  state.sizeId = preset.sizeId;
  state.caption = { ...preset.caption };
  state.effects = { ...preset.effects };

  // Load the two sample photos and spread them over the panels.
  const { layoutById } = await import('./layouts.js');
  const layout = layoutById(state.layoutId);
  fitPanelSlots(state.shelf, layout.panels.length);
  if (state.shelf.photos.length === 0) {
    await addSample(state.shelf, 'Boulevard', 'samples/boulevard.jpg');
    await addSample(state.shelf, 'Pier', 'samples/pier.jpg');
  }
  fillEmptyPanels(state.shelf);
  // Alternate the samples across panels for a varied collage.
  state.shelf.panels.forEach((slot, i) => {
    const photo = state.shelf.photos[i % state.shelf.photos.length];
    if (photo) slot.photoId = photo.id;
  });

  await document.fonts.load('100px Anton');
  await document.fonts.ready;

  if (!preset.exportSize) {
    done(null);
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = preset.exportSize.width;
  canvas.height = preset.exportSize.height;
  const ctx = canvas.getContext('2d');
  drawCover(ctx, state, canvas.width, canvas.height);
  window.__exported = canvas.toDataURL('image/png');
  done(canvas);
}
