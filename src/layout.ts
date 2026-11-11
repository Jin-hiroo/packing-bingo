import { DEFAULT_ITEMS, type BingoItem } from "./items";

/** The smallest and largest number of squares per side. */
export const MIN_SIZE = 2;
export const MAX_SIZE = 10;

/** The options that decide the shape of a card. */
export interface LayoutOptions {
  items?: readonly BingoItem[];
  size?: number;
  free?: boolean;
}

export interface Layout {
  /** Squares per side. */
  size: number;
  /** Whether the center square is a FREE square. */
  free: boolean;
  /** The items, row by row, skipping the FREE square. */
  items: readonly BingoItem[];
  /** The cell (row-major over size × size) of each item. */
  itemCell: number[];
  /** The cell of the FREE square, or -1. */
  center: number;
  /** Every winning line as cells: rows, columns, then the two diagonals. */
  cellLines: number[][];
  /** The same lines as item indices. Lines through the FREE square have size − 1 items. */
  lines: number[][];
}

const fail = (msg: string): never => {
  throw new Error(`[packing-bingo] ${msg}`);
};

/**
 * The items a card shows: `items`, or as many of `DEFAULT_ITEMS` as the card has squares
 * (all 16 when `size` is omitted). Never throws; `resolveLayout` checks the count.
 */
export function layoutItems(options: LayoutOptions): readonly BingoItem[] {
  if (options.items) return options.items;
  const n = options.size;
  if (n == null || !Number.isInteger(n) || n < MIN_SIZE) return DEFAULT_ITEMS;
  return DEFAULT_ITEMS.slice(0, n * n - (options.free ? 1 : 0));
}

function checkSize(size: number, free: boolean) {
  if (!Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE)
    fail(`"size" must be a whole number from ${MIN_SIZE} to ${MAX_SIZE} (got ${size}).`);
  if (free && size % 2 === 0) fail(`"free" needs an odd size such as 3 or 5, so that the card has a center (got ${size}).`);
}

/** The lines of a (checked) size, as cells and as item indices. */
function shape(n: number, free: boolean) {
  const seq = <T>(f: (k: number) => T) => Array.from({ length: n }, (_, k) => f(k));
  const cellLines = [
    ...seq((r) => seq((c) => r * n + c)), // rows
    ...seq((c) => seq((r) => r * n + c)), // columns
    seq((k) => k * (n + 1)), // top left to bottom right
    seq((k) => (k + 1) * (n - 1)), // top right to bottom left
  ];
  const center = free ? (n * n - 1) / 2 : -1;
  const toItem = (c: number) => (free && c > center ? c - 1 : c);
  return { center, cellLines, lines: cellLines.map((l) => l.filter((c) => c !== center).map(toItem)) };
}

/** Work out the size and the place of every item, or throw a readable error. */
export function resolveLayout(options: LayoutOptions): Layout {
  const items = layoutItems(options);
  const free = !!options.free;
  let size = options.size;
  if (size == null) {
    // Follow the number of items: 9 → 3×3, 16 → 4×4; with `free`, 8 → 3×3, 24 → 5×5.
    const len = items.length;
    // The side of a valid card with `cells` squares, or 0.
    const sideOf = (cells: number) => {
      const r = Math.round(Math.sqrt(cells));
      return r * r === cells && r >= MIN_SIZE && r <= MAX_SIZE ? r : 0;
    };
    size = sideOf(len + (free ? 1 : 0));
    if (!size) {
      // Only suggest a fix that works: toggling `free` when the count fits the other way.
      const other = sideOf(len + (free ? 0 : 1));
      const hint = free
        ? other ? `; ${len} items fill a ${other}×${other} card without "free"` : ""
        : other % 2 ? `, or set "free" for a ${other}×${other} card with a FREE center` : "";
      fail(
        free
          ? `With "free", "items" must have one less than an odd square number of entries (8, 24, 48, 80)${hint} (got ${len}).`
          : `"items" must have a square number of entries (4, 9, 16, 25, …, 100)${hint} (got ${len}).`,
      );
    }
  }
  checkSize(size, free);
  const want = size * size - (free ? 1 : 0);
  if (items.length !== want) {
    const card = `a ${size}×${size} card${free ? " with a FREE center" : ""}`;
    fail(
      options.items
        ? `"items" must have exactly ${want} entries for ${card} (got ${items.length}).`
        : `A ${card.slice(2)} needs ${want} items, but DEFAULT_ITEMS has only ${DEFAULT_ITEMS.length}. Pass "items".`,
    );
  }
  const { center, cellLines, lines } = shape(size, free);
  const itemCell = items.map((_, i) => (free && i >= center ? i + 1 : i));
  return { size, free, items, itemCell, center, cellLines, lines };
}

/**
 * The winning lines of a size × size card, as indices into its items (row by row, skipping the
 * FREE square): first the rows, then the columns, then the diagonal from the top left and the
 * one from the top right. With `free`, the lines through the center have size − 1 items.
 */
export function bingoLines(size: number, free = false): number[][] {
  checkSize(size, free);
  return shape(size, free).lines;
}
