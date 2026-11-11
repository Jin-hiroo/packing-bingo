import { PackingBingo, type BingoItem } from "packing-bingo";

// 持ち物。16個、左上から横に4つずつ並びます（READMEのクイックスタートの手順3と同じリスト）。
// \u200B は「狭い画面ではここで改行してよい」という目印です（画面には出ません）。
const items: BingoItem[] = [
  { emoji: "👛", label: "財布" },
  { emoji: "📱", label: "スマホ" },
  { emoji: "🔋", label: "モバイル\u200B充電器" },
  { emoji: "📋", label: "健康調査票" },
  { emoji: "🪪", label: "マイナカード\u200Bまたは保険証" },
  { emoji: "📖", label: "しおり" },
  { emoji: "😷", label: "マスク" },
  { emoji: "🤧", label: "ハンカチ" },
  { emoji: "💊", label: "常備薬" },
  { emoji: "🛍️", label: "ビニール袋" },
  { emoji: "🧤", label: "軍手（学校支給）" },
  { emoji: "🔦", label: "ヘッドライト" },
  { emoji: "👕", label: "ジャージ" },
  { emoji: "☔", label: "雨具" },
  { emoji: "🛁", label: "タオル" },
  { emoji: "🧴", label: "日焼け止め" },
];

export function App() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif", lineHeight: 1.7 }}>
      <h1>修学旅行のしおり</h1>
      <p>持ち物をかばんに入れたら、マスをタップしてください。進み具合はこのブラウザに保存されます。</p>

      {/* 表示したい場所に、この1行を置くだけです */}
      <PackingBingo items={items} />
    </main>
  );
}
