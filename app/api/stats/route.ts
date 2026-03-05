import { NextResponse } from 'next/server'

// Neon HTTP API — no extra npm dependency needed
const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const DB_CREDS = Buffer.from('neondb_owner:npg_50fAjkvCiztp').toString('base64')

let cache: { ordersThisWeek: number; ts: number } | null = null
const CACHE_TTL = 30 * 60 * 1000 // 30 min

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ ordersThisWeek: cache.ordersThisWeek, cached: true })
    }

    const res = await fetch(NEON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${DB_CREDS}`,
        'Neon-Connection-String': `postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb`,
      },
      body: JSON.stringify({
        query: "SELECT COUNT(*)::int AS count FROM shopify_orders WHERE created_at >= NOW() - INTERVAL '7 days'",
        params: []
      }),
    })

    if (!res.ok) throw new Error(`DB error: ${res.status}`)
    const data = await res.json()
    const ordersThisWeek = data?.rows?.[0]?.count ?? 6177

    cache = { ordersThisWeek, ts: Date.now() }
    return NextResponse.json({ ordersThisWeek, cached: false })
  } catch (err: any) {
    // Fallback to static value if DB unavailable
    return NextResponse.json({ ordersThisWeek: 6177, cached: false, fallback: true })
  }
}
