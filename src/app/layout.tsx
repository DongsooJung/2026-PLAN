import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "구독 관리 대시보드",
  description: "내 모든 구독 서비스를 한눈에 관리하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
