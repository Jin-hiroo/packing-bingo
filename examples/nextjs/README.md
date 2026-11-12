# 持ちものビンゴ：Next.js（App Router）の例

```sh
npm install
npm run dev
```

http://localhost:3000 を開きます。

## ページ

- `/packing`：READMEのクイックスタートのページです。`app/packing/page.tsx` で、持ち物16個のリストを `<PackingBingo items={items} />` に渡しています。Server Component のページから、そのまま使えます。持ち物を変えるときは、このリストを書き換えます。
- `/events`：タップ・ビンゴ・パーフェクトの瞬間を受け取る例です。コールバック（`onChange`・`onBingo`・`onPerfect`）は Server Component から渡せないので、`components/PackingWithEvents.tsx` の1行目に `"use client"` を書いています。

カードのフォントは、`app/layout.tsx` の `<head>` でGoogle Fontsから読み込んでいます。なくても動きます。

進み具合は、開いたブラウザに自動で保存されます。保存の設定は要りません。
