'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type Mode = 'generate' | 'upload'
type Material = 'canvas' | 'foam_core' | 'photo_paper' | 'coroplast'
type Style = 'photorealistic' | 'watercolor' | 'oil' | 'abstract' | 'minimalist' | 'vintage'
type GenerationState = 'idle' | 'generating' | 'success' | 'error' | 'blocked'

interface CanvasSize {
  id: string
  label: string
  widthIn: number
  heightIn: number
  price: number
  compareAt: number
  shopifyVariantId: number
  aspectRatio: string
}

interface Generation {
  id: string
  imageDataUrl: string
  prompt: string
  style: Style
}

// ── Constants ──────────────────────────────────────────────────────────────

// 10 print sizes confirmed from Shopify API. Pricing TBD.
const CANVAS_SIZES: CanvasSize[] = [
  { id: '8x10',  label: '8×10',  widthIn: 8,  heightIn: 10, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '4:5'  },
  { id: '10x12', label: '10×12', widthIn: 10, heightIn: 12, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '5:6'  },
  { id: '12x16', label: '12×16', widthIn: 12, heightIn: 16, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '3:4'  },
  { id: '13x13', label: '13×13', widthIn: 13, heightIn: 13, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '1:1'  },
  { id: '16x16', label: '16×16', widthIn: 16, heightIn: 16, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '1:1'  },
  { id: '25x17', label: '25×17', widthIn: 25, heightIn: 17, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '3:2'  },
  { id: '20x30', label: '20×30', widthIn: 20, heightIn: 30, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '2:3'  },
  { id: '25x25', label: '25×25', widthIn: 25, heightIn: 25, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '1:1'  },
  { id: '24x36', label: '24×36', widthIn: 24, heightIn: 36, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '2:3'  },
  { id: '44x22', label: '44×22', widthIn: 44, heightIn: 22, price: 0, compareAt: 0, shopifyVariantId: 0, aspectRatio: '2:1'  },
]

const STYLES: { id: Style; label: string; emoji: string }[] = [
  { id: 'photorealistic', label: 'Realistic', emoji: '📸' },
  { id: 'watercolor',     label: 'Watercolor', emoji: '🎨' },
  { id: 'oil',            label: 'Oil Paint',  emoji: '🖼️' },
  { id: 'abstract',       label: 'Abstract',   emoji: '✨' },
  { id: 'minimalist',     label: 'Minimal',    emoji: '⬜' },
  { id: 'vintage',        label: 'Vintage',    emoji: '📷' },
]

const MATERIALS: { id: Material; label: string; desc: string; emoji: string }[] = [
  { id: 'canvas',      label: 'Canvas',      desc: 'Gallery-wrapped, ready to hang',   emoji: '🖼️' },
  { id: 'foam_core',   label: 'Foam Core',   desc: 'Lightweight, modern finish',       emoji: '⬛' },
  { id: 'photo_paper', label: 'Photo Paper', desc: 'Gloss or matte photo print',       emoji: '📄' },
  { id: 'coroplast',   label: 'Coroplast',   desc: 'Corrugated plastic, weather-proof', emoji: '🪧' },
]

// Print Shop Shopify product: ID 8532271595657, 40 variants (unpublished/draft)
const VARIANT_MAP: Record<string, number> = {"8x10|Canvas":45478226919561,"8x10|Foam Core":45478226952329,"8x10|Photo Paper":45478226985097,"8x10|Coroplast":45478227017865,"10x12|Canvas":45478227050633,"10x12|Foam Core":45478227083401,"10x12|Photo Paper":45478227116169,"10x12|Coroplast":45478227148937,"12x16|Canvas":45478227181705,"12x16|Foam Core":45478227214473,"12x16|Photo Paper":45478227247241,"12x16|Coroplast":45478227280009,"13x13|Canvas":45478227312777,"13x13|Foam Core":45478227345545,"13x13|Photo Paper":45478227378313,"13x13|Coroplast":45478227411081,"16x16|Canvas":45478227443849,"16x16|Foam Core":45478227476617,"16x16|Photo Paper":45478227509385,"16x16|Coroplast":45478227542153,"25x17|Canvas":45478227574921,"25x17|Foam Core":45478227607689,"25x17|Photo Paper":45478227640457,"25x17|Coroplast":45478227673225,"20x30|Canvas":45478227705993,"20x30|Foam Core":45478227738761,"20x30|Photo Paper":45478227771529,"20x30|Coroplast":45478227804297,"25x25|Canvas":45478227837065,"25x25|Foam Core":45478227869833,"25x25|Photo Paper":45478227902601,"25x25|Coroplast":45478227935369,"24x36|Canvas":45478227968137,"24x36|Foam Core":45478228000905,"24x36|Photo Paper":45478228033673,"24x36|Coroplast":45478228066441,"44x22|Canvas":45478228099209,"44x22|Foam Core":45478228131977,"44x22|Photo Paper":45478228164745,"44x22|Coroplast":45478228197513}

