import { PackingWithEvents } from "@/components/PackingWithEvents";

export default function EventsPage() {
  return (
    <main style={{ padding: 16 }}>
      <h1>ビンゴの瞬間を受け取る</h1>
      <p>
        タップ・ビンゴ・パーフェクトのたびに、コールバックが呼ばれます。点数の記録やお知らせなどに使えます。
      </p>
      <PackingWithEvents />
    </main>
  );
}
