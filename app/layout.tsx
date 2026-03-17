import type { Metadata } from "next";
import "./globals.css";
import { displayFont, monoFont, sansFont } from "@/lib/fonts";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AiAlberta — No one left behind.",
  description:
    "AiAlberta makes AI accessible to everyone in Alberta — small businesses, developers, architects, and curious people alike."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <body className="bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}

