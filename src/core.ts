import { DEFAULT_ITEMS, type BingoItem } from "./items";
import { bingoLines, resolveLayout, type Layout } from "./layout";
import { en, ja, type Messages } from "./messages";
import { createSound } from "./sound";
import { resolveStorageKey } from "./storage-key";
import { CSS, FONT_URL } from "./styles";

export { DEFAULT_ITEMS, ja, en, bingoLines };
export type { BingoItem, Messages };

/**
 * The 10 winning lines of a 4×4 card: 4 rows, 4 columns, 2 diagonals (indices are row-major).
 * For other sizes, use `bingoLines(size, free)`.
 */
export const LINES: readonly (readonly number[])[] = bingoLines(4);

export interface PackingBingoState {
  /** One boolean per item, row by row (the FREE square is not included). */
  checked: boolean[];
  /** The completed lines, as indices into `bingoLines(size, free)`. */
  lines: number[];
  score: number;
  maxCombo: number;
  complete: boolean;
  /** Squares per side. */
  size: number;
  /** Whether the center is a FREE square. */
  free: boolean;
}

export interface BingoEvent {
  /** Lines (indices into `bingoLines(size, free)`, which is LINES for 4×4) completed by this change. */
  newLines: number[];
  totalLines: number;
  score: number;
}

export interface PerfectEvent {
  score: number;
  maxCombo: number;
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
  /** Load the display fonts from Google Fonts (default true). */
  fonts?: boolean;
  /** Pre-fill a few items and show demo buttons. */
  demo?: boolean;
  onChange?: (checked: boolean[]) => void;
  onBingo?: (event: BingoEvent) => void;
  onPerfect?: (event: PerfectEvent) => void;
}

