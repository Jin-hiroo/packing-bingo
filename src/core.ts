import { DEFAULT_ITEMS, type BingoItem } from "./items";
import { bingoLines, resolveLayout, type Layout } from "./layout";
import { en, ja, type Messages } from "./messages";
import { createSound } from "./sound";
import { createHaptics, type HapticMoment } from "./haptics";
import { PERFECT_FIREWORKS, PERFECT_REVEAL_MS, PERFECT_STAMP_BEAT, PERFECT_STAMP_DELAY_MS } from "./celebration";
import { resolveStorageKey } from "./storage-key";
import { CSS } from "./styles";

export { DEFAULT_ITEMS, ja, en, bingoLines };
export type { BingoItem, Messages };

/**
 * The 10 winning lines of a 4×4 card: 4 rows, 4 columns, 2 diagonals (indices are row-major).
 * For other sizes, use `bingoLines(size, free)`.
 */
export const LINES: readonly (readonly number[])[] = bingoLines(4);

/**
 * "normal": the packing card. "infinite": an endless game on the same squares; completed lines
 * clear so they can be filled again. It never touches the packing checks.
 */
export type BingoMode = "normal" | "infinite";

export interface PackingBingoState {
  /**
   * One boolean per item, row by row (the FREE square is not included). In the infinite mode,
   * the squares of that game, not the packing checks.
   */
  checked: boolean[];
  /** The completed lines, as indices into `bingoLines(size, free)`. */
  lines: number[];
  score: number;
  maxCombo: number;
  /** Every item is checked (always false in the infinite mode). */
  complete: boolean;
  /** The mode on the card. */
  mode: BingoMode;
  /** Lines completed in this infinite game (each one clears); 0 in the normal mode. */
  cleared: number;
  /** The infinite game was ended with FINISH (its squares are locked until a new game). */
  finished: boolean;
  /**
   * In the infinite mode, the packing card waiting behind the game: its checks and arrangement,
   * as they will be when the card switches back. Null in the normal mode.
   */
  packing: { checked: boolean[]; order: number[] } | null;
  /** Squares per side. */
  size: number;
  /** Whether the center is a FREE square. */
  free: boolean;
  /**
   * The item in each slot (row by row, skipping the FREE square): `[0, 1, 2, …]` until the card
   * is shuffled. Line `k` holds the items `bingoLines(size, free)[k].map((s) => order[s])`.
   */
  order: number[];
  /** The stopwatch in milliseconds: running since the countdown (or the first tap), frozen once the card is complete. */
  time: number;
}

export interface BingoEvent {
  /** Lines (indices into `bingoLines(size, free)`, which is LINES for 4×4) completed by this change. */
  newLines: number[];
  /** Lines complete on the card; in the infinite mode, lines completed in this game. */
  totalLines: number;
  score: number;
  /** The mode it happened in. */
  mode: BingoMode;
}

export interface PerfectEvent {
  score: number;
  maxCombo: number;
  /** The stopwatch when the card was completed, in milliseconds; null if this game was not timed. */
  time: number | null;
  /** Points `score` got for the clear time (see `speedBonus`); 0 if none were given. */
  speedBonus: number;
}

/** An infinite game ended with FINISH. */
export interface FinishEvent {
  score: number;
  maxCombo: number;
  /** Lines completed in the game. */
  lines: number;
  /** The stopwatch when it ended, in milliseconds. */
  time: number;
}

export interface PackingBingoOptions {
  /**
   * One item per square, row by row (skipping the FREE square). Defaults to a Japanese
   * school-trip list of 16. The count sets the size unless `size` is given: 9 → 3×3, 16 → 4×4.
   */
  items?: readonly BingoItem[];
  /**
   * Squares per side, 2 to 10. By default it follows the number of items. Without `items`,
   * a 2×2 or 3×3 card uses the first default items.
   */
  size?: number;
  /**
   * Make the center a FREE square (odd sizes only): it is always stamped and counts toward the
   * lines through it. `items`, `checked` and `defaultChecked` then have size² − 1 entries.
   */
  free?: boolean;
  /** Overrides for UI text. Start from `ja` (default) or `en`. */
  messages?: Partial<Messages>;
  title?: string;
  tag?: string;
  subtitle?: string;
  /** Initial state (one boolean per item), used when nothing is saved under `storageKey`. */
  defaultChecked?: readonly boolean[];
  /**
   * When true, taps don't change the card by themselves: they call `onChange` with the
   * requested state, and the card only changes through `setChecked`. (React's `checked` prop.)
   */
  controlled?: boolean;
  /**
   * Where the checks are saved in localStorage. By default (omitted) a key derived from the
   * items is used, so progress is saved automatically; pass a string to choose the key, or null
   * to turn saving off. Ignored when controlled. Demo cards only save when given a key.
   */
  storageKey?: string | null;
  /** Start with sound on (default) or off. A choice made with the sound button is remembered. */
  sound?: boolean;
  /**
   * Show the 🔀 button that moves the items to random squares (default true). Checks stay with
   * their items. The arrangement is saved next to the checks, under "packing-bingo-order:" +
   * the storage key.
   */
  shuffle?: boolean;
  /**
   * The starting arrangement, as in `getState().order`, used when no shuffled arrangement is
   * saved. Ignored unless it lists every item index exactly once.
   */
  defaultOrder?: readonly number[];
  /**
   * Buzz on phones (default true): escalating combo taps and distinct patterns for a reach, a bingo, a
   * perfect card and a shuffle where the Vibration API exists (Android), and the system tap
   * haptic on iPhone (iOS 18 and later), which only follows a real tap.
   */
  vibrate?: boolean;
  /**
   * @deprecated Ignored since 0.4.0: the card no longer loads fonts. To get Dela Gothic One and
   * M PLUS Rounded 1c, load them on the page (see the README's フォント section).
   */
  fonts?: boolean;
  /**
   * Start each game on a see-through dark screen over the whole card ("Are you ready?" with the
   * volume and Do Not Disturb reminders); a tap counts down 3, 2, 1 and starts the stopwatch
   * (default true). With false, the stopwatch starts on the first tap.
   */
  ready?: boolean;
  /**
   * Let a tap on a stamped square take the stamp off again (default false). By default a
   * stamped square stays stamped when tapped; `reset()`, `setChecked` and controlled `checked`
   * can still clear it.
   */
  uncheck?: boolean;
  /**
   * The mode to start in (default "normal"). "infinite" is an endless game on the same squares:
   * every completed line clears after its celebration, so it can be filled again, and the
   * score keeps growing. It neither changes nor saves the packing checks, and calls no
   * `onChange`; switching back to "normal" brings the packing card back as it was.
   */
  mode?: BingoMode;
  /** Show the NORMAL / ∞ INFINITE switch in the header (default true). */
  modeSwitch?: boolean;
  /** Pre-fill a few items and show demo buttons. */
  demo?: boolean;
  onChange?: (checked: boolean[]) => void;
  onBingo?: (event: BingoEvent) => void;
  onPerfect?: (event: PerfectEvent) => void;
  /** The mode was changed, with the switch or `setMode`. */
  onModeChange?: (mode: BingoMode) => void;
  /** An infinite game was ended with the 🏁 FINISH button or `finish()`. */
  onFinish?: (event: FinishEvent) => void;
}

export interface PackingBingoInstance {
  /**
   * Set the card. With `animate`, a change of exactly one item plays like a tap (including any
   * bingo or perfect it causes). Any other change, like loading saved progress, applies quietly.
   */
  setChecked(next: readonly boolean[], options?: { animate?: boolean }): void;
  /**
   * Clear the card and score (calls onChange), and put the items back in their own squares.
   * In the infinite mode, like the reset button, it starts a new infinite game instead.
   */
  reset(): void;
  /**
   * Move the items to random squares, as the 🔀 button does. Checks stay with their items; lines
   * the new arrangement happens to complete count as done but earn no points.
   */
  shuffle(): void;
  /**
   * Switch modes, as the switch does (with its animation). Each switch starts a new game: the
   * stopwatch and score start over, and the packing checks and arrangement are kept.
   */
  setMode(mode: BingoMode): void;
  /**
   * End a running infinite game, as the 🏁 FINISH button does: stop the stopwatch, lock the
   * squares and show the results. Does nothing in the normal mode or before the game starts.
   */
  finish(): void;
  getState(): PackingBingoState;
  /** Redraw the status text, e.g. after functions in `messages` start returning something else. */
  refresh(): void;
  /** Stop everything and remove the card from the container. */
  destroy(): void;
}

const CONFETTI = ["#E8473B", "#2F6FED", "#1FA971", "#FFFDF6", "#2A1F14", "#FF9F1C"];
const COMBO_COLORS = ["#FF9F1C", "#1FA971", "#2F6FED", "#9B5DE5", "#E8473B"];
const COMBO_MS = 2500;
const MUTE_KEY = "packing-bingo-muted";
/** A shuffled arrangement is saved under this prefix + the card's storage key. */
const ORDER_PREFIX = "packing-bingo-order:";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or blocked storage: run without saving */
  }
}
/** The delay of the shine on completed lines: it sweeps from the top left (0.72 s to the far corner). */
const glintDelay = (c: number, n: number) => `${+(((Math.floor(c / n) + (c % n)) * 0.36) / Math.max(1, n - 1)).toFixed(3)}s`;

