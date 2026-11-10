"use client";

// コールバック（onChange・onBingo・onPerfect）を渡す部品は、Server Component からは使えないので、
// 1行目に "use client" を書いて client component にします。
import { useState } from "react";
import { PackingBingo } from "packing-bingo";

export function PackingWithEvents() {
  const [log, setLog] = useState<string[]>([]);
  const add = (line: string) => setLog((prev) => [line, ...prev].slice(0, 20));

  return (
    <>
      <PackingBingo
        tag="イベントの例"
        onChange={(checked) => add(`チェック：${checked.filter(Boolean).length}/16`)}
        onBingo={({ newLines, totalLines, score }) => add(`ビンゴ！ ${newLines.length}列そろった（合計${totalLines}列、${score}点）`)}
        onPerfect={({ score, maxCombo }) => add(`パーフェクト！ ${score}点、最大${maxCombo}コンボ`)}
      />
      <h2>受け取ったイベント（新しい順）</h2>
      {log.length === 0 ? <p>マスをタップすると、ここに出ます。</p> : (
        <ol reversed>
          {log.map((line, i) => (
            <li key={log.length - i}>{line}</li>
          ))}
        </ol>
      )}
    </>
  );
}
