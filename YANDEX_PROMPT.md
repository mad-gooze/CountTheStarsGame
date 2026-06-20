# Count The Stars — Yandex Games submission guide

This document is the concrete, filled-in version of the original reusable
prompt, adapted to **Count The Stars** as it actually ships: a Vite + TypeScript
web game (not a single `index.html`). It records the game concept, how the
Yandex Games SDK is integrated, and how to regenerate every store asset and
text. Re-run the generator scripts after any title or visual change to keep the
whole submission consistent.

---

## 1. THE GAME

**Concept:** A calm, meditative arcade. Stars light up one at a time in a night
sky; the player counts them by tapping/clicking each *newest* star as it
appears. Tapping an already-counted star is a mistake — three mistakes end the
run. Score = stars counted; the personal best is persisted.

**Genre / vibe:** Casual, relaxing, meditative.

**Visual style:** Deep navy-to-black diagonal sky
(`linear-gradient(to top right, #003 0%, #000 100%)`), drifting clouds, and
glowing stars with a pink→white→pale-yellow radial gradient
(`#ffc8c8 → #e1e1e1 → #ffffc8`). Typeface: **Poiret One**.

**Controls:** mouse click and touch. Audio (ambient music tracks + effects)
starts on the first user gesture; a speaker control mutes/unmutes.

**Tech:** Vite + TypeScript, no runtime framework. Source in [src/](src/),
entry [index.html](index.html). Build with `npm run build` → `dist/`.

### Yandex SDK integration (as implemented)

The SDK lives in [src/yandex.ts](src/yandex.ts), wrapped behind a small class so
the rest of the game never touches the global directly. Key points:

- **Script loading.** `/sdk.js` is injected dynamically at startup rather than
  hard-coded in `<head>`. On the Yandex platform it loads; off-platform (local
  dev, GitHub Pages) it 404s and the wrapper falls back to a no-op
  implementation backed by `localStorage`, so the game stays fully playable.
- **Bootstrap order.** [src/main.ts](src/main.ts) initialises the SDK first,
  publishes the player's language on `window.__GAME_LANG__`, then dynamically
  imports the game module so i18n resolves in the right language from the first
  frame. After the app mounts it calls `ysdk.features.LoadingAPI.ready()`.
- **Best score.** Saved/loaded via `getPlayer({ scopes: false })` →
  `getData(['best'])` / `setData({ best })`, mirrored to `localStorage`.
- **Fullscreen ad.** Shown when the player taps **Retry** after a game over
  (`showFullscreenAdv`), never on the first play. The wrapper resolves on
  close/error/timeout so it never blocks the restart.
- **No rewarded ads.**

### Localization

Russian, Turkish, English. The active language comes from
`ysdk.environment.i18n.lang`, falling back to the `?lang` query param, then the
browser language, then English. Yandex's Russian-adjacent locales (be/kk/uk/uz)
map to `ru`; anything else we don't translate maps to `en`. All UI strings live
in the `I18N` dictionary in [src/i18n.ts](src/i18n.ts) and are applied via
`data-i18n` attributes.

## 2. STORE ASSETS

All assets land in [store/](store/).

**Icon + covers** — generated with Python (Pillow). The script shares
[store/asset_lib.py](store/asset_lib.py) (sky, glowing stars, fonts) and
[store/strings.py](store/strings.py) (localized copy, kept in sync with
`src/i18n.ts`); rendering is deterministic (seeded RNG).

```bash
python3 store/make_assets.py
```

- **Icon** — `icon_512.png`, 512×512 (a glowing-star constellation, no text).
- **Cover** — `cover_<lang>_800x470.png` for ru/en/tr, each with a localized
  slogan.

**Screenshots** — real in-game captures via headless Chrome (not mock-ups), so
they show the actual game. [store/capture_screens.mjs](store/capture_screens.mjs)
drives the built game over the DevTools Protocol — for each language and
platform it shoots the menu, plays a round, and triggers game over.

```bash
npm run screens        # build + start preview + capture all 18 PNGs
```

- `screen_<lang>_<platform>_<n_screen>.png` for each language (ru/en/tr) ×
  platform (desktop 1920×1080, mobile 1080×1920) × screen
  (1_menu / 2_game / 3_over) = 18 PNGs.

## 3. STORE TEXT

SEO description, About, Short description, How to play, Tags and Keywords for
ru/en/tr — with character counts and within all console limits — are in
[store/STORE.md](store/STORE.md).

## 4. PACKAGE

The game is a multi-file build, so the upload archive is the **contents of
`dist/`** (with `index.html` at the root), not a lone HTML file:

```bash
npm run build
cd dist && zip -r ../count-the-stars.zip . && cd ..
```

Upload `count-the-stars.zip` in the console; upload the images and paste the
texts via the listing form.

## Deliverables checklist

- [x] Yandex SDK integrated ([src/yandex.ts](src/yandex.ts)) — lang, best
      score, fullscreen ad, LoadingAPI, graceful off-platform fallback
- [x] Localized (ru/en/tr) with sound + mute (already in the game)
- [x] `count-the-stars.zip` (built from `dist/`)
- [x] `store/icon_512.png`
- [x] `store/cover_{ru,en,tr}_800x470.png`
- [x] `store/screen_{ru,en,tr}_{desktop,mobile}_{1_menu,2_game,3_over}.png`
- [x] Store texts in ru/en/tr ([store/STORE.md](store/STORE.md))
- [x] Asset generators ([store/make_assets.py](store/make_assets.py) for
      icon/covers, [store/capture_screens.mjs](store/capture_screens.mjs) for
      real in-game screenshots)