/** A line's items in a form that doesn't depend on where they sit, so a shuffle can't re-award it. */
const lineKey = (l: readonly number[]) => l.slice().sort((a, b) => a - b).join(",");

/** One countdown step (3, 2, 1, then the start word). */
const COUNT_MS = 1000;
/** How long the start word stays on screen after the stopwatch starts. */
const GO_MS = 750;

/** Stopwatch text: 0:12.3 (or 1:02:03.4 past an hour); `digits` decimals of a second. */
export function formatTime(ms: number, digits = 1) {
  const unit = 10 ** digits;
  const t = Math.floor(Math.max(0, ms) / (1000 / unit));
  const frac = digits ? "." + String(t % unit).padStart(digits, "0") : "";
  const sec = Math.floor(t / unit), s = sec % 60, m = Math.floor(sec / 60) % 60, h = Math.floor(sec / 3600);
  const pad = (v: number) => String(v).padStart(2, "0");
  return (h ? `${h}:${pad(m)}` : String(m)) + `:${pad(s)}${frac}`;
}

/**
 * Points for clearing a card of `items` items in `ms` milliseconds: 1000 per item per second,
 * so it has no ceiling. Halving the time doubles it.
 */
export function speedBonus(items: number, ms: number) {
  return Math.round((items * 1e6) / Math.max(ms, 1));
}

/** How long the squares take to fly to their new places on a shuffle (including the stagger). */
const FLY_MS = 560;
/** Infinite mode: completed lines clear this long after the winning tap (after the banner lands). */
const CLEAR_MS = 1000;
/** Sparkle colors for the infinite mode (the combo palette plus white). */
const SPARK = ["#FFFFFF", "#FFE066", "#FF9F1C", "#E8473B", "#9B5DE5", "#2F6FED", "#1FA971"];

