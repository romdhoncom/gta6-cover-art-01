# Sunset Cover Studio

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/romdhoncom/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/romdhoncom/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your photo into GTA-style cover art — the multi-panel poster look with
bold caption lettering and a sunset or neon colour grade — and export it as a
PNG to share. A static web app: serve `app/` with any static server and open
`index.html` in desktop Chrome. Everything runs on your machine; photos are
never uploaded.

## How it works

1. **Add photos** from your machine, or try the two bundled samples.
2. **Pick a layout** — Diagonal, Columns, Quad, Hero, or Full bleed — and a
   **colour grade** — Sunset, Neon nights, Golden hour, or Noir.
3. **Crop and position** each panel's photo: click a panel, drag its photo,
   scroll or slide to zoom. One photo can fill several panels.
4. **Write the caption** — title, subtitle and kicker, size, placement and
   ink — and switch the retro sun, palm silhouettes and print dots on or off.
5. **Export a PNG** in 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## What it is made of

- `app/index.html` + `app/style.css` — the editor page and its dark studio UI.
- `app/src/main.js` — state, controls, live preview, drag/zoom, export.
- `app/src/render.js` — the cover renderer: panels, photos, grades, sun,
  palms, dots, caption, vignette and frame, drawn on canvas.
- `app/src/layouts.js` — the five panel layouts as polygons.
- `app/src/grades.js` — the four colour grades.
- `app/src/photos.js` — the photo shelf and per-panel crops.
- `app/src/shots.js` — deterministic `?shot=` presets for screenshots.
- `app/fonts/Anton-Regular.ttf` — display lettering, SIL Open Font License
  (see `app/fonts/OFL.txt`).
- `app/samples/` — two bundled sample photos, made with an image model for
  make.fun and free to use.

Everything in the cover art is original: no Rockstar Games logo, wordmark,
official artwork, character or font file is used anywhere.

## Entry

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-app.ts`. Run it with `MAKEFUN_OUTPUT_DIR=out node main.ts`.
