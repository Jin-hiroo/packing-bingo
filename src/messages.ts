/** Every piece of UI text. Pass a partial object as `messages` to override some of them. */
export interface Messages {
  title: string;
  /** A label above the title; empty (not shown) by default. */
  tag: string;
  /** A line under the title; empty (not shown) by default. */
  subtitle: string;
  packed: string;
  bingo: string;
  score: string;
  combo: (n: number) => string;
  comboPop: (n: number) => string;
  reset: string;
  /** The button that moves the items to random squares. */
  shuffle: string;
  soundOn: string;
  soundOff: string;
  /** The big line on the gray start screen over the card (with the `ready` option). */
  readyTitle?: string;
  /** A line under it; empty (not shown) by default. */
  readyPrompt?: string;
  /** Volume reminder on the start screen; an empty string hides it. */
  soundHint?: string;
  /** Android Do Not Disturb reminder; hidden when vibration is disabled or this is empty. */
  vibrationHint?: string;
  /** The "tap to start" cue on the start screen. */
  readyTap?: string;
  /** Shown after the 3, 2, 1 countdown, as the stopwatch starts. */
  readyGo?: string;
  /** Label of the stopwatch, read out by screen readers. */
  time?: string;
  /** Before the finishing time on the perfect card. */
  statTime?: string;
  /** Floats up with the points for the clear time (`speedBonus`). */
  speedBonus?: (points: number) => string;
  /** Label of the mode switch, read out by screen readers. */
  modeLabel?: string;
  /** The mode switch's choice for the normal card. */
  modeNormal?: string;
  /** The mode switch's choice for the infinite mode. */
  modeInfinite?: string;
  /** The big word that sweeps over the card when the normal mode is chosen. */
  normalTitle?: string;
  /** The line under it. */
  normalSub?: string;
  /** The big word that sweeps over the card when the infinite mode is chosen. */
  infiniteTitle?: string;
  /** The line under it, also shown in the start screen's badge in the infinite mode. */
  infiniteSub?: string;
  /** The rule, shown on the start screen in the infinite mode; an empty string hides it. */
  infiniteRule?: string;
  /** The button that ends an infinite game and shows its results. */
  finish?: string;
  /** Title of the infinite game's results. */
  finishTitle?: string;
  /** Text inside the round medal on those results; `\n` starts a new line. */
  finishStamp?: string;
  /** Before the time played on those results. */
  finishTime?: string;
  /** The results' button that starts a new infinite game. */
  again?: string;
  /** @deprecated Ignored since 0.6.0: the pre-play popup became the start screen (see `readyTitle`). */
  playTitle?: string;
  /** @deprecated Ignored since 0.6.0. */
  playStart?: string;
  /** @deprecated Ignored since 0.6.0. */
  playSkip?: string;
  stamp: string;
  /** Text on the FREE square in the center (with `free`). */
  free: string;
  reachBadge: string;
  reachPop: string;
  bannerSingle: string;
  bannerDouble: string;
  bannerTriple: string;
  bannerNth: (totalLines: number) => string;
  bannerMulti: (newLines: number) => string;
  /** The status line before the first line is complete; empty by default. */
  statusStart: (left: number) => string;
  statusLines: (lines: number, left: number) => string;
  /** `labels` are the items that would each complete a line right now; empty by default. */
  statusReach: (labels: string[]) => string;
  statusDone: string;
  perfectTag: string;
  /** Text inside the round stamp; `\n` starts a new line. */
  perfectStamp: string;
  perfectTitle: string;
  /** `\n` starts a new line. As a function, it gets the number of items on the card. */
  perfectBody: string | ((total: number) => string);
  perfectBonus: (points: number) => string;
  statScore: string;
  statCombo: string;
  statLines: string;
  close: string;
  demoLabel: string;
  demoBingo: string;
  demoPerfect: string;
  demoRestore: string;
}

