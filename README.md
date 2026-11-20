# Sunset Cover Studio v2

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/romdhoncom/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/romdhoncom/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

A web app that turns a photo and a caption into GTA-style multi-panel cover art, in the browser, offline. Open `app/index.html` in desktop Chrome: pick a photo (or one of three sample photos drawn in code), choose one of 7 layouts and 6 colour grades, style the caption, tune the photo, and export a PNG in 1080×1080, 1080×1350 or 1920×1080 — or download all three at once.

Everything is original: the retro sun, palm silhouettes, halftone dots and all three sample photos are drawn in code. No Rockstar logo, artwork or fonts. The three caption fonts are DejaVu faces shipped under `app/fonts/` under the DejaVu licence.

## What v2 adds

- 7 layouts (Classic split, Full bleed, Trio, Duo diagonal, Poster, Strip, Sunset frame) and 6 colour grades (Sunset, Neon Nights, Golden Hour, Noir, Vice Nights, Desert Heat)
- Photo controls: brightness, contrast and saturation sliders, zoom, drag-to-reposition, and 4 quick filters (None, Warm, Cool, Faded)
- 3 caption styles (Outline, Long shadow, Gradient fill) and 3 caption fonts, with a size slider
- Randomize button: one click, a fresh look
- Preview in all three post sizes, plus Download-all export

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the kit's `buildDossier` helper from `vendor/makefun-app.ts`.

Entry for the [make.fun GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01).
