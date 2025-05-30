import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

const baseUrl = process.env.BASE_URL ?? "http://dokoiko.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "どこいこ",
  description: "どこいこは、あなたの行きたい場所を見つけるためのアプリです。",
  robots: {
    index: true,
  },
  icons: [{ rel: "icon", url: "/icon/48" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
