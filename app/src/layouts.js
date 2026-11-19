// Panel layouts for the cover. Every layout is a list of panels; each panel
// is a polygon in unit space (x and y from 0 to 1), so the same layout works
// at any export size. Slanted edges give the poster its diagonal energy.

/** @typedef {[number, number]} Point */
/** @typedef {{ id: string, name: string, panels: Point[][] }} CoverLayout */

function poly(points) {
  return points;
}

/** Three diagonal bands, the classic poster split. */
export const DIAGONAL = {
  id: 'diagonal',
  name: 'Diagonal',
  panels: [
    poly([[0, 0], [1, 0], [1, 0.38], [0, 0.55]]),
    poly([[0, 0.55], [1, 0.38], [1, 0.72], [0, 0.85]]),
    poly([[0, 0.85], [1, 0.72], [1, 1], [0, 1]]),
  ],
};

/** Three upright columns with slanted cuts. */
export const COLUMNS = {
  id: 'columns',
  name: 'Columns',
  panels: [
    poly([[0, 0], [0.42, 0], [0.34, 1], [0, 1]]),
    poly([[0.42, 0], [0.72, 0], [0.64, 1], [0.34, 1]]),
    poly([[0.72, 0], [1, 0], [1, 1], [0.64, 1]]),
  ],
};

/** A hero corner plus three smaller panels. */
export const QUAD = {
  id: 'quad',
  name: 'Quad',
  panels: [
    poly([[0, 0], [0.58, 0], [0.5, 0.55], [0, 0.55]]),
    poly([[0.58, 0], [1, 0], [1, 0.55], [0.5, 0.55]]),
    poly([[0, 0.55], [0.5, 0.55], [0.42, 1], [0, 1]]),
    poly([[0.5, 0.55], [1, 0.55], [1, 1], [0.42, 1]]),
  ],
};

/** One big hero panel with two stacked panels beside it. */
export const HERO = {
  id: 'hero',
  name: 'Hero',
  panels: [
    poly([[0, 0], [0.64, 0], [0.56, 1], [0, 1]]),
    poly([[0.64, 0], [1, 0], [1, 0.5], [0.56, 0.5]]),
    poly([[0.56, 0.5], [1, 0.5], [1, 1], [0.56, 1]]),
  ],
};

/** A single full-bleed photo. */
export const FULL = {
  id: 'full',
  name: 'Full bleed',
  panels: [poly([[0, 0], [1, 0], [1, 1], [0, 1]])],
};

export const LAYOUTS = [DIAGONAL, COLUMNS, QUAD, HERO, FULL];

/** Find a layout by id, falling back to the diagonal split. */
export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) || DIAGONAL;
}

/** The bounding box of a polygon, in unit space. */
export function panelBounds(polygon) {
  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const [x, y] of polygon) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** True when a unit-space point falls inside a polygon. */
export function pointInPanel(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const crosses = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}
