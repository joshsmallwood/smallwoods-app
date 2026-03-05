import { NextResponse } from 'next/server'

// Refreshes JudgeMe review stats from Shopify product metafields → Neon app_config
// Cycle 61 fix: auto-refreshes Shopify token via client_credentials when env token expires (24h token)
// GET /api/refresh-reviews?secret=<CRON_SECRET> to run manually or via Vercel Cron

const SHOPIFY_STORE = 'smallwoodhome.myshopify.com'
// Shopify client credentials — set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in Vercel env
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID ?? ''
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET ?? ''
const FRAMES_PRODUCT_ID = '7241370435721'
const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const CRON_SECRET = process.env.CRON_SECRET ?? 'scout-watchdog-2026'

type TokenResult = { token: string; source: 'env' | 'refreshed' }

// Get valid Shopify token — tries env first, falls back to client_credentials refresh
async function getShopifyToken(): Promise<TokenResult> {
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN ?? ''
  if (staticToken && staticToken.length > 10) {
    const pingRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/shop.json`,
      { headers: { 'X-Shopify-Access-Token': staticToken } }
    )
    if (pingRes.ok) return { token: staticToken, source: 'env' }
  }

  // Token expired or missing — fetch fresh via client credentials
  const tokenRes = await fetch(
    `https://${SHOPIFY_STORE}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    }
  )
  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    throw new Error(`Shopify token refresh failed: ${tokenRes.status} — ${body.slice(0, 200)}`)
  }
  const tokenData = await tokenRes.json()
  return { token: tokenData.access_token as string, source: 'refreshed' }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Get a valid Shopify token (auto-refreshes if expired)
    const { token: shopifyToken, source: tokenSource } = await getShopifyToken()

    // 2. Fetch JudgeMe metafield from Shopify
    const shopRes = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/products/${FRAMES_PRODUCT_ID}/metafields.json?namespace=judgeme&key=widget`,
      { headers: { 'X-Shopify-Access-Token': shopifyToken } }
    )
    if (!shopRes.ok) throw new Error(`Shopify metafield error: ${shopRes.status}`)
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

    // 3. Upsert into Neon app_config (use Neon-Connection-String only — no Authorization header)
    const NEON_CONN = 'postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb'
    const neonRes = await fetch(NEON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': process.env.NEON_CONNECTION_STRING ?? NEON_CONN,
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
      tokenSource,
      updated: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
