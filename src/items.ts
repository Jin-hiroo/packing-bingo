/** One square on the card: an emoji icon and a short label. */
export interface BingoItem {
  emoji: string;
  label: string;
}

/** The default 16 school-trip items (Japanese), listed row by row from the top left. */
export const DEFAULT_ITEMS: readonly BingoItem[] = [
  { emoji: "📖", label: "旅のしおり" },
  { emoji: "🪪", label: "生徒手帳" },
  { emoji: "🏥", label: "保険証コピー" },
  { emoji: "👛", label: "おこづかい" },
  { emoji: "👕", label: "着替え" },
  { emoji: "🌙", label: "パジャマ" },
  { emoji: "🧥", label: "上着" },
  { emoji: "🪥", label: "洗面用具" },
  { emoji: "🛁", label: "タオル" },
  { emoji: "🤧", label: "ハンカチ・ティッシュ" },
  { emoji: "😷", label: "マスク" },
  { emoji: "💊", label: "常備薬・酔い止め" },
  { emoji: "☂️", label: "折りたたみ傘" },
  { emoji: "✏️", label: "筆記用具" },
  { emoji: "🛍️", label: "ビニール袋" },
  { emoji: "📱", label: "スマホ・充電器" },
];
