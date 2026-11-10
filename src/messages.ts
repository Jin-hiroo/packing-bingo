/** Every piece of UI text. Pass a partial object as `messages` to override some of them. */
export interface Messages {
  title: string;
  tag: string;
  subtitle: string;
  packed: string;
  bingo: string;
  score: string;
  combo: (n: number) => string;
  comboPop: (n: number) => string;
  reset: string;
  soundOn: string;
  soundOff: string;
  stamp: string;
  reachBadge: string;
  reachPop: string;
  bannerSingle: string;
  bannerDouble: string;
  bannerTriple: string;
  bannerNth: (totalLines: number) => string;
  bannerMulti: (newLines: number) => string;
  statusStart: (left: number) => string;
  statusLines: (lines: number, left: number) => string;
  /** `labels` are the items that would each complete a line right now. */
  statusReach: (labels: string[]) => string;
  statusDone: string;
  perfectTag: string;
  /** Text inside the round stamp; `\n` starts a new line. */
  perfectStamp: string;
  perfectTitle: string;
  /** `\n` starts a new line. */
  perfectBody: string;
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
  tag: "修学旅行",
  subtitle: "タップでスタンプ。タテ・ヨコ・ナナメでビンゴ！",
  packed: "そろった",
  bingo: "BINGO",
  score: "SCORE",
  combo: (n) => `${n} COMBO`,
  comboPop: (n) => `${n} COMBO!`,
  reset: "リセット",
  soundOn: "🔊 音あり",
  soundOff: "🔇 音なし",
  stamp: "OK",
  reachBadge: "リーチ",
  reachPop: "リーチ!",
  bannerSingle: "BINGO!",
  bannerDouble: "ダブルビンゴ!",
  bannerTriple: "トリプルビンゴ!",
  bannerNth: (n) => `${n} ライン目！`,
  bannerMulti: (n) => `一気に ${n} ライン！`,
  statusStart: (left) => `のこり ${left} こ。まずは1ラインそろえよう`,
  statusLines: (lines, left) => `ビンゴ ${lines} ライン！ のこり ${left} こ`,
  statusReach: (labels) =>
    `リーチ！ あと${labels.slice(0, 2).map((l) => `「${l}」`).join("か")}${labels.length > 2 ? "など" : ""}でビンゴ`,
  statusDone: "🎉 パーフェクト！忘れ物ゼロで出発できます",
  perfectTag: "🏆 PERFECT",
  perfectStamp: "準備\n完了",
  perfectTitle: "パーフェクト！",
  perfectBody: "16こ ぜんぶそろった！\n忘れ物ゼロで、いってらっしゃい！",
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
  tag: "School trip",
  subtitle: "Tap to stamp. Rows, columns and diagonals all count!",
  packed: "PACKED",
  bingo: "BINGO",
  score: "SCORE",
  combo: (n) => `${n} COMBO`,
  comboPop: (n) => `${n} COMBO!`,
  reset: "Reset",
  soundOn: "🔊 Sound on",
  soundOff: "🔇 Muted",
  stamp: "OK",
  reachBadge: "REACH",
  reachPop: "Reach!",
  bannerSingle: "BINGO!",
  bannerDouble: "DOUBLE BINGO!",
  bannerTriple: "TRIPLE BINGO!",
  bannerNth: (n) => `Line ${n}!`,
  bannerMulti: (n) => `${n} lines at once!`,
  statusStart: (left) => `${left} to go. Finish a line first!`,
  statusLines: (lines, left) => `${lines} bingo line${lines === 1 ? "" : "s"}! ${left} to go`,
  statusReach: (labels) =>
    `Reach! Pack ${labels.slice(0, 2).join(" or ")}${labels.length > 2 ? " (or more)" : ""} for a bingo`,
  statusDone: "🎉 Perfect! Nothing left behind.",
  perfectTag: "🏆 PERFECT",
  perfectStamp: "ALL\nSET",
  perfectTitle: "Perfect!",
  perfectBody: "All 16 packed!\nHave a great trip!",
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
