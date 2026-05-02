import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "自費診療 見積書作成",
  description: "歯科医院 自費診療メニューから見積書を作成するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
