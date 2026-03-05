import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Custom Wood Framed Signs | Smallwoods',
  description: 'Design your custom wood framed sign — handcrafted in the USA. Upload your photo, choose your size and wood finish. 4.7★ · 6,494 reviews · Ships in 1–3 days.',
  metadataBase: new URL('https://app.smallwoods.io'),
  openGraph: {
    title: 'Custom Wood Framed Signs | Smallwoods',
    description: 'Upload your favorite photo and design a custom wood framed sign. Handcrafted in the USA. Ships in 1–3 days.',
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
    title: 'Custom Wood Framed Signs | Smallwoods',
    description: 'Upload your favorite photo and design a custom wood framed sign. Handcrafted in the USA.',
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
