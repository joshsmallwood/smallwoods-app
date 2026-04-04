'use client'

import { useState, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type Mode = 'generate' | 'upload'
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

const CANVAS_SIZES: CanvasSize[] = [
  { id: '8x10',  label: '8×10',  widthIn: 8,  heightIn: 10, price: 69,  compareAt: 100, shopifyVariantId: 40466081120393, aspectRatio: '4:5'  },
  { id: '10x12', label: '10×12', widthIn: 10, heightIn: 12, price: 75,  compareAt: 100, shopifyVariantId: 40466081153161, aspectRatio: '4:5'  },
  { id: '12x16', label: '12×16', widthIn: 12, heightIn: 16, price: 89,  compareAt: 120, shopifyVariantId: 40466081185929, aspectRatio: '3:4'  },
  { id: '16x16', label: '16×16', widthIn: 16, heightIn: 16, price: 99,  compareAt: 130, shopifyVariantId: 40466081218697, aspectRatio: '1:1'  },
  { id: '25x17', label: '25×17', widthIn: 25, heightIn: 17, price: 109, compareAt: 150, shopifyVariantId: 43045065556105, aspectRatio: '3:2'  },
  { id: '20x30', label: '20×30', widthIn: 20, heightIn: 30, price: 119, compareAt: 170, shopifyVariantId: 43045065556105, aspectRatio: '2:3'  },
]

const STYLES: { id: Style; label: string; emoji: string }[] = [
  { id: 'photorealistic', label: 'Realistic', emoji: '📸' },
  { id: 'watercolor',     label: 'Watercolor', emoji: '🎨' },
  { id: 'oil',            label: 'Oil Paint',  emoji: '🖼️' },
  { id: 'abstract',       label: 'Abstract',   emoji: '✨' },
  { id: 'minimalist',     label: 'Minimal',    emoji: '⬜' },
  { id: 'vintage',        label: 'Vintage',    emoji: '📷' },
]

const SHOPIFY_STORE = 'https://smallwoodhome.com'
const PROMO_CODE = 'MYWALL35'
const DISCOUNT = 0.35

// ── Component ──────────────────────────────────────────────────────────────

export default function PrintShop() {
  const [mode, setMode] = useState<Mode>('generate')
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
        body: JSON.stringify({ prompt: prompt.trim(), style, aspectRatio: selectedSize.aspectRatio }),
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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleAddToCart = useCallback(() => {
    if (!displayImage || adding) return
    setAdding(true)
    const cartUrl = `${SHOPIFY_STORE}/cart/${selectedSize.shopifyVariantId}:1?discount=${PROMO_CODE}`
    setTimeout(() => {
      setAdded(true); setAdding(false)
      window.open(cartUrl, '_blank')
      setTimeout(() => setAdded(false), 3000)
    }, 400)
  }, [displayImage, selectedSize, adding])

  // ── Render ────────────────────────────────────────────────────────────────

  const controlsPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px 10px' }}>
        {(['generate', 'upload'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700,
            background: mode === m ? '#143639' : '#f0ece4',
            color: mode === m ? 'white' : '#555',
          }}>
            {m === 'generate' ? '✨ AI Generate' : '📷 Upload Photo'}
          </button>
        ))}
      </div>

      {mode === 'generate' ? (
        <>
          {/* Style presets */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 16px 10px', scrollbarWidth: 'none' }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                background: style === s.id ? '#143639' : '#f0ece4',
                color: style === s.id ? 'white' : '#555',
              }}>
                <span>{s.emoji}</span><span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt */}
          <div style={{ padding: '0 16px 10px' }}>
            <textarea
              value={prompt}
              onChange={e => { setPrompt(e.target.value); if (generationState !== 'idle') setGenerationState('idle') }}
              placeholder="Describe your print… e.g. 'A golden retriever in an autumn forest, warm afternoon light'"
              rows={3}
              maxLength={500}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit',
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
              width: '100%', padding: '28px', background: '#f8f5f0',
              border: '2px dashed #c8c0b8', borderRadius: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer'
            }}>
              <span style={{ fontSize: 36 }}>📷</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#143639' }}>Tap to upload your photo</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>JPG · PNG · HEIC</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '12px', background: '#f0ece4', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#143639', cursor: 'pointer' }}>↩ Change Photo</button>
              <button onClick={() => setUploadedImage(null)} style={{ padding: '12px 14px', background: 'none', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#888', cursor: 'pointer' }}>✕</button>
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

      {/* Size + price */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 10px', gap: 8 }}>
        <button onClick={() => setShowSizePanel(true)} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', height: 44,
          borderRadius: 4, border: '1.5px solid #143639', background: 'white',
          fontSize: 13, fontWeight: 700, color: '#143639', cursor: 'pointer',
        }} aria-label="Choose size">
          {selectedSize.label}
          <svg width="8" height="5" viewBox="0 0 10 6" fill="#143639"><path d="M5 6L0 0h10z"/></svg>
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>${selectedSize.price}</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#143639' }}>${discountedPrice}</span>
          <span style={{ fontSize: 10, background: '#dcfce7', color: '#166534', fontWeight: 700, padding: '2px 6px', borderRadius: 8 }}>35% off</span>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 16px' }}>
        {mode === 'generate' ? (
          generationState === 'success' && currentImage ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setGenerationState('idle'); setCurrentImage(null) }} style={{
                padding: '13px 16px', background: '#f0ece4', border: 'none', borderRadius: 10,
                fontSize: 13, fontWeight: 700, color: '#143639', cursor: 'pointer',
              }}>↩ Redo</button>
              <button onClick={handleAddToCart} disabled={adding} style={{
                flex: 1, padding: '13px 0', background: added ? '#22c55e' : '#143639',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer',
              }}>
                {adding ? 'Adding…' : added ? '✓ Added!' : `$${discountedPrice} — Order Print`}
              </button>
            </div>
          ) : (
            <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} style={{
              width: '100%', padding: '15px 0', borderRadius: 10, border: 'none',
              background: !prompt.trim() || isGenerating ? '#94a3b8' : '#143639',
              color: 'white', fontSize: 15, fontWeight: 800, cursor: prompt.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {isGenerating ? (
                <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} /><span>Creating your print…</span></>
              ) : '✨ Generate My Print'}
            </button>
          )
        ) : (
          <button onClick={canOrder ? handleAddToCart : () => fileRef.current?.click()} disabled={adding} style={{
            width: '100%', padding: '15px 0', background: added ? '#22c55e' : canOrder ? '#143639' : '#f0ece4',
            color: canOrder ? 'white' : '#143639', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 800, cursor: 'pointer',
          }}>
            {adding ? 'Adding…' : added ? '✓ Added!' : canOrder ? `$${discountedPrice} — Order Print` : '📷 Upload Photo to Start'}
          </button>
        )}

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
      <img src={displayImage} alt="Your print" style={{
        maxWidth: '88%', maxHeight: '88%', borderRadius: 4, objectFit: 'contain',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }} />
      {isGenerating && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #143639', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#143639' }}>Updating…</p>
        </div>
      )}
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200, background: 'linear-gradient(135deg, #f8f5f0 0%, #f0ece4 100%)', borderRadius: 12, gap: 16, padding: 32, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative frame outline */}
      <div style={{ width: '60%', paddingBottom: '80%', position: 'relative', border: '3px dashed #c8c0b8', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: 40 }}>✨</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#143639', textAlign: 'center', lineHeight: 1.3 }}>Your AI print<br/>appears here</p>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: '#aaa', textAlign: 'center', maxWidth: 200 }}>Describe your vision and tap Generate — ready to ship in 1–3 days</p>
    </div>
  )

  return (
    <>
      {/* ── Mobile layout (< 768px) ── */}
      <div className="print-shop-mobile" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 480, margin: '0 auto', fontFamily: '"Poppins", sans-serif', background: '#fff', overflow: 'hidden' }}>
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

        {/* Image preview — only shown when image exists on mobile */}
        {displayImage && (
          <div style={{ flex: '1 1 auto', padding: '12px 16px', minHeight: 0, position: 'relative' }}>
            {imagePanel}
          </div>
        )}

        {/* Controls — always shown, fills remaining space */}
        <div style={{ flex: displayImage ? '0 0 auto' : '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: displayImage ? 0 : 8 }}>
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
