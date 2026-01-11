import type { Metadata } from "next";
import "./styles/index.css";

export const metadata: Metadata = {
  title: "Hệ Thống Quản Lý Máy Ấp Trứng AI",
  description: "Management system for AI incubators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
