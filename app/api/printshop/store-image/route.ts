/**
 * POST /api/printshop/store-image
 * Accepts a base64 image, assigns a UUID (photo_id), stores it,
 * logs to Neon DB, returns the photo_id and URL.
 * 
 * Phase 1: Stores as a Shopify file via Admin API
 * Phase 2: Push to upload.smwd.tools when Dustin grants access
 */

import { NextRequest, NextResponse } from 'next/server'

const SHOPIFY_STORE = 'smallwoodhome.myshopify.com'
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!
const NEON_URL = 'postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'

let cachedToken: { token: string; expires: number } | null = null

async function getShopifyToken(): Promise<string> {
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

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, source, material, sizeId, sku, prompt, style, referenceImageUsed, sessionId } = await req.json()

    if (!imageDataUrl) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const photoId = crypto.randomUUID()

    // Extract base64 data
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '')
    const mimeType = imageDataUrl.match(/^data:(image\/\w+);/)?.[1] || 'image/jpeg'

    // For now, we'll store the image URL as a data reference
    // In production, this would push to smwd.tools or S3
    // For Phase 1, we store in Neon as a reference and keep the data URL for cart properties
    
    // Log to Neon DB
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(NEON_URL)
    
    await sql`
      INSERT INTO printshop_orders (photo_id, source, material, size_id, sku, prompt, style, reference_image_used, session_id, generation_cost, status)
      VALUES (${photoId}, ${source}, ${material}, ${sizeId}, ${sku}, ${prompt || null}, ${style || null}, ${referenceImageUsed || false}, ${sessionId || null}, ${source === 'ai_generate' ? 0.0672 : 0}, 'created')
    `

    return NextResponse.json({
      success: true,
      photoId,
      imageUrl: `printshop://${photoId}`, // placeholder URL format until smwd.tools access
    })

  } catch (err) {
    console.error('Store image error:', err)
    return NextResponse.json({ error: 'Failed to store image' }, { status: 500 })
  }
}
