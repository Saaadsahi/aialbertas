import type { Metadata } from "next";
import "./globals.css";
import { displayFont, monoFont, sansFont } from "@/lib/fonts";
import { ReactNode } from "react";

const siteUrl = "https://aialbertas.com";
const mapleLeafs = [
  { top: "10rem", left: "5%", size: "1.9rem", rotate: "-18deg" },
  { top: "14rem", right: "7%", size: "1.5rem", rotate: "14deg" },
  { top: "34rem", left: "9%", size: "1.4rem", rotate: "-8deg" },
  { top: "42rem", right: "10%", size: "1.7rem", rotate: "11deg" },
  { top: "58rem", left: "14%", size: "1.25rem", rotate: "-16deg" },
  { top: "72rem", right: "16%", size: "1.6rem", rotate: "17deg" },
  { bottom: "15rem", left: "7%", size: "1.45rem", rotate: "9deg" },
  { bottom: "8rem", right: "12%", size: "1.8rem", rotate: "-12deg" },
];
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AIAlberta",
  url: siteUrl,
  logo: `${siteUrl}/opengraph-image`,
  sameAs: [
    "https://www.instagram.com/ai.alberta",
    "https://www.reddit.com/r/Aialberta"
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI Alberta | AI Automation & AI Development in Alberta",
  description:
    "AIAlberta provides AI automation, AI apps, and AI consulting for businesses in Alberta. Helping companies implement AI solutions and automation.",
  keywords: [
    "AI Alberta",
    "AI automation Alberta",
    "AI consulting Edmonton",
    "AI development Alberta"
  ],
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "AIAlberta",
    description: "AI Automation and AI Development in Alberta",
    url: siteUrl,
    type: "website",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "AIAlberta"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AIAlberta",
    description: "AI Automation and AI Development in Alberta",
    images: [`${siteUrl}/opengraph-image`]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <body className="canada-proud bg-white text-black antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <div aria-hidden="true" className="canada-ribbon" />
        <div aria-hidden="true" className="canada-frame canada-frame-left" />
        <div aria-hidden="true" className="canada-frame canada-frame-right" />
        <div aria-hidden="true" className="canada-leaf canada-leaf-top" />
        <div aria-hidden="true" className="canada-leaf canada-leaf-mid-left" />
        <div aria-hidden="true" className="canada-leaf canada-leaf-mid-right" />
        <div aria-hidden="true" className="canada-leaf canada-leaf-bottom" />
        <div aria-hidden="true" className="canada-leaf canada-leaf-lower-right" />
        {mapleLeafs.map((leaf, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="canada-leaf canada-leaf-mini"
            style={{
              top: leaf.top,
              right: leaf.right,
              bottom: leaf.bottom,
              left: leaf.left,
              width: leaf.size,
              height: leaf.size,
              transform: `rotate(${leaf.rotate})`,
            }}
          />
        ))}
        {children}
      </body>
    </html>
  );
}
