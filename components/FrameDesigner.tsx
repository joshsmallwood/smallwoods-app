'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  trackViewContent,
  trackSizeSelected,
  trackColorSelected,
  trackPhotoUploaded,
  trackAddToCart,
  trackInitiateCheckout,
  trackGalleryWallAdded,
} from '@/lib/pixels'

// ─── Types ─────────────────────────────────────────────────────────────────

type ColorId = 'Stained' | 'Almond' | 'Black' | 'White'

interface SizeOption {
  id: string
  label: string
  widthIn: number
  heightIn: number
  price: number         // framed price
  compareAt: number     // framed compare-at
  refillPrice: number   // print refill (No Frame) price — verified from Shopify API
  shopifySize: string
  frameSku: string
}

interface FrameItem {
  id: string
  size: SizeOption
  color: ColorId
  photo: string | null
  orientation: 'portrait' | 'landscape'
  zoom: number
  offsetX: number
  offsetY: number
  photoQuality?: 'excellent' | 'good' | 'low' | null
  photoW?: number
  photoH?: number
}

// ─── Constants ─────────────────────────────────────────────────────────────

const CDN = 'https://d1ekkteymj95ic.cloudfront.net/images'

const COLORS: { id: ColorId; label: string; corner: string; hex: string }[] = [
  { id: 'Stained', label: 'Walnut', corner: `${CDN}/frame_corner_SB_Stained.png`, hex: '#5a3010' },
  { id: 'Almond',  label: 'Oak',    corner: `${CDN}/frame_corner_SB_Almond.png`,  hex: '#c8a060' },
  { id: 'Black',   label: 'Black',  corner: `${CDN}/frame_corner_SB_Black.png`,   hex: '#1a1a1a' },
  { id: 'White',   label: 'White',  corner: `${CDN}/frame_corner_SB_White.png`,   hex: '#f0ece4' },
]

const COLOR_SHORT: Record<ColorId, string> = {
  Stained: 'S', Almond: 'A', Black: 'B', White: 'W',
}

// Prices verified against live Shopify API (product 7241370435721)
const SIZES: SizeOption[] = [
  { id: '8x10',  label: '8×10',  widthIn: 8,  heightIn: 10, price: 69,  compareAt: 100, refillPrice: 39,  shopifySize: '8x10',                  frameSku: 'SB-M'     },
  { id: '10x12', label: '10×12', widthIn: 10, heightIn: 12, price: 75,  compareAt: 100, refillPrice: 42,  shopifySize: '10x12',                 frameSku: 'SB-M'     },
  { id: '12x16', label: '12×16', widthIn: 12, heightIn: 16, price: 89,  compareAt: 120, refillPrice: 49,  shopifySize: '12x16',                 frameSku: 'SB-M'     },
  { id: '13x13', label: '13×13', widthIn: 13, heightIn: 13, price: 79,  compareAt: 100, refillPrice: 45,  shopifySize: 'Small Square 13" x 13"', frameSku: 'SB-M'    },
  { id: '16x16', label: '16×16', widthIn: 16, heightIn: 16, price: 99,  compareAt: 130, refillPrice: 55,  shopifySize: '16x16',                 frameSku: 'SB-M'     },
  { id: '25x17', label: '25×17', widthIn: 25, heightIn: 17, price: 109, compareAt: 150, refillPrice: 59,  shopifySize: 'Medium 25" x 17"',      frameSku: 'SB-M'     },
  { id: '20x30', label: '20×30', widthIn: 20, heightIn: 30, price: 119, compareAt: 170, refillPrice: 69,  shopifySize: '20x30',                 frameSku: 'SB-20x30' },
  { id: '25x25', label: '25×25', widthIn: 25, heightIn: 25, price: 129, compareAt: 190, refillPrice: 79,  shopifySize: 'Square 25" x 25"',      frameSku: 'SB-M'     },
  { id: '24x36', label: '24×36', widthIn: 24, heightIn: 36, price: 129, compareAt: 190, refillPrice: 79,  shopifySize: '24x36',                 frameSku: 'SB-24x36' },
  { id: '44x22', label: '44×22', widthIn: 44, heightIn: 22, price: 139, compareAt: 200, refillPrice: 89,  shopifySize: 'Extra Large 44" x 22"', frameSku: 'SB-XL'    },
]

