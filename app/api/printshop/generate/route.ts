/**
 * POST /api/printshop/generate
 * Calls Gemini Nano Banana 2 to generate a print-ready image.
 * API key is server-side only — never exposed to client.
 */

import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDLIHqbWRtmf55pU9C4jJKdRb9sctbTw8A'
const MODEL = 'gemini-3.1-flash-image-preview'

const STYLE_MODIFIERS: Record<string, string> = {
  photorealistic: 'photorealistic, professional photography, ultra-detailed, 8K quality',
  watercolor:     'watercolor painting, soft washes, artistic brushstrokes, fine art print quality',
  oil:            'oil painting, rich textures, classical art style, gallery museum quality',
  abstract:       'abstract art, bold contemporary colors, modern art, gallery print quality',
  minimalist:     'minimalist design, clean lines, generous negative space, modern fine art',
  vintage:        'vintage photography style, warm film tones, nostalgic, timeless quality',
}

const SYSTEM_ADDITION = `Generate a print-ready image at the highest quality. 
The image will be physically printed on canvas at large format.
Ensure sharp details, vibrant colors, good contrast.
Do not include watermarks, frames, borders, or text unless specifically requested.
Make it suitable for wall art display.`

const ASPECT_RATIO_MAP: Record<string, string> = {
  '4:5':   'portrait orientation, 4:5 aspect ratio',
  '1:1':   'square format',
  '16:9':  'landscape widescreen format',
  '3:4':   'portrait orientation',
  '2:3':   'tall portrait orientation',
  '3:2':   'landscape orientation',
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, style = 'photorealistic', aspectRatio = '3:4', referenceImageBase64 } = await req.json()

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Prompt too short' }, { status: 400 })
    }

    // Build full prompt
    const styleModifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.photorealistic
    const aspectNote = ASPECT_RATIO_MAP[aspectRatio] || ''
    const fullPrompt = `${prompt.trim()}. Style: ${styleModifier}. ${aspectNote ? `Format: ${aspectNote}.` : ''} ${SYSTEM_ADDITION}`

    // Build request parts
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: fullPrompt }
    ]

    // Add reference image if provided
    if (referenceImageBase64) {
      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: referenceImageBase64.replace(/^data:image\/\w+;base64,/, ''),
        }
      })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
        signal: AbortSignal.timeout(30000),
      }
    )

    const data = await response.json()

    // Handle blocked content
    if (data.promptFeedback?.blockReason) {
      return NextResponse.json({ blocked: true, message: "That prompt can't be generated. Try describing something different." })
    }

    if (data.error) {
      const msg = data.error.message || ''
      if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json({ error: 'rate_limit', message: 'Too many requests. Please wait a moment and try again.' }, { status: 429 })
      }
      console.error('Gemini API error:', data.error)
      return NextResponse.json({ error: 'api_error', message: 'Generation failed. Please try again.' }, { status: 500 })
    }

    const candidates = data.candidates || []
    if (!candidates.length) {
      return NextResponse.json({ blocked: true, message: "That prompt can't be generated. Try describing something different." })
    }

    // Check finish reason
    const finishReason = candidates[0]?.finishReason
    if (finishReason === 'SAFETY') {
      return NextResponse.json({ blocked: true, message: "That prompt can't be generated. Try describing something different." })
    }

    // Extract image
    const responseParts = candidates[0]?.content?.parts || []
    const imagePart = responseParts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)
    
    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: 'no_image', message: 'No image was generated. Please try again.' }, { status: 500 })
    }

    const { mimeType, data: imageData } = imagePart.inlineData
    const generationId = crypto.randomUUID()

    return NextResponse.json({
      success: true,
      imageDataUrl: `data:${mimeType};base64,${imageData}`,
      generationId,
      prompt: prompt.trim(),
      style,
      aspectRatio,
    })

  } catch (err) {
    console.error('Generate route error:', err)
    if (err instanceof Error && err.name === 'TimeoutError') {
      return NextResponse.json({ error: 'timeout', message: 'Generation timed out. Please try again.' }, { status: 504 })
    }
    return NextResponse.json({ error: 'server_error', message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