export interface PackingBingoInstance {
  /**
   * Set the card. With `animate`, a change of exactly one item plays like a tap (including any
   * bingo or perfect it causes). Any other change, like loading saved progress, applies quietly.
   */
  setChecked(next: readonly boolean[], options?: { animate?: boolean }): void;
  /** Clear the card and score (calls onChange). */
  reset(): void;
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

type WithUserActivation = Navigator & { userActivation?: { hasBeenActive: boolean } };

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

function ensureAssets(fonts: boolean) {
  if (!document.getElementById("pkb-styles")) {
    const s = document.createElement("style");
    s.id = "pkb-styles";
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  if (fonts && !document.getElementById("pkb-fonts")) {
    const l = document.createElement("link");
    l.id = "pkb-fonts";
    l.rel = "stylesheet";
    l.href = FONT_URL;
    document.head.appendChild(l);
  }
}

function template(L: Layout, M: Messages, demo: boolean) {
  const n = L.size;
  const tiles = Array.from({ length: n * n }, (_, c) => {
    // The shine on completed lines sweeps from the top left corner (0.72 s to the far corner).
    const gd = `--pkb-gd:${+(((Math.floor(c / n) + (c % n)) * 0.36) / Math.max(1, n - 1)).toFixed(3)}s`;
    if (c === L.center)
      return `<div class="pkb-tile pkb-free pkb-on" style="${gd}"><span class="pkb-stamp">${esc(M.free)}</span></div>`;
    const it = L.items[L.itemCell.indexOf(c)];
    return (
      `<label class="pkb-tile" data-reach="${esc(M.reachBadge)}" style="${gd}">` +
      `<input type="checkbox"><span class="pkb-emo" aria-hidden="true">${esc(it.emoji)}</span>` +
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
  return `<div class="pkb" style="${scale}"><div class="pkb-board">
<div class="pkb-head"><div>
<div class="pkb-tags"><span class="pkb-kicker" data-r="kick">${esc(M.tag)}</span><button type="button" class="pkb-snd" data-r="snd"></button></div>
<h2 class="pkb-title">${esc(M.title)}</h2>${M.subtitle ? `<p class="pkb-sub">${esc(M.subtitle)}</p>` : ""}</div>
<div class="pkb-side"><div class="pkb-score">
<div class="pkb-pill"><small>${esc(M.packed)}</small><b data-r="cnt"></b></div>
<div class="pkb-pill" data-r="bp"><small>${esc(M.bingo)}</small><b data-r="bng"></b></div>
<div class="pkb-pill pkb-sc" data-r="sp"><small>${esc(M.score)}</small><b data-r="sc">0</b></div></div>
<div class="pkb-combo" data-r="combo"><b data-r="cmbN"></b><span class="pkb-bar"><i data-r="cbar"></i></span></div></div></div>
<div class="pkb-gw"><div class="pkb-grid">${tiles}</div><svg class="pkb-lines" aria-hidden="true"></svg>
<div class="pkb-banner" data-r="banner" aria-hidden="true"><b data-r="bT"></b><span data-r="bS"></span></div></div>
<div class="pkb-foot"><span data-r="msg" aria-live="polite"></span><button type="button" class="pkb-reset" data-r="reset">${esc(M.reset)}</button></div>
<div class="pkb-flash" data-r="flash"></div>
<div class="pkb-perfect" data-r="perfect"><div class="pkb-card" role="dialog" aria-label="${esc(M.perfectTitle)}">
<div class="pkb-medal">${esc(M.perfectStamp)}</div><h3 class="pkb-ptitle">${esc(M.perfectTitle)}</h3><p class="pkb-pbody" data-r="pbody">${esc(perfectText(M, L.items.length))}</p>
<div class="pkb-stats"><div><small>${esc(M.statScore)}</small><b data-r="sScore">0</b></div><div><small>${esc(M.statCombo)}</small><b data-r="sCombo">×0</b></div><div><small>${esc(M.statLines)}</small><b data-r="sBingo">0</b></div></div>
<button type="button" class="pkb-close" data-r="close">${esc(M.close)}</button></div></div>
<canvas class="pkb-fx"></canvas></div>${demoBar}</div>`;
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
  const { items, lines, cellLines } = L;
  const n = L.size, N = items.length;
  const normalize = (v: readonly boolean[] | undefined) => Array.from({ length: N }, (_, i) => !!v?.[i]);
  // Demo start: the top row, plus the diagonal from the top left except its last square (a reach).
  const demoCells = [...cellLines[0], ...cellLines[2 * n].slice(1, -1)];
  const demoItems = new Set(L.itemCell.flatMap((c, i) => (demoCells.includes(c) ? [i] : [])));
  const demoStart = () => Array.from({ length: N }, (_, i) => demoItems.has(i));
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
  const demo = !!options.demo;
  const calm = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  ensureAssets(options.fonts !== false);
  container.innerHTML = template(L, M, demo);
  const $ = <T extends Element = HTMLElement>(r: string) => {
    const el = container.querySelector(`[data-r="${r}"]`);
    if (!el) throw new Error(`[packing-bingo] internal: missing element "${r}"`);
    return el as T;
  };
  const board = container.querySelector(".pkb-board") as HTMLElement;
  const gw = container.querySelector(".pkb-gw") as HTMLElement;
  const grid = container.querySelector(".pkb-grid") as HTMLElement;
  const svg = container.querySelector(".pkb-lines") as SVGSVGElement;
  const cv = container.querySelector(".pkb-fx") as HTMLCanvasElement;
  const ctx = cv.getContext("2d");
  /** Every square in grid order, including the FREE one. */
  const cellTiles = Array.from(grid.children) as HTMLElement[];
  /** The square of each item. */
  const tiles = L.itemCell.map((c) => cellTiles[c]);
  const freeTile = L.center >= 0 ? cellTiles[L.center] : null;
  const ins = tiles.map((t) => t.querySelector("input") as HTMLInputElement);
  const kick = $("kick"), snd = $<HTMLButtonElement>("snd"), perfectEl = $("perfect");

  // ---- state ----
  let checked = normalize(undefined);
  let cur: number[] = [];
  let prevLines = new Set<number>();
  let prevReach = new Set<number>();
  let prevAll = false;
  let lastN = 0;
  let score = 0, shown = 0, combo = 0, maxCombo = 0, lastT = 0, gotP = false;
  const got = new Set<number>(), gotL = new Set<number>();

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
  const piece = (x: number, y: number, vx: number, vy: number, g: number, s: number, life: number, shape: Particle["shape"]): Particle => ({
    x, y, vx, vy, g, life, shape,
    w: (5 + Math.random() * 6) * s, h: (3 + Math.random() * 5) * s,
    r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
    c: CONFETTI[(Math.random() * CONFETTI.length) | 0],
  });
  const go = () => {
    if (!raf && ctx) raf = requestAnimationFrame(tick);
  };
  interface BurstOpts { angle?: number; spread?: number; speed?: number; g?: number; size?: number; life?: number; star?: number }
  function burst(x: number, y: number, n: number, o: BurstOpts = {}) {
    if (calm) return;
    for (let i = 0; i < n; i++) {
      const a = (o.angle ?? -Math.PI / 2) + (Math.random() - 0.5) * (o.spread ?? Math.PI * 2);
      const v = (o.speed ?? 10) * (0.35 + Math.random() * 0.85);
      const sh = Math.random() < (o.star ?? 0.15) ? "star" : Math.random() < 0.3 ? "round" : "rect";
      P.push(piece(x, y, Math.cos(a) * v, Math.sin(a) * v, o.g ?? 0.28, o.size ?? 1, (o.life ?? 110) + Math.random() * 40, sh));
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
    if (t.classList.contains("pkb-tile") && (e.animationName === "pkb-hop" || e.animationName === "pkb-squash"))
      t.classList.remove(e.animationName);
  });
  const ring = (t: HTMLElement) => {
    const r = document.createElement("span");
    r.className = "pkb-ring";
    t.appendChild(r);
    r.addEventListener("animationend", () => r.remove());
  };
  const buzz = (pattern: number | number[]) => {
    const ua = (navigator as WithUserActivation).userActivation;
    if (ua && !ua.hasBeenActive) return; // vibration needs a prior user gesture
    try {
      navigator.vibrate?.(pattern);
    } catch {
      /* unsupported */
    }
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
  function drawLines(fresh: number[] = []) {
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

  // ---- big moments ----
  function tapFx(i: number, on: boolean) {
    const p = rel(tiles[i]);
    if (!on) {
      combo = 0;
      $("combo").classList.remove("pkb-on");
      sfx.off();
      return;
    }
    const now = performance.now();
    combo = now - lastT < COMBO_MS ? combo + 1 : 1;
    lastT = now;
    maxCombo = Math.max(maxCombo, combo);
    sfx.pop(combo - 1);
    if (!calm) {
      replay(tiles[i], "pkb-squash");
      ring(tiles[i]);
    }
    burst(p.x, p.y, 18, { speed: 6, g: 0.2, life: 30, size: 0.6, star: 0.5 });
    if (!got.has(i)) {
      got.add(i);
      score += 10 * combo;
      showGain(10 * combo, p.x, p.y - 12);
    }
    if (combo >= 2) {
      floatText(M.comboPop(combo), p.x, p.y + 22, "cmb", 90, COMBO_COLORS[(combo - 2) % COMBO_COLORS.length]);
      $("cmbN").textContent = M.combo(combo);
      replay($("combo"), "pkb-on");
    }
    buzz(12);
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

  function bingo(fresh: number[], pts: number) {
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
      $("bS").textContent = nl > 1 ? M.bannerMulti(nl) : M.bannerNth(cur.length);
      replay($("banner"), "pkb-show");
      if (!calm) {
        replay($("flash"), "pkb-go");
        replay(board, "pkb-punch");
      }
      const c = rel(gw);
      burst(c.x, c.y, nl > 1 ? 180 : 110, { speed: nl > 1 ? 16 : 13, star: 0.3 });
      sfx.bingo(nl);
      buzz(nl > 1 ? [40, 60, 40, 60, 90] : [40, 60, 40]);
      if (pts) later(() => showGain(pts, c.x, c.y + 105, "big"), 350); // points are already in `score`
    }, seq.length * step + 60);
  }

  function perfect(events: Pending[]) {
    const bonus = gotP ? 0 : 1000;
    gotP = true;
    score += bonus;
    cellTiles.forEach((t, c) => hop(t, (far(c) * 180) / Math.max(1, n - 1)));
    sfx.perfect();
    if (!calm) replay($("flash"), "pkb-go");
    $("pbody").textContent = perfectText(M, N); // a function in `messages` may have changed since the build
    $("sScore").textContent = "0";
    $("sCombo").textContent = "×0";
    $("sBingo").textContent = "0";
    later(() => {
      replay(perfectEl, "pkb-show");
      $("close").focus({ preventScroll: true });
      later(() => {
        if (!calm) replay(board, "pkb-shake");
        sfx.boom();
        burst(0, BH, 90, { angle: -Math.PI / 3, spread: 0.8, speed: 22, g: 0.32, star: 0.3 });
        burst(BW, BH, 90, { angle: (-Math.PI * 2) / 3, spread: 0.8, speed: 22, g: 0.32, star: 0.3 });
        rain(3500);
        buzz([60, 80, 60, 80, 200]);
        if (bonus) floatText(M.perfectBonus(bonus), BW / 2, BH * 0.16, "big");
        countUp($("sScore"), 0, score, 1300, (v) => v.toLocaleString(), true);
        countUp($("sCombo"), 0, maxCombo, 700, (v) => "×" + v);
        countUp($("sBingo"), 0, cur.length, 700, String);
        countScore();
      }, 720);
      [1300, 1650, 2000, 2350, 2700].forEach((t) =>
        later(() => firework(BW * (0.15 + Math.random() * 0.7), BH * (0.12 + Math.random() * 0.3)), t),
      );
      later(() => emojiRain(3000), 1500);
    }, 520);
    const e = { score, maxCombo };
    events.push(() => options.onPerfect?.(e));
  }

  /** Drop everything that is still scheduled to happen, and show the real score right away. */
  function cancelFx() {
    gen++;
    timers.forEach((id) => clearTimeout(id));
    timers.clear();
    cancelAnimationFrame(tw);
    shown = score;
    $("sc").textContent = score.toLocaleString();
  }

  /** Also wipe effects already on screen (used when a new game starts). */
  function clearVisuals() {
    P = [];
    cancelAnimationFrame(raf);
    raf = 0;
    ctx?.clearRect(0, 0, cv.width, cv.height);
    board.querySelectorAll(".pkb-float, .pkb-ring").forEach((el) => el.remove());
    $("banner").classList.remove("pkb-show");
    $("flash").classList.remove("pkb-go");
    $("combo").classList.remove("pkb-on");
    perfectEl.classList.remove("pkb-show");
  }

  // ---- render the current `checked` state; `src` is the tapped square, if any ----
  function render(src: number | null, quiet: boolean): Pending[] {
    const events: Pending[] = [];
    const on = checked, c = on.filter(Boolean).length;
    cur = lines.flatMap((l, k) => (l.every((i) => on[i]) ? [k] : []));
    const fresh = cur.filter((k) => !prevLines.has(k));
    // A completed line was undone: whatever was still queued to celebrate it no longer applies.
    if ([...prevLines].some((k) => !cur.includes(k))) {
      cancelFx();
      if (c < N) perfectEl.classList.remove("pkb-show");
    }
    const hit = new Set(cur.flatMap((k) => cellLines[k])); // cells, so the FREE square lights up too
    const reach = new Set<number>();
    for (const l of lines) {
      const m = l.filter((i) => !on[i]);
      if (m.length === 1) reach.add(m[0]);
    }
    tiles.forEach((t, i) => {
      t.classList.toggle("pkb-on", on[i]);
      t.classList.toggle("pkb-line", hit.has(L.itemCell[i]));
      t.classList.toggle("pkb-reach", reach.has(i));
    });
    freeTile?.classList.toggle("pkb-line", hit.has(L.center));
    board.classList.toggle("pkb-all", c === N);
    kick.classList.toggle("pkb-gold", c === N);
    kick.textContent = c === N ? M.perfectTag : M.tag;
    $("cnt").textContent = `${c}/${N}`;
    $("bng").textContent = String(cur.length);
    const bp = $("bp");
    if (cur.length > lastN) {
      bp.classList.remove("pkb-hot");
      void bp.offsetWidth;
    }
    bp.classList.toggle("pkb-hot", cur.length > 0);
    lastN = cur.length;
    drawLines(fresh);
    if (src !== null) tapFx(src, on[src]);
    const newL = fresh.filter((k) => !gotL.has(k));
    newL.forEach((k) => gotL.add(k));
    const linePts = 100 * newL.length * newL.length;
    score += linePts; // earned now; the popup for it is only shown later
    if (quiet) {
      if (linePts) countScore();
    } else if (c === N && !prevAll) perfect(events);
    else if (fresh.length) {
      bingo(fresh, linePts);
      const e = { newLines: fresh, totalLines: cur.length, score };
      events.push(() => options.onBingo?.(e));
    } else if (src !== null && on[src]) {
      const nr = [...reach].filter((i) => !prevReach.has(i));
      if (nr.length) reachFx(nr);
    }
    prevLines = new Set(cur);
    prevReach = reach;
    prevAll = c === N;
    const labels = [...reach].map((i) => items[i].label);
    $("msg").textContent =
      c === N ? M.statusDone : labels.length ? M.statusReach(labels) : cur.length ? M.statusLines(cur.length, N - c) : M.statusStart(N - c);
    // Callbacks run only after the state above is consistent (they may reset or destroy the card).
    return events;
  }

  const flush = (events: Pending[]) => {
    for (const fn of events) {
      if (dead) return;
      fn();
    }
  };

  const save = () => {
    if (storageKey) writeStore(storageKey, JSON.stringify(checked));
  };

  /** Apply a state change that comes from play (taps, demo). */
  function apply(next: boolean[], src: number | null, quiet: boolean): Pending[] {
    checked = next;
    ins.forEach((x, i) => (x.checked = checked[i]));
    const events = render(src, quiet);
    save();
    return events;
  }

  /** Jump to a state without celebrating it, and rebuild the score as if it had been played calmly. */
  function baseline(next: boolean[]) {
    // Drop pending celebrations and wipe the ones on screen, or they would land on the new game.
    cancelFx();
    clearVisuals();
    checked = next;
    ins.forEach((x, i) => (x.checked = checked[i]));
    got.clear();
    gotL.clear();
    checked.forEach((v, i) => v && got.add(i));
    lines.forEach((l, k) => l.every((i) => checked[i]) && gotL.add(k));
    prevLines = new Set(gotL);
    prevReach = new Set();
    prevAll = checked.every(Boolean);
    gotP = prevAll;
    score = shown = got.size * 10 + gotL.size * 100;
    combo = 0;
    maxCombo = 0;
    $("sc").textContent = score.toLocaleString();
    render(null, true); // quiet: produces no events
    save();
  }

  /** A change requested by the user. Controlled cards only report it. */
  function request(next: boolean[], src: number | null, opts: { quiet?: boolean; reset?: boolean } = {}) {
    if (controlled) {
      ins.forEach((x, i) => (x.checked = checked[i])); // undo the browser's own toggle
      options.onChange?.(next.slice());
      return;
    }
    let events: Pending[] = [];
    if (opts.reset) baseline(next);
    else events = apply(next, src, !!opts.quiet);
    options.onChange?.(checked.slice());
    flush(events);
  }

  grid.addEventListener("change", (e) => {
    const i = ins.indexOf(e.target as HTMLInputElement);
    if (i < 0) return;
    const next = checked.slice();
    next[i] = !next[i];
    request(next, i);
  });
  $("reset").addEventListener("click", () => request(normalize(undefined), null, { reset: true }));
  $("close").addEventListener("click", () => perfectEl.classList.remove("pkb-show"));
  perfectEl.addEventListener("click", (e) => {
    if (e.target === perfectEl) perfectEl.classList.remove("pkb-show");
  });

  // ---- demo buttons ----
  if (demo) {
    let busy = false;
    const prepare = () => {
      if (checked.every(Boolean)) request(normalize(undefined), null, { reset: true });
      else perfectEl.classList.remove("pkb-show");
    };
    // Plays `steps` one by one; stops early if the card is reset, a line is undone, or it's destroyed.
    const run = async (steps: { i: number; delay: number; quiet?: boolean }[]) => {
      if (busy) return;
      busy = true;
      try {
        prepare();
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
      const open = () => lines.map((l) => l.filter((i) => !checked[i])).filter((m) => m.length).sort((a, b) => a.length - b.length)[0] ?? [];
      const pick = checked.every(Boolean) ? [...lines[0]] : open();
      void run(pick.map((i) => ({ i, delay: 320 })));
    });
    $("dP").addEventListener("click", () => {
      const all = items.map((_, i) => i);
      const miss = checked.every(Boolean) ? all : all.filter((i) => !checked[i]);
      void run(miss.map((i, k) => (k < miss.length - 1 ? { i, delay: 170, quiet: true } : { i, delay: 450 })));
    });
    $("dR").addEventListener("click", () => {
      if (!busy) request(demoStart(), null, { reset: true });
    });
  }

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
  baseline(initial ?? normalize(undefined));
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { fit(); drawLines(); }) : null;
  ro?.observe(board);
  ro?.observe(gw);

  return {
    setChecked(next, opts = {}) {
      if (dead) return;
      const n = normalize(next);
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
      if (!dead) request(normalize(undefined), null, { reset: true });
    },
    refresh() {
      if (!dead) render(null, true);
    },
    getState() {
      return { checked: checked.slice(), lines: cur.slice(), score, maxCombo, complete: checked.every(Boolean), size: n, free: L.free };
    },
    destroy() {
      if (dead) return;
      dead = true;
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tw);
      ro?.disconnect();
      sfx.close();
      container.innerHTML = "";
    },
  };
}
