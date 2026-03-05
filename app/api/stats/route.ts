import { NextResponse } from 'next/server'

// Neon HTTP API — no extra npm dependency needed
const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const DB_CREDS = Buffer.from('neondb_owner:npg_50fAjkvCiztp').toString('base64')

let cache: { ordersThisWeek: number; ordersToday: number; reviewCount: number; starRating: number; ts: number } | null = null
const CACHE_TTL = 30 * 60 * 1000 // 30 min

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ ordersThisWeek: cache.ordersThisWeek, ordersToday: cache.ordersToday, reviewCount: cache.reviewCount, starRating: cache.starRating, cached: true })
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${DB_CREDS}`,
      'Neon-Connection-String': `postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb`,
    }

    const [ordersRes, configRes] = await Promise.all([
      fetch(NEON_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // Filter to Smallwoods frame orders only (excludes SweetHoney clothing orders in same DB)
          query: `SELECT
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'
              AND EXISTS (SELECT 1 FROM jsonb_array_elements(line_items) li WHERE li->>'title' = 'Frames'))::int AS week_count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE
              AND EXISTS (SELECT 1 FROM jsonb_array_elements(line_items) li WHERE li->>'title' = 'Frames'))::int AS today_count
          FROM shopify_orders`,
          params: []
        }),
      }),
      fetch(NEON_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `SELECT key, value FROM app_config WHERE key IN ('judgeme_review_count','judgeme_star_rating')`,
          params: []
        }),
      }),
    ])

    if (!ordersRes.ok) throw new Error(`DB error: ${ordersRes.status}`)
    const ordersData = await ordersRes.json()
    const ordersThisWeek = ordersData?.rows?.[0]?.week_count ?? 4407
    const ordersToday = ordersData?.rows?.[0]?.today_count ?? 0

    let reviewCount = 6494
    let starRating = 4.74
    if (configRes.ok) {
      const configData = await configRes.json()
      for (const row of (configData?.rows ?? [])) {
        if (row.key === 'judgeme_review_count') reviewCount = parseInt(row.value, 10) || 6494
        if (row.key === 'judgeme_star_rating') starRating = parseFloat(row.value) || 4.74
      }
    }

    cache = { ordersThisWeek, ordersToday, reviewCount, starRating, ts: Date.now() }
    return NextResponse.json({ ordersThisWeek, ordersToday, reviewCount, starRating, cached: false })
  } catch (err: any) {
    // Fallback to static values if DB unavailable
    return NextResponse.json({ ordersThisWeek: 4407, ordersToday: 0, reviewCount: 6494, starRating: 4.74, cached: false, fallback: true })
  }
}
