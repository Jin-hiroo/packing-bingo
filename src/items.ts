/** One square on the card: an emoji icon and a short label. */
export interface BingoItem {
  emoji: string;
  label: string;
}

/**
 * The default 16 school-trip items (Japanese), listed row by row from the top left.
 * Smaller cards (`size` 2 or 3, without `items`) use the first ones.
 * Labels keep each unbreakable run to about 6 characters so they fit the narrow (phone) card;
 * `\u200B` marks where a longer label may wrap.
 */
export const DEFAULT_ITEMS: readonly BingoItem[] = [
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
