'use client'

import { useState, useRef, useEffect } from 'react'
import InfoModal from './InfoModal'

type FrameColor = 'walnut' | 'oak' | 'black' | 'white'

const FRAME_COLORS: { id: FrameColor; label: string; swatch: string; shopifyColor: string }[] = [
  { id: 'walnut', label: 'Walnut', swatch: '#5a3010', shopifyColor: 'Stained' },
  { id: 'oak',    label: 'Oak',    swatch: '#c8a060', shopifyColor: 'Almond' },
  { id: 'black',  label: 'Black',  swatch: '#1a1a1a', shopifyColor: 'Black'  },
  { id: 'white',  label: 'White',  swatch: '#f0ece4', shopifyColor: 'White'  },
]

interface SizeOption {
  id: string; label: string; width: number; height: number; price: number
  shopifySize: string // matches Shopify variant option1
}

// Real Smallwoods sizes mapped to Shopify product 7241370435721 (Frames / copy-of-frames)
const SIZES: SizeOption[] = [
  { id: '8x10',  label: '8×10',  width: 8,  height: 10, price: 69,  shopifySize: '8x10'              },
  { id: '10x12', label: '10×12', width: 10, height: 12, price: 75,  shopifySize: '10x12'             },
  { id: '12x16', label: '12×16', width: 12, height: 16, price: 89,  shopifySize: '12x16'             },
  { id: '16x16', label: '16×16', width: 16, height: 16, price: 99,  shopifySize: '16x16'             },
  { id: '25x17', label: '25×17', width: 25, height: 17, price: 109, shopifySize: 'Medium 25" x 17"' },
  { id: '20x30', label: '20×30', width: 20, height: 30, price: 119, shopifySize: '20x30'             },
  { id: '25x25', label: '25×25', width: 25, height: 25, price: 129, shopifySize: 'Square 25" x 25"' },
  { id: '24x36', label: '24×36', width: 24, height: 36, price: 129, shopifySize: '24x36'             },
]

// Hardcoded variant ID lookup: variantMap[shopifySize][shopifyColor] = variantId
// Source: Shopify product 7241370435721 (Frames)
const VARIANT_MAP: Record<string, Record<string, number>> = {
  '8x10':              { Stained: 41365292810377, Almond: 41365292843145, Black: 41365292875913, White: 41365292908681 },
  '10x12':             { Stained: 41365292646537, Almond: 41365292679305, Black: 41365292712073, White: 41365292744841 },
  '12x16':             { Stained: 41365292155017, Almond: 41365292187785, Black: 41365292220553, White: 41365292253321 },
  '16x16':             { Stained: 41365292318857, Almond: 41365292351625, Black: 41365292384393, White: 41365292417161 },
  'Medium 25" x 17"': { Stained: 41365291663497, Almond: 41365291696265, Black: 41365291729033, White: 41365291761801 },
  '20x30':             { Stained: 41843744768137, Almond: 41843744800905, Black: 41843744833673, White: 41843744866441 },
  'Square 25" x 25"': { Stained: 41365291991177, Almond: 41365292023945, Black: 41365292056713, White: 41365292089481 },
  '24x36':             { Stained: 43361951154313, Almond: 43361954857097, Black: 43361957707913, White: 43361959936137 },
}

const SHOPIFY_STORE = 'https://smallwoodhome.com'
const BUNDLE_DISCOUNT = 0.20

function getVariantId(size: SizeOption, color: FrameColor): number | null {
  const colorObj = FRAME_COLORS.find(c => c.id === color)
  if (!colorObj) return null
  return VARIANT_MAP[size.shopifySize]?.[colorObj.shopifyColor] ?? null
}

interface FrameItem {
  id: string
  color: FrameColor
  size: SizeOption
  photo: string | null
}

function makeFrame(id: string): FrameItem {
  return { id, color: 'walnut', size: SIZES[3], photo: null }
}

