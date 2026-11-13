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
  statusLines: (lines, left) => `ビンゴ ${lines} ライン！ のこり ${left} こ`,
  statusReach: () => "",
  statusDone: "🎉 パーフェクト！忘れ物ゼロで出発できます",
  perfectTag: "🏆 PERFECT",
  perfectStamp: "準備\n完了",
  perfectTitle: "パーフェクト！",
  perfectBody: (n) => `${n}こ ぜんぶそろった！\n忘れ物ゼロで、いってらっしゃい！`,
  perfectBonus: (n) => `PERFECT BONUS +${n}`,
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
  statusLines: (lines, left) => `${lines} bingo line${lines === 1 ? "" : "s"}! ${left} to go`,
  statusReach: () => "",
  statusDone: "🎉 Perfect! Nothing left behind.",
  perfectTag: "🏆 PERFECT",
  perfectStamp: "ALL\nSET",
  perfectTitle: "Perfect!",
  perfectBody: (n) => `All ${n} packed!\nHave a great trip!`,
  perfectBonus: (n) => `PERFECT BONUS +${n}`,
  statScore: "SCORE",
  statCombo: "MAX COMBO",
  statLines: "BINGO",
  close: "Close",
  demoLabel: "Demo:",
  demoBingo: "▶ Show a bingo",
  demoPerfect: "▶ Combo → perfect",
  demoRestore: "Restore",
};
