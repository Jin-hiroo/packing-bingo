import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "持ちものビンゴ（Next.jsの例）",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* 持ちものビンゴのフォント。なくても動きます */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=M+PLUS+Rounded+1c:wght@500;800&display=swap" />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", lineHeight: 1.7 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>{children}</div>
      </body>
    </html>
  );
}
