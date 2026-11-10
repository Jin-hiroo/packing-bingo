# Packing Bingo (持ちものビンゴ)

**A React component that turns a school-trip packing checklist into a 4×4 bingo card: students stamp each item as it goes in the bag, complete lines, and get combos, fanfares and fireworks. One component, no runtime dependencies, safe to render on the server.**

[![npm version](https://img.shields.io/npm/v/packing-bingo?logo=npm)](https://www.npmjs.com/package/packing-bingo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React 18 or later](https://img.shields.io/badge/React-%E2%89%A518-61DAFB?logo=react&logoColor=black)](#at-a-glance)
[![TypeScript types included](https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript&logoColor=white)](#api)
[![Standalone single HTML file](https://img.shields.io/badge/standalone-single%20HTML%20file-E34F26?logo=html5&logoColor=white)](#standalone-page)

[Quick start](#quick-start) · [Recipes](#recipes) · [API](#api) · [Integration notes](#integration-notes) · [Without React](#without-react) · [日本語](#日本語) · [Changelog](CHANGELOG.md)

<p align="center">
  <a href="docs/images/bingo-desktop.png"><img src="docs/images/bingo-desktop.png" alt="A 4×4 bingo card of packing items. A diagonal line has just been completed: a large BINGO! banner, a +100 score popup and confetti are on screen, and the score panel shows 8/16 items, 2 lines and a 2-tap combo." width="560"></a>
</p>

_The second line completes on a two-tap combo: the line is drawn, the BINGO! banner and +100 pop up, and confetti bursts. The default UI is Japanese: 持ちものビンゴ = "Packing Bingo", そろった = "packed", 2ライン目 = "2nd line". An English text set is included._

<p>
  <a href="docs/images/phone-reach.png"><img src="docs/images/phone-reach.png" alt="Phone layout with one line completed and a dashed, pulsing square labeled リーチ (reach) on the last missing item." height="320"></a>
  <a href="docs/images/phone-combo.png"><img src="docs/images/phone-combo.png" alt="Phone layout during a three-tap combo: +20 and +30 popups, 2 COMBO! and 3 COMBO! labels, a draining combo gauge and two リーチ callouts." height="320"></a>
  <a href="docs/images/phone-perfect.png"><img src="docs/images/phone-perfect.png" alt="Phone layout after all 16 items are stamped: a 準備完了 (ready) stamp, the Perfect! card with score 3,410, max combo ×10 and 10 lines, with confetti and falling item emoji." height="320"></a>
</p>

_On a phone, left to right: one line done and a リーチ ("reach") badge on the square that would finish the next one; a three-tap combo; the Perfect! screen with the final score, fireworks and falling item emoji._

## What it does

Packing the night before a school trip is a chore. Packing Bingo puts the 16 items on a bingo card, so every packed item is a stamp, and every few items there's something to celebrate.

- **Every tap gets feedback.** A stamp, a ripple, sparks and a rising note. Taps less than 2.5 s apart chain into a combo.
- **There's always a next goal.** A square that would complete a line pulses with a リーチ ("reach") badge, and the status line names the item.
- **Lines and the full card are celebrated.** Any row, column or diagonal (10 lines in all) is a bingo, with a banner and confetti. Stamping all 16 plays a finale with fireworks and a score card.
- **Points reward finishing,** not tapping on and off. See [Scoring](#scoring).
- **It's considerate by default.** Squares are real checkboxes, so the keyboard works. `prefers-reduced-motion` is respected. The sound is synthesized (no audio files) and can be muted.

## At a glance

| Area | Details |
| --- | --- |
| Install | `npm install packing-bingo`: ESM and CommonJS, TypeScript types included |
| Requires | React 18 or later and `react-dom`. No other dependencies, no CSS import, no provider |
| Size | About 13 kB minified and gzipped, CSS included (React not counted) |
| Server rendering | Ships with `"use client"`. On the server it renders an empty `<div>`, and the card is built after mount |
| Styling | Injects one `<style>` into `<head>`. Every class is prefixed `pkb-`. Themable with CSS variables, and it sizes itself to its container |
| Network | Loads two fonts from Google Fonts, unless you pass `fonts={false}` |
| Storage | localStorage, only for `storageKey` progress and the mute setting |
| Browsers | Chrome and Edge 105+, Safari 16+, Firefox 121+. Only tested in Chromium so far ([details](#browser-support-and-testing)) |

## Quick start

```sh
npm install packing-bingo        # or: pnpm add packing-bingo / yarn add packing-bingo
```

```tsx
import { PackingBingo } from "packing-bingo";

export default function PackingPage() {
  return <PackingBingo storageKey="kyoto-trip-2026" />;
}
```

That's the whole setup. The card fills the width of its container, up to 720 px. With `storageKey`, each student's checks are saved in their browser, so they can close the page and come back.

**Next.js App Router:** you can use the component straight from a Server Component page, as above, including `items` and `messages={en}`. Functions you write can't cross from a Server Component to a Client Component, though, so callbacks like `onChange` or `onBingo` stop the build with "Event handlers cannot be passed to Client Component props". For those, wrap the card in your own client component:

```tsx
// app/packing/PackingCard.tsx
"use client";

import { PackingBingo } from "packing-bingo";

export function PackingCard() {
  return <PackingBingo storageKey="kyoto-trip-2026" onBingo={(e) => console.log(e)} />;
}
```

## Recipes

### Your own items and text

```tsx
import { PackingBingo, en, type BingoItem } from "packing-bingo";

const items: BingoItem[] = [
  { emoji: "🛂", label: "Passport" },
  { emoji: "🎫", label: "Tickets" },
  // … exactly 16 items, row by row from the top left
];

<PackingBingo items={items} messages={en} title="Kyoto Trip" tag="Class 2-B" storageKey="kyoto-2b" />;
```

- `items` needs exactly 16 entries. Any other count throws `[packing-bingo] "items" must have exactly 16 entries`.
- `messages` is merged over the Japanese defaults, so `messages={{ reset: "Start over" }}` changes just that label. `en` is a complete English set. See [Messages](#messages) for every key.
- On narrow cards, labels wrap after a `・`, so `常備薬・酔い止め` breaks as 常備薬・ / 酔い止め.

### Save progress on your server

`storageKey` saves progress in one browser. To make progress follow a student to another device, keep the checks in your own state and pass them as `checked`, which makes the card controlled:

```tsx
import { useEffect, useState } from "react";
import { PackingBingo } from "packing-bingo";

export function PackingCard({ studentId }: { studentId: string }) {
  const [checked, setChecked] = useState<boolean[] | null>(null);

  useEffect(() => {
    setChecked(null);
    fetch(`/api/packing/${studentId}`)
      .then((res) => res.json())
      .then((data) => setChecked(data.checked ?? Array(16).fill(false)));
  }, [studentId]);

  if (!checked) return null; // or a placeholder

  return (
    <PackingBingo
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        fetch(`/api/packing/${studentId}`, { method: "PUT", body: JSON.stringify({ checked: next }) });
      }}
    />
  );
}
```

How a controlled card behaves:

- A tap doesn't change the card by itself. It calls `onChange` with the 16 booleans the user asked for, and the card follows when `checked` changes. If you don't update `checked`, the tap is undone.
- When `checked` changes by exactly one item, the card plays it like a tap: stamp, sound, and any bingo or finale. A bigger change, such as data arriving from your server, is applied quietly, with no fanfare and no bonus for lines completed at once.
- The reset button calls `onChange` with 16 `false` values.
- `storageKey` is ignored.

### React to bingos

```tsx
<PackingBingo
  storageKey="kyoto-trip-2026"
  onBingo={({ newLines, totalLines, score }) => analytics.track("bingo", { totalLines, score })}
  onPerfect={({ score, maxCombo }) => analytics.track("perfect", { score, maxCombo })}
/>
```

- `onBingo` fires when a tap completes one or more lines. On the tap that completes the whole card, `onPerfect` fires instead.
- `onChange` fires only for what the user does: a tap, the reset button, or `ref.reset()`. Changes you make through `checked` or `ref.setChecked()` don't trigger it.
- `onBingo` and `onPerfect` fire whenever a change plays like a tap, including a one-item change of `checked`. Quiet updates and the first render fire nothing.
- `onChange` runs first, then `onBingo` or `onPerfect`, after the card has updated. You can reset or unmount the card from inside any of them.

### Control the card from outside

```tsx
import { useRef } from "react";
import { PackingBingo, type PackingBingoHandle } from "packing-bingo";

function PackingPage() {
  const card = useRef<PackingBingoHandle>(null);
  return (
    <>
      <button onClick={() => card.current?.reset()}>Start over</button>
      <PackingBingo ref={card} storageKey="kyoto-trip-2026" />
    </>
  );
}
```

The handle has `reset()`, `setChecked()` and `getState()`. See [Ref handle](#ref-handle). With a controlled card, change `checked` instead of calling `setChecked()`.

### Theme and layout

Set any of these CSS variables on the component or an ancestor:

| Variable | Used for | Default |
| --- | --- | --- |
| `--pkb-sun` | Board background | `#FFD54F` |
| `--pkb-ink` | Lines, borders and text | `#2A1F14` |
| `--pkb-paper` | Squares | `#FFFDF6` |
| `--pkb-red` | Stamps and accents | `#E8473B` |
| `--pkb-mint` | Completed lines | `#BDEBD2` |
| `--pkb-font-fallback` | Font used before or instead of the display fonts | `sans-serif` |

```tsx
<PackingBingo style={{ "--pkb-sun": "#9AD0F5" } as React.CSSProperties} />
```

The card takes the full width of its container, up to 720 px, and centers itself. When its container is narrower than 560 px, it switches to a compact layout. This uses a container query, so the compact layout also kicks in inside a narrow sidebar on a wide screen. The height follows from the width. Because the server renders an empty `<div>`, the card appears after hydration; if layout shift matters, give its wrapper a `min-height`.

## API

### Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `items` | `readonly BingoItem[]` (exactly 16) | `DEFAULT_ITEMS` (Japanese school-trip list) | The squares, row by row: `{ emoji, label }` |
| `messages` | `Partial<Messages>` | `ja` | UI text, merged over the Japanese defaults. `en` is included |
| `title`, `tag`, `subtitle` | `string` | from `messages` | The heading, the small label above it, and the line below it |
| `storageKey` | `string` | none | Save the checks in localStorage under this key. Uncontrolled cards only |
| `defaultChecked` | `readonly boolean[]` (16) | all `false` | Initial checks of an uncontrolled card, used when nothing is saved under `storageKey` |
| `checked` | `readonly boolean[]` (16) | none | Makes the card controlled. See [Save progress on your server](#save-progress-on-your-server) |
| `onChange` | `(checked: boolean[]) => void` | none | The user tapped or reset. For a controlled card, this is the requested state |
| `onBingo` | `(event: BingoEvent) => void` | none | A tap completed one or more lines |
| `onPerfect` | `(event: PerfectEvent) => void` | none | A tap completed the card |
| `sound` | `boolean` | `true` | Initial sound setting, until the user picks one with the 🔊 button |
| `fonts` | `boolean` | `true` | Load Dela Gothic One and M PLUS Rounded 1c from Google Fonts |
| `demo` | `boolean` | `false` | Pre-fill six items (when nothing is saved) and show demo buttons |
| `className`, `style` | | none | Applied to the wrapper `<div>` |
| `ref` | `Ref<PackingBingoHandle>` | none | See [Ref handle](#ref-handle) |

Props are compared by value, so inline arrays and objects are fine. When the content of `items`, `title`, `tag`, `subtitle`, `storageKey`, `sound`, `fonts`, `demo` or the text in `messages` changes, the card is rebuilt. The checks are kept, unless `storageKey` changed, in which case the card loads that key's own progress. The score is then recomputed, as described in [Scoring](#scoring). Message functions can use your props or state: when `messages` changes, the status line is redrawn without a rebuild.

### Events

```ts
interface BingoEvent {
  newLines: number[]; // lines completed by this tap, as indices into LINES
  totalLines: number; // lines completed so far
  score: number;      // score after this tap
}

interface PerfectEvent {
  score: number;      // final score, including the 1000-point bonus the first time
  maxCombo: number;
}
```

### Ref handle

```ts
interface PackingBingoHandle {
  /** Same as the reset button: clears the card and score, and calls onChange. A controlled card only calls onChange. */
  reset(): void;
  /** A one-item change plays like a tap; bigger changes apply quietly. Doesn't call onChange. */
  setChecked(checked: readonly boolean[]): void;
  /** null before mount and on the server. */
  getState(): PackingBingoState | null;
}

interface PackingBingoState {
  checked: boolean[]; // 16 booleans, row by row
  lines: number[];    // completed lines, as indices into LINES
  score: number;
  maxCombo: number;
  complete: boolean;  // all 16 checked
}
```

`LINES` is exported. Its entries 0–3 are the rows, 4–7 the columns, 8 the diagonal from the top left, and 9 the diagonal from the top right.

### Scoring

- An item checked for the first time scores 10 × the current combo. A combo is a chain of taps less than 2.5 s apart.
- Completing n lines with one tap scores 100 × n². Each line scores only once.
- Completing the card for the first time adds 1000.
- Unchecking never takes points away, and checking an item again earns nothing.
- After a quiet update or a rebuild (loading saved progress, for example), the score is recomputed as 10 per checked item plus 100 per completed line, and the max combo starts again from 0.

### Messages

`messages` accepts any subset of these keys. The full Japanese and English sets are `ja` and `en` in [`src/messages.ts`](src/messages.ts).

- **Text:** `title`, `tag`, `subtitle`, `packed`, `bingo`, `score`, `reset`, `soundOn`, `soundOff`, `stamp`, `reachBadge`, `reachPop`, `bannerSingle`, `bannerDouble`, `bannerTriple`, `statusDone`, `perfectTag`, `perfectStamp`, `perfectTitle`, `perfectBody`, `statScore`, `statCombo`, `statLines`, `close`, `demoLabel`, `demoBingo`, `demoPerfect`, `demoRestore`. In `perfectStamp` and `perfectBody`, `\n` starts a new line.
- **Functions:** `combo(n)`, `comboPop(n)`, `bannerNth(totalLines)`, `bannerMulti(newLines)`, `statusStart(left)`, `statusLines(lines, left)`, `statusReach(labels)`, `perfectBonus(points)`. Each returns a string.

### Exports

- `packing-bingo`: `PackingBingo`, `createPackingBingo`, `LINES`, `DEFAULT_ITEMS`, `ja`, `en`, and the types `PackingBingoProps`, `PackingBingoHandle`, `PackingBingoState`, `BingoItem`, `BingoEvent`, `PerfectEvent`, `Messages`, `PackingBingoOptions`, `PackingBingoInstance`.
- `packing-bingo/core`: the same without the React component, so it doesn't import React.

## Integration notes

### What the card adds to your page

On first mount, the card appends `<style id="pkb-styles">` to `<head>`, shared by every card and left in place after unmount. Unless `fonts={false}`, it also appends `<link id="pkb-fonts">` for Google Fonts. All CSS is scoped under `.pkb`, and every class and keyframe name starts with `pkb-`, so the rest of your page is left alone.

Everything the card draws (the confetti canvas, the banner, the finale screen) stays inside the card's own box. Nothing is `position: fixed` or attached to `<body>`, and the card is its own stacking context, so a sticky site header stays on top of it.

### Content Security Policy

The injected `<style>` and a few inline `style` attributes need `style-src 'unsafe-inline'`. With fonts on, also allow `https://fonts.googleapis.com` in `style-src` and `https://fonts.gstatic.com` in `font-src`.

### Fonts

The card uses Dela Gothic One and M PLUS Rounded 1c. With `fonts={false}`, nothing is requested from Google. If your site already loads fonts with those family names (self-hosted, for example), the card uses them. Otherwise it falls back to `--pkb-font-fallback`.

### Sound and vibration

Sound is synthesized with the Web Audio API. The audio context is only created after the user has interacted with the page, so the browser shows no autoplay warnings. The 🔊 button's choice is stored in localStorage as `packing-bingo-muted` and applies to every card on your site. Taps and bingos vibrate where the Vibration API exists, which in practice means Android browsers.

### Saved data

With `storageKey`, the checks are stored under that key as a JSON array of 16 booleans. The score isn't stored. Saved progress takes priority over `defaultChecked`. If two cards on one page should keep separate progress, give each its own key. Blocked storage, as in some private browsing modes, is handled: the card just doesn't save.

### Accessibility

Each square is a native checkbox inside a `<label>`, so Tab and Space work and the item name is the accessible name. The emoji and the stamp are hidden from assistive technology. The status line is a polite live region. With `prefers-reduced-motion`, shaking, bouncing and particles are turned off. It hasn't been tested with a screen reader yet.

### Browser support and testing

The card uses CSS container queries (Chrome and Edge 105+, Safari 16+, Firefox 110+) and `:has()` for the keyboard focus ring (Firefox 121+).

Tested so far:

- React 19 in StrictMode, with three cards on one page, controlled and uncontrolled
- Server rendering with `renderToString`, ESM and CommonJS
- A Next.js 16 App Router production build, using the card from a Server Component page and from a client component
- Installing from npm with npm and pnpm
- Taps scripted in Chromium at desktop and phone sizes, including resets and callbacks that land mid-celebration

These scripted browser tests aren't part of this repository yet. Safari, Firefox and real phones haven't been tried, and the sound hasn't been checked on a real device. Emoji come from each device's emoji font, so they look different on each system.

## Without React

The engine has no framework dependency:

```ts
import { createPackingBingo } from "packing-bingo/core";

const card = createPackingBingo(document.getElementById("bingo")!, {
  storageKey: "trip",
  onBingo: (e) => console.log(e),
});
// card.reset(), card.getState(), card.setChecked(next, { animate: true }), card.destroy()
```

It takes the same options as the React props, except that a controlled card is `controlled: true` plus `setChecked()`. Without `{ animate: true }`, `setChecked()` always applies quietly.

Without a bundler, load the browser build from a CDN. It defines a global `PackingBingo`:

```html
<div id="bingo"></div>
<script src="https://cdn.jsdelivr.net/npm/packing-bingo@0.1/dist/packing-bingo.global.js"></script>
<script>
  PackingBingo.createPackingBingo(document.getElementById("bingo"), { storageKey: "trip" });
</script>
```

## Standalone page

`index.html` is the whole app in one file, so you can open it directly or put it on any static host. It saves progress in the browser.

```sh
git clone https://github.com/Jin-hiroo/packing-bingo.git
cd packing-bingo
open index.html        # macOS; on other systems, open the file in a browser
```

Add `?demo` to the URL to start part-way through and show the demo buttons: "▶ ビンゴを見る" plays a bingo, and "▶ コンボ → パーフェクト" plays a combo run to a full card. On GitHub Pages, use **Settings → Pages → Deploy from a branch → `main` / root**.

To change the page, edit the options in its last `<script>`, which calls `PackingBingo.createPackingBingo(…)`. To change the defaults for every build, edit `src/items.ts` or `src/messages.ts` and run `npm run build`.

## Development

```sh
npm install          # also builds dist/ and index.html
npm run build        # dist/ (ESM, CJS, types, browser bundle) and the standalone index.html
npm run typecheck
```

`index.html` is generated from `src/` by `scripts/build-standalone.mjs`, so don't edit it by hand.

## 日本語

修学旅行の持ち物チェックリストを4×4のビンゴにする、Reactのコンポーネントです。持ち物をかばんに入れるたびにマスをタップしてスタンプを押し、タテ・ヨコ・ナナメがそろうとビンゴになります。

```sh
npm install packing-bingo
```

```tsx
import { PackingBingo } from "packing-bingo";

<PackingBingo storageKey="kyoto-trip-2026" />;
```

- React 18以上で動きます。ほかに依存するパッケージはなく、CSSの読み込みも要りません。
- `storageKey` を付けると、チェックがその人のブラウザ（localStorage）に保存されます。
- 持ち物は `items`（ちょうど16個）で、文言は `messages` で変えられます。英語の文言は `en` です。
- 自分のサーバーに保存したいときは、`checked` と `onChange` を使って親側で状態を持ちます（[Save progress on your server](#save-progress-on-your-server)）。
- Next.jsのApp Routerでは、Server Componentのページにそのまま置けます（`items` や `messages={en}` も渡せます）。ただし、`onChange` などのコールバックは渡せないので、使うときは `"use client"` を付けた自分のコンポーネントで包んでください。
- 配色はCSS変数（`--pkb-sun` など）で変えられます。Google Fontsを読み込みたくないときは `fonts={false}` にします。
- CSP（Content Security Policy）を設定している場合は、`style-src 'unsafe-inline'` が必要です。

詳しい仕様は [API](#api) と [Integration notes](#integration-notes) にあります。

## License

[MIT](LICENSE) © 2026 Jin-hiroo.

The Dela Gothic One and M PLUS Rounded 1c fonts are loaded from Google Fonts and are licensed under the SIL Open Font License. They aren't included in this repository.
