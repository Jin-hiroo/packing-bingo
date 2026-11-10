# Changelog

## 0.2.0

### Changed

- Progress is now saved in the browser by default. Without `storageKey`, a card saves its checks in localStorage under a key derived from its items (`packing-bingo:` plus a hash of the emoji and labels), so cards with different item lists keep separate progress, and changing the items starts a fresh card. Pass `storageKey={null}` to turn saving off. Controlled cards still never save, and demo cards only save when given a key.
- When a card is rebuilt, its checks are carried over only if the key it saves under stays the same. This now includes the derived key, so a new item list no longer inherits the old list's checks.

### Docs

- The README is now in Japanese, with a copy-and-paste quick start (an Okinawa school-trip list) for a React component, a Next.js page and a plain HTML page, and a short English section.

## 0.1.1

### Fixed

- The card no longer draws over a fixed or sticky site header. Its confetti, banner and finale screen used z-indexes up to 11 without a stacking context of their own; the card now creates one.
- Saved progress (`storageKey`) now takes priority over `defaultChecked`. Before, `defaultChecked` replaced the saved progress on every mount.
- Changing `storageKey` on a mounted card, for example when switching between students, now loads that key's own progress. Before, the previous key's checks were carried over and saved under the new key.

### Docs

- The README is reorganized for developers adding the component to a site: quick start, recipes, API reference and integration notes.

## 0.1.0 (2026-11-10)

First release: the `<PackingBingo>` React component, the framework-free engine in `packing-bingo/core`, a browser build that defines a global `PackingBingo`, and the standalone `index.html`.
