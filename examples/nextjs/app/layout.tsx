import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "持ちものビンゴ（Next.jsの例）",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", lineHeight: 1.7 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
