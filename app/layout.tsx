import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Lucky You Sale — live through March 17, 2026 (MYWALL35/LUCKY35 = 35% off, both verified active with no expiry via Shopify API Mar 5 2026)
export const metadata: Metadata = {
  title: 'Lucky You Sale — 35% Off | Custom Wood Framed Signs | Smallwoods',
  description: 'Lucky You Sale ends Mar 17 — design your custom wood framed sign, 35% off. Handcrafted in the USA. 4.74★ · 6,494 reviews · Ships in 1–3 days.',
  metadataBase: new URL('https://app.smallwoods.io'),
  openGraph: {
    title: 'Lucky You Sale — 35% Off Custom Wood Frames | Smallwoods',
    description: 'Lucky You Sale ends St. Patrick\'s Day (Mar 17). Upload your photo, design a custom wood framed sign. 35% off auto-applied. 4.74★ · 6,494 reviews. Ships in 1–3 days.',
    url: 'https://app.smallwoods.io',
    siteName: 'Smallwoods',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/1091/1314/files/HERO_PRoduct_WEB_1125__0005_Frames-min.jpg?v=1764101397',
        width: 1200,
        height: 630,
        alt: 'Custom Wood Framed Sign by Smallwoods',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucky You Sale — 35% Off Custom Wood Frames | Smallwoods',
    description: 'Lucky You Sale ends Mar 17! 35% off auto-applied. Upload your photo, design a custom wood framed sign. 4.74★ rated. Ships in 1–3 days.',
    images: ['https://cdn.shopify.com/s/files/1/1091/1314/files/HERO_PRoduct_WEB_1125__0005_Frames-min.jpg?v=1764101397'],
  },
  keywords: ['custom wood frames', 'personalized photo frames', 'wood framed signs', 'custom photo gifts', 'smallwoods'],
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
