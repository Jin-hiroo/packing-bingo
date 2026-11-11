import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 16 }}>
      <h1>持ちものビンゴ：Next.jsの例</h1>
      <ul>
        <li>
          <Link href="/packing">/packing</Link>：READMEのクイックスタートのページ
        </li>
        <li>
          <Link href="/events">/events</Link>：ビンゴの瞬間を受け取る例（client component）
        </li>
      </ul>
    </main>
  );
}
