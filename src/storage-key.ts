import { layoutItems, type LayoutOptions } from "./layout";
import type { BingoItem } from "./items";

/** The options that decide where a card saves its checks. */
export interface StorageKeyOptions extends LayoutOptions {
  storageKey?: string | null;
  controlled?: boolean;
  demo?: boolean;
}

/**
 * The localStorage key a card saves its checks under, or null when it doesn't save.
 * Without an explicit `storageKey`, the key is derived from the items, so cards with different
 * item lists keep separate progress, and checks saved for one list are never applied to another.
 * Controlled cards never save (their state lives with the parent), and demo cards only save
 * when given a key.
 */
export function resolveStorageKey(options: StorageKeyOptions): string | null {
  if (options.controlled) return null;
  if (options.storageKey !== undefined) return options.storageKey || null;
  if (options.demo) return null;
  // The items the card actually shows (`size` without `items` takes the first default items).
  return itemsKey(layoutItems(options));
}

function itemsKey(items: readonly BingoItem[]): string {
  // FNV-1a over the emoji and labels: short, stable across builds and browsers.
  const text = items.map((it) => `${it.emoji}\u0000${it.label}`).join("\u0001");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `packing-bingo:${(h >>> 0).toString(36)}`;
}
