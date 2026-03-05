'use client'

import { useState, useRef, useEffect } from 'react'
import InfoModal from './InfoModal'

const WALL_STYLES: Record<string, React.CSSProperties> = {
  classic: { backgroundColor: '#ede8e0', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(0,0,0,0.018) 24px,rgba(0,0,0,0.018) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(0,0,0,0.012) 24px,rgba(0,0,0,0.012) 25px)' },
  modern:  { backgroundColor: '#f0f0f0', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 32px,rgba(0,0,0,0.015) 32px,rgba(0,0,0,0.015) 33px)' },
  dark:    { backgroundColor: '#2a2a2a', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(255,255,255,0.03) 28px,rgba(255,255,255,0.03) 29px)' },
  warm:    { backgroundColor: '#d4b896', backgroundImage: 'repeating-linear-gradient(160deg,rgba(120,70,20,0.06) 0px,rgba(120,70,20,0.06) 2px,transparent 2px,transparent 12px)' },
}

function ShareDesignButton() {
  const [copied, setCopied] = useState(false)
  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Custom Wood Frame', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <div className="flex justify-end px-4 pt-1">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 hover:text-[#1B5A4A] transition-colors"
      >
        {copied ? (
          <><span className="text-[#1B5A4A]">✓</span><span className="text-[#1B5A4A]">Link copied!</span></>
        ) : (
          <><span>🔗</span><span>Share design</span></>
        )}
      </button>
    </div>
  )
}

function RotatingTagline() {
  const lines = [
    '🎁 The gift everyone cries over',
    '🏡 Handcrafted in the USA',
    '📸 Your photo. Real wood. Forever.',
    '💚 50,000+ families love their frames',
    '⚡ Ships in 1–3 business days',
  ]
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % lines.length)
        setVisible(true)
      }, 300)
    }, 3500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="mt-1.5 min-h-[20px]">
      <span
        className="text-[12px] font-semibold text-[#1B5A4A] transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {lines[idx]}
      </span>
    </div>
  )
}

