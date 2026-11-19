// Colour grades. A grade is a photo filter plus one or two translucent
// gradient washes drawn over the photos. Everything here is a plain colour
// grade — no artwork is borrowed from anywhere.

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   filter: string,
 *   washes: Array<{ kind: 'linear' | 'radial', stops: Array<[number, string]>, blend: string, alpha: number, angle: number }>,
 *   vignette: number,
 *   swatch: string,
 * }} CoverGrade
 */

/** Warm orange-to-violet dusk, the sunset poster look. */
export const SUNSET = {
  id: 'sunset',
  name: 'Sunset',
  filter: 'saturate(1.25) contrast(1.06) brightness(1.02)',
  washes: [
    {
      kind: 'linear',
      stops: [
        [0, '#ffb03d'],
        [0.5, '#ff5e7a'],
        [1, '#7a2ea6'],
      ],
      blend: 'overlay',
      alpha: 0.38,
      angle: 165,
    },
  ],
  vignette: 0.32,
  swatch: 'linear-gradient(135deg,#ffb03d,#ff5e7a 55%,#7a2ea6)',
};

/** Hot magenta against electric cyan. */
export const NEON = {
  id: 'neon',
  name: 'Neon nights',
  filter: 'saturate(1.6) contrast(1.15) brightness(1.0)',
  washes: [
    {
      kind: 'linear',
      stops: [
        [0, '#ff2e88'],
        [1, '#19e3ff'],
      ],
      blend: 'overlay',
      alpha: 0.5,
      angle: 35,
    },
    {
      kind: 'radial',
      stops: [
        [0, '#ff2e88'],
        [1, 'rgba(255,46,136,0)'],
      ],
      blend: 'screen',
      alpha: 0.3,
      angle: 0,
    },
  ],
  vignette: 0.28,
  swatch: 'linear-gradient(135deg,#ff2e88,#19e3ff)',
};

/** Honeyed late-afternoon light. */
export const GOLDEN = {
  id: 'golden',
  name: 'Golden hour',
  filter: 'sepia(0.28) saturate(1.35) brightness(1.06) contrast(1.04)',
  washes: [
    {
      kind: 'linear',
      stops: [
        [0, '#ffe9a8'],
        [1, '#ff9a3d'],
      ],
      blend: 'soft-light',
      alpha: 0.45,
      angle: 115,
    },
  ],
  vignette: 0.26,
  swatch: 'linear-gradient(135deg,#ffe9a8,#ff9a3d)',
};

/** Desaturated, high-contrast, night-drive mood. */
export const NOIR = {
  id: 'noir',
  name: 'Noir',
  filter: 'saturate(0.18) contrast(1.28) brightness(0.94)',
  washes: [
    {
      kind: 'linear',
      stops: [
        [0, '#8fa3c8'],
        [1, '#1c2340'],
      ],
      blend: 'multiply',
      alpha: 0.32,
      angle: 200,
    },
  ],
  vignette: 0.5,
  swatch: 'linear-gradient(135deg,#8fa3c8,#1c2340)',
};

export const GRADES = [SUNSET, NEON, GOLDEN, NOIR];

/** Find a grade by id, falling back to the sunset grade. */
export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) || SUNSET;
}