function ensureStyles() {
  if (document.getElementById("pkb-styles")) return;
  const s = document.createElement("style");
  s.id = "pkb-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

interface Features {
  demo: boolean;
  shuffle: boolean;
  vibrate: boolean;
  ready: boolean;
  modes: boolean;
}

/** An optional message: the given text, or the default when it was left out (empty stays empty). */
const opt = (v: string | undefined, fallback: string | undefined) => v ?? fallback ?? "";

function template(L: Layout, M: Messages, { demo, shuffle, vibrate, ready, modes }: Features) {
  const n = L.size;
  // iOS Safari plays the system haptic when a real tap toggles a `switch` checkbox (iOS 18+);
  // role="checkbox" keeps it announced as a checkbox. Other browsers ignore the attribute.
  const input = vibrate ? `<input type="checkbox" switch role="checkbox">` : `<input type="checkbox">`;
  const tiles = Array.from({ length: n * n }, (_, c) => {
    const gd = `--pkb-gd:${glintDelay(c, n)}`;
    if (c === L.center)
      return `<div class="pkb-tile pkb-free pkb-on" style="${gd}"><span class="pkb-stamp">${esc(M.free)}</span></div>`;
    const it = L.items[L.itemCell.indexOf(c)];
    return (
      `<label class="pkb-tile" data-reach="${esc(M.reachBadge)}" style="${gd}">` +
      `${input}<span class="pkb-emo" aria-hidden="true">${esc(it.emoji)}</span>` +
      `<span class="pkb-lbl">${esc(it.label).replace(/・/g, "・<wbr>")}</span>` +
      `<span class="pkb-stamp" aria-hidden="true">${esc(M.stamp)}</span></label>`
    );
  }).join("");
  // Type and spacing follow the tile size: 1 at 4×4, larger on 3×3, smaller from 5×5.
  const scale = `--pk-n:${n};--pk-s:${+Math.min(1.35, 4 / n).toFixed(3)};--pk-d:${+Math.min(1, 4 / n).toFixed(3)}`;
  const demoBar = demo
    ? `<div class="pkb-demo"><span>${esc(M.demoLabel)}</span><button type="button" data-r="dB">${esc(M.demoBingo)}</button>` +
      `<button type="button" data-r="dP">${esc(M.demoPerfect)}</button><button type="button" data-r="dR">${esc(M.demoRestore)}</button></div>`
    : "";
  const hints = [opt(M.soundHint, ja.soundHint), vibrate ? opt(M.vibrationHint, ja.vibrationHint) : ""].filter((h) => h.trim());
  const prompt = opt(M.readyPrompt, ja.readyPrompt);
  const rule = opt(M.infiniteRule, ja.infiniteRule);
  // A button over the whole card: anywhere on the gray starts the countdown (mouse, touch or keyboard).
  // The badge and the rule only show in the infinite mode (see .pkb-inf in the CSS).
  const readyScreen = ready
    ? `<button type="button" class="pkb-ready" data-r="ready"><span class="pkb-ready-in">` +
      `<span class="pkb-ready-b">∞ ${esc(M.infiniteSub?.trim() || ja.infiniteSub!)}</span>` +
      `<b class="pkb-ready-t">${esc(M.readyTitle?.trim() || ja.readyTitle!)}</b>` +
      (prompt.trim() ? `<span class="pkb-ready-q">${esc(prompt)}</span>` : "") +
      (rule.trim() ? `<span class="pkb-ready-r">${esc(rule)}</span>` : "") +
      (hints.length ? `<span class="pkb-ready-l">${hints.map((h) => `<span>${esc(h)}</span>`).join("")}</span>` : "") +
      `<span class="pkb-ready-go">${esc(M.readyTap?.trim() || ja.readyTap!)}</span></span>` +
      `<b class="pkb-count" data-r="count" aria-live="assertive"></b></button>`
    : "";
  const timeLabel = M.time?.trim() || ja.time!;
  // A two-choice radio group with a thumb that slides to the chosen side.
  const modeSwitch = modes
    ? `<span class="pkb-mode" data-r="mode" role="radiogroup" aria-label="${esc(M.modeLabel?.trim() || ja.modeLabel!)}"><i class="pkb-mode-th" data-r="modeTh"></i>` +
      `<button type="button" role="radio" data-m="normal">${esc(M.modeNormal?.trim() || ja.modeNormal!)}</button>` +
      `<button type="button" role="radio" data-m="infinite">${esc(M.modeInfinite?.trim() || ja.modeInfinite!)}</button></span>`
    : "";
  return `<div class="pkb" style="${scale}"><div class="pkb-board">
<div class="pkb-head"><div>
<div class="pkb-tags"><span class="pkb-kicker" data-r="kick">${esc(M.tag)}</span>${modeSwitch}<button type="button" class="pkb-snd" data-r="snd"></button><span class="pkb-watch" data-r="watch" role="timer" aria-label="${esc(timeLabel)}">${formatTime(0)}</span></div>
<h2 class="pkb-title">${esc(M.title)}</h2>${M.subtitle ? `<p class="pkb-sub">${esc(M.subtitle)}</p>` : ""}</div>
<div class="pkb-side"><div class="pkb-score">
<div class="pkb-pill"><small>${esc(M.packed)}</small><b data-r="cnt"></b></div>
<div class="pkb-pill" data-r="bp"><small>${esc(M.bingo)}</small><b data-r="bng"></b></div>
<div class="pkb-pill pkb-sc" data-r="sp"><small>${esc(M.score)}</small><b data-r="sc">0</b></div></div>
<div class="pkb-combo" data-r="combo"><b data-r="cmbN"></b><span class="pkb-bar"><i data-r="cbar"></i></span></div></div></div>
<div class="pkb-gw"><div class="pkb-grid">${tiles}</div><svg class="pkb-lines" aria-hidden="true"></svg>
<div class="pkb-banner" data-r="banner" aria-hidden="true"><b data-r="bT"></b><span data-r="bS"></span></div></div>
<div class="pkb-foot"><span data-r="msg" aria-live="polite"></span><div class="pkb-acts"><button type="button" class="pkb-finbtn" data-r="fin" disabled>${esc(M.finish?.trim() || ja.finish!)}</button>${
    shuffle ? `<button type="button" class="pkb-shuf" data-r="shuf">${esc(M.shuffle)}</button>` : ""
  }<button type="button" class="pkb-reset" data-r="reset">${esc(M.reset)}</button></div></div>
<div class="pkb-flash" data-r="flash"></div>
<div class="pkb-perfect" data-r="perfect"><div class="pkb-card" data-r="pcard" role="dialog" aria-label="${esc(M.perfectTitle)}">
<div class="pkb-medal" data-r="medal">${esc(M.perfectStamp)}</div><h3 class="pkb-ptitle" data-r="ptitle">${esc(M.perfectTitle)}</h3><p class="pkb-pbody" data-r="pbody">${esc(perfectText(M, L.items.length))}</p>
<p class="pkb-ptime" data-r="ptime" hidden><small data-r="pTl">${esc(M.statTime?.trim() || ja.statTime!)}</small><b data-r="pT"></b></p>
<div class="pkb-stats"><div><small>${esc(M.statScore)}</small><b data-r="sScore">0</b></div><div><small>${esc(M.statCombo)}</small><b data-r="sCombo">×0</b></div><div><small>${esc(M.statLines)}</small><b data-r="sBingo">0</b></div></div>
<div class="pkb-pbtns"><button type="button" class="pkb-close pkb-again" data-r="again" hidden>${esc(M.again?.trim() || ja.again!)}</button><button type="button" class="pkb-close" data-r="close">${esc(M.close)}</button></div></div></div>
<canvas class="pkb-fx"></canvas>${readyScreen}<div class="pkb-mfx" data-r="mfx" aria-hidden="true"></div></div>${demoBar}</div>`;
}

const perfectText = (M: Messages, total: number) => (typeof M.perfectBody === "function" ? M.perfectBody(total) : M.perfectBody);

/** A callback to run once a state change has finished rendering. */
type Pending = () => void;

interface Particle {
  x: number; y: number; vx: number; vy: number; g: number;
  w: number; h: number; r: number; vr: number; c: string; life: number;
  shape: "rect" | "round" | "star" | "emoji"; e?: string;
}

/** Render a packing bingo card into `container`. Call only in the browser. */
export function createPackingBingo(container: HTMLElement, options: PackingBingoOptions = {}): PackingBingoInstance {
  const L = resolveLayout(options);
  const { items, cellLines } = L;
  const n = L.size, N = items.length;
  const normalize = (v: readonly boolean[] | undefined) => Array.from({ length: N }, (_, i) => !!v?.[i]);
  // Squares that hold items are "slots" (row by row, skipping the FREE square); slot s is cell
  // L.itemCell[s]. `order[s]` is the item in slot s, and `slotOf[i]` the slot of item i.
  const identity = () => Array.from({ length: N }, (_, s) => s);
  const isIdentity = (o: readonly number[]) => o.every((v, s) => v === s);
  const validOrder = (o: unknown): o is number[] =>
    Array.isArray(o) && o.length === N && o.every((v) => Number.isInteger(v) && v >= 0 && v < N) && new Set(o).size === N;
  let order = identity();
  const slotOf = identity();
  /** The winning lines as item indices; they follow the items around when the card is shuffled. */
  let lines = L.lines;
  // Demo start: the top row, plus the diagonal from the top left except its last square (a reach).
  const demoCells = [...cellLines[0], ...cellLines[2 * n].slice(1, -1)];
  const demoSlots = L.itemCell.flatMap((c, s) => (demoCells.includes(c) ? [s] : []));
  const demoStart = () => {
    const on = normalize(undefined);
    demoSlots.forEach((s) => (on[order[s]] = true));
    return on;
  };
  /** Row + column of a cell: how far it is from the top left corner. */
  const far = (c: number) => Math.floor(c / n) + (c % n);
  /** Spacing scale (1 up to 4×4, smaller above), as in the --pk-d CSS variable. */
  const dScale = Math.min(1, 4 / n);
  const M: Messages = { ...ja, ...options.messages };
  if (options.title != null) M.title = options.title;
  if (options.tag != null) M.tag = options.tag;
  if (options.subtitle != null) M.subtitle = options.subtitle;
  const controlled = !!options.controlled;
  const storageKey = resolveStorageKey(options);
  // A prefix, not a suffix: a suffix could collide with another card's own key ("trip:order").
  const orderKey = storageKey && ORDER_PREFIX + storageKey;
  const demo = !!options.demo;
  const vibrate = options.vibrate !== false;
  const uncheck = options.uncheck === true;
  const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const haptics = createHaptics(vibrate);
  let mode: BingoMode = options.mode === "infinite" ? "infinite" : "normal";
  const inf = () => mode === "infinite";
  /**
   * The packing card while the infinite mode is shown: its checks and arrangement. Taps, saving
   * and `onChange` belong to the infinite game until the card switches back.
   */
  let packing: { checked: boolean[]; order: number[] } | null = null;
  /** Infinite mode: lines completed in this game, and the items of complete lines that will clear. */
  let cleared = 0;
  const pending = new Set<number>();
  let clearTimer = 0, clearAt = 0;

  // ---- lifecycle: every timer is tracked so destroy() can stop them ----
  let dead = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (!dead) fn();
    }, ms);
    timers.add(id);
  };
  // Demo pacing uses its own timers so a reset (which cancels `later`) can't strand a demo run.
  const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
  // Bumped whenever pending effects must be dropped (reset, a completed line undone).
  // Long-running loops (count-ups, demo runs) stop when it changes.
  let gen = 0;

  ensureStyles();
  container.innerHTML = template(L, M, {
    demo, shuffle: options.shuffle !== false, vibrate, ready: options.ready !== false, modes: options.modeSwitch !== false,
  });
  const $ = <T extends Element = HTMLElement>(r: string) => {
    const el = container.querySelector(`[data-r="${r}"]`);
    if (!el) throw new Error(`[packing-bingo] internal: missing element "${r}"`);
    return el as T;
  };
  const root = container.querySelector(".pkb") as HTMLElement;
  const board = container.querySelector(".pkb-board") as HTMLElement;
  const gw = container.querySelector(".pkb-gw") as HTMLElement;
  const grid = container.querySelector(".pkb-grid") as HTMLElement;
  const svg = container.querySelector(".pkb-lines") as SVGSVGElement;
  const cv = container.querySelector(".pkb-fx") as HTMLCanvasElement;
  const ctx = cv.getContext("2d");
  /** Every square in grid order, including the FREE one. Rearranged when the card is shuffled. */
  const cellTiles = Array.from(grid.children) as HTMLElement[];
  /** The square of each item (it moves with the item). */
  const tiles = L.itemCell.map((c) => cellTiles[c]);
  const freeTile = L.center >= 0 ? cellTiles[L.center] : null;
  const ins = tiles.map((t) => t.querySelector("input") as HTMLInputElement);
  const stamps = tiles.map((t) => t.querySelector(".pkb-stamp") as HTMLElement);
  const kick = $("kick"), snd = $<HTMLButtonElement>("snd"), perfectEl = $("perfect"), mfx = $("mfx");

  // ---- state ----
  let checked = normalize(undefined);
  let cur: number[] = [];
  let prevLines = new Set<number>();
  let prevReach = new Set<number>();
  let prevAll = false;
  let perfectPending = false, restorePerfectFocus = false;
  let perfectBeat: ((beat: readonly number[]) => void) | undefined;
  let lastN = 0;
  let score = 0, shown = 0, combo = 0, maxCombo = 0, lastT = 0, gotP = false;
  /** Items and lines (by `lineKey`) that have earned their points. */
  const got = new Set<number>(), gotL = new Set<string>();

  // ---- sound ----
  const storedMute = readStore(MUTE_KEY);
  let muted = storedMute != null ? storedMute === "1" : options.sound === false;
  const sfx = createSound(() => muted);
  const setSnd = () => {
    snd.textContent = muted ? M.soundOff : M.soundOn;
    snd.setAttribute("aria-pressed", String(!muted));
  };
  snd.addEventListener("click", () => {
    muted = !muted;
    writeStore(MUTE_KEY, muted ? "1" : "0");
    if (muted) sfx.stop();
    setSnd();
    if (!muted) sfx.pop(4);
  });
  setSnd();

  // ---- particles (confetti, stars, fireworks, falling emoji) on one canvas ----
  let P: Particle[] = [];
  let raf = 0, dpr = 1, BW = 0, BH = 0;
  const fit = () => {
    const r = board.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    BW = r.width;
    BH = r.height;
    cv.width = Math.round(BW * dpr);
    cv.height = Math.round(BH * dpr);
  };
  const piece = (x: number, y: number, vx: number, vy: number, g: number, s: number, life: number, shape: Particle["shape"], colors = CONFETTI): Particle => ({
    x, y, vx, vy, g, life, shape,
    w: (5 + Math.random() * 6) * s, h: (3 + Math.random() * 5) * s,
    r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
    c: colors[(Math.random() * colors.length) | 0],
  });
  const go = () => {
    if (!raf && ctx) raf = requestAnimationFrame(tick);
  };
  interface BurstOpts { angle?: number; spread?: number; speed?: number; g?: number; size?: number; life?: number; star?: number; colors?: readonly string[] }
  function burst(x: number, y: number, n: number, o: BurstOpts = {}) {
    if (calm) return;
    for (let i = 0; i < n; i++) {
      const a = (o.angle ?? -Math.PI / 2) + (Math.random() - 0.5) * (o.spread ?? Math.PI * 2);
      const v = (o.speed ?? 10) * (0.35 + Math.random() * 0.85);
      const sh = Math.random() < (o.star ?? 0.15) ? "star" : Math.random() < 0.3 ? "round" : "rect";
      P.push(piece(x, y, Math.cos(a) * v, Math.sin(a) * v, o.g ?? 0.28, o.size ?? 1, (o.life ?? 110) + Math.random() * 40, sh, o.colors as string[] | undefined));
    }
    go();
  }
  function rain(ms: number) {
    if (calm) return;
    const end = performance.now() + ms;
    const drop = () => {
      for (let i = 0; i < 4; i++)
        P.push(piece(Math.random() * BW, -12, (Math.random() - 0.5) * 2, 2 + Math.random() * 3, 0.045, 1, 420, Math.random() < 0.2 ? "star" : "rect"));
      go();
      if (performance.now() < end) later(drop, 45);
    };
    drop();
  }
  function emojiRain(ms: number) {
    if (calm) return;
    const end = performance.now() + ms;
    const drop = () => {
      const p = piece(Math.random() * BW, -30, (Math.random() - 0.5) * 1.5, 1.5 + Math.random() * 2, 0.05, 1, 500, "emoji");
      p.e = items[(Math.random() * items.length) | 0].emoji;
      p.w = 22 + Math.random() * 12;
      p.vr = (Math.random() - 0.5) * 0.06;
      P.push(p);
      go();
      if (performance.now() < end) later(drop, 110);
    };
    drop();
  }
  function firework(x: number, y: number) {
    burst(x, y, 80, { speed: 7.5, g: 0.06, life: 85, star: 0.4 });
    sfx.boom();
  }
  function star(c: CanvasRenderingContext2D, r: number) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2, q = i % 2 ? r * 0.45 : r;
      c.lineTo(Math.cos(a) * q, Math.sin(a) * q);
    }
    c.closePath();
    c.fill();
  }
  function tick() {
    raf = 0;
    if (dead || !ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, BW, BH);
    P = P.filter((p) => p.life > 0 && p.y < BH + 40);
    for (const p of P) {
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life--;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 25);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      if (p.shape === "round") {
        ctx.beginPath();
        ctx.arc(0, 0, p.h / 1.6, 0, 7);
        ctx.fill();
      } else if (p.shape === "star") star(ctx, p.w * 0.8);
      else if (p.shape === "emoji") {
        ctx.font = `${p.w}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.e ?? "", 0, 0);
      } else {
        ctx.scale(1, Math.cos(p.r * 2.3));
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (P.length) raf = requestAnimationFrame(tick);
  }

  // ---- small effects ----
  const rel = (el: Element) => {
    const b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
  };
  const replay = (el: Element, cls: string) => {
    el.classList.remove(cls);
    void (el as HTMLElement).offsetWidth;
    el.classList.add(cls);
  };
  const hop = (t: HTMLElement, d: number) => {
    if (calm) return;
    t.classList.remove("pkb-squash");
    t.style.setProperty("--pkb-d", d + "ms");
    replay(t, "pkb-hop");
  };
  grid.addEventListener("animationend", (e) => {
    const t = e.target as HTMLElement;
    if (e.animationName === "pkb-stamp-hit") t.classList.remove("pkb-hit");
    if (t.classList.contains("pkb-tile") && (e.animationName === "pkb-hop" || e.animationName === "pkb-squash"))
      t.classList.remove(e.animationName);
    if (t.classList.contains("pkb-tile") && e.animationName === "pkb-clr") t.classList.remove("pkb-clr");
  });
  const ring = (t: HTMLElement) => {
    const r = document.createElement("span");
    r.className = "pkb-ring";
    t.appendChild(r);
    r.addEventListener("animationend", () => r.remove());
  };
  const floatText = (txt: string, x: number, y: number, cls: string, delay = 0, color?: string) => {
    const el = document.createElement("div");
    el.className = "pkb-float pkb-" + cls;
    el.textContent = txt;
    el.style.left = x + "px";
    el.style.top = y + "px";
    if (delay) el.style.animationDelay = delay + "ms";
    if (color) el.style.color = color;
    board.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  };
  // rAF timestamps can be slightly earlier than performance.now(), so clamp progress at 0.
  const prog = (t: number, t0: number, d: number) => Math.max(0, Math.min(1, (t - t0) / d));
  const ease = (k: number) => 1 - Math.pow(1 - k, 3);
  let tw = 0;
  function countScore() {
    cancelAnimationFrame(tw);
    const a = shown, b = score, t0 = performance.now();
    const st = (t: number) => {
      if (dead) return;
      const k = prog(t, t0, 450);
      shown = Math.round(a + (b - a) * ease(k));
      $("sc").textContent = shown.toLocaleString();
      if (k < 1) tw = requestAnimationFrame(st);
    };
    st(t0);
    if (!calm) replay($("sp"), "pkb-bump");
  }
  /** Show points that are already in `score`: a popup plus the header count-up. */
  const showGain = (pts: number, x: number, y: number, cls = "pt") => {
    floatText(`+${pts}`, x, y, cls);
    countScore();
  };
  function countUp(el: HTMLElement, a: number, b: number, d: number, fmt: (v: number) => string, ticks = false) {
    const t0 = performance.now();
    const g = gen;
    let lt = 0;
    const st = (t: number) => {
      if (dead || g !== gen) return;
      const k = prog(t, t0, d);
      el.textContent = fmt(Math.round(a + (b - a) * ease(k)));
      if (ticks && k < 1 && t - lt > 55) {
        sfx.tick();
        lt = t;
      }
      if (k < 1) requestAnimationFrame(st);
      else if (!calm) replay(el, "pkb-bump");
    };
    st(t0);
  }
  const ctr = (t: HTMLElement) => {
    return { x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2 };
  };
  /** Set while the squares fly to new places after a shuffle; the lines are drawn when they land. */
  let landing = 0;
  function drawLines(fresh: number[] = []) {
    if (landing) {
      svg.innerHTML = "";
      return;
    }
    svg.setAttribute("viewBox", `0 0 ${gw.clientWidth} ${gw.clientHeight}`);
    svg.innerHTML = cur
      .map((k) => {
        const a = ctr(cellTiles[cellLines[k][0]]), b = ctr(cellTiles[cellLines[k][n - 1]]);
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, r = 26 * dScale, ex = (dx / d) * r, ey = (dy / d) * r;
        const at = `x1="${a.x - ex}" y1="${a.y - ey}" x2="${b.x + ex}" y2="${b.y + ey}" pathLength="1"`;
        return `<g${fresh.includes(k) ? ' class="pkb-draw"' : ""}><line class="pkb-u" ${at}/><line class="pkb-o" ${at}/></g>`;
      })
      .join("");
  }

  // ---- start screen, countdown and stopwatch ----
  const readyEl = container.querySelector<HTMLButtonElement>('[data-r="ready"]');
  const watch = $("watch");
  /**
   * ready: the start screen is up · count: counting down · idle: waiting for the first tap
   * (without the start screen) · play: timing · done: stopped on a complete card.
   */
  // A cast, not an annotation: other functions change it, so it must not narrow to "idle".
  let phase = "idle" as "ready" | "count" | "idle" | "play" | "done";
  let t0 = 0, watchTimer = 0;
  /** The time the card was completed in; null until a timed game is finished. */
  let finalMs: number | null = null;
  // Countdown steps have their own timers: cancelFx() (a hidden tab, an undone line) must not stop them.
  const cdTimers = new Set<number>();
  const cd = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      cdTimers.delete(id);
      if (!dead) fn();
    }, ms);
    cdTimers.add(id);
  };
  const stopTimers = () => {
    cdTimers.forEach((id) => clearTimeout(id));
    cdTimers.clear();
    clearInterval(watchTimer);
  };
  const elapsed = () => (phase === "play" ? performance.now() - t0 : finalMs ?? 0);
  const showWatch = () => {
    watch.textContent = formatTime(elapsed());
  };
  function startWatch() {
    phase = "play";
    t0 = performance.now();
    finalMs = null;
    clearInterval(watchTimer);
    watchTimer = window.setInterval(showWatch, 100);
    watch.classList.remove("pkb-done");
    watch.classList.add("pkb-run");
    showWatch();
    syncFin();
  }
  /** 🏁 FINISH works only while an infinite game is running. */
  const finBtn = $<HTMLButtonElement>("fin");
  const shufBtn = container.querySelector<HTMLButtonElement>('[data-r="shuf"]');
  const syncFin = () => {
    finBtn.disabled = !(inf() && phase === "play");
    // A finished infinite game stays as it ended, so it can't be shuffled either.
    if (shufBtn) shufBtn.disabled = inf() && phase === "done";
  };
  /** The card is complete: stop the stopwatch, or drop a start screen that is still up. */
  function finish() {
    if (phase === "play") {
      finalMs = performance.now() - t0;
      watch.classList.replace("pkb-run", "pkb-done");
    } else if (phase !== "done") {
      stopTimers();
      openGrid(false);
    }
    phase = "done";
    clearInterval(watchTimer);
    showWatch();
  }
  /** Lift the start screen so the squares can be played; `fade` lets the start word play out. */
  function openGrid(fade: boolean) {
    grid.removeAttribute("inert");
    if (!readyEl || readyEl.hidden) return;
    const focused = document.activeElement === readyEl;
    readyEl.classList.add("pkb-gone");
    board.classList.remove("pkb-waiting");
    readyEl.tabIndex = -1;
    if (focused) grid.querySelector("input")?.focus({ preventScroll: true });
    if (fade) cd(() => (readyEl.hidden = true), GO_MS);
    else readyEl.hidden = true;
  }
  /** A new game: the start screen (or waiting for the first tap) with the stopwatch at zero. */
  function toReady() {
    stopTimers();
    finalMs = null;
    watch.classList.remove("pkb-run", "pkb-done");
    phase = readyEl ? "ready" : "idle";
    showWatch();
    syncFin();
    // A finished infinite game locked the squares; without a start screen they open right away.
    board.classList.remove("pkb-over");
    grid.removeAttribute("inert");
    if (!readyEl) return;
    readyEl.hidden = false;
    readyEl.removeAttribute("tabindex");
    readyEl.classList.remove("pkb-gone", "pkb-counting");
    board.classList.add("pkb-waiting");
    $("count").textContent = "";
    grid.setAttribute("inert", "");
  }
  /**
   * The reset button / reset(): a new game. A controlled card waits until the parent actually
   * empties it (baseline() then restarts), so a rejected reset leaves the game running.
   */
  let resetAsked = false;
  const restartGame = () => {
    if (!controlled || !checked.some(Boolean)) toReady();
    else resetAsked = true; // the parent's answer may be a one-item change, which would look like a tap
  };
  /** Start timing right away, without the countdown (demo runs). */
  function skipReady() {
    if (phase === "play" || phase === "done") return;
    stopTimers();
    openGrid(false);
    startWatch();
  }
  function countdown() {
    if (phase !== "ready") return;
    phase = "count";
    readyEl!.classList.add("pkb-counting");
    const count = $("count");
    const words = ["3", "2", "1", M.readyGo?.trim() || ja.readyGo!];
    words.forEach((word, k) => {
      const go = k === words.length - 1;
      const step = () => {
        count.textContent = word;
        count.classList.toggle("pkb-go", go);
        replay(count, "pkb-tick");
        sfx.count(go);
        haptics.play(go ? "go" : "count");
        if (go) {
          startWatch();
          openGrid(true);
        }
      };
      // The first beep plays inside the tap itself, which is what lets the browser start audio.
      if (k) cd(step, k * COUNT_MS);
      else step();
    });
  }
  readyEl?.addEventListener("click", countdown);

  // ---- big moments ----
  function tapFx(i: number, on: boolean, moment: HapticMoment, fresh: number[]) {
    const p = rel(tiles[i]);
    if (!on) {
      stamps[i].classList.remove("pkb-hit");
      combo = 0;
      $("combo").classList.remove("pkb-on");
      sfx.off();
      haptics.play("off");
      return;
    }
    const now = performance.now();
    combo = now - lastT < COMBO_MS ? combo + 1 : 1;
    lastT = now;
    maxCombo = Math.max(maxCombo, combo);
    // Sound, stamp and vibration all start on this input, even on the winning square.
    const seqLength = new Set(fresh.flatMap((k) => cellLines[k])).size;
    const impactAt = Math.min(70 * seqLength, 300) + 60;
    const beat = haptics.play(moment, combo, fresh.length, impactAt);
    perfectBeat = moment === "perfect" ? beat : undefined;
    const energy = Math.min(3, Math.floor(combo / 3));
    sfx.pop(combo - 1);
    if (!calm) {
      tiles[i].style.setProperty("--pkb-impact", String(energy));
      replay(tiles[i], "pkb-squash");
      replay(stamps[i], "pkb-hit");
      ring(tiles[i]);
    }
    burst(p.x, p.y, 18 + energy * 6, { speed: 6 + energy, g: 0.2, life: 30, size: 0.6, star: 0.5 });
    if (!got.has(i)) {
      got.add(i);
      score += 10 * combo;
      showGain(10 * combo, p.x, p.y - 12);
    }
    if (combo >= 2) {
      floatText(M.comboPop(combo), p.x, p.y + 22, "cmb", 90, COMBO_COLORS[(combo - 2) % COMBO_COLORS.length]);
      $("cmbN").textContent = M.combo(combo);
      // Restart only the timer; keep the combo label visible between rapid taps.
      $("combo").classList.add("pkb-on");
      replay($("cbar"), "pkb-draining");
      if (!calm) replay($("cmbN"), "pkb-bump");
    }
  }
  $("cbar").addEventListener("animationend", () => {
    $("combo").classList.remove("pkb-on");
    combo = 0;
  });

  function reachFx(list: number[]) {
    list.forEach((i) => {
      const p = rel(tiles[i]);
      floatText(M.reachPop, p.x, p.y - 34, "rch", 150);
    });
    later(() => sfx.reach(), 150);
  }

  /** `total` is the line count for the banner ("3 ライン目！"). */
  function bingo(fresh: number[], pts: number, total: number) {
    const nl = fresh.length;
    // The squares of the new lines in line order, including the FREE square.
    const seq = [...new Set(fresh.flatMap((k) => cellLines[k]))].map((c) => cellTiles[c]);
    const step = Math.min(70, 300 / seq.length);
    seq.forEach((t, j) =>
      later(() => {
        hop(t, 0);
        const p = rel(t);
        burst(p.x, p.y, 14, { speed: 5, g: 0.15, life: 30, size: 0.7, star: 0.8 });
        sfx.note(j + 3);
      }, j * step),
    );
    later(() => {
      $("bT").textContent = nl >= 3 ? M.bannerTriple : nl === 2 ? M.bannerDouble : M.bannerSingle;
      $("bS").textContent = nl > 1 ? M.bannerMulti(nl) : M.bannerNth(total);
      replay($("banner"), "pkb-show");
      if (!calm) {
        replay($("flash"), "pkb-go");
        replay(board, "pkb-punch");
      }
      const c = rel(gw);
      burst(c.x, c.y, nl > 1 ? 180 : 110, { speed: nl > 1 ? 16 : 13, star: 0.3 });
      sfx.bingo(nl);
      if (pts) later(() => showGain(pts, c.x, c.y + 105, "big"), 350); // points are already in `score`
    }, seq.length * step + 60);
  }

  function perfect(events: Pending[]) {
    const beat = perfectBeat;
    perfectPending = true;
    perfectEl.classList.remove("pkb-settled");
    const bonus = gotP ? 0 : 1000;
    // Only for a timed first clear, like the PERFECT bonus.
    const speed = gotP || finalMs == null ? 0 : speedBonus(N, finalMs);
    gotP = true;
    score += bonus + speed;
    cellTiles.forEach((t, c) => hop(t, (far(c) * 180) / Math.max(1, n - 1)));
    sfx.perfect();
    if (!calm) replay($("flash"), "pkb-go");
    setResult(false);
    $("pbody").textContent = perfectText(M, N); // a function in `messages` may have changed since the build
    $("ptime").hidden = finalMs == null;
    $("pT").textContent = formatTime(finalMs ?? 0, 2);
    $("sScore").textContent = "0";
    $("sCombo").textContent = "×0";
    $("sBingo").textContent = "0";
    later(() => {
      perfectPending = false;
      replay(perfectEl, "pkb-show");
      $("close").focus({ preventScroll: true });
      later(() => {
        if (!calm) replay(board, "pkb-shake");
        sfx.boom();
        beat?.(PERFECT_STAMP_BEAT);
        burst(0, BH, 90, { angle: -Math.PI / 3, spread: 0.8, speed: 22, g: 0.32, star: 0.3 });
        burst(BW, BH, 90, { angle: (-Math.PI * 2) / 3, spread: 0.8, speed: 22, g: 0.32, star: 0.3 });
        rain(3500);
        if (bonus) floatText(M.perfectBonus(bonus), BW / 2, BH * 0.16, "big");
        // One line above the PERFECT BONUS (.pkb-big is clamp(14px, 5.6cqi, 34px)), so the card can't cover it.
        const gap = Math.min(34, Math.max(14, BW * 0.056)) * 1.3 + 6;
        if (speed) floatText((M.speedBonus ?? ja.speedBonus!)(speed), BW / 2, Math.max(gap / 2 + 4, BH * 0.16 - gap), "big");
        countUp($("sScore"), 0, score, 1300, (v) => v.toLocaleString(), true);
        countUp($("sCombo"), 0, maxCombo, 700, (v) => "×" + v);
        countUp($("sBingo"), 0, resultLines(), 700, String);
        countScore();
      }, PERFECT_STAMP_DELAY_MS);
      later(() => emojiRain(3000), 1500);
    }, PERFECT_REVEAL_MS);
    PERFECT_FIREWORKS.forEach(({ at, beat: pulse }) =>
      later(() => {
        firework(BW * (0.15 + Math.random() * 0.7), BH * (0.12 + Math.random() * 0.3));
        beat?.(pulse);
      }, at),
    );
    const e = { score, maxCombo, time: finalMs == null ? null : Math.round(finalMs), speedBonus: speed };
    events.push(() => options.onPerfect?.(e));
  }

  /**
   * Infinite mode: take the stamps off the squares of the complete lines (`pending`), so they can
   * be filled and scored again. `animate` flips them over; without it (a hidden tab, a shuffle)
   * they clear at once.
   */
  function clearNow(animate: boolean) {
    clearTimeout(clearTimer);
    clearTimer = 0;
    if (!pending.size) return;
    const gone = [...pending].filter((i) => checked[i]);
    pending.clear();
    checked = checked.slice();
    gone.forEach((i) => {
      checked[i] = false;
      ins[i].checked = false;
      got.delete(i);
    });
    // Every complete line was pending, so none is left; the same items can earn a line again.
    gotL.clear();
    const left = completeLines();
    left.forEach((k) => gotL.add(lineKey(lines[k])));
    // Not an undone line: keep render() from cancelling the bingo that is still on screen.
    prevLines = new Set(left);
    render(null, true);
    if (!animate || !gone.length) return;
    sfx.clear(gone.length);
    gone.forEach((i, j) => {
      const t = tiles[i];
      if (!calm) {
        t.style.setProperty("--pkb-cd", Math.min(j * 28, 280) + "ms");
        t.classList.remove("pkb-squash", "pkb-hop");
        replay(t, "pkb-clr");
      }
      const p = rel(t);
      burst(p.x, p.y, 9, { speed: 4.5, g: 0.06, life: 45, size: 0.75, star: 1, colors: SPARK.slice(1) });
    });
  }
  /** Clear the complete lines in `ms`, or later if a clear is already due later (a newer bingo). */
  function scheduleClear(ms: number) {
    const at = performance.now() + ms;
    if (clearTimer && at <= clearAt) return;
    clearTimeout(clearTimer);
    clearAt = at;
    clearTimer = window.setTimeout(() => {
      clearTimer = 0;
      if (!dead) clearNow(true);
    }, ms);
  }
  /** Forget a clear that is due (the card is starting over). */
  const dropClear = () => {
    clearTimeout(clearTimer);
    clearTimer = 0;
    pending.clear();
  };

  /** The results card is shared: the perfect card, or (`fin`) the end of an infinite game. */
  function setResult(fin: boolean) {
    const title = fin ? M.finishTitle?.trim() || ja.finishTitle! : M.perfectTitle;
    perfectEl.classList.toggle("pkb-fin", fin);
    $("pcard").setAttribute("aria-label", title);
    $("medal").textContent = fin ? M.finishStamp?.trim() || ja.finishStamp! : M.perfectStamp;
    $("ptitle").textContent = title;
    $("pTl").textContent = fin ? M.finishTime?.trim() || ja.finishTime! : M.statTime?.trim() || ja.statTime!;
    $("again").hidden = !fin;
  }
  /** The lines the results count: complete ones, or every line of an infinite game. */
  const resultLines = () => (inf() ? cleared : cur.length);
  /** The button that gets focus when the results open: "play again" after an infinite game. */
  const resultFocus = () => $(perfectEl.classList.contains("pkb-fin") ? "again" : "close");

  /** Drop everything that is still scheduled to happen, and show the real score right away. */
  function cancelFx() {
    // A clear that is due still happens, at once: the game must not be left with a complete line.
    if (pending.size) clearNow(false);
    gen++;
    perfectPending = false;
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    haptics.stop();
    sfx.stop();
    cancelAnimationFrame(tw);
    shown = score;
    $("sc").textContent = score.toLocaleString();
  }

  /** Also wipe effects already on screen (used when a new game starts). */
  function clearVisuals(keepPerfect = false) {
    P = [];
    cancelAnimationFrame(raf);
    raf = 0;
    ctx?.clearRect(0, 0, cv.width, cv.height);
    board.querySelectorAll(".pkb-float, .pkb-ring").forEach((el) => el.remove());
    $("banner").classList.remove("pkb-show");
    $("flash").classList.remove("pkb-go");
    $("combo").classList.remove("pkb-on");
    $("cbar").classList.remove("pkb-draining");
    cellTiles.forEach((t) => t.classList.remove("pkb-squash", "pkb-hop", "pkb-clr"));
    stamps.forEach((s) => s.classList.remove("pkb-hit"));
    board.classList.remove("pkb-punch", "pkb-shake", "pkb-switching");
    mfx.classList.remove("pkb-show");
    if (!keepPerfect) perfectEl.classList.remove("pkb-show", "pkb-settled");
  }

  /** The lines (indices into `lines`) whose items are all checked. */
  const completeLines = () => lines.flatMap((l, k) => (l.every((i) => checked[i]) ? [k] : []));

  // ---- render the current `checked` state; `src` is the tapped square, if any ----
  function render(src: number | null, quiet: boolean): Pending[] {
    const events: Pending[] = [];
    const on = checked, c = on.filter(Boolean).length;
    const endless = inf();
    // The infinite mode has no perfect card: a full board is just lines that are about to clear.
    const all = c === N && !endless;
    cur = completeLines();
    const fresh = cur.filter((k) => !prevLines.has(k));
    // A completed line was undone: whatever was still queued to celebrate it no longer applies.
    if ([...prevLines].some((k) => !cur.includes(k))) {
      cancelFx();
      if (c < N) perfectEl.classList.remove("pkb-show");
    }
    if (endless) {
      if (!quiet) cleared += fresh.length;
      // Every complete line clears: after its celebration, or soon after a shuffle lands. Only
      // newly complete squares set the time; other renders (taps elsewhere, refresh) must not
      // keep pushing a due clear back.
      if (cur.length) {
        const known = pending.size;
        cur.forEach((k) => lines[k].forEach((i) => pending.add(i)));
        if (pending.size > known || !clearTimer) scheduleClear(!quiet && fresh.length ? CLEAR_MS : FLY_MS + 200);
      }
    }
    const hit = new Set(cur.flatMap((k) => cellLines[k])); // cells, so the FREE square lights up too
    const reach = new Set<number>();
    for (const l of lines) {
      const m = l.filter((i) => !on[i]);
      if (m.length === 1) reach.add(m[0]);
    }
    tiles.forEach((t, i) => {
      t.classList.toggle("pkb-on", on[i]);
      // A square about to clear stays stamped even with `uncheck`.
      const lock = on[i] && (!uncheck || pending.has(i));
      t.classList.toggle("pkb-lock", lock);
      if (lock) ins[i].setAttribute("aria-readonly", "true");
      else ins[i].removeAttribute("aria-readonly");
      t.classList.toggle("pkb-line", hit.has(L.itemCell[slotOf[i]]));
      t.classList.toggle("pkb-reach", reach.has(i));
    });
    freeTile?.classList.toggle("pkb-line", hit.has(L.center));
    board.classList.toggle("pkb-all", all);
    kick.classList.toggle("pkb-gold", all);
    kick.textContent = all ? M.perfectTag : M.tag;
    $("cnt").textContent = `${c}/${N}`;
    // In the infinite mode the BINGO count keeps every line of the game, cleared or not.
    const total = endless ? cleared : cur.length;
    $("bng").textContent = String(total);
    const bp = $("bp");
    if (total > lastN) {
      bp.classList.remove("pkb-hot");
      void bp.offsetWidth;
    }
    bp.classList.toggle("pkb-hot", total > 0);
    lastN = total;
    drawLines(fresh);
    if (src !== null) {
      const newReach = [...reach].some((i) => !prevReach.has(i));
      const moment = !quiet && all && !prevAll ? "perfect" :
        !quiet && fresh.length ? "bingo" : !quiet && newReach ? "reach" : "tap";
      tapFx(src, on[src], moment, fresh);
    }
    const newL = fresh.map((k) => lineKey(lines[k])).filter((key) => !gotL.has(key));
    newL.forEach((key) => gotL.add(key));
    const linePts = 100 * newL.length * newL.length;
    score += linePts; // earned now; the popup for it is only shown later
    if (quiet) {
      if (linePts) countScore();
    } else if (all && !prevAll) perfect(events);
    else if (fresh.length) {
      bingo(fresh, linePts, total);
      const e = { newLines: fresh, totalLines: total, score, mode };
      events.push(() => options.onBingo?.(e));
    } else if (src !== null && on[src]) {
      const nr = [...reach].filter((i) => !prevReach.has(i));
      if (nr.length) reachFx(nr);
    }
    prevLines = new Set(cur);
    prevReach = reach;
    prevAll = all;
    const labels = [...reach].map((i) => items[i].label);
    $("msg").textContent =
      all ? M.statusDone : labels.length ? M.statusReach(labels) : cur.length ? M.statusLines(cur.length, N - c) : M.statusStart(N - c);
    // Callbacks run only after the state above is consistent (they may reset or destroy the card).
    return events;
  }

  const flush = (events: Pending[]) => {
    for (const fn of events) {
      if (dead) return;
      fn();
    }
  };

  // The infinite game is never saved: the key holds the packing checks.
  const save = () => {
    if (storageKey && !inf()) writeStore(storageKey, JSON.stringify(checked));
  };

  /** Apply a state change that comes from play (taps, demo). */
  function apply(next: boolean[], src: number | null, quiet: boolean): Pending[] {
    if (phase === "idle" && src !== null && next[src]) startWatch();
    if (!inf() && next.every(Boolean)) finish();
    checked = next;
    ins.forEach((x, i) => (x.checked = checked[i]));
    const events = render(src, quiet);
    save();
    return events;
  }

  /** Jump to a state without celebrating it, and rebuild the score as if it had been played calmly. */
  function baseline(next: boolean[]) {
    // Drop pending celebrations and wipe the ones on screen, or they would land on the new game.
    dropClear();
    cleared = 0;
    cancelFx();
    clearVisuals();
    if (!inf() && next.every(Boolean)) finish();
    // A card emptied at once (a reset, loading other progress) is a new game. Unchecking the
    // last item with a tap goes through apply() and keeps the clock running.
    else if ((phase === "play" || phase === "done") && !next.some(Boolean)) toReady();
    checked = next;
    ins.forEach((x, i) => (x.checked = checked[i]));
    got.clear();
    gotL.clear();
    checked.forEach((v, i) => v && got.add(i));
    const done = completeLines();
    done.forEach((k) => gotL.add(lineKey(lines[k])));
    prevLines = new Set(done);
    prevReach = new Set();
    prevAll = !inf() && checked.every(Boolean);
    gotP = prevAll;
    score = shown = got.size * 10 + gotL.size * 100;
    combo = 0;
    maxCombo = 0;
    $("sc").textContent = score.toLocaleString();
    render(null, true); // quiet: produces no events
    save();
  }

  /**
   * A change requested by the user. Controlled cards only report it. The infinite game is the
   * card's own: it applies at once, also on a controlled card, and is not reported.
   */
  function request(next: boolean[], src: number | null, opts: { quiet?: boolean; reset?: boolean } = {}) {
    const game = inf();
    if (controlled && !game) {
      resetAsked = !!opts.reset && resetAsked; // a newer request replaces an unanswered reset
      ins.forEach((x, i) => (x.checked = checked[i])); // undo the browser's own toggle
      options.onChange?.(next.slice());
      return;
    }
    let events: Pending[] = [];
    if (opts.reset) baseline(next);
    else events = apply(next, src, !!opts.quiet);
    if (!game) options.onChange?.(checked.slice());
    flush(events);
  }

  // ---- arrangement (shuffle) ----
  /** Put item `next[s]` in slot s: moves the squares in the DOM, so tab order follows the grid. */
  function place(next: number[]) {
    order = next;
    order.forEach((i, s) => {
      slotOf[i] = s;
      cellTiles[L.itemCell[s]] = tiles[i];
    });
    lines = L.lines.map((l) => l.map((s) => order[s]));
    const focused = document.activeElement;
    cellTiles.forEach((t, c) => {
      t.style.setProperty("--pkb-gd", glintDelay(c, n));
      grid.appendChild(t);
    });
    // Moving a focused element drops its focus; keyboard users keep their place.
    if (focused instanceof HTMLElement && grid.contains(focused) && document.activeElement !== focused)
      focused.focus({ preventScroll: true });
  }

  const saveOrder = () => {
    if (!orderKey || inf()) return;
    // Save the original order too: deleting it would restore a custom defaultOrder on reload.
    writeStore(orderKey, JSON.stringify(order));
  };

  let flights: Animation[] = [];
  /** Rearrange the card, with the squares flying from where they were (unless motion is reduced). */
  function arrange(next: number[]) {
    // Queued celebrations (a bingo's hops, a demo run) would play on squares that have moved.
    // On a complete card the only ones left belong to the perfect finale, which doesn't depend
    // on where the squares are, so it plays on. (The infinite mode has no finale.)
    if (inf() || !checked.every(Boolean)) cancelFx();
    const from = calm ? null : tiles.map((t) => t.getBoundingClientRect()); // mid-flight positions included
    flights.forEach((a) => a.cancel());
    flights = [];
    place(next);
    // Treat every line made entirely of previously packed items as already paid, even if an
    // item was unchecked before shuffling. Otherwise uncheck → shuffle → recheck farms points.
    lines.forEach((l) => {
      if (l.every((i) => got.has(i))) gotL.add(lineKey(l));
    });
    // Lines the new arrangement completes count as done, with no points or celebrations.
    const done = completeLines();
    done.forEach((k) => gotL.add(lineKey(lines[k])));
    prevLines = new Set(done);
    render(null, true);
    saveOrder();
    if (!from || typeof Element.prototype.animate !== "function") return;
    tiles.forEach((t, i) => {
      const a = from[i], b = t.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) + Math.abs(dy) < 1) return;
      flights.push(
        t.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], {
          duration: FLY_MS - 140,
          delay: Math.random() * 140,
          easing: "cubic-bezier(.3,1.25,.5,1)",
          fill: "backwards",
        }),
      );
    });
    clearTimeout(landing);
    landing = window.setTimeout(() => {
      landing = 0;
      flights = [];
      if (!dead) drawLines(cur); // all of them draw in again
    }, FLY_MS);
    svg.innerHTML = "";
  }

  function shuffleCard() {
    if (inf() && phase === "done") return; // a finished infinite game stays as it ended
    let next = order.slice();
    do {
      for (let s = N - 1; s > 0; s--) {
        const r = Math.floor(Math.random() * (s + 1));
        [next[s], next[r]] = [next[r], next[s]];
      }
    } while (next.every((v, s) => v === order[s]));
    arrange(next);
    sfx.shuffle();
    haptics.play("shuffle");
  }

  /** Put every item back in its own square (part of starting over). */
  const unshuffle = () => {
    if (!isIdentity(order)) arrange(identity());
  };

  /** A stamped square that a tap must leave alone: always, unless `uncheck`; and while it is about to clear. */
  const locked = (i: number) => checked[i] && (!uncheck || pending.has(i));
  // Cancel the click before the browser toggles a locked square, so no change event, sound or
  // iPhone haptic follows (a label tap and Space both arrive as a click).
  grid.addEventListener("click", (e) => {
    const i = ins.indexOf(e.target as HTMLInputElement);
    if (i >= 0 && locked(i)) e.preventDefault();
  });
  grid.addEventListener("change", (e) => {
    const i = ins.indexOf(e.target as HTMLInputElement);
    if (i < 0) return;
    if (locked(i)) {
      ins[i].checked = true;
      return;
    }
    const next = checked.slice();
    next[i] = !next[i];
    request(next, i);
  });
  container.querySelector('[data-r="shuf"]')?.addEventListener("click", shuffleCard);
  /** A new infinite game: an empty board, the score and line count at 0, and the start screen. */
  const restartInfinite = () => {
    baseline(normalize(undefined));
    toReady();
  };
  $("reset").addEventListener("click", () => {
    if (inf()) return restartInfinite();
    unshuffle();
    restartGame();
    request(normalize(undefined), null, { reset: true });
  });
  $("close").addEventListener("click", () => perfectEl.classList.remove("pkb-show"));
  $("again").addEventListener("click", () => {
    if (!inf()) return;
    restartInfinite();
    (readyEl && !readyEl.hidden ? readyEl : grid.querySelector("input"))?.focus({ preventScroll: true });
  });

  /**
   * End a running infinite game: settle a due clear, stop the stopwatch, lock the squares and
   * show the results with a fanfare. The squares stay locked until reset or a mode switch.
   */
  function finishGame() {
    if (dead || !inf() || phase !== "play") return;
    cancelFx(); // also clears lines that were about to clear (they are already counted)
    clearVisuals();
    finalMs = performance.now() - t0;
    phase = "done";
    clearInterval(watchTimer);
    watch.classList.replace("pkb-run", "pkb-done");
    showWatch();
    syncFin();
    combo = 0;
    grid.setAttribute("inert", "");
    board.classList.add("pkb-over");
    setResult(true);
    $("pbody").textContent = "";
    $("ptime").hidden = false;
    $("pT").textContent = formatTime(finalMs, 2);
    $("sScore").textContent = "0";
    $("sCombo").textContent = "×0";
    $("sBingo").textContent = "0";
    perfectEl.classList.remove("pkb-settled");
    replay(perfectEl, "pkb-show");
    resultFocus().focus({ preventScroll: true });
    sfx.perfect();
    const beat = haptics.play("finish");
    if (!calm) replay($("flash"), "pkb-go");
    later(() => {
      if (!calm) replay(board, "pkb-shake");
      sfx.boom();
      beat?.(PERFECT_STAMP_BEAT);
      burst(0, BH, 80, { angle: -Math.PI / 3, spread: 0.8, speed: 21, g: 0.32, star: 0.5, colors: SPARK });
      burst(BW, BH, 80, { angle: (-Math.PI * 2) / 3, spread: 0.8, speed: 21, g: 0.32, star: 0.5, colors: SPARK });
      rain(2500);
      countUp($("sScore"), 0, score, 1300, (v) => v.toLocaleString(), true);
      countUp($("sCombo"), 0, maxCombo, 700, (v) => "×" + v);
      countUp($("sBingo"), 0, cleared, 700, String);
    }, PERFECT_STAMP_DELAY_MS);
    [1250, 1700, 2200].forEach((at, k) =>
      later(() => {
        firework(BW * (0.15 + Math.random() * 0.7), BH * (0.12 + Math.random() * 0.3));
        beat?.(PERFECT_FIREWORKS[k * 2].beat);
      }, at),
    );
    const e = { score, maxCombo, lines: cleared, time: Math.round(finalMs) };
    options.onFinish?.(e);
  }
  finBtn.addEventListener("click", finishGame);
  perfectEl.addEventListener("click", (e) => {
    if (e.target === perfectEl) perfectEl.classList.remove("pkb-show");
  });

  // ---- demo buttons ----
  if (demo) {
    let busy = false;
    const prepare = () => {
      if (!inf() && checked.every(Boolean)) request(normalize(undefined), null, { reset: true });
      else perfectEl.classList.remove("pkb-show");
    };
    // Plays `steps` one by one; stops early if the card is reset, a line is undone, or it's destroyed.
    const run = async (steps: { i: number; delay: number; quiet?: boolean }[]) => {
      if (busy) return;
      busy = true;
      try {
        prepare();
        skipReady();
        const g = gen;
        for (const s of steps) {
          await wait(s.delay);
          if (dead || g !== gen) return;
          const next = checked.slice();
          next[s.i] = true;
          request(next, s.i, { quiet: s.quiet });
        }
      } finally {
        busy = false;
      }
    };
    $("dB").addEventListener("click", () => {
      if (inf() && phase === "done") return; // a finished infinite game stays as it ended
      const open = () => lines.map((l) => l.filter((i) => !checked[i])).filter((m) => m.length).sort((a, b) => a.length - b.length)[0] ?? [];
      const pick = !inf() && checked.every(Boolean) ? [...lines[0]] : open();
      void run(pick.map((i) => ({ i, delay: 320 })));
    });
    // The perfect and restore demos are about the packing card; they are hidden in the infinite mode.
    $("dP").addEventListener("click", () => {
      if (inf()) return;
      const all = items.map((_, i) => i);
      const miss = checked.every(Boolean) ? all : all.filter((i) => !checked[i]);
      void run(miss.map((i, k) => (k < miss.length - 1 ? { i, delay: 170, quiet: true } : { i, delay: 450 })));
    });
    $("dR").addEventListener("click", () => {
      if (busy || inf()) return;
      unshuffle();
      restartGame();
      request(demoStart(), null, { reset: true });
    });
  }

  // ---- modes: the switch, and the takeover that plays when it changes ----
  const modeEl = container.querySelector<HTMLElement>('[data-r="mode"]');
  const radios = modeEl ? Array.from(modeEl.querySelectorAll<HTMLButtonElement>("button[data-m]")) : [];
  const syncMode = () => {
    root.classList.toggle("pkb-inf", inf());
    radios.forEach((b) => {
      const on = b.dataset.m === mode;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1; // one tab stop; the arrow keys move between the two
    });
  };
  /** The takeover over the whole card: an aurora with ∞ for the infinite mode, a stamp for the normal one. */
  function modeFx() {
    const endless = inf();
    const title = endless ? M.infiniteTitle?.trim() || ja.infiniteTitle! : M.normalTitle?.trim() || ja.normalTitle!;
    const sub = endless ? M.infiniteSub?.trim() || ja.infiniteSub! : M.normalSub?.trim() || ja.normalSub!;
    const sparks = endless && !calm
      ? Array.from({ length: 18 }, (_, k) => {
          const x = (5 + Math.random() * 90).toFixed(1), y = (6 + Math.random() * 88).toFixed(1);
          const s = (0.45 + Math.random() * 0.95).toFixed(2), t = Math.round(100 + Math.random() * 950);
          return `<i style="--x:${x}%;--y:${y}%;--s:${s};--t:${t}ms;--c:${SPARK[k % SPARK.length]}"></i>`;
        }).join("")
      : "";
    mfx.className = "pkb-mfx " + (endless ? "pkb-mfx-inf" : "pkb-mfx-n");
    mfx.innerHTML =
      (endless ? `<span class="pkb-mfx-glow"></span>` : "") + sparks +
      `<span class="pkb-mfx-in"><b class="pkb-mfx-sym">${endless ? "∞" : esc(M.stamp)}</b>` +
      `<b class="pkb-mfx-t">${esc(title)}</b><span class="pkb-mfx-s">${esc(sub)}</span></span>`;
    replay(mfx, "pkb-show");
    board.classList.add("pkb-switching"); // lifts the switch and the sparks above the takeover
    if (modeEl && !calm) replay(modeEl, "pkb-bump");
    sfx.mode(endless);
    haptics.play(endless ? "infinite" : "normal");
    // Sparks fly off the chosen side of the switch, then burst over the card.
    const picked = radios.find((b) => b.dataset.m === mode);
    if (picked) {
      const p = rel(picked);
      burst(p.x, p.y, endless ? 46 : 24, { speed: endless ? 7 : 5, g: 0.1, life: 55, size: 0.8, star: endless ? 0.9 : 0.3, colors: endless ? SPARK : undefined });
    }
    later(() => {
      const c = rel(gw);
      if (endless) burst(c.x, c.y, 90, { speed: 12, g: 0.07, life: 90, star: 0.75, colors: SPARK });
      else {
        if (!calm) replay(board, "pkb-punch");
        burst(c.x, c.y, 70, { speed: 11, star: 0.2 });
      }
    }, endless ? 260 : 430);
  }
  mfx.addEventListener("animationend", (e) => {
    if (e.target !== mfx) return; // its parts have animations of their own
    mfx.classList.remove("pkb-show");
    board.classList.remove("pkb-switching");
    mfx.innerHTML = "";
  });
  /** Switch modes. Each switch is a new game; the packing card comes back as it was. */
  function setMode(next: BingoMode) {
    if (dead || next === mode || (next !== "normal" && next !== "infinite")) return;
    const back = packing;
    if (next === "infinite") packing = { checked: checked.slice(), order: order.slice() };
    else packing = null;
    mode = next;
    resetAsked = false;
    // The infinite game may have shuffled the squares: put the packing card's arrangement back.
    if (back && back.order.some((v, s) => v !== order[s])) {
      flights.forEach((a) => a.cancel());
      flights = [];
      clearTimeout(landing);
      landing = 0;
      place(back.order);
    }
    syncMode();
    // Start from a fresh clock and an open board first: a finished infinite game ends in phase
    // "done" (locked squares, frozen time), which must not carry over to the packing card.
    toReady();
    baseline(back ? back.checked : normalize(undefined));
    modeFx();
    options.onModeChange?.(mode);
  }
  modeEl?.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-m]");
    if (b) setMode(b.dataset.m as BingoMode);
  });
  modeEl?.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    // Two choices: every arrow key moves to the other one (a radio group wraps around).
    setMode(inf() ? "normal" : "infinite");
    radios.find((b) => b.dataset.m === mode)?.focus();
  });

  // ---- initial arrangement: a saved shuffle, then defaultOrder ----
  let startOrder: number[] | null = null;
  if (orderKey) {
    try {
      const saved: unknown = JSON.parse(readStore(orderKey) ?? "null");
      if (validOrder(saved)) startOrder = saved;
    } catch {
      /* ignore broken saved data */
    }
  }
  if (!startOrder && validOrder(options.defaultOrder)) startOrder = options.defaultOrder.slice();
  if (startOrder && !isIdentity(startOrder)) place(startOrder);

  // ---- initial state: saved progress, then defaultChecked, then the demo start ----
  let initial: boolean[] | null = null;
  if (storageKey) {
    try {
      const saved = JSON.parse(readStore(storageKey) ?? "null");
      if (Array.isArray(saved)) initial = normalize(saved);
    } catch {
      /* ignore broken saved data */
    }
  }
  if (!initial && options.defaultChecked) initial = normalize(options.defaultChecked);
  if (!initial && demo) initial = demoStart();
  fit();
  // Starting in the infinite mode: the packing card waits on the side until it is switched back.
  if (inf()) packing = { checked: initial ?? normalize(undefined), order: order.slice() };
  syncMode();
  baseline(inf() ? normalize(undefined) : initial ?? normalize(undefined));
  if (phase !== "done") toReady();
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); drawLines(); }) : null;
  ro?.observe(board);
  ro?.observe(gw);
  const onVisibility = () => {
    if (!document.hidden) {
      if (restorePerfectFocus && perfectEl.classList.contains("pkb-show")) resultFocus().focus({ preventScroll: true });
      restorePerfectFocus = false;
      return;
    }
    // Results are persistent content. Finish their count-up instead of discarding them.
    const keepPerfect = perfectPending || perfectEl.classList.contains("pkb-show");
    restorePerfectFocus = keepPerfect;
    cancelFx();
    clearVisuals(keepPerfect);
    if (keepPerfect) {
      $("sScore").textContent = score.toLocaleString();
      $("sCombo").textContent = "×" + maxCombo;
      $("sBingo").textContent = String(resultLines());
      perfectEl.classList.add("pkb-show", "pkb-settled");
    }
    combo = 0;
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setChecked(next, opts = {}) {
      if (dead) return;
      const n = normalize(next);
      if (packing) {
        // The infinite game is on the card: this is the packing card's state for when it is back.
        packing.checked = n;
        resetAsked = false;
        if (storageKey) writeStore(storageKey, JSON.stringify(n));
        return;
      }
      if (resetAsked && !n.some(Boolean)) toReady();
      resetAsked = false;
      const changed = n.flatMap((v, i) => (v !== checked[i] ? [i] : []));
      if (!changed.length) return;
      // Only a single-item change is a tap. Bigger jumps (loading saved progress, a reset)
      // update quietly, so they neither celebrate nor earn simultaneous-line points.
      if (!opts.animate || changed.length !== 1) {
        baseline(n);
        return;
      }
      flush(apply(n, changed[0], false));
    },
    reset() {
      if (dead) return;
      if (inf()) return restartInfinite();
      unshuffle();
      restartGame();
      request(normalize(undefined), null, { reset: true });
    },
    shuffle() {
      if (!dead) shuffleCard();
    },
    setMode(next) {
      setMode(next);
    },
    finish() {
      finishGame();
    },
    refresh() {
      if (!dead) render(null, true);
    },
    getState() {
      return {
        checked: checked.slice(),
        lines: cur.slice(),
        score,
        maxCombo,
        complete: !inf() && checked.every(Boolean),
        mode,
        cleared,
        finished: inf() && phase === "done",
        packing: packing && { checked: packing.checked.slice(), order: packing.order.slice() },
        size: n,
        free: L.free,
        order: order.slice(),
        time: Math.round(elapsed()),
      };
    },
    destroy() {
      if (dead) return;
      dead = true;
      stopTimers();
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      clearTimeout(landing);
      clearTimeout(clearTimer);
      flights.forEach((a) => a.cancel());
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tw);
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      haptics.stop();
      sfx.close();
      container.innerHTML = "";
    },
  };
}
