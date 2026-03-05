import { NextResponse } from 'next/server'

// Refreshes JudgeMe review stats from Shopify product metafields → Neon app_config
// Call this periodically (e.g. daily cron via Vercel Cron or external trigger)
// GET /api/refresh-reviews?secret=<CRON_SECRET> to run manually
// Shopify product 7241370435721 (Frames) has judgeme/widget metafield with live stats

const SHOPIFY_STORE = 'smallwoodhome.myshopify.com'
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN ?? ''
const FRAMES_PRODUCT_ID = '7241370435721'
const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const DB_CREDS = Buffer.from(process.env.NEON_CREDS ?? 'neondb_owner:npg_50fAjkvCiztp').toString('base64')
const CRON_SECRET = process.env.CRON_SECRET ?? 'scout-watchdog-2026'

export async function GET(request: Request) {
  // Light auth check — prevent public abuse
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch JudgeMe metafield from Shopify
    const shopRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/products/${FRAMES_PRODUCT_ID}/metafields.json?namespace=judgeme&key=widget`,
      { headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN } }
    )
    if (!shopRes.ok) throw new Error(`Shopify error: ${shopRes.status}`)
    const shopData = await shopRes.json()
    const metafield = shopData?.metafields?.[0]?.value ?? ''

    // Parse data-average-rating and data-number-of-reviews from the widget HTML
    const ratingMatch = metafield.match(/data-average-rating='([\d.]+)'/)
    const countMatch = metafield.match(/data-number-of-reviews='(\d+)'/)
    if (!ratingMatch || !countMatch) {
      return NextResponse.json({ error: 'Could not parse JudgeMe data from metafield', metafield: metafield.slice(0, 200) }, { status: 500 })
    }
    const starRating = parseFloat(ratingMatch[1])
    const reviewCount = parseInt(countMatch[1], 10)

    // 2. Upsert into Neon app_config
    const neonRes = await fetch(NEON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${DB_CREDS}`,
        'Neon-Connection-String': process.env.NEON_CONNECTION_STRING ?? 'postgresql://neondb_owner:placeholder@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb',
      },
      body: JSON.stringify({
        query: `
          INSERT INTO app_config (key, value, updated_at) VALUES
            ('judgeme_star_rating', $1, NOW()),
            ('judgeme_review_count', $2, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `,
        params: [String(starRating), String(reviewCount)],
      }),
    })
    if (!neonRes.ok) throw new Error(`Neon error: ${neonRes.status}`)

    return NextResponse.json({
      success: true,
      starRating,
      reviewCount,
      source: 'shopify_metafields',
      product: 'Frames (7241370435721)',
      updated: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
