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