const MATERIAL_LABELS: Record<string, string> = {
  canvas: 'Canvas',
  foam_core: 'Foam Core',
  photo_paper: 'Photo Paper',
  coroplast: 'Coroplast',
}

const SHOPIFY_STORE = 'https://smallwoodhome.com'
const PROMO_CODE = 'MYWALL35'
const DISCOUNT = 0.35


// ── Delivery + social proof utilities ──────────────────────────────────────
function getShipText(): string {
  const ct = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const day = ct.getDay()
  const hour = ct.getHours()
  if (day === 0) return 'Ships Mon'
  if (day === 6) return 'Ships Mon'
  if (hour < 15) return '⚡ Ships today'
  return 'Ships tomorrow'
}

function getViewerCount(): number {
  const HOURLY = [14,8,5,4,6,10,20,40,64,84,98,110,110,108,109,94,88,86,92,108,117,91,56,32]
  const ct = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const h = ct.getHours()
  const base = HOURLY[h] ?? 40
  return base + Math.floor(Math.random() * 8)
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PrintShop() {
  const [mode, setMode] = useState<Mode>('generate')
  const [material, setMaterial] = useState<Material>('canvas')
  const [reviewCount] = useState(6570)
  const [starRating] = useState(4.74)
  const shipText = getShipText()
  const viewers = getViewerCount()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<Style>('photorealistic')
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[4])
  const [showSizePanel, setShowSizePanel] = useState(false)
  const [generationState, setGenerationState] = useState<GenerationState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [generationHistory, setGenerationHistory] = useState<Generation[]>([])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const refImageRef = useRef<HTMLInputElement>(null)
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [referenceThumb, setReferenceThumb] = useState<string | null>(null)

  const discountedPrice = Math.round(selectedSize.price * (1 - DISCOUNT))
  const displayImage = mode === 'generate' ? currentImage : uploadedImage
  const canOrder = !!displayImage
  const isGenerating = generationState === 'generating'

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return
    setGenerationState('generating')
    setErrorMessage('')

    try {
      const res = await fetch('/api/printshop/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), style, aspectRatio: selectedSize.aspectRatio, referenceImageBase64: referenceImage || undefined }),
      })
      const data = await res.json()

      if (data.blocked) { setGenerationState('blocked'); setErrorMessage(data.message); return }
      if (data.error) { setGenerationState('error'); setErrorMessage(data.message || 'Generation failed. Please try again.'); return }
      if (data.success && data.imageDataUrl) {
        setCurrentImage(data.imageDataUrl)
        setGenerationState('success')
        const gen: Generation = { id: data.generationId, imageDataUrl: data.imageDataUrl, prompt: prompt.trim(), style }
        setGenerationHistory(prev => [gen, ...prev].slice(0, 3))
      }
    } catch {
      setGenerationState('error')
      setErrorMessage('Connection issue. Please try again.')
    }
  }, [prompt, style, selectedSize, isGenerating])

  const handleRefImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setReferenceImage(dataUrl) // full base64 for API
      setReferenceThumb(dataUrl) // thumbnail preview
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleAddToCart = useCallback(async () => {
    if (!displayImage || adding) return
    setAdding(true)

    // Get the correct variant ID from the map
    const variantKey = `${selectedSize.id}|${MATERIAL_LABELS[material]}`
    const variantId = VARIANT_MAP[variantKey]
    if (!variantId) { alert('Size/material combination not available'); setAdding(false); return }

    // Store the image and get a photo_id
    try {
      const storeRes = await fetch('/api/printshop/store-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: displayImage,
          source: mode === 'generate' ? 'ai_generate' : 'upload',
          material,
          sizeId: selectedSize.id,
          sku: `SB-${selectedSize.id === '25x17' ? 'M' : selectedSize.id === '13x13' ? 'SSQ' : selectedSize.id === '25x25' ? 'SQ' : selectedSize.id === '44x22' ? 'XL' : selectedSize.id}-CUSTOM-0-${material === 'canvas' ? 'CVS' : material === 'foam_core' ? 'FC' : material === 'photo_paper' ? 'PP' : 'CP'}-A0`,
          prompt: prompt || null,
          style: style || null,
          referenceImageUsed: !!referenceImage,
          sessionId: typeof window !== 'undefined' ? (window as any).__ps_session || crypto.randomUUID() : null,
        }),
      })
      const storeData = await storeRes.json()
      const photoId = storeData.photoId || crypto.randomUUID()

      // Build Shopify cart URL with line item properties
      // Use /cart/{id}:1 format — no properties in URL (Shopify doesn't support it)
      // Properties will be added via the Shopify AJAX cart API in production
      // For now: simple cart URL with discount
      let cartUrl = `${SHOPIFY_STORE}/cart/${variantId}:1?discount=${PROMO_CODE}`

      // Pass UTM params
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search)
        for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','ttclid']) {
          const v = sp.get(key)
          if (v) cartUrl += `&${key}=${encodeURIComponent(v)}`
        }
      }

      setAdded(true); setAdding(false)
      window.open(cartUrl, '_blank')
      setTimeout(() => setAdded(false), 3000)
    } catch (err) {
      console.error('Add to cart error:', err)
      setAdding(false)
      alert('Something went wrong. Please try again.')
    }
  }, [displayImage, selectedSize, material, mode, prompt, style, referenceImage, adding])

  // ── Render ────────────────────────────────────────────────────────────────

  const controlsPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Product headline */}
      <div style={{ padding: '14px 16px 10px' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#143639', lineHeight: 1.2 }}>Custom Prints</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#555', lineHeight: 1.4 }}>
          Upload your photo or generate AI art — printed on premium materials and shipped to your door.
        </p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
        {(['generate', 'upload'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '12px 16px', borderRadius: 0, border: mode === m ? '2px solid #143639' : '1px solid #e5e7eb', cursor: 'pointer',
            fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
            background: mode === m ? '#143639' : 'white',
            color: mode === m ? 'white' : '#555',
          }}>
            {m === 'generate' ? 'AI Generate' : 'Upload Photo'}
          </button>
        ))}
      </div>

      {/* Product info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#143639', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{shipText}</span>
          <span style={{ fontSize: 11, color: '#888' }}>· arrives in 3–5 days</span>
        </div>
      </div>

      {mode === 'generate' ? (
        <>
          {/* Style presets */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px 12px', scrollbarWidth: 'none' }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px 14px', borderRadius: 0, cursor: 'pointer',
                border: style === s.id ? '2px solid #143639' : '1px solid #e5e7eb',
                fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
                background: style === s.id ? '#143639' : 'white',
                color: style === s.id ? 'white' : '#555',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt + reference image */}
          <div style={{ padding: '0 16px 10px' }}>
            {/* Reference image attachment */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button
                onClick={() => refImageRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 0,
                  border: referenceThumb ? '2px solid #143639' : '1px dashed #c8c0b8',
                  background: referenceThumb ? '#143639' : 'transparent',
                  cursor: 'pointer', fontSize: 11, fontWeight: 800, 
                  color: referenceThumb ? 'white' : '#143639',
                  textTransform: 'uppercase', letterSpacing: '0.05em'
                }}
              >
                <span>{referenceThumb ? 'REFERENCE ATTACHED' : '+ ATTACH REFERENCE'}</span>
              </button>
              {referenceThumb && (
                <>
                  <div style={{ width: 36, height: 36, borderRadius: 0, overflow: 'hidden', flexShrink: 0, border: '1px solid #143639' }}>
                    <img src={referenceThumb} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <button
                    onClick={() => { setReferenceImage(null); setReferenceThumb(null) }}
                    style={{ background: 'none', border: 'none', color: '#888', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}
                  >✕</button>
                </>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={e => { setPrompt(e.target.value); if (generationState !== 'idle') setGenerationState('idle') }}
              placeholder="Describe your print… e.g. 'A golden retriever in an autumn forest, warm afternoon light'"
              rows={3}
              maxLength={500}
              style={{
                width: '100%', padding: '12px', borderRadius: 0,
                border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit',
                resize: 'none', boxSizing: 'border-box', outline: 'none', lineHeight: 1.5,
              }}
              onFocus={e => e.target.style.borderColor = '#143639'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Error messages */}
          {(generationState === 'error' || generationState === 'blocked') && (
            <div style={{ margin: '0 16px 10px', padding: '10px 14px', borderRadius: 10, background: generationState === 'blocked' ? '#fef3c7' : '#fef2f2', border: `1px solid ${generationState === 'blocked' ? '#f59e0b' : '#fca5a5'}` }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: generationState === 'blocked' ? '#92400e' : '#991b1b' }}>{errorMessage}</p>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '0 16px 10px' }}>
          {!uploadedImage ? (
            <button onClick={() => fileRef.current?.click()} style={{
              width: '100%', padding: '28px', background: 'transparent',
              border: '1px dashed #c8c0b8', borderRadius: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer'
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#143639', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TAP TO UPLOAD PHOTO</span>
              <span style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JPG · PNG · HEIC</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12, fontWeight: 800, color: '#143639', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CHANGE PHOTO</button>
              <button onClick={() => setUploadedImage(null)} style={{ padding: '12px 14px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 0, fontSize: 12, color: '#888', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✕</button>
            </div>
          )}
        </div>
      )}

      {/* Generation history */}
      {generationHistory.length > 1 && (
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>Previous:</span>
          {generationHistory.map((gen, i) => (
            <button key={gen.id} onClick={() => setCurrentImage(gen.imageDataUrl)} style={{
              width: currentImage === gen.imageDataUrl ? 20 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              background: currentImage === gen.imageDataUrl ? '#143639' : '#d1d5db',
              transition: 'all 0.2s',
            }} aria-label={`Generation ${i + 1}`} />
          ))}
        </div>
      )}

      {/* Material selector */}
      <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {MATERIALS.map(m => (
          <button key={m.id} onClick={() => setMaterial(m.id)} title={m.desc} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', borderRadius: 0,
            border: material === m.id ? '2px solid #143639' : '1px solid #e5e7eb',
            background: material === m.id ? '#143639' : 'white', cursor: 'pointer', flexShrink: 0,
            fontSize: 11, fontWeight: 800, color: material === m.id ? 'white' : '#555',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Size + pricing TBD */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 16px', gap: 8 }}>
        <button onClick={() => setShowSizePanel(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 44,
          borderRadius: 0, border: '1px solid #e5e7eb', background: 'white',
          fontSize: 13, fontWeight: 800, color: '#143639', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }} aria-label="Choose size">
          {selectedSize.label}
          <svg width="8" height="5" viewBox="0 0 10 6" fill="#143639"><path d="M5 6L0 0h10z"/></svg>
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          
          
          <span style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>Pricing coming soon</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 16px' }}>
        {mode === 'generate' ? (
          generationState === 'success' && currentImage ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setGenerationState('idle'); setCurrentImage(null) }} style={{
                padding: '16px 20px', background: 'white', border: '1px solid #143639', borderRadius: 0,
                fontSize: 13, fontWeight: 800, color: '#143639', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>REDO</button>
              <button onClick={handleAddToCart} disabled={adding} style={{
                flex: 1, padding: '16px 0', background: added ? '#1B5A4A' : '#143639',
                color: 'white', border: 'none', borderRadius: 0, fontSize: 15, fontWeight: 900, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {adding ? 'ADDING…' : added ? 'ADDED!' : 'ORDER PRINT'}
              </button>
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} style={{
              width: '100%', padding: '16px 0', borderRadius: 0, border: 'none',
              background: !prompt.trim() || isGenerating ? '#e5e7eb' : '#143639',
              color: !prompt.trim() || isGenerating ? '#aaa' : 'white', fontSize: 15, fontWeight: 900, cursor: prompt.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              {isGenerating ? (
                <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: '#143639', animation: 'spin 0.8s linear infinite' }} /><span>CREATING…</span></>
              ) : 'GENERATE PRINT'}
            </button>
          )
        ) : (
          <button onClick={canOrder ? handleAddToCart : () => fileRef.current?.click()} disabled={adding} style={{
            width: '100%', padding: '16px 0', background: added ? '#1B5A4A' : canOrder ? '#143639' : 'white',
            color: canOrder || added ? 'white' : '#143639', border: canOrder || added ? 'none' : '1px solid #143639', borderRadius: 0,
            fontSize: 15, fontWeight: 900, cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {adding ? 'ADDING…' : added ? 'ADDED!' : canOrder ? 'ORDER PRINT' : 'UPLOAD PHOTO'}
          </button>
        )}

      {/* Trust badges */}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 16px 4px', borderTop: '1px solid #f0ece4' }}>
        {[
          { icon: '🚚', label: 'Free Shipping' },
          { icon: '🇺🇸', label: 'Made in USA' },
          { icon: '💯', label: 'Free Reprints' },
          { icon: '⚡', label: '1–3 Day Ship' },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#888', textAlign: 'center', lineHeight: 1.2 }}>{b.label}</span>
          </div>
        ))}
      </div>

      {/* Example prints — fills space, shows what's possible */}
      <div style={{ padding: '4px 16px 16px' }}>
        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Examples</p>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { url: 'https://cdn.shopify.com/s/files/1/1091/1314/files/63A4953.jpg?v=1726361626&width=300', label: 'Family portrait' },
            { url: 'https://cdn.shopify.com/s/files/1/1091/1314/files/2K1A4158.jpg?v=1717001123&width=300', label: 'Modern abstract' },
            { url: 'https://cdn.shopify.com/s/files/1/1091/1314/files/FWRC21.jpg?v=1717001067&width=300', label: 'Landscape art' },
            { url: 'https://cdn.shopify.com/s/files/1/1091/1314/files/220224Practicals_20.jpg?v=1764101397&width=300', label: 'Home décor' },
          ].map((ex, i) => (
            <div key={i} style={{ flexShrink: 0, width: 100, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              onClick={() => setPrompt(ex.label + ' wall art, premium canvas print quality')}>
              <img src={ex.url} alt={ex.label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} loading="lazy" />
              <div style={{ padding: '4px 6px', background: 'white' }}>
                <p style={{ margin: 0, fontSize: 10, color: '#555', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.label}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 10, color: '#bbb', textAlign: 'center' }}>Tap any example to use as inspiration</p>
      </div>
      </div>
    </div>
  )

  const imagePanel = displayImage ? (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', borderRadius: 12, overflow: 'hidden' }}>
      {/* Constrain preview to selected print size aspect ratio */}
      <div style={{
        maxWidth: '88%', maxHeight: '88%', borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)',
        aspectRatio: `${selectedSize.widthIn} / ${selectedSize.heightIn}`,
        position: 'relative',
      }}>
        <img src={displayImage} alt="Your print" style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
        }} />
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
          {selectedSize.label}
        </div>
      </div>
      {isGenerating && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #143639', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#143639' }}>Updating…</p>
        </div>
      )}
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 120, background: '#f5f0e8', borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
      {/* Proportional preview matching selected size */}
      <div style={{
        width: '75%', maxWidth: 320,
        aspectRatio: `${selectedSize.widthIn} / ${selectedSize.heightIn}`,
        border: '2px dashed #c8c0b8', borderRadius: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: 'rgba(255,255,255,0.6)',
        transition: 'aspect-ratio 0.3s ease',
      }}>
        <div style={{ fontSize: 28 }}>✨</div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#143639', textAlign: 'center' }}>Your print preview</p>
        <span style={{ fontSize: 10, color: '#aaa', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: 8 }}>{selectedSize.label}</span>
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#aaa', textAlign: 'center' }}>Generate or upload — ships in 1–3 days</p>
    </div>
  )

  return (
    <>
      {/* ── Mobile layout (< 768px) ── */}
      <div className="print-shop-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', fontFamily: '"Poppins", sans-serif', background: '#fff', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'white', borderBottom: '1px solid #f0ece4', padding: '10px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#143639', letterSpacing: '0.04em' }}>PRINT SHOP</span>
            <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>by Smallwoods</span>
          </div>
          <a href="https://www.smallwoodhome.com/cart" target="_blank" rel="noopener noreferrer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#143639" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </a>
        </div>

        {/* Image preview — fixed max height, scrollable page handles overflow */}
        <div style={{ flex: '0 0 auto', padding: '8px 12px', maxHeight: '45vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {imagePanel}
        </div>

        {/* Controls — always shown, fills remaining space */}
        <div style={{ flex: '0 0 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          {controlsPanel}
        </div>
      </div>

      {/* ── Desktop layout (≥ 768px) — 2 column ── */}
      <div className="print-shop-desktop" style={{ display: 'none', height: '100vh', fontFamily: '"Poppins", sans-serif', background: '#f8f5f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', height: '100%', maxWidth: 1200, margin: '0 auto', gap: 0 }}>
          {/* Left: image preview */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: 32, gap: 16, height: '100%', overflow: 'hidden' }}>
            {/* Desktop header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#143639', letterSpacing: '0.04em' }}>PRINT SHOP</span>
                <span style={{ fontSize: 12, color: '#aaa', marginLeft: 10 }}>by Smallwoods</span>
              </div>
              <a href="https://www.smallwoodhome.com/cart" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#143639', fontSize: 13, fontWeight: 600 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#143639" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Cart
              </a>
            </div>
            {/* Image area fills remaining height */}
            <div style={{ flex: 1, minHeight: 0 }}>
              {imagePanel}
            </div>
          </div>

          {/* Right: controls panel */}
          <div style={{ background: 'white', borderLeft: '1px solid #f0ece4', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: 16 }}>
            {controlsPanel}
          </div>
        </div>
      </div>

      {/* ── Size Panel ── */}
      {showSizePanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowSizePanel(false)}>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', padding: '16px 16px 36px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>Canvas Size</span>
              <button onClick={() => setShowSizePanel(false)} style={{ background: '#143639', color: 'white', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Done</button>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 11, color: '#888' }}>🏷️ MYWALL35 — 35% off applied automatically</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {CANVAS_SIZES.map(s => {
                const maxDim = 56
                const isL = s.widthIn > s.heightIn
                const dispW = isL ? maxDim : Math.round(maxDim * s.widthIn / s.heightIn)
                const dispH = isL ? Math.round(maxDim * s.heightIn / s.widthIn) : maxDim
                const dp = Math.round(s.price * (1 - DISCOUNT))
                const sel = selectedSize.id === s.id
                return (
                  <button key={s.id} onClick={() => { setSelectedSize(s); setShowSizePanel(false) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 8px', borderRadius: 8, border: sel ? '2.5px solid #143639' : '2px solid #e5e7eb', background: sel ? '#f0faf5' : 'white', cursor: 'pointer', flexShrink: 0, minWidth: 72 }}
                    aria-pressed={sel} aria-label={`${s.label} $${dp}`}>
                    <div style={{ width: maxDim, height: maxDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: dispW, height: dispH, border: sel ? '2px solid #143639' : '2px solid #888', borderRadius: 2, background: sel ? 'rgba(20,54,57,0.06)' : 'transparent' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: sel ? 800 : 700, color: sel ? '#143639' : '#1a1a1a' }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>${dp}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,.heic,.heif" style={{ display: 'none' }} onChange={handleUpload} />
      <input ref={refImageRef} type="file" accept="image/*,.heic,.heif" style={{ display: 'none' }} onChange={handleRefImage} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box }
        textarea { -webkit-appearance: none }
        ::-webkit-scrollbar { display: none }
        @media (min-width: 768px) {
          .print-shop-mobile { display: none !important }
          .print-shop-desktop { display: block !important }
        }
      `}</style>
    </>
  )
}