/** Japanese (default). */
export const ja: Messages = {
  title: "持ちものビンゴ",
  tag: "",
  subtitle: "",
  packed: "そろった",
  bingo: "BINGO",
  score: "SCORE",
  combo: (n) => `${n} COMBO`,
  comboPop: (n) => `${n} COMBO!`,
  reset: "リセット",
  shuffle: "🔀 シャッフル",
  soundOn: "🔊 音あり",
  soundOff: "🔇 音なし",
  readyTitle: "Are you ready?",
  readyPrompt: "",
  soundHint: "端末の音量をMAXに",
  vibrationHint: "おやすみモードをオフ",
  readyTap: "タップでスタート",
  readyGo: "START!",
  time: "タイム",
  statTime: "クリアタイム",
  modeLabel: "モード",
  modeNormal: "通常",
  modeInfinite: "∞ 無限",
  normalTitle: "NORMAL",
  normalSub: "通常モード",
  infiniteTitle: "INFINITE",
  infiniteSub: "無限ビンゴ",
  infiniteRule: "そろった列は消えて、また埋められる。何度でもビンゴ！",
  finish: "🏁 FINISH",
  finishTitle: "フィニッシュ！",
  finishStamp: "∞",
  finishTime: "プレイタイム",
  again: "もう一度",
  stamp: "OK",
  free: "FREE",
  reachBadge: "リーチ",
  reachPop: "リーチ!",
  bannerSingle: "BINGO!",
  bannerDouble: "ダブルビンゴ!",
  bannerTriple: "トリプルビンゴ!",
  bannerNth: (n) => `${n} ライン目！`,
  bannerMulti: (n) => `一気に ${n} ライン！`,
  statusStart: () => "",
  statusLines: () => "",
  statusReach: () => "",
  statusDone: "",
  perfectTag: "🏆 PERFECT",
  perfectStamp: "準備\n完了",
  perfectTitle: "パーフェクト！",
  perfectBody: "",
  perfectBonus: (n) => `PERFECT BONUS +${n}`,
  speedBonus: (n) => `SPEED BONUS +${n.toLocaleString()}`,
  statScore: "SCORE",
  statCombo: "MAX COMBO",
  statLines: "BINGO",
  close: "とじる",
  demoLabel: "デモ：",
  demoBingo: "▶ ビンゴを見る",
  demoPerfect: "▶ コンボ → パーフェクト",
  demoRestore: "最初に戻す",
};

/** English. */
export const en: Messages = {
  title: "Packing Bingo",
  tag: "",
  subtitle: "",
  packed: "PACKED",
  bingo: "BINGO",
  score: "SCORE",
  combo: (n) => `${n} COMBO`,
  comboPop: (n) => `${n} COMBO!`,
  reset: "Reset",
  shuffle: "🔀 Shuffle",
  soundOn: "🔊 Sound on",
  soundOff: "🔇 Muted",
  readyTitle: "Are you ready?",
  readyPrompt: "",
  soundHint: "Turn your volume to MAX",
  vibrationHint: "Turn off Do Not Disturb",
  readyTap: "Tap to start",
  readyGo: "GO!",
  time: "Time",
  statTime: "Time",
  modeLabel: "Mode",
  modeNormal: "Normal",
  modeInfinite: "∞ Infinite",
  normalTitle: "NORMAL",
  normalSub: "Normal mode",
  infiniteTitle: "INFINITE",
  infiniteSub: "Infinite bingo",
  infiniteRule: "Completed lines clear, so you can fill them again. Bingo forever!",
  finish: "🏁 FINISH",
  finishTitle: "Finish!",
  finishStamp: "∞",
  finishTime: "Time played",
  again: "Play again",
  stamp: "OK",
  free: "FREE",
  reachBadge: "REACH",
  reachPop: "Reach!",
  bannerSingle: "BINGO!",
  bannerDouble: "DOUBLE BINGO!",
  bannerTriple: "TRIPLE BINGO!",
  bannerNth: (n) => `Line ${n}!`,
  bannerMulti: (n) => `${n} lines at once!`,
  statusStart: () => "",
  statusLines: () => "",
  statusReach: () => "",
  statusDone: "",
  perfectTag: "🏆 PERFECT",
  perfectStamp: "ALL\nSET",
  perfectTitle: "Perfect!",
  perfectBody: "",
  perfectBonus: (n) => `PERFECT BONUS +${n}`,
  speedBonus: (n) => `SPEED BONUS +${n.toLocaleString()}`,
  statScore: "SCORE",
  statCombo: "MAX COMBO",
  statLines: "BINGO",
  close: "Close",
  demoLabel: "Demo:",
  demoBingo: "▶ Show a bingo",
  demoPerfect: "▶ Combo → perfect",
  demoRestore: "Restore",
};
