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
  aspectRatio: string // for AI generation
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
  { id: 'photorealistic', label: 'Photo',      emoji: '📸' },
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
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[4]) // 25x17 default
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

  // ── Generate ──────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || generationState === 'generating') return
    setGenerationState('generating')
    setErrorMessage('')

    try {
      const res = await fetch('/api/printshop/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio: selectedSize.aspectRatio,
        }),
      })

      const data = await res.json()

      if (data.blocked) {
        setGenerationState('blocked')
        setErrorMessage(data.message)
        return
      }

      if (data.error) {
        setGenerationState('error')
        setErrorMessage(data.message || 'Generation failed. Please try again.')
        return
      }

      if (data.success && data.imageDataUrl) {
        setCurrentImage(data.imageDataUrl)
        setGenerationState('success')
        // Add to history (keep last 3)
        const gen: Generation = { id: data.generationId, imageDataUrl: data.imageDataUrl, prompt: prompt.trim(), style }
        setGenerationHistory(prev => [gen, ...prev].slice(0, 3))
      }
    } catch {
      setGenerationState('error')
      setErrorMessage('Connection issue. Please try again.')
    }
  }, [prompt, style, selectedSize, generationState])

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // ── Add to Cart ───────────────────────────────────────────────────────────

  const handleAddToCart = useCallback(() => {
    if (!displayImage || adding) return
    setAdding(true)
    // Build cart URL with image as line item property
    // In production: upload image to server first, get permanent URL
    // For now: use variant ID + price as draft
    const cartUrl = `${SHOPIFY_STORE}/cart/${selectedSize.shopifyVariantId}:1?discount=${PROMO_CODE}`
    setTimeout(() => {
      setAdded(true)
      setAdding(false)
      window.open(cartUrl, '_blank')
      setTimeout(() => setAdded(false), 3000)
    }, 400)
  }, [displayImage, selectedSize, adding])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      maxWidth: 480,
      margin: '0 auto',
      fontFamily: '"Poppins", sans-serif',
      background: '#ffffff',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* ── Header ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0ece4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 6px' }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#143639', letterSpacing: '0.04em' }}>PRINT SHOP</span>
            <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>by Smallwoods</span>
          </div>
          <a href="https://www.smallwoodhome.com/cart" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#143639" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </a>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', padding: '0 16px 8px', gap: 8 }}>
          {(['generate', 'upload'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                background: mode === m ? '#143639' : '#f0ece4',
                color: mode === m ? 'white' : '#666',
              }}
            >
              {m === 'generate' ? '✨ AI Generate' : '📷 Upload Photo'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Canvas Preview — only shown when image exists ── */}
      <div style={{ position: 'relative', background: '#f5f0e8', flex: displayImage ? '1 1 auto' : '0 0 0px', display: displayImage ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
        {displayImage && (
          <div style={{
            position: 'relative',
            maxWidth: '88%', maxHeight: '92%',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            aspectRatio: selectedSize.widthIn > selectedSize.heightIn
              ? `${selectedSize.widthIn}/${selectedSize.heightIn}`
              : `${selectedSize.heightIn}/${selectedSize.widthIn}`,
          }}>
            <img
              src={displayImage}
              alt="Your print"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Generating overlay — only shown when image exists and regenerating */}
        {generationState === 'generating' && displayImage && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #143639', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#143639' }}>Creating your print…</p>
            <p style={{ margin: 0, fontSize: 12, color: '#888' }}>Usually takes 5–10 seconds</p>
          </div>
        )}

        {/* Error/blocked overlay */}
        {(generationState === 'error' || generationState === 'blocked') && (
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: generationState === 'blocked' ? '#fef3c7' : '#fef2f2', borderRadius: 12, padding: '12px 16px', border: `1px solid ${generationState === 'blocked' ? '#f59e0b' : '#fca5a5'}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: generationState === 'blocked' ? '#92400e' : '#991b1b' }}>
              {errorMessage}
            </p>
          </div>
        )}

        {/* Generation history dots */}
        {generationHistory.length > 1 && (
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {generationHistory.map((gen, i) => (
              <button
                key={gen.id}
                onClick={() => setCurrentImage(gen.imageDataUrl)}
                style={{ width: currentImage === gen.imageDataUrl ? 20 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: currentImage === gen.imageDataUrl ? '#143639' : 'rgba(20,54,57,0.3)', transition: 'all 0.2s', padding: 0 }}
                aria-label={`Generation ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div style={{ background: 'white', borderTop: '1px solid #f0ece4', flex: displayImage ? '0 0 auto' : '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflowY: 'auto' }}>
        {mode === 'generate' ? (
          <div style={{ padding: '10px 14px 6px' }}>
            {/* Style presets */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '5px 10px', borderRadius: 16, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
                    background: style === s.id ? '#143639' : '#f0ece4',
                    color: style === s.id ? 'white' : '#555',
                  }}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Prompt input */}
            <div style={{ position: 'relative' }}>
              <textarea
                value={prompt}
                onChange={e => { setPrompt(e.target.value); if (generationState !== 'idle') setGenerationState('idle') }}
                placeholder="Describe your print… e.g. 'A golden retriever in an autumn forest, warm afternoon light'"
                rows={3}
                maxLength={500}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 10,
                  border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit',
                  resize: 'none', boxSizing: 'border-box', outline: 'none',
                  lineHeight: 1.5, color: '#1a1a1a',
                }}
                onFocus={e => { e.target.style.borderColor = '#143639' }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
              />
              <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 10, color: '#bbb' }}>
                {prompt.length}/500
              </span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '10px 14px 6px' }}>
            {!uploadedImage ? (
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', padding: '24px', background: '#f5f0e8', border: '2px dashed #c8c0b8', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 40 }}>📷</span>
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

        {/* Size + price row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px 8px', gap: 8 }}>
          <button
            onClick={() => setShowSizePanel(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', height: 40, borderRadius: 4, border: '1.5px solid #143639', background: 'white', fontSize: 13, fontWeight: 700, color: '#143639', cursor: 'pointer' }}
            aria-label="Choose size"
          >
            {selectedSize.label}
            <svg width="8" height="5" viewBox="0 0 10 6" fill="#143639"><path d="M5 6L0 0h10z"/></svg>
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: 11, color: '#aaa', textDecoration: 'line-through' }}>${selectedSize.price}</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#143639' }}>${discountedPrice}</span>
            <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>35% off</span>
          </div>
        </div>
      </div>

      {/* ── CTA Bar ── */}
      <div style={{ background: '#143639', padding: '8px 14px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
        {mode === 'generate' ? (
          generationState === 'success' && currentImage ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setGenerationState('idle'); setCurrentImage(null) }}
                style={{ padding: '13px 16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}
              >
                Regenerate
              </button>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                style={{ flex: 1, padding: '13px 0', background: added ? '#22c55e' : 'white', color: '#143639', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }}
              >
                {adding ? 'Adding…' : added ? '✓ Added!' : `$${discountedPrice} — Order Print`}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generationState === 'generating'}
              style={{
                width: '100%', padding: '14px 0',
                background: !prompt.trim() || generationState === 'generating' ? 'rgba(255,255,255,0.3)' : 'white',
                color: !prompt.trim() || generationState === 'generating' ? 'rgba(20,54,57,0.5)' : '#143639',
                border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: prompt.trim() ? 'pointer' : 'default', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {generationState === 'generating' ? (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(20,54,57,0.5)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                  <span>Creating your print…</span>
                </>
              ) : '✨ Generate My Print'}
            </button>
          )
        ) : (
          <button
            onClick={canOrder ? handleAddToCart : () => fileRef.current?.click()}
            disabled={adding}
            style={{ width: '100%', padding: '14px 0', background: added ? '#22c55e' : 'white', color: '#143639', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {adding ? 'Adding…' : added ? '✓ Added!' : canOrder ? `$${discountedPrice} — Order Print` : '📷 Upload Photo to Start'}
          </button>
        )}
      </div>

      {/* ── Size Panel ── */}
      {showSizePanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowSizePanel(false)}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '20px 20px 0 0', padding: '16px 16px 36px', maxWidth: 480, margin: '0 auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>Canvas Size</span>
              <button onClick={() => setShowSizePanel(false)} style={{ background: '#143639', color: 'white', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Done</button>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 11, color: '#888' }}>🏷️ MYWALL35 — 35% off applied automatically</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {CANVAS_SIZES.map(s => {
                const maxDim = 56
                const isLandscape = s.widthIn > s.heightIn
                const dispW = isLandscape ? maxDim : Math.round(maxDim * s.widthIn / s.heightIn)
                const dispH = isLandscape ? Math.round(maxDim * s.heightIn / s.widthIn) : maxDim
                const discPrice = Math.round(s.price * (1 - DISCOUNT))
                const isSelected = selectedSize.id === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSize(s); setShowSizePanel(false) }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 8px', borderRadius: 8, border: isSelected ? '2.5px solid #143639' : '2px solid #e5e7eb', background: isSelected ? '#f0faf5' : 'white', cursor: 'pointer', flexShrink: 0, minWidth: 72 }}
                    aria-pressed={isSelected}
                    aria-label={`${s.label} $${discPrice}`}
                  >
                    <div style={{ width: maxDim, height: maxDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: dispW, height: dispH, border: isSelected ? '2px solid #143639' : '2px solid #888', borderRadius: 2, background: isSelected ? 'rgba(20,54,57,0.06)' : 'rgba(0,0,0,0.03)' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: isSelected ? 800 : 700, color: isSelected ? '#143639' : '#1a1a1a' }}>{s.label}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>${discPrice}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={handleUpload} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input[type="file"].hidden { display: none }
        * { -webkit-tap-highlight-color: transparent }
        textarea { -webkit-appearance: none }
        ::-webkit-scrollbar { display: none }
      `}</style>
    </div>
  )
}
