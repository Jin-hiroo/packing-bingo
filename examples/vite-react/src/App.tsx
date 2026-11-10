import { OkinawaPackingBingo } from "./OkinawaPackingBingo";

export function App() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif", lineHeight: 1.7 }}>
      <h1>沖縄修学旅行のしおり</h1>
      <p>持ち物をかばんに入れたら、マスをタップしてください。進み具合はこのブラウザに保存されます。</p>

      {/* 表示したい場所に、この1行を置くだけです */}
      <OkinawaPackingBingo />
    </main>
  );
}