// Shopify variant map [shopifySize][colorLabel]
const VARIANT_MAP: Record<string, Record<string, number>> = {
  '8x10':                    { Stained: 41365292810377, Almond: 41365292843145, Natural: 41365292941449, Black: 41365292875913, White: 41365292908681, 'No Frame': 42725040554121 },
  '10x12':                   { Stained: 41365292646537, Almond: 41365292679305, Natural: 41365292777609, Black: 41365292712073, White: 41365292744841, 'No Frame': 42725040521353 },
  '12x16':                   { Stained: 41365292155017, Almond: 41365292187785, Natural: 41365292286089, Black: 41365292220553, White: 41365292253321, 'No Frame': 42725040423049 },
  '16x16':                   { Stained: 41365292318857, Almond: 41365292351625, Natural: 41365292449929, Black: 41365292384393, White: 41365292417161, 'No Frame': 42725040455817 },
  'Medium 25" x 17"':        { Stained: 41365291663497, Almond: 41365291696265, Natural: 41365291794569, Black: 41365291729033, White: 41365291761801, 'No Frame': 42725040291977 },
  '20x30':                   { Stained: 41843744768137, Almond: 41843744800905, Natural: 41843744899209, Black: 41843744833673, White: 41843744866441, 'No Frame': 42725040357513 },
  'Square 25" x 25"':        { Stained: 41365291991177, Almond: 41365292023945, Natural: 41365292122249, Black: 41365292056713, White: 41365292089481, 'No Frame': 42725040390281 },
  '24x36':                   { Stained: 43361951154313, Almond: 43361954857097, Natural: 43361960329353, Black: 43361957707913, White: 43361959936137, 'No Frame': 43361961214089 },
  'Extra Large 44" x 22"':   { Stained: 41365291827337, Almond: 41365291860105, Natural: 41365291958409, Black: 41365291892873, White: 41365291925641, 'No Frame': 42725040324745 },
  'Small Square 13" x 13"':  { Stained: 41365292482697, Almond: 41365292515465, Natural: 41365292613769, Black: 41365292548233, White: 41365292581001, 'No Frame': 42725040488585 },
}

const DISCOUNT = 0.35
const PROMO_CODE = 'MYWALL35'
const SHOPIFY_STORE = 'https://smallwoodhome.com'

// No Frame (Print Refill) variant IDs — verified from Shopify API Apr 2026
const REFILL_VARIANT_MAP: Record<string, number> = {
  '8x10':                   42725040554121,
  '10x12':                  42725040521353,
  '12x16':                  42725040423049,
  'Small Square 13" x 13"': 42725040488585,
  '16x16':                  42725040455817,
  'Medium 25" x 17"':       42725040291977,
  '20x30':                  42725040357513,
  'Square 25" x 25"':       42725040390281,
  '24x36':                  43361961214089,
  'Extra Large 44" x 22"':  42725040324745,
}

const DEFAULT_SIZE = SIZES.find(s => s.id === '25x17')!

// Default portrait — dev app shows 25x17 as portrait (rotated, 17w x 25h) to fill phone height
function makeFrame(id: string): FrameItem {
  return { id, size: DEFAULT_SIZE, color: 'Stained', photo: null, orientation: 'portrait', zoom: 1, offsetX: 0, offsetY: 0 }
}

function getFrameImageUrl(size: SizeOption, color: ColorId): string {
  return `${CDN}/frame_rotated_${size.frameSku}-CUSTOM-100-${COLOR_SHORT[color]}-A0.png`
}

function getVariantId(size: SizeOption, color: ColorId, isRefill: boolean): number | null {
  if (isRefill) return REFILL_VARIANT_MAP[size.shopifySize] ?? null
  const shopifyColorMap: Record<ColorId, string> = {
    Stained: 'Stained', Almond: 'Almond', Black: 'Black', White: 'White',
  }
  return VARIANT_MAP[size.shopifySize]?.[shopifyColorMap[color]] ?? null
}

