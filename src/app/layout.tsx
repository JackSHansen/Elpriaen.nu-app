import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import "./globals.scss";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ElPriser.nu",
  description: "ElPriser.nu app med live priser, historik og indstillinger.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <head>
        <meta name="theme-color" content="#201e1e" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body className={roboto.className}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}