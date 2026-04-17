import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "ElPriser.nu",
  description: "ElPriser.nu app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}