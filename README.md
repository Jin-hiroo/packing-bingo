# 持ちものビンゴ（Packing Bingo）

**修学旅行の持ち物チェックリストを、4×4のビンゴにするReactコンポーネントです。持ち物をかばんに入れるたびにマスをタップしてスタンプを押し、タテ・ヨコ・ナナメがそろうと、コンボ・ファンファーレ・花火で盛り上がります。進み具合は各自のブラウザに自動で保存されます。**

[![npm version](https://img.shields.io/npm/v/packing-bingo?logo=npm)](https://www.npmjs.com/package/packing-bingo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React 18 or later](https://img.shields.io/badge/React-%E2%89%A518-61DAFB?logo=react&logoColor=black)](#概要)
[![TypeScript types included](https://img.shields.io/badge/types-TypeScript-3178C6?logo=typescript&logoColor=white)](#api)
[![Standalone single HTML file](https://img.shields.io/badge/standalone-single%20HTML%20file-E34F26?logo=html5&logoColor=white)](#単体のページ)

[クイックスタート](#クイックスタート) · [使い方の例](#使い方の例) · [API](#api) · [組み込むときの注意](#組み込むときの注意) · [Reactなしで使う](#reactなしで使う) · [English](#english) · [変更履歴](CHANGELOG.md)

<p align="center">
  <a href="docs/images/bingo-desktop.png"><img src="docs/images/bingo-desktop.png" alt="持ち物が並んだ4×4のビンゴカード。ナナメの列がそろった瞬間で、大きなBINGO!の文字、+100の得点、紙吹雪が出ている。上の欄には8/16、2ライン、2コンボと表示されている。" width="560"></a>
</p>

_2コンボで2列目がそろったところ。列に線が引かれ、BINGO!と+100が出て、紙吹雪が舞います。_

<p>
  <a href="docs/images/phone-reach.png"><img src="docs/images/phone-reach.png" alt="スマホの画面。1列そろっていて、次の列を完成させる最後のマスが点線で囲まれ、リーチの札が付いて点滅している。" height="320"></a>
  <a href="docs/images/phone-combo.png"><img src="docs/images/phone-combo.png" alt="スマホの画面。3回続けてタップしたところで、+20と+30、2 COMBO!と3 COMBO!の表示、減っていくコンボのゲージ、2つのリーチが見える。" height="320"></a>
  <a href="docs/images/phone-perfect.png"><img src="docs/images/phone-perfect.png" alt="スマホの画面。16個すべてにスタンプを押したあと。準備完了のスタンプと、得点3,410、最大コンボ×10、10ラインのパーフェクト画面に、紙吹雪と持ち物の絵文字が降っている。" height="320"></a>
</p>

_スマホでの表示。左から、1列そろって次の列にリーチがかかったところ、3回続けたコンボ、全部そろったときのパーフェクト画面です。_

## できること

修学旅行の前の晩の荷造りは面倒です。持ちものビンゴは16個の持ち物をビンゴカードに並べるので、持ち物を1つ入れるたびにスタンプが押せて、何個かごとにお祝いがあります。

- **タップするたびに反応があります。** スタンプ、波紋、火花、少しずつ高くなる音。2.5秒以内に続けてタップすると、コンボになります。
- **次の目標がいつも見えます。** あと1つで列がそろうマスは、リーチの札を付けて点滅し、下の1行にその持ち物の名前が出ます。
- **列がそろうたびにお祝いします。** タテ・ヨコ・ナナメの10列のどれかがそろうと、BINGO!の文字と紙吹雪が出ます。16個すべてそろうと、花火とスコアカードのフィナーレになります。
- **得点は、そろえることへのごほうびです。** 付けたり外したりしても増えません。[得点のルール](#得点のルール)を見てください。
- **進み具合は自動で保存されます。** 各自のブラウザ（localStorage）に保存されるので、ページを閉じても続きから始められます。サーバーには何も送りません。
- **だれでも使えるように配慮しています。** マスは本物のチェックボックスなので、キーボードで操作できます。`prefers-reduced-motion`（動きを減らす設定）に従います。音は合成した音（音声ファイルなし）で、消すこともできます。

## 概要

| 項目 | 内容 |
| --- | --- |
| インストール | `npm install packing-bingo`。ESMとCommonJSの両方、TypeScriptの型付き |
| 必要なもの | React 18以上と `react-dom`。ほかに依存するパッケージはありません。CSSの読み込みもProviderも不要です |
| サイズ | 約13 kB（minify・gzip後、CSS込み、Reactは含まず） |
| サーバー側での表示 | `"use client"` 付きで配布しています。サーバー側では空の `<div>` を出し、ブラウザでカードを作ります |
| 見た目 | `<head>` に `<style>` を1つ追加します。クラス名はすべて `pkb-` で始まります。CSS変数で配色を変えられ、置いた場所の幅に合わせて自動で大きさが変わります |
| 通信 | Google Fontsからフォントを2つ読み込みます（`fonts={false}` で止められます） |
| 保存 | localStorageだけ。進み具合と、音のオン・オフの設定 |
| ブラウザ | Chrome・Edge 105以上、Safari 16以上、Firefox 121以上。今のところChromiumでしか試していません（[詳しく](#対応ブラウザと確認済みの範囲)） |

## クイックスタート

コピーして貼り付けるだけで、サイトの好きな場所に置けます。進み具合は各自のブラウザに自動で保存されるので、保存の設定も要りません。

### 1. インストールする

```sh
npm install packing-bingo
```

pnpmなら `pnpm add packing-bingo`、yarnなら `yarn add packing-bingo` です。

### 2. 部品のファイルを作る

`OkinawaPackingBingo.tsx` というファイルを作り、次をそのまま貼り付けます。置き場所はどこでも構いません（例：`components/OkinawaPackingBingo.tsx`）。

```tsx
import { PackingBingo, type BingoItem } from "packing-bingo";

// 沖縄の修学旅行の持ち物。ちょうど16個、左上から横に4つずつ並びます。
const items: BingoItem[] = [
  { emoji: "📖", label: "旅のしおり" },
  { emoji: "🪪", label: "生徒手帳" },
  { emoji: "🏥", label: "保険証コピー" },
  { emoji: "👛", label: "おこづかい" },
  { emoji: "👕", label: "着替え" },
  { emoji: "🩱", label: "水着" },
  { emoji: "🧴", label: "日焼け止め" },
  { emoji: "🧢", label: "帽子" },
  { emoji: "🕶️", label: "サングラス" },
  { emoji: "🩴", label: "ビーチサンダル" },
  { emoji: "🪥", label: "洗面用具" },
  { emoji: "🛁", label: "タオル" },
  { emoji: "💊", label: "常備薬・酔い止め" },
  { emoji: "☂️", label: "折りたたみ傘" },
  { emoji: "🛍️", label: "ビニール袋" },
  { emoji: "📱", label: "スマホ・充電器" },
];

export function OkinawaPackingBingo() {
  return <PackingBingo items={items} tag="沖縄修学旅行" />;
}
```

### 3. 表示したい場所に置く

表示したいページやコンポーネントで読み込み、置きたい場所に `<OkinawaPackingBingo />` と書きます。`import` のパスは、ファイルを置いた場所に合わせてください。

```tsx
import { OkinawaPackingBingo } from "./components/OkinawaPackingBingo";

// JSXの中の、表示したい場所に
<OkinawaPackingBingo />
```

Next.js（App Router）で専用のページを作るなら、`app/packing/page.tsx` を作って次を貼り付けます。`/packing` を開くと表示されます。

```tsx
import { OkinawaPackingBingo } from "@/components/OkinawaPackingBingo";

export default function PackingPage() {
  return (
    <main style={{ padding: 16 }}>
      <OkinawaPackingBingo />
    </main>
  );
}
```

`@/` は、`create-next-app` で作ったプロジェクトに最初から設定されている、プロジェクトの一番上を指す書き方です。部品のファイルは `components/OkinawaPackingBingo.tsx` に置いてください。`src/` フォルダを使うプロジェクトでは `src/components/OkinawaPackingBingo.tsx` です。`@/` が使えないプロジェクトでは、`../../components/OkinawaPackingBingo` のような相対パスに書き換えてください。

カードは置いた場所の幅いっぱい（最大720 px）に広がり、狭い場所ではスマホ向けの配置に自動で切り替わります。持ち物を変えたいときは `items` の中身を書き換えるだけです。`items` を省くと、一般的な修学旅行の持ち物リストになります。

Next.jsのServer Componentのページからでも、そのまま使えます。ただし、`onBingo` などの関数（コールバック）はServer Componentから渡せず、「Event handlers cannot be passed to Client Component props」というエラーでビルドが止まります。コールバックを使うときは、部品のファイルの1行目に `"use client";` を書いてください。

### Reactを使っていないページに置く場合

HTMLの好きな場所に、次をそのまま貼り付けます。インストールは要りません。

```html
<div id="packing-bingo"></div>
<script src="https://cdn.jsdelivr.net/npm/packing-bingo@0.2/dist/packing-bingo.global.js"></script>
<script>
  PackingBingo.createPackingBingo(document.getElementById("packing-bingo"), {
    tag: "沖縄修学旅行",
    items: [
      { emoji: "📖", label: "旅のしおり" }, { emoji: "🪪", label: "生徒手帳" },
      { emoji: "🏥", label: "保険証コピー" }, { emoji: "👛", label: "おこづかい" },
      { emoji: "👕", label: "着替え" }, { emoji: "🩱", label: "水着" },
      { emoji: "🧴", label: "日焼け止め" }, { emoji: "🧢", label: "帽子" },
      { emoji: "🕶️", label: "サングラス" }, { emoji: "🩴", label: "ビーチサンダル" },
      { emoji: "🪥", label: "洗面用具" }, { emoji: "🛁", label: "タオル" },
      { emoji: "💊", label: "常備薬・酔い止め" }, { emoji: "☂️", label: "折りたたみ傘" },
      { emoji: "🛍️", label: "ビニール袋" }, { emoji: "📱", label: "スマホ・充電器" },
    ],
  });
</script>
```

## 使い方の例

### 持ち物と文言を変える

```tsx
import { PackingBingo, en, type BingoItem } from "packing-bingo";

const items: BingoItem[] = [
  { emoji: "🩱", label: "Swimsuit" },
  { emoji: "🧴", label: "Sunscreen" },
  // … ちょうど16個、左上から横に1行ずつ
];

<PackingBingo items={items} messages={en} title="Okinawa Trip" tag="Class 2-B" />;
```

- `items` はちょうど16個にしてください。それ以外の数だと `[packing-bingo] "items" must have exactly 16 entries` というエラーになります。
- `messages` は日本語の既定値の上に重なるので、`messages={{ reset: "やり直す" }}` のように一部の文言だけを変えられます。`en` は英語の文言一式です。キーの一覧は[文言のキー](#文言のキー)にあります。
- 狭いカードでは、ラベルは `・` の後ろで折り返します。`常備薬・酔い止め` は「常備薬・」と「酔い止め」の2行になります。

### 保存のしかたを変える

何も指定しなければ、進み具合は持ち物リストから自動で決まるキーで、各自のブラウザに保存されます。持ち物リストが違うカードは別々に保存されるので、1つのサイトに複数のチェックリストを置いても混ざりません。

- **キーを自分で決める：** `storageKey="okinawa-2026"` のように指定します。持ち物リストから決まるキーは、持ち物を1文字でも直すと変わり、カードは新しく始まります。生徒が使い始めたあとで持ち物を直す可能性があるなら、最初からキーを決めておくと、直したあとも続きから使えます。同じ持ち物のカードを2枚、別々に保存したいときも、それぞれにキーを付けます。
- **保存しない：** `storageKey={null}` にします。

### 自分のサーバーに保存する

ブラウザへの保存は、その端末の中だけで使えます。別の端末でも続きから使いたい場合だけ、チェックを自分の state で持って `checked` で渡します（controlledといいます）。このときブラウザには保存しません。

```tsx
import { useEffect, useRef, useState } from "react";
import { PackingBingo } from "packing-bingo";

export function PackingCard({ studentId }: { studentId: string }) {
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const saving = useRef(Promise.resolve());

  useEffect(() => {
    let current = true; // 生徒が切り替わったあとに届いた古い応答は使わない
    setChecked(null);
    fetch(`/api/packing/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (current) setChecked(data.checked ?? Array(16).fill(false));
      });
    return () => {
      current = false;
    };
  }, [studentId]);

  if (!checked) return null; // または同じ大きさの仮表示

  const save = (next: boolean[]) => {
    setChecked(next);
    // 保存は1つずつ順に送る。遅れた古い保存が、新しい保存を上書きしないように。
    saving.current = saving.current
      .then(() => fetch(`/api/packing/${studentId}`, { method: "PUT", body: JSON.stringify({ checked: next }) }))
      .then(() => undefined, () => undefined);
  };

  return <PackingBingo checked={checked} onChange={save} />;
}
```

生徒のタップは通信より速いので、この例では保存を順番に送り、`studentId` が変わったあとに届いた読み込みは捨てています。保存のたびに16個すべてを送るので、最後の保存がいつも最新の状態になります。

controlledのカードの動き：

- タップしただけでは、カードは変わりません。ユーザーが求めた16個の状態で `onChange` が呼ばれ、`checked` が変わるとカードがそれに合わせます。`checked` を変えなければ、タップは取り消されます。
- `checked` がちょうど1個だけ変わったときは、タップと同じように演出します（スタンプ、音、ビンゴやフィナーレ）。サーバーからデータが届いたときのように一度に何個も変わったときは、演出なしで静かに反映し、同時にそろった列のボーナスも付けません。
- リセットボタンを押すと、16個すべて `false` で `onChange` が呼ばれます。
- `storageKey` は使われません。

### ビンゴの瞬間を受け取る

```tsx
<PackingBingo
  items={items}
  onBingo={({ newLines, totalLines, score }) => analytics.track("bingo", { totalLines, score })}
  onPerfect={({ score, maxCombo }) => analytics.track("perfect", { score, maxCombo })}
/>
```

- `onBingo` は、タップで1列以上そろったときに呼ばれます。カード全体がそろったタップでは、代わりに `onPerfect` が呼ばれます。
- `onChange` は、ユーザーの操作（タップ、リセットボタン、`ref.reset()`）のときだけ呼ばれます。`checked` や `ref.setChecked()` で変えたときは呼ばれません。
- `onBingo` と `onPerfect` は、タップと同じように演出した変化のときに呼ばれます。`checked` が1個だけ変わったときも含みます。静かに反映した変化や、最初の表示では呼ばれません。
- 順番は、まず `onChange`、次に `onBingo` か `onPerfect` です。どれもカードの表示が変わったあとに呼ばれるので、中でカードをリセットしたり、画面から外したりしても大丈夫です。

### 外から操作する

```tsx
import { useRef } from "react";
import { PackingBingo, type PackingBingoHandle } from "packing-bingo";

function PackingPage() {
  const card = useRef<PackingBingoHandle>(null);
  return (
    <>
      <button onClick={() => card.current?.reset()}>最初からやり直す</button>
      <PackingBingo ref={card} />
    </>
  );
}
```

`reset()`・`setChecked()`・`getState()` が使えます。くわしくは [ref](#ref) を見てください。controlledのカードでは、`setChecked()` ではなく `checked` を変えてください。

### 配色とレイアウト

次のCSS変数を、カードかその親要素に指定します。

| 変数 | 使われる場所 | 既定値 |
| --- | --- | --- |
| `--pkb-sun` | カードの背景 | `#FFD54F` |
| `--pkb-ink` | 線、枠、文字 | `#2A1F14` |
| `--pkb-paper` | マス | `#FFFDF6` |
| `--pkb-red` | スタンプとアクセント | `#E8473B` |
| `--pkb-mint` | そろった列 | `#BDEBD2` |
| `--pkb-font-fallback` | 見出しなどのフォントが使えないときのフォント | `sans-serif` |

```tsx
<PackingBingo style={{ "--pkb-sun": "#9AD0F5" } as React.CSSProperties} />
```

カードは置いた場所の幅いっぱい（最大720 px）に広がり、中央に寄ります。置いた場所の幅が560 pxより狭いと、スマホ向けの配置に切り替わります。画面の幅ではなく置いた場所の幅で決まるので、広い画面のサイドバーに置いてもスマホ向けの配置になります。高さは幅から自動で決まります。サーバー側では空の `<div>` を出すので、カードはhydrationのあとに現れます。レイアウトのずれが気になるときは、外側の要素に `min-height` を付けてください。

## API

### props

| prop | 型 | 既定値 | 内容 |
| --- | --- | --- | --- |
| `items` | `readonly BingoItem[]`（ちょうど16個） | `DEFAULT_ITEMS`（一般的な修学旅行の持ち物） | マスの中身。左上から横に1行ずつ：`{ emoji, label }` |
| `messages` | `Partial<Messages>` | `ja` | 画面の文言。日本語の既定値の上に重なります。英語の `en` も入っています |
| `title`・`tag`・`subtitle` | `string` | `messages` の値 | 見出し、その上の小さなラベル、その下の1行 |
| `storageKey` | `string \| null` | 持ち物から自動で決まる | 進み具合を保存するlocalStorageのキー。`null` で保存しません。controlledのときは使われません |
| `defaultChecked` | `readonly boolean[]`（16個） | すべて `false` | uncontrolledのカードの最初の状態。保存された進み具合があれば、そちらが優先です |
| `checked` | `readonly boolean[]`（16個） | なし | 指定するとcontrolledになります。[自分のサーバーに保存する](#自分のサーバーに保存する)を見てください |
| `onChange` | `(checked: boolean[]) => void` | なし | ユーザーがタップかリセットをした。controlledのときは、求められた状態 |
| `onBingo` | `(event: BingoEvent) => void` | なし | タップで1列以上そろった |
| `onPerfect` | `(event: PerfectEvent) => void` | なし | タップでカード全体がそろった |
| `sound` | `boolean` | `true` | 音の最初の設定。ユーザーが🔊ボタンで選ぶまで使われます |
| `fonts` | `boolean` | `true` | Dela Gothic OneとM PLUS Rounded 1cをGoogle Fontsから読み込む |
| `demo` | `boolean` | `false` | デモ用のボタンを出します。保存された進み具合も `defaultChecked` もなければ、6マス埋まった状態から始めます。`storageKey` を指定しない限り保存しません |
| `className`・`style` | | なし | 外側の `<div>` に付きます |
| `ref` | `Ref<PackingBingoHandle>` | なし | [ref](#ref) を見てください |

propsは中身で比べるので、配列やオブジェクトをその場で書いても構いません。`items`・`title`・`tag`・`subtitle`・`storageKey`・`sound`・`fonts`・`demo`、または `messages` の文字列が変わると、カードを作り直します。保存先のキーが変わらなければ、チェックはそのまま残ります。キーが変わったとき（`items` を変えて自動のキーが変わったときも含む）は、新しいキーに保存された進み具合を読み込みます。得点は[得点のルール](#得点のルール)のとおり計算し直します。`messages` の関数はpropsやstateを使っても構いません。`messages` が変わると、作り直さずに下の1行だけを描き直します。

### イベント

```ts
interface BingoEvent {
  newLines: number[]; // このタップでそろった列（LINESの番号）
  totalLines: number; // これまでにそろった列の数
  score: number;      // このタップのあとの得点
}

interface PerfectEvent {
  score: number;      // 最終得点。初めて全部そろえたときは1000点のボーナスを含む
  maxCombo: number;
}
```

### ref

```ts
interface PackingBingoHandle {
  /** リセットボタンと同じ。カードと得点を消して onChange を呼ぶ。controlled のカードでは onChange を呼ぶだけ。 */
  reset(): void;
  /** 1個だけの変化はタップと同じように演出し、それより大きな変化は静かに反映する。onChange は呼ばない。 */
  setChecked(checked: readonly boolean[]): void;
  /** 表示前とサーバー側では null。 */
  getState(): PackingBingoState | null;
}

interface PackingBingoState {
  checked: boolean[]; // 16個、左上から横に1行ずつ
  lines: number[];    // そろった列（LINESの番号）
  score: number;
  maxCombo: number;
  complete: boolean;  // 16個すべてにチェックが付いている
}
```

`LINES` もexportしています。0〜3がヨコの列、4〜7がタテの列、8が左上からのナナメ、9が右上からのナナメです。

### 得点のルール

- 初めてチェックした持ち物は、10点 × そのときのコンボ数。コンボは、2.5秒以内に続けたタップの数です。
- 1回のタップでn列そろうと、100点 × n²。同じ列で得点するのは1回だけです。
- 初めてカード全体をそろえると、1000点を足します。
- チェックを外しても得点は減らず、付け直しても増えません。
- 静かに反映したあとや作り直したあと（保存された進み具合を読み込んだときなど）は、チェックした持ち物1個につき10点、そろった列1つにつき100点で計算し直し、最大コンボは0からになります。

### 文言のキー

`messages` には、次のキーを好きなだけ指定できます。日本語と英語の一式は、[`src/messages.ts`](src/messages.ts) の `ja` と `en` です。

- **文字列：** `title`、`tag`、`subtitle`、`packed`、`bingo`、`score`、`reset`、`soundOn`、`soundOff`、`stamp`、`reachBadge`、`reachPop`、`bannerSingle`、`bannerDouble`、`bannerTriple`、`statusDone`、`perfectTag`、`perfectStamp`、`perfectTitle`、`perfectBody`、`statScore`、`statCombo`、`statLines`、`close`、`demoLabel`、`demoBingo`、`demoPerfect`、`demoRestore`。`perfectStamp` と `perfectBody` では、`\n` で改行します。
- **関数（どれも文字列を返します）：** `combo(n)`、`comboPop(n)`、`bannerNth(totalLines)`、`bannerMulti(newLines)`、`statusStart(left)`、`statusLines(lines, left)`、`statusReach(labels)`、`perfectBonus(points)`。

### export

- `packing-bingo`：`PackingBingo`、`createPackingBingo`、`LINES`、`DEFAULT_ITEMS`、`ja`、`en`。型は `PackingBingoProps`、`PackingBingoHandle`、`PackingBingoState`、`BingoItem`、`BingoEvent`、`PerfectEvent`、`Messages`、`PackingBingoOptions`、`PackingBingoInstance`。
- `packing-bingo/core`：Reactのコンポーネントとその型（`PackingBingoProps`、`PackingBingoHandle`）を除いた残り。Reactを読み込みません。

## 組み込むときの注意

### ページに追加されるもの

最初に表示したとき、`<head>` に `<style id="pkb-styles">` を追加します。これはすべてのカードで共有し、カードを外したあとも残ります。`fonts={false}` でなければ、Google Fonts用の `<link id="pkb-fonts">` も追加します。CSSはすべて `.pkb` の中だけに効き、クラス名とアニメーション名はすべて `pkb-` で始まるので、ページのほかの部分には影響しません。

カードが描くもの（紙吹雪、BINGO!の文字、フィナーレの画面）は、すべてカード自身の枠の中に収まります。`position: fixed` を使ったり `<body>` に要素を足したりはしません。カードは独立した重なり順（stacking context）を持つので、上部に固定したヘッダーの上に描かれることもありません。

### CSP（Content Security Policy）

追加する `<style>` と一部の `style` 属性のために、`style-src 'unsafe-inline'` が必要です。フォントを読み込む場合は、`style-src` に `https://fonts.googleapis.com`、`font-src` に `https://fonts.gstatic.com` も許可してください。

### フォント

Dela Gothic OneとM PLUS Rounded 1cを使います。`fonts={false}` にするとGoogleには何も取りに行きません。サイトで同じ名前のフォントを読み込んでいれば（自分のサーバーに置いている場合など）それを使い、なければ `--pkb-font-fallback` のフォントを使います。

### 音と振動

音はWeb Audio APIで合成しています。音を鳴らす仕組みは、ユーザーがページを操作したあとにだけ作るので、ブラウザの自動再生の警告は出ません。🔊ボタンの選択は、localStorageの `packing-bingo-muted` に保存されます。そのあとに作られるカードは、ページを読み込み直したあとも含めて、この設定で始まります。すでに表示中のほかのカードは、それぞれの設定のままです。タップやビンゴのときは、Vibration APIがある端末で振動します。実際にはAndroidのブラウザです。

### 保存されるデータ

チェックは、16個の真偽値のJSON配列としてlocalStorageに保存されます。キーは `storageKey`、指定しなければ `packing-bingo:` で始まる、持ち物リストから決まるキーです。得点は保存しません。保存された進み具合は `defaultChecked` より優先されます。プライベートブラウズなどで保存できない環境では、保存せずにそのまま動きます。

### アクセシビリティ

マスは `<label>` の中の本物のチェックボックスなので、TabキーとSpaceキーで操作でき、持ち物の名前がそのまま読み上げられます。絵文字とスタンプは、読み上げの対象から外しています。下の1行は、変化を控えめに読み上げる領域（polite live region）です。`prefers-reduced-motion` のときは、揺れ、弾み、紙吹雪を止めます。スクリーンリーダーでの確認は、まだしていません。

### 対応ブラウザと確認済みの範囲

CSSのコンテナクエリ（Chrome・Edge 105以上、Safari 16以上、Firefox 110以上）と、キーボード操作時の枠に `:has()`（Firefox 121以上）を使っています。

確認済み：

- React 19のStrictModeで、1ページに3枚、controlledとuncontrolledの両方
- `renderToString` でのサーバー側の表示（ESMとCommonJS）
- Next.js 16のApp Routerで本番ビルドし、Server Componentのページとclient componentの両方から使う
- npmとpnpmでのnpmからのインストール
- Chromiumで、パソコンとスマホの大きさでの自動タップ。演出の途中でのリセットやコールバックも含む
- 自動保存。持ち物リストごとに別々に保存されること、`storageKey={null}` で保存しないこと、持ち物を変えると新しく始まり、戻すと前の進み具合が戻ること

これらの自動テストは、まだこのリポジトリには入っていません。Safari、Firefox、実際のスマホでは試しておらず、実機での音も確かめていません。絵文字は端末の絵文字フォントで表示されるので、端末ごとに見た目が違います。

## Reactなしで使う

エンジン部分はフレームワークに依存しません。

```ts
import { createPackingBingo } from "packing-bingo/core";

const card = createPackingBingo(document.getElementById("bingo")!, {
  tag: "沖縄修学旅行",
  onBingo: (e) => console.log(e),
});
// card.reset()、card.getState()、card.setChecked(next, { animate: true })、card.destroy()
```

オプションは、Reactのpropsから `checked`・`className`・`style`・`ref` を除いたものです（型は `PackingBingoOptions`）。controlledにするときは `controlled: true` を渡し、`setChecked()` で状態を変えます。`setChecked()` は、`{ animate: true }` を付けないと、いつも静かに反映します。

バンドラーを使わないページでは、CDNからブラウザ用のファイルを読み込みます。グローバル変数 `PackingBingo` ができます。使い方は[クイックスタート](#reactを使っていないページに置く場合)にあります。

## 単体のページ

`index.html` は、アプリ全体が1つに入ったファイルです。そのまま開くことも、静的なホスティングに置くこともできます。進み具合はブラウザに保存されます。

```sh
git clone https://github.com/Jin-hiroo/packing-bingo.git
cd packing-bingo
open index.html        # macOSの場合。ほかのOSでは、ファイルをブラウザで開いてください
```

URLの末尾に `?demo` を付けると、途中まで埋まった状態から始まり、デモ用のボタンが出ます。「▶ ビンゴを見る」でビンゴを、「▶ コンボ → パーフェクト」でコンボからパーフェクトまでを再生します。GitHub Pagesで公開するときは、**Settings → Pages → Deploy from a branch → `main` / root** を選びます。

ページの中身を変えるときは、最後の `<script>` にある `PackingBingo.createPackingBingo(…)` のオプションを書き換えます。どのビルドでも使われる既定値を変えるときは、`src/items.ts` か `src/messages.ts` を編集して `npm run build` を実行します。

## 開発

```sh
npm install          # dist/ と index.html もビルドされます
npm run build        # dist/（ESM、CJS、型、ブラウザ用）と単体の index.html
npm run typecheck
```

`index.html` は `scripts/build-standalone.mjs` が `src/` から作るので、直接編集しないでください。

## English

Packing Bingo is a React component that turns a school-trip packing checklist into a 4×4 bingo card, with combos, fanfares and fireworks. Progress is saved in each student's browser automatically. It has no runtime dependencies and is safe to render on the server (it ships with `"use client"`).

```sh
npm install packing-bingo
```

```tsx
import { PackingBingo, en } from "packing-bingo";

<PackingBingo messages={en} />;
```

The default UI text is Japanese; `en` is a complete English set. Pass exactly 16 `items` (`{ emoji, label }`) to use your own list. The sections above cover the props, events and integration notes; the code snippets and type names can be read as they are.

## ライセンス

[MIT](LICENSE) © 2026 Jin-hiroo.

Dela Gothic OneとM PLUS Rounded 1cのフォントはGoogle Fontsから読み込んでおり、SIL Open Font Licenseで提供されています。このリポジトリには含まれていません。
