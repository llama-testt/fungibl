import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { themeScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Fungibl — Every coin comes with its own NFT collection",
  description: "Launch NFT-backed coins. Trade coins for NFTs, earn rewards, and promote the collections you believe in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="theme-color" content="#EFE4CE" />
      </head>
      <body className="paper-grain font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