function getPrice(frame: FrameItem, isRefill: boolean) {
  return isRefill ? frame.size.refillPrice : frame.size.price
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function FrameCanvas({ frame, onPhotoChange, isActive, onClick, showRefill, onOrientMismatch, showGalleryRing }: {
  frame: FrameItem
  onPhotoChange: (photo: string | null, quality: 'excellent' | 'good' | 'low', photoW: number, photoH: number) => void
  isActive: boolean
  onClick: () => void
  showRefill?: boolean
  onOrientMismatch?: (suggestion: 'portrait' | 'landscape') => void
  showGalleryRing?: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const touchRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null)

  const frameImgUrl = getFrameImageUrl(frame.size, frame.color)
  // "portrait" mode = rotate so the longer dimension is vertical
  // For 25x17: portrait shows 17w × 25h (tall), landscape shows 25w × 17h (wide)
  const isLandscape = frame.orientation === 'landscape'
  // In portrait: swap so taller dimension is height
  const longerDim = Math.max(frame.size.widthIn, frame.size.heightIn)
  const shorterDim = Math.min(frame.size.widthIn, frame.size.heightIn)
  const aspectW = isLandscape ? longerDim : shorterDim
  const aspectH = isLandscape ? shorterDim : longerDim

  // Frame border via CSS border-image (same technique as dev app)
  const framePadding = 14
  const containerRef = useRef<HTMLDivElement>(null)

  // Compute display size: fill available space, respecting aspect ratio
  // Border stays fixed — only the photo interior scales
  const BORDER_PX = showRefill ? 0 : 10 // matches dev app border-width exactly
  const photoW = aspectW
  const photoH = aspectH
  // Scale frame to fill available space — container is max 480px wide, height depends on viewport
  const viewW = typeof window !== 'undefined' ? Math.min(window.innerWidth, 480) : 390
  const viewH = typeof window !== 'undefined' ? window.innerHeight : 844
  const maxDisplayW = viewW * 0.70 - BORDER_PX * 2
  const maxDisplayH = viewH * 0.68 - BORDER_PX * 2
  const scaleByW = maxDisplayW / photoW
  const scaleByH = maxDisplayH / photoH
  const scale = Math.min(scaleByW, scaleByH)
  const innerW = Math.round(photoW * scale)
  const innerH = Math.round(photoH * scale)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(heic|heif)$/i)) {
      alert('Please upload an image file (JPG, PNG, or HEIC).')
      return
    }
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        const px = img.naturalWidth * img.naturalHeight
        const excellent = frame.size.widthIn * 150 * frame.size.heightIn * 150
        const good = frame.size.widthIn * 100 * frame.size.heightIn * 100
        const quality = px >= excellent ? 'excellent' : px >= good ? 'good' : 'low'
        const natW = img.naturalWidth
        const natH = img.naturalHeight
        onPhotoChange(dataUrl, quality, natW, natH)
        // Orientation mismatch detection
        if (onOrientMismatch) {
          const photoIsLandscape = natW > natH
          const frameIsLandscape = frame.orientation === 'landscape'
          if (photoIsLandscape && !frameIsLandscape) onOrientMismatch('landscape')
          else if (!photoIsLandscape && frameIsLandscape) onOrientMismatch('portrait')
        }
        setLoading(false)
      }
      img.onerror = () => { setLoading(false); alert('Could not read this image. Try a different photo.') }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ lineHeight: 0 }}
      onClick={onClick}
    >
      {/* Active ring — only show in gallery mode (multiple frames) */}
      {isActive && showGalleryRing && (
        <div style={{ position: 'absolute', inset: -3, borderRadius: 6, border: '2.5px solid #143639', pointerEvents: 'none', zIndex: 5 }} />
      )}
      {/* Frame border using border-image — fixed border width, variable interior */}
      <div
        style={{
          width: innerW + BORDER_PX * 2,
          height: innerH + BORDER_PX * 2,
          borderStyle: frameImgUrl ? 'solid' : 'none',
          borderWidth: BORDER_PX,
          borderImageSource: frameImgUrl ? `url("${frameImgUrl}")` : 'none',
          borderImageSlice: 10,
          borderImageRepeat: 'stretch',
          lineHeight: 0,
          boxSizing: 'content-box',
          position: 'relative',
          background: 'transparent',
        }}
      >
        {/* Photo area */}
        <div
          style={{
            width: innerW,
            height: innerH,
            overflow: 'hidden',
            cursor: frame.photo ? (dragging ? 'grabbing' : 'grab') : 'pointer',
            background: 'white',
            position: 'relative',
          }}
          onClick={() => { if (!frame.photo && !loading) fileRef.current?.click() }}
          onMouseDown={(e) => {
            if (!frame.photo) return
            dragRef.current = { startX: e.clientX, startY: e.clientY, ox: frame.offsetX, oy: frame.offsetY }
            setDragging(true)
          }}
          onMouseMove={(e) => {
            if (!dragRef.current) return
            const dx = e.clientX - dragRef.current.startX
            const dy = e.clientY - dragRef.current.startY
            // Bubble up to parent to update offset — we use a custom event approach
            const el = e.currentTarget
            el.dispatchEvent(new CustomEvent('photodrag', { detail: { x: dragRef.current.ox + dx, y: dragRef.current.oy + dy }, bubbles: true }))
          }}
          onMouseUp={() => { dragRef.current = null; setDragging(false) }}
          onMouseLeave={() => { dragRef.current = null; setDragging(false) }}
          onTouchStart={(e) => {
            if (!frame.photo) return
            if (e.touches.length === 2) {
              const dx = e.touches[0].clientX - e.touches[1].clientX
              const dy = e.touches[0].clientY - e.touches[1].clientY
              pinchRef.current = { dist: Math.hypot(dx, dy), zoom: frame.zoom }
            } else {
              const t = e.touches[0]
              touchRef.current = { startX: t.clientX, startY: t.clientY, ox: frame.offsetX, oy: frame.offsetY }
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2 && pinchRef.current) {
              e.preventDefault()
              const dx = e.touches[0].clientX - e.touches[1].clientX
              const dy = e.touches[0].clientY - e.touches[1].clientY
              const newDist = Math.hypot(dx, dy)
              const scale = newDist / pinchRef.current.dist
              const newZoom = Math.min(3, Math.max(0.5, pinchRef.current.zoom * scale))
              e.currentTarget.dispatchEvent(new CustomEvent('photozoom', { detail: { zoom: newZoom }, bubbles: true }))
            } else if (touchRef.current) {
              const t = e.touches[0]
              const dx = t.clientX - touchRef.current.startX
              const dy = t.clientY - touchRef.current.startY
              e.currentTarget.dispatchEvent(new CustomEvent('photodrag', { detail: { x: touchRef.current.ox + dx, y: touchRef.current.oy + dy }, bubbles: true }))
            }
          }}
          onTouchEnd={() => { touchRef.current = null; pinchRef.current = null }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="w-7 h-7 rounded-full animate-spin" style={{ border: '3px solid #143639', borderTopColor: 'transparent' }} />
            </div>
          ) : frame.photo ? (
            <img
              src={frame.photo}
              alt="Your photo"
              draggable={false}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                transform: `translate(${frame.offsetX}px, ${frame.offsetY}px) scale(${frame.zoom})`,
                transformOrigin: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none" stroke="#143639" strokeWidth="1.5">
                <rect x="1" y="5" width="26" height="16" rx="2"/>
                <circle cx="14" cy="13" r="4"/>
                <path d="M9 5V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/>
              </svg>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#143639' }}>Add Photo</p>
              <p style={{ fontSize: 9, color: '#888' }}>JPG, PNG or HEIC</p>
            </div>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
    </div>
  )
}