// ─── Single Frame ────────────────────────────────────────────────
function SingleFrame({
  frame,
  isActive,
  onActivate,
  onUpdate,
  onRemove,
  canRemove,
}: {
  frame: FrameItem
  isActive: boolean
  onActivate: () => void
  onUpdate: (patch: Partial<FrameItem>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [cropMode, setCropMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)
  const [photoExiting, setPhotoExiting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const touchRef = useRef<{ tx: number; ty: number; ox: number; oy: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setTimeout(() => {
        setZoom(1); setOffset({ x: 0, y: 0 }); setCropMode(false)
        onUpdate({ photo: ev.target?.result as string })
        setLoading(false)
      }, 350)
    }
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    setPhotoExiting(true)
    setTimeout(() => {
      onUpdate({ photo: null })
      setPhotoExiting(false)
      setZoom(1); setOffset({ x: 0, y: 0 }); setCropMode(false)
    }, 260)
  }

  const aspectW = frame.size.width
  const aspectH = frame.size.height

  return (
    <div
      className={`relative rounded-2xl overflow-visible transition-all ${isActive ? 'ring-2 ring-[#1B5A4A]' : 'ring-1 ring-gray-200'}`}
      onClick={onActivate}
    >
      {/* Remove button */}
      {canRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute -top-2.5 -right-2.5 z-20 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold shadow-md flex items-center justify-center hover:bg-red-600"
        >×</button>
      )}

      {/* Frame */}
      <div
        className={`frame-wrap frame-${frame.color} frame-pop`}
        style={{ padding: '16px', borderRadius: '3px' }}
      >
        <div
          className="mat-inner overflow-hidden relative"
          style={{
            aspectRatio: `${aspectW} / ${aspectH}`,
            cursor: cropMode ? 'grab' : (frame.photo ? 'default' : 'pointer'),
          }}
          onClick={(e) => { e.stopPropagation(); if (!frame.photo && !loading) fileRef.current?.click() }}
          onMouseDown={(e) => {
            if (!cropMode || !frame.photo) return
            dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
          }}
          onMouseMove={(e) => {
            if (!dragStart.current) return
            setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.mx, y: dragStart.current.oy + e.clientY - dragStart.current.my })
          }}
          onMouseUp={() => { dragStart.current = null }}
          onMouseLeave={() => { dragStart.current = null }}
          onTouchStart={(e) => {
            if (!cropMode || !frame.photo) return
            const t = e.touches[0]
            touchRef.current = { tx: t.clientX, ty: t.clientY, ox: offset.x, oy: offset.y }
          }}
          onTouchMove={(e) => {
            if (!touchRef.current) return
            const t = e.touches[0]
            setOffset({ x: touchRef.current.ox + t.clientX - touchRef.current.tx, y: touchRef.current.oy + t.clientY - touchRef.current.ty })
          }}
          onTouchEnd={() => { touchRef.current = null }}
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: '#1B5A4A', borderTopColor: 'transparent' }}/>
              <span className="text-xs text-gray-500">Processing…</span>
            </div>
          ) : frame.photo ? (
            <img
              src={frame.photo}
              alt="Photo"
              className={`absolute inset-0 w-full h-full object-cover select-none ${photoExiting ? 'photo-exit' : 'photo-enter'}`}
              style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin: 'center', userSelect: 'none', pointerEvents: 'none' }}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 select-none">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <span className="text-xs font-medium text-gray-500">Add Photo</span>
            </div>
          )}
          {cropMode && frame.photo && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-dashed border-white/60"/>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap">Drag to pan</div>
            </div>
          )}
        </div>
      </div>

      {/* Mini controls (only when active) */}
      {isActive && (
        <div className="flex items-center justify-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1B5A4A] text-white"
          >
            {frame.photo ? '↺ Photo' : '+ Photo'}
          </button>
          {frame.photo && (
            <>
              <button
                onClick={() => setCropMode(v => !v)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cropMode ? 'bg-[#1B5A4A] text-white border-[#1B5A4A]' : 'bg-white text-gray-600 border-gray-300'}`}
              >✂️ Crop</button>
              {cropMode && (
                <>
                  <button onClick={() => setZoom(z => Math.min(z + 0.15, 3))} className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center">+</button>
                  <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))} className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-700 font-bold text-sm flex items-center justify-center">−</button>
                </>
              )}
              <button onClick={clearPhoto} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-red-500 border border-red-200">✕</button>
            </>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Price tag */}
      <div className="text-center mt-2">
        <span className="text-xs font-bold text-gray-700">{frame.size.label}</span>
        <span className="text-xs text-gray-400 ml-1.5">${frame.size.price}</span>
      </div>
    </div>
  )
}

// ─── Main Configurator ────────────────────────────────────────────
export default function FrameConfigurator() {
  const [frames, setFrames] = useState<FrameItem[]>([makeFrame('f1')])
  const [activeId, setActiveId] = useState<string>('f1')
  const [showFrameBar, setShowFrameBar] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const counterRef = useRef(2)

  const activeFrame = frames.find(f => f.id === activeId) ?? frames[0]

  const updateFrame = (id: string, patch: Partial<FrameItem>) =>
    setFrames(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f))

  const addFrame = () => {
    const id = `f${counterRef.current++}`
    setFrames(prev => [...prev, makeFrame(id)])
    setActiveId(id)
  }

  const removeFrame = (id: string) => {
    setFrames(prev => {
      const next = prev.filter(f => f.id !== id)
      if (activeId === id) setActiveId(next[next.length - 1]?.id ?? '')
      return next
    })
  }

  const clearAll = () => {
    setFrames([makeFrame('f1')])
    setActiveId('f1')
    counterRef.current = 2
  }

  const totalPrice = frames.reduce((s, f) => s + f.size.price, 0)
  const bundleTotal = frames.length > 1 ? Math.round(totalPrice * (1 - BUNDLE_DISCOUNT)) : null
  const fullTotal = Math.round(totalPrice * 1.375)
  const displayBundle = bundleTotal ?? Math.round((activeFrame?.size.price ?? 0) * (1 - BUNDLE_DISCOUNT))

  // Gallery layout: side by side for 2+
  const isGallery = frames.length > 1

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0eb] max-w-md mx-auto md:max-w-2xl">
      {/* Top Banner */}
      <div className="bg-[#1B5A4A] text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
        <span>Unlock an EXTRA 30% Off!</span>
        <button className="bg-white text-[#1B5A4A] text-xs font-bold px-3 py-1 rounded-full ml-2 hover:bg-gray-100 transition-colors">
          GET CODE
        </button>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button className="p-1" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="flex items-center gap-0.5">
          <span className="font-black text-lg tracking-widest text-gray-900">SMALLW</span>
          <div className="relative inline-flex items-center justify-center w-5 h-5">
            <span className="font-black text-lg text-gray-900">O</span>
            <svg className="absolute" width="11" height="11" viewBox="0 0 12 12" fill="#1B5A4A">
              <path d="M6 1L7.5 4H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4H4.5L6 1Z"/>
            </svg>
          </div>
          <span className="font-black text-lg tracking-widest text-gray-900">ODHOME</span>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Search" className="p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <button aria-label="Cart" className="p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Breadcrumb + Badge */}
      <div className="flex items-center justify-between px-4 py-2">
        <button className="text-sm text-[#1B5A4A] font-medium flex items-center gap-1 hover:underline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Gallery
        </button>
        <span className="bg-[#C0392B] text-white text-xs font-bold px-3 py-1 rounded-full">
          📦 Ships in 1-3 Days
        </span>
      </div>

      {/* Gallery Wall Label */}
      {isGallery && (
        <div className="flex items-center justify-between px-4 mb-1">
          <span className="text-xs font-bold text-[#1B5A4A] uppercase tracking-wide">🖼 Gallery Wall</span>
          <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 font-semibold">
            Clear All
          </button>
        </div>
      )}

      {/* Frame Preview Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 wall-bg rounded-2xl mx-4 my-2" style={{ minHeight: '320px' }}>
        {isGallery ? (
          /* Gallery: side-by-side layout */
          <div className="flex items-center justify-center gap-4 w-full flex-wrap">
            {frames.map(frame => (
              <div key={frame.id} className="flex-1" style={{ minWidth: '120px', maxWidth: `${Math.floor(320 / frames.length)}px` }}>
                <SingleFrame
                  frame={frame}
                  isActive={frame.id === activeId}
                  onActivate={() => setActiveId(frame.id)}
                  onUpdate={(patch) => updateFrame(frame.id, patch)}
                  onRemove={() => removeFrame(frame.id)}
                  canRemove={frames.length > 1}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Single frame — large */
          <div className="w-full" style={{ maxWidth: '340px' }}>
            <SingleFrame
              frame={frames[0]}
              isActive={true}
              onActivate={() => {}}
              onUpdate={(patch) => updateFrame(frames[0].id, patch)}
              onRemove={() => {}}
              canRemove={false}
            />
          </div>
        )}
      </div>

      {/* Pricing Row */}
      <div className="mx-4 mb-3 rounded-xl overflow-hidden shadow-sm">
        {/* Bundle Price Hero */}
        <div className="bg-[#1B5A4A] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#7EC8A4] uppercase tracking-widest mb-0.5">Bundle Price</p>
            <p className="text-4xl font-black text-white leading-none">
              ${displayBundle}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-[#F5C842] text-[#1B5A4A] text-xs font-black px-2 py-1 rounded-full uppercase tracking-wide mb-1">Best Deal</span>
            <p className="text-[#7EC8A4] text-sm font-semibold">Save ${fullTotal - displayBundle}</p>
          </div>
        </div>
        {/* Full & Sale prices as context */}
        <div className="bg-white flex items-center justify-center gap-6 px-4 py-2">
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Full Price</p>
            <p className="text-sm font-semibold text-gray-400 line-through">${fullTotal}</p>
          </div>
          <div className="w-px h-6 bg-gray-200"/>
          <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Sale Price</p>
            <p className="text-sm font-semibold text-gray-600">${totalPrice}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-around py-3 bg-white mx-4 rounded-xl shadow-sm mb-3">
        <ToolbarBtn
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          label="Add Frame"
          onClick={addFrame}
        />
        <ToolbarBtn
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="1"/><rect x="6" y="7" width="12" height="10"/></svg>}
          label="Frame"
          onClick={() => setShowFrameBar(v => !v)}
          active={showFrameBar}
        />
        <ToolbarBtn
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
          label="Clear"
          onClick={() => updateFrame(activeId, { photo: null })}
        />
        <ToolbarBtn
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          label="Info"
          onClick={() => setShowInfo(true)}
        />
      </div>

      {/* Frame Selector Bar */}
      {showFrameBar && (
        <div className="bg-white mx-4 rounded-xl shadow-sm mb-3 p-3">
          {/* Active frame label */}
          {isGallery && (
            <p className="text-[11px] font-semibold text-[#1B5A4A] uppercase tracking-wide mb-2">
              Editing Frame {frames.findIndex(f => f.id === activeId) + 1} of {frames.length}
            </p>
          )}

          {/* Size picker */}
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Size (inches)</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => updateFrame(activeId, { size })}
                  className={`size-btn ${activeFrame.size.id === size.id ? 'active' : ''}`}
                >
                  <span className="size-label">{size.label}</span>
                  <span className={`size-inches ${activeFrame.size.id === size.id ? 'text-white/80' : 'text-gray-400'}`}>
                    ${size.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-3"/>

          {/* Color swatches */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Frame Color</p>
            <div className="flex items-center gap-4">
              {FRAME_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => updateFrame(activeId, { color: c.id })}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={`w-10 h-10 rounded-full transition-all block shadow-sm ${
                      activeFrame.color === c.id
                        ? 'border-[3px] border-[#1B5A4A] scale-110 shadow-md'
                        : 'border-[2px] border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: c.swatch }}
                  />
                  <span className={`text-[10px] font-semibold ${activeFrame.color === c.id ? 'text-[#1B5A4A]' : 'text-gray-500'}`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="px-4 pb-6">
        <AddToCartButton frames={frames} bundleTotal={bundleTotal} totalPrice={totalPrice} />
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}

function AddToCartButton({ frames, bundleTotal, totalPrice }: {
  frames: FrameItem[]; bundleTotal: number | null; totalPrice: number
}) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    setAdding(true)
    // Build cart URL with all frame variants
    const items = frames.map(f => {
      const variantId = getVariantId(f.size, f.color)
      return variantId ? `id[]=${variantId}&quantity[]=1` : null
    }).filter(Boolean)

    if (items.length === 0) {
      // No real variant IDs resolved — open product page instead
      window.open(`${SHOPIFY_STORE}/products/copy-of-frames`, '_blank')
      setAdding(false)
      return
    }

    setTimeout(() => {
      setAdded(true)
      setAdding(false)
      // Navigate to Shopify cart
      const cartUrl = `${SHOPIFY_STORE}/cart/${frames.map(f => {
        const vid = getVariantId(f.size, f.color)
        return vid ? `${vid}:1` : ''
      }).filter(Boolean).join(',')}`
      window.open(cartUrl, '_blank')
      setTimeout(() => setAdded(false), 3000)
    }, 800)
  }

  const hasPhotos = frames.some(f => f.photo)
  const label = frames.length > 1
    ? `Add ${frames.length} Frames to Cart — $${bundleTotal ?? totalPrice}`
    : (hasPhotos ? `Add to Cart — $${totalPrice}` : 'Upload Photos to Continue')

  return (
    <button
      onClick={hasPhotos ? handleAddToCart : undefined}
      className={`w-full font-bold text-base py-4 rounded-xl transition-all shadow-md active:scale-[0.98] relative overflow-hidden ${
        hasPhotos
          ? 'bg-[#1B5A4A] hover:bg-[#154739] text-white cursor-pointer'
          : 'bg-gray-200 text-gray-400 cursor-default'
      }`}
    >
      {adding ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full animate-spin inline-block" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'white', borderTopColor: 'transparent' }}/>
          Adding to Cart…
        </span>
      ) : added ? (
        <span className="flex items-center justify-center gap-2">✓ Added! Redirecting to cart…</span>
      ) : label}
    </button>
  )
}

function ToolbarBtn({ icon, label, onClick, active }: {
  icon: React.ReactNode; label: string; onClick: () => void; active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[52px] ${
        active ? 'text-[#1B5A4A] bg-green-50' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  )
}
