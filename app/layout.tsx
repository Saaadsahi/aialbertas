import type { Metadata } from "next";
import "./globals.css";
import { monoFont, sansFont } from "@/lib/fonts";
import { ReactNode } from "react";

const siteUrl = "https://aialbertas.com";
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
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="canada-proud bg-white text-black antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <div aria-hidden="true" className="canada-ribbon" />
        <div aria-hidden="true" className="canada-frame canada-frame-left" />
        <div aria-hidden="true" className="canada-frame canada-frame-right" />
        <div aria-hidden="true" className="canada-leaf canada-leaf-top-left" />
        {children}
      </body>
    </html>
  );
}
