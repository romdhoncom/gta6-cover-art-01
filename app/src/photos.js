// The photo shelf and what each panel shows. Photos are read on the
// person's own machine and never uploaded: a file becomes a data URL, a
// sample becomes an image element pointed at a file under app/.

/**
 * @typedef {{ id: number, name: string, image: HTMLImageElement }} ShelfPhoto
 * @typedef {{ photoId: number | null, zoom: number, panX: number, panY: number }} PanelPhoto
 */

let nextPhotoId = 1;

/** A new, empty shelf. */
export function createShelf() {
  return { photos: [], panels: [] };
}

/** Make sure the shelf has one slot per panel, keeping old slots. */
export function fitPanelSlots(shelf, panelCount) {
  while (shelf.panels.length < panelCount) {
    shelf.panels.push({ photoId: null, zoom: 1, panX: 0, panY: 0 });
  }
  shelf.panels.length = panelCount;
}

/** Add an already-loaded image to the shelf and return its id. */
export function addPhoto(shelf, name, image) {
  const photo = { id: nextPhotoId++, name, image };
  shelf.photos.push(photo);
  return photo.id;
}

/** Read image files the person picked into the shelf. */
export function addFiles(shelf, files) {
  const jobs = [...files]
    .filter((file) => file.type.startsWith('image/'))
    .map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const image = new Image();
            image.onload = () => resolve(addPhoto(shelf, file.name, image));
            image.onerror = () => reject(new Error(`Could not read ${file.name}`));
            image.src = String(reader.result);
          };
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.readAsDataURL(file);
        }),
    );
  return Promise.all(jobs);
}

/** Load one of the bundled sample photos into the shelf. */
export function addSample(shelf, name, url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(addPhoto(shelf, name, image));
    image.onerror = () => reject(new Error(`Could not load ${name}`));
    image.src = url;
  });
}

/** Find a photo on the shelf by id. */
export function photoById(shelf, id) {
  return shelf.photos.find((photo) => photo.id === id) || null;
}

/** Point a panel at a photo, keeping its crop when it already had one. */
export function assignPhoto(shelf, panelIndex, photoId) {
  const slot = shelf.panels[panelIndex];
  if (!slot) return;
  slot.photoId = photoId;
}

/** Fill every empty panel with the first photo, in order. */
export function fillEmptyPanels(shelf) {
  if (shelf.photos.length === 0) return;
  shelf.panels.forEach((slot, i) => {
    if (slot.photoId === null) {
      slot.photoId = shelf.photos[i % shelf.photos.length].id;
    }
  });
}

/** Reset one panel's crop to centred and unzoomed. */
export function recenterPanel(shelf, panelIndex) {
  const slot = shelf.panels[panelIndex];
  if (!slot) return;
  slot.zoom = 1;
  slot.panX = 0;
  slot.panY = 0;
}