function SizeSelector({ selected, onSelect }: { selected: SizeOption; onSelect: (s: SizeOption) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 12px', borderRadius: 4,
          border: '1.5px solid #143639', background: 'white',
          fontSize: 13, fontWeight: 700, color: '#143639',
          cursor: 'pointer',
        }}
      >
        {selected.label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="#143639" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
          <path d="M5 6L0 0h10z"/>
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', bottom: '110%', left: 0, zIndex: 100,
            background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: 8, minWidth: 160,
          }}
        >
          {SIZES.map(s => (
            <button
              key={s.id}
              onClick={() => { onSelect(s); setOpen(false) }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none',
                background: selected.id === s.id ? '#f0faf5' : 'transparent',
                color: selected.id === s.id ? '#143639' : '#333',
                fontWeight: selected.id === s.id ? 800 : 500,
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span>{s.label}</span>
              <span style={{ fontSize: 11, color: '#888' }}>${s.price}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ColorSwatch({ color, selected, onSelect }: { color: typeof COLORS[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      title={color.label}
      style={{
        width: 36, height: 36, padding: 2, border: 'none', background: 'none',
        cursor: 'pointer', borderRadius: 3, flexShrink: 0,
        outline: selected ? `2px solid #143639` : '2px solid transparent',
        outlineOffset: 1,
        transition: 'outline 0.1s',
      }}
    >
      {color.corner ? (
        <img
          src={color.corner}
          alt={color.label}
          style={{ width: '100%', height: '100%', display: 'block', borderRadius: 3, objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#e8e4dc', borderRadius: 3, border: '1px solid #d0ccc4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 8, color: '#999', fontWeight: 600 }}>None</span>
        </div>
      )}
    </button>
  )
}

function PriceRow({ frames, isRefill }: { frames: FrameItem[]; isRefill: boolean }) {
  const fullTotal = frames.reduce((s, f) => s + f.size.compareAt, 0)
  const saleTotal = frames.reduce((s, f) => s + getPrice(f, isRefill), 0)
  // Refills don't get 35% bundle discount — price is already final
  const bundleTotal = isRefill ? saleTotal : Math.round(saleTotal * (1 - DISCOUNT))

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '5px 16px', background: 'white', borderTop: '1px solid #f0ece4' }}>
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#bd7b57', textDecoration: 'line-through' }}>${fullTotal}</div>
        <div style={{ fontSize: 7, color: '#bbb', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Price</div>
      </div>
      <div style={{ width: 1, height: 28, background: '#e5e7eb' }} />
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#143639' }}>${saleTotal}</div>
        <div style={{ fontSize: 7, color: '#bbb', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sale Price</div>
      </div>
      <div style={{ width: 1, height: 28, background: '#e5e7eb' }} />
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#143639', lineHeight: 1 }}>${bundleTotal}</div>
        <div style={{ fontSize: 7, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bundle Price</div>
      </div>
    </div>
  )
}

// ─── Main Designer ──────────────────────────────────────────────────────────

export default function FrameDesigner() {
  const [frames, setFrames] = useState<FrameItem[]>([makeFrame('f1')])
  const [activeId, setActiveId] = useState('f1')
  const [isRefill, setIsRefill] = useState(false)
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const counterRef = useRef(2)

  const activeFrame = frames.find(f => f.id === activeId) ?? frames[0]

  // Fire ViewContent on mount
  useEffect(() => {
    trackViewContent({ sizeId: DEFAULT_SIZE.id, colorId: 'Stained', price: DEFAULT_SIZE.price })
  }, [])

  // Listen for photodrag / photozoom custom events from FrameCanvas
  const handleCanvasEvent = useCallback((e: Event) => {
    const ce = e as CustomEvent
    if (ce.type === 'photodrag') {
      setFrames(prev => prev.map(f => f.id === activeId ? { ...f, offsetX: ce.detail.x, offsetY: ce.detail.y } : f))
    } else if (ce.type === 'photozoom') {
      setFrames(prev => prev.map(f => f.id === activeId ? { ...f, zoom: ce.detail.zoom } : f))
    }
  }, [activeId])

  useEffect(() => {
    document.addEventListener('photodrag', handleCanvasEvent)
    document.addEventListener('photozoom', handleCanvasEvent)
    return () => {
      document.removeEventListener('photodrag', handleCanvasEvent)
      document.removeEventListener('photozoom', handleCanvasEvent)
    }
  }, [handleCanvasEvent])

  const updateFrame = (id: string, patch: Partial<FrameItem>) => {
    setFrames(prev => prev.map(f => {
      if (f.id !== id) return f
      const next = { ...f, ...patch }
      if (patch.size && patch.size.id !== f.size.id) {
        trackSizeSelected({ sizeId: patch.size.id, sizeLabel: patch.size.label, price: patch.size.price })
      }
      if (patch.color && patch.color !== f.color) {
        const colorObj = COLORS.find(c => c.id === patch.color)
        trackColorSelected({ colorId: patch.color as string, colorLabel: colorObj?.label ?? patch.color as string, sizeId: next.size.id, price: getPrice(next, isRefill) })
      }
      return next
    }))
  }

  const [orientMismatch, setOrientMismatch] = useState<'portrait' | 'landscape' | null>(null)

  const handlePhotoChange = (id: string, photo: string | null, quality: 'excellent' | 'good' | 'low', photoW = 0, photoH = 0) => {
    updateFrame(id, { photo, zoom: 1, offsetX: 0, offsetY: 0, photoQuality: photo ? quality : null, photoW, photoH })
    if (photo) {
      trackPhotoUploaded({ sizeId: activeFrame.size.id, colorId: activeFrame.color, price: getPrice(activeFrame, isRefill), quality, frameCount: frames.length })
    } else {
      setOrientMismatch(null)
    }
  }

  const addFrame = () => {
    const id = `f${counterRef.current++}`
    setFrames(prev => {
      const next = [...prev, makeFrame(id)]
      if (prev.length === 1) {
        trackGalleryWallAdded({ frameCount: 2, totalValue: next.reduce((s, f) => s + getPrice(f, isRefill), 0) })
      }
      return next
    })
    setActiveId(id)
  }

  const removeFrame = (id: string) => {
    setFrames(prev => {
      const next = prev.filter(f => f.id !== id)
      if (activeId === id) setActiveId(next[next.length - 1]?.id ?? '')
      return next
    })
  }

  const clearPhoto = () => updateFrame(activeId, { photo: null, zoom: 1, offsetX: 0, offsetY: 0 })

  const rotateFrame = () => {
    updateFrame(activeId, { orientation: activeFrame.orientation === 'portrait' ? 'landscape' : 'portrait' })
  }

  const handleAddToCart = () => {
    const discountedTotal = Math.round(frames.reduce((s, f) => s + getPrice(f, isRefill), 0) * (1 - DISCOUNT))
    trackAddToCart({
      frames: frames.map(f => ({ sizeId: f.size.id, colorId: f.color, price: getPrice(f, isRefill), sizeLabel: f.size.label, colorLabel: COLORS.find(c => c.id === f.color)?.label ?? f.color })),
      totalValue: frames.reduce((s, f) => s + getPrice(f, isRefill), 0),
      discountedValue: discountedTotal,
      promoCode: PROMO_CODE,
    })
    setShowOrderSummary(true)
  }

  const handleConfirmCheckout = () => {
    const saleTotal = frames.reduce((s, f) => s + getPrice(f, isRefill), 0)
    const discountedTotal = Math.round(saleTotal * (1 - DISCOUNT))
    trackInitiateCheckout({
      frames: frames.map(f => ({ sizeId: f.size.id, colorId: f.color, price: getPrice(f, isRefill) })),
      totalValue: saleTotal,
      discountedValue: discountedTotal,
      promoCode: PROMO_CODE,
      numItems: frames.length,
    })
    setShowOrderSummary(false)
    setAdding(true)

    // Build cart URL
    const items = frames.map(f => {
      const vid = getVariantId(f.size, f.color, isRefill)
      return vid ? `${vid}:1` : null
    }).filter(Boolean).join(',')

    let url = items
      ? `${SHOPIFY_STORE}/cart/${items}?discount=${PROMO_CODE}`
      : `${SHOPIFY_STORE}/products/frames`

    // Pass UTM params through
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','ttclid']) {
        const v = sp.get(key)
        if (v) url += `&${key}=${encodeURIComponent(v)}`
      }
    }

    setTimeout(() => {
      setAdded(true)
      setAdding(false)
      window.open(url, '_blank')
      setTimeout(() => setAdded(false), 3000)
    }, 500)
  }

  const hasAnyPhoto = frames.some(f => f.photo)
  const saleTotal = frames.reduce((s, f) => s + getPrice(f, isRefill), 0)
  const discountedTotal = Math.round(saleTotal * (1 - DISCOUNT))
  const fullTotal = frames.reduce((s, f) => s + (f.size.compareAt), 0)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '48px 1fr auto auto 56px',
        height: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        background: '#d8d2cc',
        fontFamily: '"Poppins", sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <a href="https://www.smallwoodhome.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#143639', letterSpacing: '0.08em' }}>SMALLWOODHOME</span>
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {frames.length < 3 && (
            <button
              onClick={addFrame}
              style={{ fontSize: 11, fontWeight: 700, color: '#143639', background: 'none', border: '1px solid #143639', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            >
              + Frame
            </button>
          )}
          <a href="https://www.smallwoodhome.com/cart" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#143639" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#143639' }}>Cart</span>
          </a>
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <div data-canvas-area style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', overflow: 'hidden', gap: 10, minHeight: 0 }}>
        {frames.map(frame => (
          <div
            key={frame.id}
            style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', maxWidth: frames.length === 1 ? '100%' : `${Math.floor(92 / frames.length)}%` }}
            onClick={() => setActiveId(frame.id)}
          >
            <FrameCanvas
              frame={frame}
              isActive={frame.id === activeId}
              onClick={() => setActiveId(frame.id)}
              onPhotoChange={(photo, quality, w, h) => handlePhotoChange(frame.id, photo, quality, w, h)}
              showRefill={isRefill}
              onOrientMismatch={(s) => setOrientMismatch(s)}
              showGalleryRing={frames.length > 1}
            />
            {frames.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeFrame(frame.id) }}
                style={{
                  position: 'absolute', top: -8, right: -8, zIndex: 10,
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#e53e3e', color: 'white', border: 'none',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Price Row ── */}
      <PriceRow frames={frames} isRefill={isRefill} />

      {/* ── Controls ── */}
      <div style={{ background: 'white', borderTop: '1px solid #f0ece4', borderBottom: '1px solid #f0ece4' }}>

        {/* Orientation mismatch warning */}
        {orientMismatch && activeFrame.photo && (
          <div style={{ margin: '0 16px 4px', padding: '8px 10px', background: '#fffbeb', borderRadius: 8, border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ margin: 0, fontSize: 10, color: '#92400e', fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
              🔄 Your photo looks better in {orientMismatch} orientation
            </p>
            <button
              onClick={() => { updateFrame(activeId, { orientation: orientMismatch }); setOrientMismatch(null) }}
              style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Rotate
            </button>
            <button
              onClick={() => setOrientMismatch(null)}
              style={{ background: 'none', border: 'none', color: '#92400e', fontSize: 14, cursor: 'pointer', padding: '0 2px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Photo quality indicator */}
        {activeFrame.photoQuality && activeFrame.photo && (
          <div style={{
            margin: '0 16px 4px', padding: '6px 10px', borderRadius: 8,
            background: activeFrame.photoQuality === 'excellent' ? '#f0faf5' : activeFrame.photoQuality === 'good' ? '#fffbeb' : '#fef2f2',
            border: `1px solid ${activeFrame.photoQuality === 'excellent' ? '#86efac' : activeFrame.photoQuality === 'good' ? '#fcd34d' : '#fca5a5'}`,
          }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, lineHeight: 1.4,
              color: activeFrame.photoQuality === 'excellent' ? '#166534' : activeFrame.photoQuality === 'good' ? '#92400e' : '#991b1b'
            }}>
              {activeFrame.photoQuality === 'excellent' && `✅ Great quality — will print beautifully at ${activeFrame.size.label}`}
              {activeFrame.photoQuality === 'good' && `🟡 Good quality — will print well${activeFrame.photoW ? ` (${activeFrame.photoW}×${activeFrame.photoH}px)` : ''}`}
              {activeFrame.photoQuality === 'low' && `⚠️ Low resolution${activeFrame.photoW ? ` (${activeFrame.photoW}×${activeFrame.photoH}px)` : ''} — may appear blurry at ${activeFrame.size.label}. Use original camera photos for best results.`}
            </p>
          </div>
        )}

        {/* Toolbar — matching dev app: Add, Frame(rotate), Clear, Info */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '6px 16px 2px' }}>
          {[
            {
              label: 'Add',
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect width="18" height="18" fill="#143639" rx="2"/>
                  <path fill="white" d="M8 3h2v12H8z"/>
                  <path fill="white" d="M15 8v2H3V8z"/>
                </svg>
              ),
              action: () => { const f = document.querySelector<HTMLInputElement>('input[type="file"]'); f?.click() }
            },
            {
              label: 'Frame',
              icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fill="#143639" d="M10.99 1.68C13.17 2.71 14.73 4.83 14.97 7.33h1C15.63 3.23 12.2 0 8 0L7.56.02l2.54 2.54.89-.88zM6.82 1.17c-.39-.39-1.03-.39-1.41 0L1.17 5.41c-.39.39-.39 1.03 0 1.41l8.01 8.01c.39.39 1.03.39 1.41 0l4.24-4.24c.39-.39.39-1.03 0-1.41L6.82 1.17zm3.07 12.96L1.87 6.11l4.24-4.24 8.01 8.01-4.23 4.25zM5.01 14.32c-2.18-1.03-3.74-3.15-3.98-5.66h-1C.37 12.77 3.81 16 8 16l.44-.02-2.54-2.54-.89.88z"/>
                </svg>
              ),
              action: rotateFrame
            },
            {
              label: 'Clear',
              icon: (
                <svg width="14" height="17" viewBox="0 0 16 17" fill="#143639">
                  <path d="M12.5 16.91H3.35c-.31 0-.58-.24-.61-.54L1.87 2.9H.6C.26 2.9 0 2.65 0 2.33s.26-.57.6-.57h4.9V1.0C5.5.44 5.98 0 6.55 0h2.75c.58 0 1.05.44 1.05 1v.75h4.9c.33 0 .6.25.6.57s-.26.57-.6.57h-1.28L12.5 16.91zm-8.6-1.14h7.99l.85-12.88H3.06l.85 12.88zm2.78-13.9h2.47V.76H6.69v1.11z"/>
                </svg>
              ),
              action: clearPhoto
            },
            {
              label: 'Info',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#143639" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              ),
              action: () => {}
            },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', minWidth: 40, padding: '2px 0' }}
            >
              <span style={{ height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{btn.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: '#143639' }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Size + Color + Refill toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px 6px', gap: 6, overflowX: 'auto' }}>
          {/* Product type toggle — compact pills */}
          <div style={{ display: 'flex', background: '#f0ece4', borderRadius: 16, padding: 2, gap: 1, flexShrink: 0 }}>
            <button onClick={() => setIsRefill(false)} style={{ padding: '3px 8px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, background: !isRefill ? '#143639' : 'transparent', color: !isRefill ? 'white' : '#888', whiteSpace: 'nowrap' }}>Frame</button>
            <button onClick={() => setIsRefill(true)} style={{ padding: '3px 8px', borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, background: isRefill ? '#143639' : 'transparent', color: isRefill ? 'white' : '#888', whiteSpace: 'nowrap' }}>Refill</button>
          </div>
          {/* Size selector */}
          <SizeSelector selected={activeFrame.size} onSelect={(s) => updateFrame(activeId, { size: s })} />
          {/* Color swatches — all 4 visible, no overflow */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
            {COLORS.map(c => (
              <ColorSwatch key={c.id} color={c} selected={activeFrame.color === c.id} onSelect={() => updateFrame(activeId, { color: c.id })} />
            ))}
          </div>
        </div>
        {/* Refill note — only shown in refill mode, compact */}
        {isRefill && (
          <div style={{ margin: '0 10px 4px', padding: '4px 8px', background: '#f0faf5', borderRadius: 6, border: '1px solid #c6e6d8' }}>
            <p style={{ margin: 0, fontSize: 9, color: '#143639', fontWeight: 600, lineHeight: 1.3 }}>Fits your existing frame · barcode hidden behind face-frame</p>
          </div>
        )}
      </div>

      {/* ── CTA Bar — full width, matches dev app ── */}
      <div style={{ background: '#143639', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10 }}>
        <button
          onClick={hasAnyPhoto ? handleAddToCart : () => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          disabled={adding}
          style={{
            flex: 1, padding: '16px 0',
            background: added ? '#22c55e' : 'white',
            color: '#143639', border: 'none', borderRadius: 8,
            fontSize: 15, fontWeight: 800, cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {adding ? 'Adding…' : added ? '✓ Added!' : hasAnyPhoto ? `Add to Cart — $${discountedTotal}` : 'Upload Photos'}
        </button>
        <button
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '13px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      </div>

      {/* ── Order Summary Sheet ── */}
      {showOrderSummary && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowOrderSummary(false) }}
        >
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, background: '#e5e7eb', borderRadius: 9, margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Order Summary</h2>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 20px' }}>Review before checkout</p>

            {frames.map((f, i) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#faf9f7', borderRadius: 12, border: '1px solid #ede9e3', marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.photo
                    ? <img src={f.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <span style={{ fontSize: 20 }}>🖼️</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Custom Wood Frame</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{f.size.label} · {COLORS.find(c => c.id === f.color)?.label}</div>
                  {!f.photo && <div style={{ fontSize: 10, color: '#e67e22', fontWeight: 600 }}>⚠ No photo uploaded</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#143639' }}>${Math.round(getPrice(f, isRefill) * (1 - DISCOUNT))}</div>
                  <div style={{ fontSize: 10, color: '#aaa', textDecoration: 'line-through' }}>${f.size.compareAt}</div>
                </div>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #f0ece4', paddingTop: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#888' }}>Retail</span>
                <span style={{ fontSize: 13, color: '#aaa', textDecoration: 'line-through' }}>${fullTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#c0392b', fontWeight: 600 }}>35% Off Savings</span>
                <span style={{ fontSize: 13, color: '#c0392b', fontWeight: 700 }}>−${fullTotal - discountedTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #f0ece4' }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>Total Today</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#143639' }}>${discountedTotal}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmCheckout}
              style={{
                width: '100%', padding: 16, marginTop: 16,
                background: '#143639', color: 'white', border: 'none',
                borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer',
              }}
            >
              Confirm & Go to Checkout →
            </button>
            <button
              onClick={() => setShowOrderSummary(false)}
              style={{ width: '100%', marginTop: 10, padding: 8, background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer' }}
            >
              ← Back to customizing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
