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
