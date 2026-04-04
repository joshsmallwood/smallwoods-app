import PrintShop from '@/components/PrintShop'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Print Shop — Custom Canvas Prints | Smallwoods',
  description: 'Upload your photo or generate AI art and order it printed on premium canvas. Handcrafted in Texas, ships in 1–3 days.',
  metadataBase: new URL('https://app.smallwoods.io'),
  openGraph: {
    title: 'Print Shop — Custom Canvas Prints | Smallwoods',
    description: 'Upload a photo or describe your vision — we print it on premium canvas and ship it to your door.',
    url: 'https://app.smallwoods.io/printshop',
    siteName: 'Smallwoods',
  },
}

export default function PrintShopPage() {
  return <PrintShop />
}
