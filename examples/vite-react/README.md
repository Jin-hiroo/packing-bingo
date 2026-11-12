# 持ちものビンゴ：Vite + React の例

ふつうのReactアプリのページに、持ちものビンゴを置く例です。

```sh
npm install
npm run dev
```

表示されたURL（ふつうは http://localhost:5173 ）を開きます。

## 見どころ

- `src/App.tsx`：持ち物16個のリストを作り、ページの中の表示したい場所に `<PackingBingo items={items} />` を1行置いています。READMEのクイックスタートと同じです。持ち物を変えるときは、このリストを書き換えます。
- `index.html`：`<head>` で、カードのフォントをGoogle Fontsから読み込んでいます。なくても動きます。

進み具合は、開いたブラウザに自動で保存されます。保存の設定は要りません。
