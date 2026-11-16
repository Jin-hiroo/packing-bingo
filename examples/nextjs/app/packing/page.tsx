import { PackingBingo, type BingoItem } from "packing-bingo";

// 持ち物。16個、左上から横に4つずつ並びます（READMEのクイックスタートの手順3と同じリスト）。
// \u200B は「狭い画面ではここで改行してよい」という目印です（画面には出ません）。
const items: BingoItem[] = [
  { emoji: "👔", label: "制服\u200B（初日）" },
  { emoji: "👟", label: "黒系\u200Bスニーカー" },
  { emoji: "👕", label: "学園指定\u200Bジャージ" },
  { emoji: "🧤", label: "軍手（学校支給）" },
  { emoji: "🔦", label: "ヘッドライト" },
  { emoji: "☔", label: "雨具" },
  { emoji: "📋", label: "健康調査票" },
  { emoji: "👛", label: "財布" },
  { emoji: "🔋", label: "モバイル\u200B充電器" },
  { emoji: "🪪", label: "マイナ保険証" },
  { emoji: "💊", label: "常備薬" },
  { emoji: "🧴", label: "日焼け止め" },
  { emoji: "🤧", label: "ハンカチ・\u200Bティッシュ・\u200Bマスク" },
  { emoji: "🛍️", label: "ビニール袋" },
  { emoji: "✏️", label: "筆記用具" },
  { emoji: "📖", label: "しおり" },
];

export default function PackingPage() {
  return (
    <main style={{ padding: 16 }}>
      <PackingBingo items={items} />
    </main>
  );
}
