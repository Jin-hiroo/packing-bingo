# Packing Bingo (持ちものビンゴ)

**A packing checklist for school trips that plays like bingo: stamp each item as it goes in the bag, line them up, and get combos, fanfares and fireworks. One HTML file, no build.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Single HTML file](https://img.shields.io/badge/single%20file-HTML-E34F26?logo=html5&logoColor=white)](index.html)
[![No build step](https://img.shields.io/badge/build%20step-none-brightgreen)](#getting-started)

[Getting started](#getting-started) · [Customize the items](#customize-the-16-items) · [Good to know](#good-to-know) · [日本語](#日本語) · [License](#license)

<p align="center">
  <a href="docs/images/bingo-desktop.png"><img src="docs/images/bingo-desktop.png" alt="A 4×4 bingo card of packing items. A diagonal line has just been completed: a large BINGO! banner, a +100 score popup and confetti are on screen, and the score panel shows 8/16 items, 2 lines and a 2-tap combo." width="560"></a>
</p>

_The second line completes on a two-tap combo: the line is drawn, the BINGO! banner and +100 pop up, and confetti bursts. The UI is in Japanese: 持ちものビンゴ = "Packing Bingo", そろった = "packed", 2ライン目 = "2nd line"._

<p>
  <a href="docs/images/phone-reach.png"><img src="docs/images/phone-reach.png" alt="Phone layout with one line completed and a dashed, pulsing square labeled リーチ (reach) on the last missing item." height="320"></a>
  <a href="docs/images/phone-combo.png"><img src="docs/images/phone-combo.png" alt="Phone layout during a three-tap combo: +20 and +30 popups, 2 COMBO! and 3 COMBO! labels, a draining combo gauge and two リーチ callouts." height="320"></a>
  <a href="docs/images/phone-perfect.png"><img src="docs/images/phone-perfect.png" alt="Phone layout after all 16 items are stamped: a 準備完了 (ready) stamp, the Perfect! card with score 3,410, max combo ×10 and 10 lines, with confetti and falling item emoji." height="320"></a>
</p>

_On a phone, left to right: one line done and a リーチ ("reach") badge on the square that would finish the next one; a three-tap combo; the Perfect! screen with the final score, fireworks and falling item emoji._

## Features

Packing the night before a school trip is a chore. Packing Bingo turns the checklist into a 4×4 bingo card, so every item packed is a stamp, and every few items there's something to celebrate.

- **Packing becomes a game.** The 16 items sit on a 4×4 card. Any row, column or diagonal is a bingo, for 10 possible lines.
- **There's always a next goal.** A square that would complete a line pulses and gets a リーチ ("reach") badge, and the footer names the item that would finish it.
- **Every tap gives feedback.** Each stamp comes with a ripple and sparks. Taps less than 2.5 s apart chain into a combo, with a rising note on each tap and a draining combo gauge.
- **The score rewards finishing.** An item is worth 10 points × the current combo the first time it's stamped. Completing n lines at once adds 100 × n² points, and the first full card adds a 1000-point bonus. Unchecking and re-checking adds nothing.
- **Finishing gets a real finale.** Stamping all 16 plays a "ready" stamp slam, fireworks and falling item emoji, then counts up the score, max combo and lines.
- **Sound needs no audio files.** All effects are synthesized with the Web Audio API. The 🔊 toggle mutes them, and the choice is remembered in the browser.
- **It's considerate by default.** Squares are real checkboxes, so the keyboard works. `prefers-reduced-motion` turns off particles, shaking and bouncing. Phones get their own layout, and Android phones vibrate on bingo.
- **There's nothing to install.** Everything is in `index.html`, with no build step and no JavaScript dependencies. Fonts come from Google Fonts and fall back to system fonts offline.

## Getting started

You only need a current web browser.

```sh
git clone https://github.com/Jin-hiroo/packing-bingo.git
cd packing-bingo
open index.html        # macOS; on other systems, open the file in a browser
```

The card starts empty, ready for real use. Add `?demo` to the URL to start part-way through and show the demo buttons: "▶ ビンゴを見る" plays a bingo, and "▶ コンボ → パーフェクト" plays a combo run to a full card.

To share it with a class, put `index.html` on any static host. On GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.

## Customize the 16 items

The items are the `I` array near the top of the script in `index.html`. Each entry is `[emoji, label]`, listed row by row from the top left:

```js
const I=[["📖","旅のしおり"],["🪪","生徒手帳"],["🏥","保険証コピー"],["👛","おこづかい"],
         ["👕","着替え"],   ["🌙","パジャマ"],  ["🧥","上着"],        ["🪥","洗面用具"],
         /* … */ ];
```

Keep exactly 16 entries, because the card and its 10 lines assume a 4×4 grid. On narrow screens, labels wrap after a `・`, so `常備薬・酔い止め` breaks as 常備薬・ / 酔い止め. To change the title or the 修学旅行 tag, edit the HTML in the `.head` block.

## Good to know

- **Checks aren't saved.** Reloading the page clears the card. Only the mute setting is stored.
- **Emoji look different on each system**, because they come from the device's emoji font.
- **Vibration works only where the Vibration API exists**, which in practice means Android browsers. iPhones don't vibrate.
- **Testing so far:** clicks and taps were automated in Chromium at desktop and phone sizes. Safari, Firefox and real phones haven't been tried yet, and the sound hasn't been checked on a real device.

## 日本語

修学旅行の持ち物チェックリストを、4×4のビンゴにしたものです。持ち物を入れるたびにマスをタップしてスタンプを押し、タテ・ヨコ・ナナメがそろうとビンゴになります。コンボ・スコア・効果音・花火で、前の晩の荷造りを少し楽しくします。`index.html` を開くだけで動き、`?demo` を付けると途中まで埋まった状態とデモ用のボタンが出ます。持ち物は `index.html` の `I` の配列（16個）を書き換えて変更できます。

## License

[MIT](LICENSE) © 2026 Jin-hiroo.

The Dela Gothic One and M PLUS Rounded 1c fonts are loaded from Google Fonts and are licensed under the SIL Open Font License. They aren't included in this repository.
