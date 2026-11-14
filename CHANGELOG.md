# Changelog

## 0.6.0 (2026-11-15)

### Added

- Start screen: each game begins with a see-through dark layer over the whole card (the same as the results screen), with one panel that asks "Are you ready?" and lists the volume and Android Do Not Disturb reminders; the sound button stays usable above it. A tap (or Enter/Space) counts down 3, 2, 1 with beeps and Android vibration, then shows START! and starts a stopwatch next to the sound button. The stopwatch stops when the card is complete, and the perfect card shows the finishing time. `PerfectEvent.time` and `PackingBingoState.time` report it in milliseconds. Reset returns to the start screen. `ready: false` hides the start screen; the stopwatch then starts on the first tap. Demo buttons skip the countdown.
- `uncheck` option (default `false`): `uncheck: true` lets a second tap, click or Space on a stamped square take the stamp off, as in 0.5.0.
- Speed bonus with no ceiling: a timed first clear adds 1000 points per item per second (16 items in 20 s: 800; in 10 s: 1,600), so a faster run always scores higher. It floats up as SPEED BONUS on the perfect card, `PerfectEvent.speedBonus` reports it, and `speedBonus(items, ms)` is exported.
- Optional message keys `speedBonus`, `readyTitle`, `readyPrompt`, `readyTap`, `readyGo`, `time` and `statTime`.
- Infinite mode: a "通常 | ∞ 無限" (Normal | ∞ Infinite) switch in the header turns the card into an endless game on the same squares. Each completed line flips over and clears about a second after its bingo, so its squares and the line score again; the BINGO count keeps every line of the game, and there is no perfect card. The infinite game is never saved, calls no `onChange` (also on a controlled card), and leaves the packing checks alone: `setChecked` and controlled `checked` update them while it is shown, and switching back restores them and their arrangement. Each switch starts a new game. Reset restarts the infinite game.
- Mode switch takeover: choosing ∞ sweeps a dark sky over the whole card with a spinning rainbow aurora, a rainbow ∞, INFINITE, a light beam and twinkling stars, a rising chime and an Android vibration; choosing Normal slams down an OK stamp. In the infinite mode the switch's thumb, the card's border and the start screen's panel turn rainbow, and the start screen shows an ∞ badge and the rule. The switch stays above the start screen, and the arrow keys move between its two choices. Reduced motion fades instead.
- Infinite mode finish: a rainbow 🏁 FINISH button (only in the infinite mode, enabled while a game is running) ends the game. A due clear settles first, the stopwatch stops, and a rainbow-bordered results card opens at once with an ∞ medal, the time played, and SCORE, MAX COMBO and BINGO (lines completed) counting up, with a fanfare, confetti, three fireworks and an Android vibration. "Play again" starts a new infinite game; after closing, the finished board stays dimmed and locked (squares and shuffle) until reset or a mode switch. `onFinish` reports `{ score, maxCombo, lines, time }`; `finish()` on the instance and the React ref does the same as the button; `PackingBingoState.finished`; the `FinishEvent` type; optional message keys `finish`, `finishTitle`, `finishStamp`, `finishTime` and `again`.
- Options `mode` (`"normal"` or `"infinite"`), `modeSwitch` (default `true`) and `onModeChange`; `setMode()` on the instance and the React ref (in React, changing `mode` switches the live card); `PackingBingoState.mode`, `.cleared` and `.packing` (the packing card's checks and arrangement while the infinite mode is shown); `BingoEvent.mode`; the `BingoMode` type; optional message keys `modeLabel`, `modeNormal`, `modeInfinite`, `normalTitle`, `normalSub`, `infiniteTitle`, `infiniteSub` and `infiniteRule`.

### Changed

- A stamped square now stays stamped: tapping, clicking or pressing Space on it again does nothing, and controlled cards get no `onChange` for it. Stamped squares get `aria-readonly="true"` and lose the pressed look. `reset()`, `setChecked` and controlled `checked` can still clear them. Pass `uncheck: true` for the 0.5.0 behavior.
- The default `ja` and `en` messages leave the status line under the card (`statusLines`, `statusDone`) and the perfect card's body (`perfectBody`) empty, so neither is shown. Pass them in `messages` to bring them back.
- The start screen replaces the 0.5.0 first-play dialog. `playTitle`, `playStart` and `playSkip` are deprecated and ignored; `soundHint` and `vibrationHint` now appear on the start screen.
- TypeScript: `PackingBingoState` has the new required fields `time`, `mode`, `cleared`, `finished` and `packing`; `BingoEvent` has `mode`; `PerfectEvent` has `time` and `speedBonus`. Update state and event mocks when upgrading. All new `Messages` keys are optional.

### Fixed

- The results card takes keyboard focus as it opens. Its fade-in kept it hidden for the first frame, so the focus was dropped (it only landed after switching apps and back).

## 0.5.0 (2026-11-13)

### Added

- A first-play dialog reminds players to turn up the volume and disable Android Do Not Disturb. It appears on the first square interaction once per page and can be dismissed with either button or Escape. Customize its optional message keys `soundHint`, `vibrationHint`, `playTitle`, `playStart` and `playSkip`; set both hints to empty strings to hide it.
- Unit and Chromium browser regression tests (`npm test`, `npm run test:browser`).

### Changed

- Android haptics are longer: ordinary taps last 90 ms and combo rhythms build at 3, 6 and 9 taps. Single, double and triple-or-more bingo each have a distinct pattern. Perfect cards finish with an approximately five-second rhythm synchronized with the stamp, seven fireworks and their booms, ending in a longer final hit. Each individual pattern has at most nine entries. Actual vibration strength and availability depend on the device, OS and browser; iPhone retains only its system switch-tap haptic.
- Reduced motion affects visual animations without shortening vibration; `vibrate={false}` explicitly disables haptics.
- Stamps have a stronger impact and rebound, with larger bursts at higher combos and a more percussive tap sound.

### Fixed

- Delayed firework beats cannot override a newer tap, shuffle, or another card's vibration. Reset, undoing a line, hiding the page and destroying a card cancel its pending feedback.
- Muting stops current and scheduled sounds, and active sounds release over 10 ms to avoid an abrupt cut.
- The combo label stays visible between rapid taps while its timer restarts. Winning-line hops no longer cut off the tapped square's stamp animation.
- Switching apps or locking the phone preserves Perfect results and settles their counters, including when the result was still waiting to appear. Returning restores focus to Close; dismissed results stay dismissed.

### Docs

- CDN and example-package references now use 0.5 so new integrations receive the current feedback behavior.

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
