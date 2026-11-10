# 持ちものビンゴ：Next.js（App Router）の例

```sh
npm install
npm run dev
```

http://localhost:3000 を開きます。

## ページ

- `/packing`：READMEのクイックスタートそのままのページです。`app/packing/page.tsx` から `components/OkinawaPackingBingo.tsx`（沖縄の修学旅行の持ち物16個）を読み込んでいます。Server Component のページから、そのまま使えます。
- `/events`：タップ・ビンゴ・パーフェクトの瞬間を受け取る例です。コールバック（`onChange`・`onBingo`・`onPerfect`）は Server Component から渡せないので、`components/PackingWithEvents.tsx` の1行目に `"use client"` を書いています。

進み具合は、開いたブラウザに自動で保存されます。保存の設定は要りません。
