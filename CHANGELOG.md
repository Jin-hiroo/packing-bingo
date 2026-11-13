# Changelog

## 0.4.0 (2026-11-13)

### Added

- A 🔀 shuffle button (`shuffle`, on by default) moves the items to random squares, with the squares flying to their new places. Checks move with their items and the score does not change: lines a shuffle happens to complete count as complete but earn no points, and a line's points are now tied to its items, so shuffling can't earn them twice. The arrangement is saved under `"packing-bingo-order:"` + the storage key, and the reset button puts the items back. `shuffle()` on the instance and the React ref does the same as the button, `getState().order` gives the item in each square, and `defaultOrder` sets the starting arrangement.
- Taps give haptic feedback on iPhone (iOS 18 and later): the hidden checkbox in each square has the `switch` attribute (with `role="checkbox"`), which Safari answers with the system tap haptic. Not yet checked on a real iPhone.
- `vibrate` (default true) turns all vibration off when false.

### Changed

- TypeScript: `Messages.shuffle` and `PackingBingoState.order` are new required fields. Update full message objects and state mocks when upgrading; partial `messages` overrides continue to use the defaults.
- The default card no longer shows the school-trip tag or the reach status sentence, in either Japanese or English. Empty tags leave no badge behind. Set `tag` or `messages.statusReach` to supply your own text.
- On Android, a tap now buzzes for 18 ms (was 12 ms), unchecking buzzes for 8 ms, and a shuffle has its own pattern.
- The footer wraps: on narrow cards the status line takes its own row above the shuffle and reset buttons.

- The card no longer loads its fonts from Google Fonts, so it makes no network requests and its code contains no external URLs (Socket flagged the font URL as "URL strings"). To keep the look, add one line to the page's `<head>`: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=M+PLUS+Rounded+1c:wght@500;800&display=swap" />`. Without it, body text uses Hiragino Maru Gothic on Apple devices, and headings (and body text elsewhere) use `--pkb-font-fallback`. Sites with a Content Security Policy no longer need to allow Google's font hosts unless they add that line.
- `fonts` is deprecated and ignored. Code that passes `fonts={false}` still compiles and behaves as before, and changing it no longer rebuilds a React card.

### Fixed

- Unchecking a previously packed item, shuffling and checking it again cannot earn points for new combinations of already packed items. Lines containing an item never packed before that shuffle can still earn their first reward.
- Reset saves the original arrangement too, so a custom `defaultOrder` cannot reappear on the next page load.

### Docs

- The README quick start, the 「フォント」 section, the CDN snippet, the demo site's embed code and all three example projects show the font `<link>`. The standalone `index.html` and the demo site load the fonts themselves, so they look the same as before.

## 0.3.0

### Added

- Cards of any size from 2×2 to 10×10. Pass `size`, or let the number of `items` decide it (9 → 3×3, 25 → 5×5). Without `items`, a 2×2 or 3×3 card uses the first default items. Labels, emoji, stamps, gaps and the bingo lines scale with the squares, and on a 4×4 card everything keeps its size.
- `free` makes the center of an odd-sized card a FREE square: stamped from the start, not tappable, and not one of the items. The lines through it need one item fewer. `items`, `checked`, `defaultChecked` and `onChange` then have size² − 1 entries, and the saved progress skips it too. Its text is the new message key `free` (`FREE`).
- `bingoLines(size, free)` returns the winning lines of any card as item indices. `getState()` now also returns `size` and `free`.
- `perfectBody` may be a function of the number of items; `ja` and `en` use one, so the perfect screen says 「9こ ぜんぶそろった！」 on a 3×3 card.
- The demo site has a size slider (2×2 to 10×10) and a FREE switch for odd sizes, and shows the matching code.

### Changed

- New default items (`DEFAULT_ITEMS`), taken from a school's packing list: wallet, phone, power bank, health form, My Number or insurance card, trip booklet, mask, handkerchief, medicine, plastic bags, work gloves, headlamp, school tracksuit, rain gear, towel and sunscreen. Cards that use the default items and no `storageKey` start fresh, because their saved-progress key is derived from the items.
- Cleaner default card: no subtitle under the title (「タップでスタンプ。タテ・ヨコ・ナナメでビンゴ！」) and no status line before the first line is complete (「のこり 16 こ。まずは1ラインそろえよう」), in both `ja` and `en`. Pass `subtitle` or `messages.statusStart` to show them again. An empty `subtitle` no longer leaves an empty line in the header.
- Item lists that don't fill a square now fail with a message that names the counts that work, instead of always asking for exactly 16.

### Fixed

- On narrow screens the card no longer spills out of its frame. Long labels (such as 「マイナカード または保険証」) used to widen the grid, so on phones the fourth column was cut off and the bottom row covered the footer. The four columns now always share the card's width, and cards narrower than 400 px and 320 px get tighter spacing and smaller labels.
- Between 560 px and about 620 px wide, the title no longer breaks in the middle (「持ちものビ / ンゴ」): the score pills move below it instead.
- On phones, 「PERFECT BONUS」 and the 「MAX COMBO」 label on the perfect screen fit inside the card.

### Docs

- The README screenshots are retaken with the current default items and look, and the 「マスの数を変える」 section has a 5×5 + FREE screenshot.
- The quick start places the package's own `<PackingBingo />` instead of a wrapper component named `OkinawaPackingBingo`, and then shows how to pass your own `items`. The Next.js and Vite examples pass the same 16 items to `<PackingBingo items={items} />` directly, and nothing refers to Okinawa any more. `<PackingBingo />` without `items` shows the same list and saves under the same key as the old wrapper, so cards built from the old quick start keep their progress.
- The README quick start, the demo site and the example projects use the same 16 items as the new default.
- The README explains how to mark where a long label without `・` may wrap.
- A demo site on GitHub Pages (https://jin-hiroo.github.io/packing-bingo/), built from `site/` by a workflow on every push to `main`. Its embed code is taken from the README's quick start.
- Runnable example projects in `examples/`: Next.js (App Router), Vite + React, and plain HTML.
- The package's `homepage` points to the demo site.

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
