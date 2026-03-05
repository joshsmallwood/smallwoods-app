import { NextResponse } from 'next/server'

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!
const SHOPIFY_STORE = 'smallwoodhome.myshopify.com'
const PRODUCT_ID = '7241370435721'

let cachedToken: { token: string; expires: number } | null = null
let cachedVariants: any[] | null = null
let variantCacheExpiry = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token
  const res = await fetch(`https://${SHOPIFY_STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: SHOPIFY_CLIENT_ID, client_secret: SHOPIFY_CLIENT_SECRET, grant_type: 'client_credentials' }),
  })
  const data = await res.json()
  cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 }
  return cachedToken.token
}

export async function GET() {
  try {
    if (cachedVariants && Date.now() < variantCacheExpiry) {
      return NextResponse.json({ variants: cachedVariants, cached: true })
    }
    const token = await getAccessToken()
    const res = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/products/${PRODUCT_ID}/variants.json?limit=250`,
      { headers: { 'X-Shopify-Access-Token': token } }
    )
    const data = await res.json()
    cachedVariants = data.variants || []
    variantCacheExpiry = Date.now() + 10 * 60 * 1000
    return NextResponse.json({ variants: cachedVariants, cached: false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