function RoomPresetSwitcher({ wallStyle, onChangeWall }: { wallStyle: string; onChangeWall: (s: 'classic' | 'modern' | 'dark' | 'warm') => void }) {
  const presets = [
    { id: 'classic' as const, label: '🏠 Classic' },
    { id: 'modern'  as const, label: '🏢 Modern'  },
    { id: 'dark'    as const, label: '🌙 Dark'    },
    { id: 'warm'    as const, label: '🪵 Wood'    },
  ]
  return (
    <div className="flex gap-1.5 px-4 pt-2 pb-0">
      {presets.map(p => (
        <button
          key={p.id}
          onClick={() => onChangeWall(p.id)}
          className={`flex-1 text-[10px] font-bold py-1 rounded-lg border transition-all ${
            wallStyle === p.id
              ? 'bg-[#1B5A4A] text-white border-[#1B5A4A]'
              : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function CartScarcityBadge() {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 8) + 7) // 7-14
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(5, Math.min(18, c + delta))
      })
    }, 6000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="bg-[#0a2e21] px-4 py-1.5 flex items-center gap-2">
      <span className="text-base leading-none">🔥</span>
      <span className="text-[11px] text-orange-300 font-semibold">{count} people have this in their cart right now</span>
    </div>
  )
}

function OfferCountdown() {
  const [secs, setSecs] = useState(() => 12 * 60 + Math.floor(Math.random() * 600))
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s > 0 ? s - 1 : 14 * 60 + Math.floor(Math.random() * 300)), 1000)
    return () => clearInterval(t)
  }, [])
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return <>{m}:{s}</>
}

function ViewingCount() {
  const [count, setCount] = useState(() => 34 + Math.floor(Math.random() * 18))
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => {
        const delta = Math.random() < 0.5 ? -1 : 1
        const next = c + delta
        return next < 28 ? 29 : next > 54 ? 53 : next
      })
    }, 4200)
    return () => clearInterval(t)
  }, [])
  return <>{count}</>
}

const RECENT_BUYERS = [
  { name: 'Sarah', location: 'TX', size: '16×16', color: 'Walnut' },
  { name: 'Emily', location: 'CA', size: '20×30', color: 'Black' },
  { name: 'Jessica', location: 'FL', size: '12×16', color: 'White' },
  { name: 'Ashley', location: 'OH', size: '24×36', color: 'Oak' },
  { name: 'Megan', location: 'GA', size: '16×16', color: 'Walnut' },
  { name: 'Lauren', location: 'NC', size: '8×10', color: 'Black' },
  { name: 'Rachel', location: 'IL', size: '20×30', color: 'White' },
  { name: 'Amanda', location: 'TN', size: '25×25', color: 'Walnut' },
  { name: 'Jennifer', location: 'TX', size: '16×16', color: 'Oak' },
  { name: 'Brittany', location: 'VA', size: '12×16', color: 'Black' },
]

function RecentBuyerToast() {
  const [visible, setVisible] = useState(false)
  const [buyer, setBuyer] = useState(RECENT_BUYERS[0])
  const [minsAgo, setMinsAgo] = useState(3)
  const idxRef = useRef(0)

  useEffect(() => {
    // Show first toast after 4 seconds
    const initial = setTimeout(() => {
      setBuyer(RECENT_BUYERS[0])
      setMinsAgo(2 + Math.floor(Math.random() * 8))
      setVisible(true)
      const hide = setTimeout(() => setVisible(false), 4500)
      return () => clearTimeout(hide)
    }, 4000)

    // Then cycle every 18 seconds
    const interval = setInterval(() => {
      idxRef.current = (idxRef.current + 1) % RECENT_BUYERS.length
      setBuyer(RECENT_BUYERS[idxRef.current])
      setMinsAgo(1 + Math.floor(Math.random() * 12))
      setVisible(true)
      setTimeout(() => setVisible(false), 4500)
    }, 18000)

    return () => { clearTimeout(initial); clearInterval(interval) }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '16px',
        zIndex: 9999,
        transform: visible ? 'translateY(0)' : 'translateY(120px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '280px',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1B5A4A, #2d7a65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '16px',
        }}>🛒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
            {buyer.name} from {buyer.location} just ordered!
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            {buyer.size} {buyer.color} Frame · {minsAgo}m ago
          </div>
        </div>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#22c55e',
          flexShrink: 0,
          boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
        }} />
      </div>
    </div>
  )
}

type FrameColor = 'walnut' | 'oak' | 'black' | 'white'

const FRAME_COLORS: { id: FrameColor; label: string; swatch: string; gradient: string; shopifyColor: string }[] = [
  { id: 'walnut', label: 'Walnut', swatch: '#5a3010', gradient: 'repeating-linear-gradient(170deg, #5a3010 0px, #7a4520 4px, #4a2508 8px, #6b3c18 12px, #5a3010 16px)', shopifyColor: 'Stained' },
  { id: 'oak',    label: 'Oak',    swatch: '#c8a060', gradient: 'repeating-linear-gradient(170deg, #c8a060 0px, #deb878 4px, #b89048 8px, #caa868 12px, #c8a060 16px)', shopifyColor: 'Almond' },
  { id: 'black',  label: 'Black',  swatch: '#1a1a1a', gradient: 'repeating-linear-gradient(170deg, #1a1a1a 0px, #2a2a2a 4px, #111 8px, #222 12px, #1a1a1a 16px)', shopifyColor: 'Black'  },
  { id: 'white',  label: 'White',  swatch: '#f0ece4', gradient: 'repeating-linear-gradient(170deg, #f0ece4 0px, #e8e4dc 4px, #f5f1e9 8px, #ece8e0 12px, #f0ece4 16px)', shopifyColor: 'White'  },
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
  orientation: 'portrait' | 'landscape'
}

function makeFrame(id: string): FrameItem {
  return { id, color: 'walnut', size: SIZES[3], photo: null, orientation: 'portrait' }
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
  const [photoQuality, setPhotoQuality] = useState<'excellent' | 'good' | 'low' | null>(null)
  const [sampleIdx, setSampleIdx] = useState(0)
  const SAMPLE_PHOTOS = [
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=800&q=80',
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
    'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=800&q=80',
  ]
  useEffect(() => {
    if (frame.photo) return
    const t = setInterval(() => setSampleIdx(i => (i + 1) % SAMPLE_PHOTOS.length), 4000)
    return () => clearInterval(t)
  }, [frame.photo])
  const fileRef = useRef<HTMLInputElement>(null)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const touchRef = useRef<{ tx: number; ty: number; ox: number; oy: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      // Check image resolution for quality indicator
      const img = new window.Image()
      img.onload = () => {
        const mp = (img.naturalWidth * img.naturalHeight) / 1_000_000
        if (mp >= 3) setPhotoQuality('excellent')
        else if (mp >= 1) setPhotoQuality('good')
        else setPhotoQuality('low')
      }
      img.src = dataUrl
      setTimeout(() => {
        setZoom(1); setOffset({ x: 0, y: 0 }); setCropMode(false)
        onUpdate({ photo: dataUrl })
        setLoading(false)
      }, 350)
    }
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    setPhotoExiting(true)
    setPhotoQuality(null)
    setTimeout(() => {
      onUpdate({ photo: null })
      setPhotoExiting(false)
      setZoom(1); setOffset({ x: 0, y: 0 }); setCropMode(false)
    }, 260)
  }

  const isLandscape = frame.orientation === 'landscape'
  const aspectW = isLandscape ? frame.size.height : frame.size.width
  const aspectH = isLandscape ? frame.size.width : frame.size.height

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
            <div className="absolute inset-0 select-none overflow-hidden">
              {/* Sample inspirational photos — rotates every 4s to show different family moments */}
              {SAMPLE_PHOTOS.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt="Example photo in frame"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: 'brightness(0.88) saturate(1.1)',
                    opacity: i === sampleIdx ? 1 : 0,
                    transition: 'opacity 1s ease-in-out',
                  }}
                  draggable={false}
                />
              ))}
              {/* "SAMPLE" pill top-right */}
              <div className="absolute top-2 right-2 bg-black/40 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase pointer-events-none">
                Sample
              </div>
              {/* Bottom overlay CTA */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center py-3 gap-1 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.0) 100%)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B5A4A" strokeWidth="2.2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-white drop-shadow leading-tight">Tap to Add Your Photo</p>
                </div>
                <p className="text-[9px] text-white/70">JPG, PNG or HEIC</p>
              </div>
              {/* Animated dashed border hint */}
              <div className="absolute inset-2 rounded-lg border-2 border-dashed border-white/30 pointer-events-none" style={{ animation: 'dashPulse 2s ease-in-out infinite' }}/>
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

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} data-frame-upload="true" />

      {/* Photo quality indicator */}
      {photoQuality && (
        <div className={`mx-3 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
          photoQuality === 'excellent' ? 'bg-green-50 text-green-700 border border-green-200' :
          photoQuality === 'good' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{photoQuality === 'excellent' ? '🟢' : photoQuality === 'good' ? '🟡' : '🔴'}</span>
          <span>
            {photoQuality === 'excellent' ? 'Excellent photo quality — great print!' :
             photoQuality === 'good' ? 'Good quality — will print well' :
             'Low resolution — may appear blurry when printed'}
          </span>
        </div>
      )}

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
  const [wallStyle, setWallStyle] = useState<'classic' | 'modern' | 'dark' | 'warm'>('classic')
  const [ctaVisible, setCtaVisible] = useState(true)
  const counterRef = useRef(2)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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

      {/* Product Title + Urgency */}
      <div className="px-4 pt-1 pb-2">
        <h1 className="text-lg font-bold text-[#1B1B1B] leading-tight">Custom Wood Framed Sign</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i === 5 ? '#F59E0B' : '#F59E0B'} className="inline-block">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            ))}
          </div>
          <span className="text-xs font-semibold text-[#1B1B1B]">4.9</span>
          <span className="text-xs text-[#1B5A4A] font-medium underline cursor-pointer">2,847 reviews</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-gray-500 font-medium"><ViewingCount /> people viewing this right now</span>
        </div>
        <RotatingTagline />
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

      {/* Room preset switcher */}
      <RoomPresetSwitcher wallStyle={wallStyle} onChangeWall={setWallStyle} />
      <ShareDesignButton />

      {/* Frame Preview Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 rounded-2xl mx-4 my-2 transition-all duration-500" style={{ minHeight: '320px', ...WALL_STYLES[wallStyle] }}>
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
        {/* Countdown bar */}
        <div className="bg-[#0f3d2e] px-4 py-1.5 flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
          </svg>
          <span className="text-[11px] text-[#F5C842] font-bold uppercase tracking-wide">Limited Time — Offer expires in <OfferCountdown /></span>
        </div>
        {/* Cart scarcity */}
        <CartScarcityBadge />
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

      {/* Quantity / Bulk Discount Selector */}
      <div className="px-4 mb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Save More — Order Multiple</p>
        <div className="flex gap-2">
          {[
            { qty: 1, label: '1 Frame', pct: 0, badge: null },
            { qty: 2, label: '2 Frames', pct: 10, badge: null },
            { qty: 3, label: '3 Frames', pct: 20, badge: 'Best Value' },
          ].map(({ qty, label, pct, badge }) => {
            const isSelected = frames.length === qty
            const perFrame = Math.round(totalPrice / frames.length * (1 - pct / 100))
            return (
              <button
                key={qty}
                onClick={() => {
                  const diff = qty - frames.length
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) addFrame()
                  }
                }}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-2 transition-all relative"
                style={
                  isSelected
                    ? { borderColor: '#1B5A4A', background: '#f0faf5' }
                    : qty === 3
                    ? { borderColor: '#1B5A4A', background: 'linear-gradient(135deg, #1B5A4A 0%, #2d7a65 100%)' }
                    : { borderColor: '#e5e7eb', background: 'white' }
                }
              >
                {badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: '#F5C842', color: '#1B5A4A' }}>{badge}</span>
                )}
                <span className="text-[11px] font-black" style={{ color: isSelected ? '#1B5A4A' : qty === 3 ? 'white' : '#4b5563' }}>{label}</span>
                {pct > 0 && <span className="text-[9px] font-bold" style={{ color: isSelected ? '#16a34a' : qty === 3 ? '#7EC8A4' : '#16a34a' }}>Save {pct}%</span>}
                <span className="text-[10px] font-semibold" style={{ color: isSelected ? '#1B5A4A' : qty === 3 ? 'rgba(255,255,255,0.75)' : '#9ca3af' }}>${perFrame}/ea</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gallery Upsell Card — shown when single frame only */}
      {frames.length === 1 && (
        <div
          className="mx-4 mb-3 rounded-xl overflow-hidden"
          style={{ border: '2px dashed #F5C842', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '22px', lineHeight: 1 }}>🖼️</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5A4A', lineHeight: 1.2 }}>
                  Build a Gallery Wall
                </div>
                <div style={{ fontSize: '11px', color: '#78716c', marginTop: '1px' }}>
                  Add more frames &amp; save an extra 10%
                </div>
              </div>
            </div>
            <button
              onClick={addFrame}
              className="w-full"
              style={{
                background: '#1B5A4A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Add Frame to Gallery
            </button>
          </div>
        </div>
      )}

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

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-4 px-1">
            {/* Step 1 — Choose Size */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: '#1B5A4A', color: '#fff' }}>✓</div>
              <span className="text-[9px] font-semibold text-[#1B5A4A] text-center leading-tight">Choose<br/>Size</span>
            </div>
            <div className="flex-1 h-0.5 mb-3" style={{ background: '#1B5A4A' }}/>
            {/* Step 2 — Pick Frame */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: '#1B5A4A', color: '#fff' }}>✓</div>
              <span className="text-[9px] font-semibold text-[#1B5A4A] text-center leading-tight">Pick<br/>Frame</span>
            </div>
            <div className="flex-1 h-0.5 mb-3" style={{ background: activeFrame.photo ? '#1B5A4A' : '#e5e7eb' }}/>
            {/* Step 3 — Upload Photo */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2"
                style={activeFrame.photo
                  ? { background: '#1B5A4A', color: '#fff', borderColor: '#1B5A4A' }
                  : { background: '#fff', color: '#9ca3af', borderColor: '#e5e7eb' }}>
                {activeFrame.photo ? '✓' : '3'}
              </div>
              <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: activeFrame.photo ? '#1B5A4A' : '#9ca3af' }}>Upload<br/>Photo</span>
            </div>
          </div>

          {/* Room picker — size recommendation */}
          <RoomSizePicker onSuggest={(sizeId) => { const s = SIZES.find(x => x.id === sizeId); if (s) updateFrame(activeId, { size: s }) }} selectedSizeId={activeFrame.size.id} />

          {/* Size picker */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Size (inches)</p>
              {/* Orientation toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => updateFrame(activeId, { orientation: 'portrait' })}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeFrame.orientation !== 'landscape' ? 'bg-white shadow text-[#1B5A4A]' : 'text-gray-400'}`}
                >
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="1" y="0" width="8" height="12" rx="1.5"/></svg>
                  Portrait
                </button>
                <button
                  onClick={() => updateFrame(activeId, { orientation: 'landscape' })}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${activeFrame.orientation === 'landscape' ? 'bg-white shadow text-[#1B5A4A]' : 'text-gray-400'}`}
                >
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor"><rect x="0" y="1" width="12" height="8" rx="1.5"/></svg>
                  Landscape
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map(size => {
                const stockHints: Record<string, { label: string; color: string }> = {
                  '16x16': { label: 'POPULAR', color: '#F59E0B' },
                  '20x30': { label: '🔥 Hot', color: '#EF4444' },
                  '16x20': { label: 'Low stock', color: '#EF4444' },
                  '24x36': { label: 'Last few', color: '#EF4444' },
                }
                const hint = stockHints[size.id]
                return (
                  <button
                    key={size.id}
                    onClick={() => updateFrame(activeId, { size })}
                    className={`size-btn relative ${activeFrame.size.id === size.id ? 'active' : ''}`}
                  >
                    {hint && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap z-10" style={{ background: hint.color }}>
                        {hint.label}
                      </span>
                    )}
                    <span className="size-label">{size.label}</span>
                    <span className={`size-inches ${activeFrame.size.id === size.id ? 'text-white/80' : 'text-gray-400'}`}>
                      ${size.price}
                    </span>
                  </button>
                )
              })}
            </div>
            {/* Size comparison visual */}
            <div className="mt-3 px-1 pb-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Size comparison</p>
              <div className="flex items-end gap-2 justify-start">
                {[
                  { label: '8×10', w: 16, h: 20 },
                  { label: '12×16', w: 20, h: 27 },
                  { label: '16×16', w: 27, h: 27 },
                  { label: '20×30', w: 28, h: 42 },
                  { label: '24×36', w: 34, h: 51 },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <div
                      style={{ width: s.w, height: s.h, background: 'linear-gradient(135deg, #8B6914 0%, #C49A2B 50%, #8B6914 100%)', borderRadius: 2, border: '1.5px solid #6B4F10', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                    />
                    <span className="text-[8px] text-gray-500 font-medium leading-none">{s.label}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center gap-1 ml-auto">
                  <div style={{ width: 18, height: 54, background: 'linear-gradient(180deg, #e8d5b7 0%, #c9a96e 100%)', borderRadius: 2, border: '1px solid #bfa060', opacity: 0.5 }} />
                  <span className="text-[8px] text-gray-400 leading-none">door</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-400 mt-1">All frames shown to scale relative to each other</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-3"/>

          {/* Most Popular Combo quick-select */}
          <div className="mx-0 mb-3 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B5A4A 0%, #2d7a65 100%)', border: '1px solid rgba(27,90,74,0.2)' }}>
            <div className="px-3 py-2.5 flex items-center gap-2.5">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden" style={{ background: FRAME_COLORS[0].gradient, border: '2px solid rgba(255,255,255,0.3)' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <div style={{ width: 28, height: 28, border: '4px solid rgba(90,48,16,0.9)', borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">🏆 #1 Best Seller</span>
                </div>
                <p className="text-white font-bold text-[12px] leading-tight">16×16 Walnut Frame</p>
                <p className="text-white/70 text-[10px]">Chosen by 68% of customers</p>
              </div>
              <button
                onClick={() => {
                  const s = SIZES.find(x => x.id === '16x16')
                  if (s) updateFrame(activeId, { size: s, color: 'walnut' })
                }}
                className="flex-shrink-0 bg-white text-[#1B5A4A] text-[11px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap"
                style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}
              >
                Select ✓
              </button>
            </div>
          </div>

          {/* Color swatches */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Frame Color</p>
            <div className="flex items-center gap-3">
              {FRAME_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => updateFrame(activeId, { color: c.id })}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  <span
                    className={`w-full transition-all block shadow-sm overflow-hidden ${
                      activeFrame.color === c.id
                        ? 'ring-[3px] ring-[#1B5A4A] ring-offset-1 scale-105 shadow-md'
                        : 'ring-1 ring-gray-200 hover:ring-gray-400'
                    }`}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      background: c.gradient,
                      backgroundSize: '100% 100%',
                    }}
                  />
                  <span className={`text-[10px] font-semibold leading-none ${activeFrame.color === c.id ? 'text-[#1B5A4A]' : 'text-gray-500'}`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* "How it looks in your home" lifestyle inspiration strip */}
      <div className="pb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-4">How it looks in your home</p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 px-4" style={{ scrollSnapType: 'x mandatory' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1618219740975-d40978bb7378?w=400&q=80', room: 'Living Room', name: 'Sarah M.', size: '16×20 Walnut' },
            { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', room: 'Bedroom', name: 'Jessica L.', size: '16×16 Oak' },
            { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', room: 'Office', name: 'Mike R.', size: '12×16 Black' },
            { img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', room: 'Hallway', name: 'Amy K.', size: '20×30 Walnut' },
            { img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80', room: 'Nursery', name: 'Rachel T.', size: '10×12 White' },
          ].map(c => (
            <div key={c.name} className="flex-shrink-0 relative rounded-xl overflow-hidden" style={{ width: 130, height: 160, scrollSnapAlign: 'start', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
              <img src={c.img} alt={c.room} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.85)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 55%)' }} />
              <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{c.room}</div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-[10px] font-bold leading-tight">{c.size}</p>
                <p className="text-white/70 text-[9px]">{c.name} · ★★★★★</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customers Also Love */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customers also love</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { emoji: '🎨', title: 'Canvas Print', subtitle: '16×20 · Rolled', price: '$49', href: 'https://smallwoodhome.com/collections/canvas-prints' },
            { emoji: '🖼️', title: 'Gallery Wall Set', subtitle: '3-pack · Mixed sizes', price: '$179', href: 'https://smallwoodhome.com/collections/gallery-wall' },
            { emoji: '📸', title: 'Photo Book', subtitle: 'Hardcover · 20 pgs', price: '$39', href: 'https://smallwoodhome.com/collections/photo-books' },
          ].map(p => (
            <a
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-28 bg-white border border-gray-200 rounded-xl p-2.5 flex flex-col gap-1 hover:border-[#1B5A4A] transition-colors"
            >
              <span className="text-2xl leading-none">{p.emoji}</span>
              <span className="text-[11px] font-bold text-gray-800 leading-tight">{p.title}</span>
              <span className="text-[10px] text-gray-400 leading-tight">{p.subtitle}</span>
              <span className="text-[12px] font-black text-[#1B5A4A]">{p.price}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Social Proof Strip */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-xl py-2.5 px-4">
          <span className="text-amber-400 text-base leading-none tracking-tight">★★★★★</span>
          <span className="text-sm font-semibold text-gray-700">50,000+ happy families</span>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">What Customers Say</p>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Sarah M.', location: 'Austin, TX', product: '16×16 Walnut', quote: 'Absolutely beautiful — the wood grain is stunning and it arrived in perfect condition. My family loves it!', initials: 'SM', color: '#C65D2B' },
            { name: 'Jessica L.', location: 'Denver, CO', product: '20×30 Oak', quote: 'Ordered as a anniversary gift. My husband cried when he opened it. The quality exceeded our expectations.', initials: 'JL', color: '#2B6CB0' },
            { name: 'Mike R.', location: 'Nashville, TN', product: '12×16 Black', quote: 'Third one I\'ve ordered — addicted. Ships SO fast and looks exactly like the preview. 10/10.', initials: 'MR', color: '#276749' },
          ].map((review) => (
            <div key={review.name} className="flex items-start gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black" style={{ background: review.color }}>
                {review.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-gray-800">{review.name}</span>
                  <span className="text-amber-400 text-[10px] leading-none">★★★★★</span>
                </div>
                <p className="text-[9px] text-gray-400 mb-1">{review.product} · {review.location}</p>
                <p className="text-[10px] text-gray-600 leading-relaxed">&ldquo;{review.quote}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-around gap-1 py-2.5 px-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg leading-none">🔒</span>
            <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight">Secure<br/>Checkout</span>
          </div>
          <div className="w-px h-8 bg-gray-200"/>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg leading-none">🔄</span>
            <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight">Free<br/>Returns</span>
          </div>
          <div className="w-px h-8 bg-gray-200"/>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg leading-none">🇺🇸</span>
            <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight">Made<br/>in USA</span>
          </div>
          <div className="w-px h-8 bg-gray-200"/>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg leading-none">🚚</span>
            <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight">Ships in<br/>1–3 Days</span>
          </div>
        </div>
      </div>

      {/* Estimated Delivery Banner */}
      <DeliveryBanner />

      {/* How It Works */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">How It Works</p>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#1B5A4A]/08 flex items-center justify-center text-xl">📸</div>
            <p className="text-[9px] font-semibold text-gray-600 text-center leading-tight">Upload<br/>Your Photo</p>
          </div>
          <div className="flex items-center mt-4 text-gray-300 text-base">→</div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#1B5A4A]/08 flex items-center justify-center text-xl">🖨️</div>
            <p className="text-[9px] font-semibold text-gray-600 text-center leading-tight">We Print<br/>& Frame It</p>
          </div>
          <div className="flex items-center mt-4 text-gray-300 text-base">→</div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#1B5A4A]/08 flex items-center justify-center text-xl">📦</div>
            <p className="text-[9px] font-semibold text-gray-600 text-center leading-tight">Delivered<br/>in 1–3 Days</p>
          </div>
        </div>
      </div>

      {/* Gift Message */}
      <GiftMessageBox />

      {/* FAQ Accordion */}
      <FAQAccordion />

      {/* CTA Button */}
      {/* Satisfaction Guarantee Banner */}
      <div className="mx-4 mb-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-2xl leading-none flex-shrink-0">🛡️</span>
        <div>
          <p className="text-[12px] font-black text-[#1B5A4A] leading-tight">100% Satisfaction Guarantee</p>
          <p className="text-[11px] text-gray-600 leading-tight mt-0.5">Love it or we reprint it free. No questions asked.</p>
        </div>
      </div>

      <div className="px-4 pb-6" ref={ctaRef}>
        <AddToCartButton frames={frames} bundleTotal={bundleTotal} totalPrice={totalPrice} />
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      <RecentBuyerToast />

      {/* Sticky Bottom Bar — shown when CTA scrolls out of view */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          transform: ctaVisible ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease',
          background: '#1B5A4A',
          padding: '10px 14px',
          paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* Mini frame color swatch */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: FRAME_COLORS.find(c => c.id === activeFrame.color)?.gradient ?? '#5a3010',
          border: '2.5px solid rgba(255,255,255,0.35)',
          flexShrink: 0,
          boxShadow: '0 1px 6px rgba(0,0,0,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* inner frame cutout hint */}
          <div style={{ position: 'absolute', inset: 6, border: '1.5px solid rgba(0,0,0,0.18)', borderRadius: 2 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeFrame.size.label} · {FRAME_COLORS.find(c => c.id === activeFrame.color)?.label ?? 'Walnut'} · Qty {frames.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, lineHeight: 1.1 }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>${displayBundle}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textDecoration: 'line-through' }}>${fullTotal}</span>
          </div>
        </div>
        <button
          onClick={() => ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          style={{
            background: 'white',
            color: '#1B5A4A',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {activeFrame.photo ? '🛒 Add to Cart' : '📸 Upload & Order'}
        </button>
      </div>
    </div>
  )
}

function DeliveryBanner() {
  const deliveryDate = (() => {
    const d = new Date()
    // Add 1-3 business days (skip weekends)
    let days = 0
    let added = 0
    while (added < 3) {
      d.setDate(d.getDate() + 1)
      days++
      if (d.getDay() !== 0 && d.getDay() !== 6) added++
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
  })()

  const soonDate = (() => {
    const d = new Date()
    let added = 0
    while (added < 1) {
      d.setDate(d.getDate() + 1)
      if (d.getDay() !== 0 && d.getDay() !== 6) added++
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
  })()

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-2.5 bg-[#f0faf5] border border-[#1B5A4A]/20 rounded-xl px-3 py-2.5">
        <span className="text-xl leading-none flex-shrink-0">🚚</span>
        <div>
          <p className="text-[11px] font-black text-[#1B5A4A] leading-tight">Order today — arrives by {deliveryDate}</p>
          <p className="text-[9px] text-[#1B5A4A]/60 mt-0.5">Express available: as soon as {soonDate}</p>
        </div>
      </div>
    </div>
  )
}

function RoomSizePicker({ onSuggest, selectedSizeId }: { onSuggest: (sizeId: string) => void; selectedSizeId: string }) {
  const rooms = [
    { label: '🛋️ Living Room', sizeId: '24x36', hint: '24×36' },
    { label: '🛏️ Bedroom', sizeId: '16x16', hint: '16×16' },
    { label: '🚶 Hallway', sizeId: '12x16', hint: '12×16' },
    { label: '💼 Office', sizeId: '10x12', hint: '10×12' },
  ]
  const [selected, setSelected] = useState<string | null>(null)
  const handlePick = (r: typeof rooms[0]) => {
    setSelected(r.label)
    onSuggest(r.sizeId)
  }
  return (
    <div className="mb-3 px-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Where will it hang?</p>
      <div className="flex gap-1.5 flex-wrap">
        {rooms.map(r => (
          <button
            key={r.label}
            onClick={() => handlePick(r)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
              selected === r.label
                ? 'bg-[#1B5A4A] text-white border-[#1B5A4A]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B5A4A]'
            }`}
          >
            {r.label}
            {selected === r.label && <span className="text-white/80 text-[10px]">→ {r.hint}</span>}
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-[10px] text-[#1B5A4A] mt-1.5 font-medium">✓ Size updated — you can still adjust below</p>
      )}
    </div>
  )
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    {
      q: 'How do I upload my photo?',
      a: 'Tap "Upload Your Photo to Continue" and select any photo from your device. JPG, PNG, and HEIC files are all supported. We recommend at least 1MB for best print quality.'
    },
    {
      q: 'What file types are accepted?',
      a: 'We accept JPG, PNG, and HEIC (iPhone) photos. For best results, use a high-resolution image — at least 1000×800 pixels. Blurry or very small photos may affect print clarity.'
    },
    {
      q: 'How is it packaged and protected?',
      a: 'Every frame is wrapped in foam padding and shipped in a custom-fit box. We include corner protectors and a layer of bubble wrap. Less than 0.5% of orders arrive with any damage.'
    },
    {
      q: 'Can I include a gift message?',
      a: 'Yes! Check the "This is a gift" box above and type your personal message. It\'ll be printed on a card and included inside the box at no extra cost.'
    },
    {
      q: 'What is your return policy?',
      a: 'We offer free returns within 30 days of delivery. If your print arrives damaged or doesn\'t look right, we\'ll reprint it for free — no questions asked.'
    },
  ]
  return (
    <div className="mx-4 mb-4 rounded-xl border border-gray-200 overflow-hidden">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-3 border-b border-gray-100 bg-gray-50">Common Questions</p>
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-gray-100 last:border-0">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-[13px] font-semibold text-gray-800 leading-snug pr-2">{faq.q}</span>
            <span className="text-gray-400 text-lg flex-shrink-0 transition-transform duration-200" style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
          </button>
          {open === i && (
            <p className="px-4 pb-4 text-[12px] text-gray-600 leading-relaxed">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function GiftMessageBox() {
  const [isGift, setIsGift] = useState(false)
  const [message, setMessage] = useState('')
  return (
    <div className="px-4 pb-3">
      <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isGift ? 'border-[#1B5A4A]/30 bg-[#f0faf5]' : 'border-gray-100 bg-white'}`}>
        <button
          onClick={() => setIsGift(v => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5"
        >
          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${isGift ? 'bg-[#1B5A4A] border-[#1B5A4A]' : 'bg-white border-gray-300'}`}>
            {isGift && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20,6 9,17 4,12"/></svg>}
          </div>
          <span className="text-sm font-semibold text-gray-700">🎁 This is a gift — add a free message</span>
        </button>
        {isGift && (
          <div className="px-3 pb-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Write your personal message here... e.g. &quot;Happy Anniversary, love always 💛&quot;"
              className="w-full text-[12px] text-gray-700 placeholder-gray-400 border border-[#1B5A4A]/20 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B5A4A]/40 bg-white"
            />
            <p className="text-[9px] text-gray-400 text-right mt-0.5">{message.length}/200</p>
          </div>
        )}
      </div>
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
    : (hasPhotos ? `Add to Cart — $${totalPrice}` : '📷  Upload Your Photo to Continue')

  return (
    <button
      onClick={hasPhotos ? handleAddToCart : () => { document.querySelector<HTMLElement>('[data-frame-upload]')?.click() }}
      className="w-full font-bold rounded-xl transition-all active:scale-[0.98] relative overflow-hidden cursor-pointer"
      style={{
        background: hasPhotos ? '#1B5A4A' : 'linear-gradient(135deg, #1B5A4A 0%, #2d7a65 100%)',
        color: 'white',
        padding: '0',
        boxShadow: hasPhotos ? '0 4px 16px rgba(27,90,74,0.35)' : '0 4px 20px rgba(27,90,74,0.5), 0 0 0 3px rgba(27,90,74,0.15)',
      }}
    >
      {/* Pulsing glow ring — only when no photo yet */}
      {!hasPhotos && !adding && !added && (
        <span className="absolute -inset-[3px] rounded-[15px] pointer-events-none" style={{ border: '3px solid rgba(126,200,164,0.45)', animation: 'ctaGlow 2s ease-in-out infinite' }} />
      )}
      {/* Shimmer glint overlay */}
      {!adding && !added && (
        <span className="absolute inset-0 pointer-events-none" style={{ animation: 'ctaShimmer 2.8s ease-in-out infinite' }}>
          <span className="absolute top-0 bottom-0 w-16 -skew-x-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', left: '-4rem', animation: 'ctaShimmerSlide 2.8s ease-in-out infinite' }}/>
        </span>
      )}
      {adding ? (
        <span className="flex items-center justify-center gap-2 py-4">
          <span className="w-4 h-4 rounded-full animate-spin inline-block" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'white', borderTopColor: 'transparent' }}/>
          Adding to Cart…
        </span>
      ) : added ? (
        <span className="flex items-center justify-center gap-2 py-4">✓ Added! Redirecting to cart…</span>
      ) : hasPhotos ? (
        <span className="flex items-center justify-center gap-2 py-4">{label}</span>
      ) : (
        <span className="flex items-center justify-center gap-3 py-3.5 px-4">
          {/* Camera icon */}
          <span className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </span>
          <span className="flex flex-col items-start">
            <span style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.2 }}>Upload Your Photo to Continue</span>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.72)', lineHeight: 1.2 }}>Your memory · Our frame · Ships in 3 days</span>
          </span>
        </span>
      )}
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
