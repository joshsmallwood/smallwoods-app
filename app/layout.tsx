import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SALE_END = new Date('2026-03-17T23:59:59-05:00') // Mar 17 end of day CT
const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const NEON_CONN = 'postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb'

// Cache review stats for metadata (revalidated every 6 hours)
let metaStatsCache: { reviewCount: number; starRating: number; ts: number } | null = null
async function getMetaStats() {
  if (metaStatsCache && Date.now() - metaStatsCache.ts < 6 * 60 * 60 * 1000) return metaStatsCache
  try {
    const res = await fetch(NEON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': NEON_CONN },
      body: JSON.stringify({ query: `SELECT key, value FROM app_config WHERE key IN ('judgeme_review_count','judgeme_star_rating')`, params: [] }),
      next: { revalidate: 21600 }, // 6h Next.js cache
    })
    if (!res.ok) throw new Error('DB err')
    const data = await res.json()
    let reviewCount = 6494, starRating = 4.74
    for (const row of (data?.rows ?? [])) {
      if (row.key === 'judgeme_review_count') reviewCount = parseInt(row.value, 10) || 6494
      if (row.key === 'judgeme_star_rating') starRating = parseFloat(row.value) || 4.74
    }
    metaStatsCache = { reviewCount, starRating, ts: Date.now() }
    return metaStatsCache
  } catch { return { reviewCount: 6494, starRating: 4.74, ts: Date.now() } }
}

export async function generateMetadata(): Promise<Metadata> {
  const isSaleActive = new Date() < SALE_END
  const { reviewCount, starRating } = await getMetaStats()
  const reviewStr = reviewCount.toLocaleString()
  const ratingStr = starRating.toFixed(2)

  const title = isSaleActive
    ? 'Lucky You Sale — 35% Off | Custom Wood Framed Signs | Smallwoods'
    : 'Custom Wood Framed Signs | 35% Off | Smallwoods'
  const description = isSaleActive
    ? `Lucky You Sale ends Mar 17 — design your custom wood framed sign, 35% off. Handcrafted in the USA. ${ratingStr}★ · ${reviewStr} reviews · Ships in 1–3 days.`
    : `Design your custom wood framed sign online. 35% off auto-applied. Handcrafted in the USA. ${ratingStr}★ · ${reviewStr} reviews · Ships in 1–3 days.`
  const ogTitle = isSaleActive
    ? 'Lucky You Sale — 35% Off Custom Wood Frames | Smallwoods'
    : '35% Off Custom Wood Frames | Smallwoods'
  const ogDescription = isSaleActive
    ? `Lucky You Sale ends St. Patrick's Day (Mar 17). Upload your photo, design a custom wood framed sign. 35% off auto-applied. ${ratingStr}★ · ${reviewStr} reviews. Ships in 1–3 days.`
    : `Upload your photo, design a custom wood framed sign. 35% off auto-applied. ${ratingStr}★ · ${reviewStr} reviews. Ships in 1–3 days.`

  return {
    title,
    description,
    metadataBase: new URL('https://app.smallwoods.io'),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
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
      title: ogTitle,
      description: isSaleActive
        ? 'Lucky You Sale ends Mar 17! 35% off auto-applied. Upload your photo, design a custom wood framed sign. 4.74★ rated. Ships in 1–3 days.'
        : '35% off auto-applied. Upload your photo, design a custom wood framed sign. 4.74★ rated. Ships in 1–3 days.',
      images: ['https://cdn.shopify.com/s/files/1/1091/1314/files/HERO_PRoduct_WEB_1125__0005_Frames-min.jpg?v=1764101397'],
    },
    keywords: ['custom wood frames', 'personalized photo frames', 'wood framed signs', 'custom photo gifts', 'smallwoods'],
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical third-party origins — eliminates DNS+TCP+TLS latency for images & scripts */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://analytics.tiktok.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B5A4A" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Meta Pixel — SmallwoodHome + Smallwood #2 */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1660571784197503');
          fbq('init', '336179884248606');
          fbq('track', 'PageView');
        `}</Script>
        {/* GA4 — replace G-XXXXXXXXXX with real ID */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}</Script>
        {/* TikTok Pixel — replace TIKTOK_PIXEL_ID with real ID */}
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._r=ttq._r||{},ttq._r[e]=n,ttq._i[e].t=e;var o=d.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('TIKTOK_PIXEL_ID');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
