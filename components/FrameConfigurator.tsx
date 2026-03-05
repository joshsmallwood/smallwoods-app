'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import InfoModal from './InfoModal'

type FrameColor = 'walnut' | 'oak' | 'black' | 'white'

const FRAME_COLORS: { id: FrameColor; label: string; swatch: string }[] = [
  { id: 'walnut', label: 'Walnut', swatch: '#5a3010' },
  { id: 'oak',    label: 'Oak',    swatch: '#c8a060' },
  { id: 'black',  label: 'Black',  swatch: '#1a1a1a' },
  { id: 'white',  label: 'White',  swatch: '#f0ece4' },
]

interface SizeOption {
  id: string
  label: string
  width: number   // inches
  height: number  // inches
  price: number
  displayW: string
  displayH: string
}

const SIZES: SizeOption[] = [
  { id: '5x7',   label: '5×7',   width: 5,  height: 7,  price: 49,  displayW: '5',  displayH: '7'  },
  { id: '8x10',  label: '8×10',  width: 8,  height: 10, price: 69,  displayW: '8',  displayH: '10' },
  { id: '11x14', label: '11×14', width: 11, height: 14, price: 89,  displayW: '11', displayH: '14' },
  { id: '16x20', label: '16×20', width: 16, height: 20, price: 109, displayW: '16', displayH: '20' },
  { id: '25x17', label: '25×17', width: 25, height: 17, price: 109, displayW: '25', displayH: '17' },
  { id: '20x24', label: '20×24', width: 20, height: 24, price: 129, displayW: '20', displayH: '24' },
  { id: '24x30', label: '24×30', width: 24, height: 30, price: 149, displayW: '24', displayH: '30' },
  { id: '30x40', label: '30×40', width: 30, height: 40, price: 189, displayW: '30', displayH: '40' },
]

const BUNDLE_DISCOUNT = 0.20

export default function FrameConfigurator() {
  const [frameColor, setFrameColor] = useState<FrameColor>('walnut')
  const [activeSize, setActiveSize] = useState<SizeOption>(SIZES[3]) // 16x20 default
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoExiting, setPhotoExiting] = useState(false)
  const [showFrameBar, setShowFrameBar] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [loading, setLoading] = useState(false)
  // Pan/zoom state
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [cropMode, setCropMode] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const salePrice = activeSize.price
  const fullPrice = Math.round(salePrice * 1.375) // ~37.5% markup for "full price"
  const bundlePrice = Math.round(salePrice * (1 - BUNDLE_DISCOUNT))

  // Aspect ratio for the mat
  const aspectW = activeSize.width
  const aspectH = activeSize.height

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setTimeout(() => {
        setZoom(1)
        setOffset({ x: 0, y: 0 })
        setCropMode(false)
        setPhoto(ev.target?.result as string)
        setLoading(false)
      }, 400)
    }
    reader.readAsDataURL(file)
  }, [])

  const triggerUpload = () => fileInputRef.current?.click()

  const clearPhoto = () => {
    setPhotoExiting(true)
    setTimeout(() => {
      setPhoto(null)
      setPhotoExiting(false)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setCropMode(false)
    }, 260)
  }

  // Drag to pan
  const onMouseDown = (e: React.MouseEvent) => {
    if (!cropMode || !photo) return
    setDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
  }
  const onMouseUp = () => { setDragging(false); dragStart.current = null }

  // Touch drag
  const touchStart = useRef<{ tx: number; ty: number; ox: number; oy: number } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    if (!cropMode || !photo) return
    const t = e.touches[0]
    touchStart.current = { tx: t.clientX, ty: t.clientY, ox: offset.x, oy: offset.y }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const t = e.touches[0]
    setOffset({
      x: touchStart.current.ox + (t.clientX - touchStart.current.tx),
      y: touchStart.current.oy + (t.clientY - touchStart.current.ty),
    })
  }

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
        <div className="flex flex-col items-center">
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

      {/* Frame Preview */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <div
          className={`frame-wrap frame-${frameColor}`}
          style={{ padding: '22px', width: '100%', maxWidth: '340px' }}
        >
          {/* Mat */}
          <div
            className="mat-inner overflow-hidden relative"
            style={{
              aspectRatio: `${aspectW} / ${aspectH}`,
              cursor: cropMode ? 'grab' : (photo ? 'default' : 'pointer'),
            }}
            onClick={!photo && !loading ? triggerUpload : undefined}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { touchStart.current = null }}
          >
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50">
                <div className="w-10 h-10 border-3 border-[#1B5A4A] border-t-transparent rounded-full animate-spin" style={{ borderWidth: '3px' }}/>
                <span className="text-sm text-gray-500 font-medium">Processing photo…</span>
              </div>
            ) : photo ? (
              <img
                src={photo}
                alt="Uploaded photo"
                className={`absolute inset-0 w-full h-full object-cover select-none ${photoExiting ? 'photo-exit' : 'photo-enter'}`}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  userSelect: 'none',
                  pointerEvents: cropMode ? 'none' : 'auto',
                }}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 select-none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span className="text-base font-medium text-gray-500">Add Photo</span>
                <span className="text-xs text-gray-400">Tap to upload your image</span>
              </div>
            )}

            {/* Crop mode overlay */}
            {cropMode && photo && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-sm"/>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                  Drag to reposition
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zoom controls when photo loaded */}
        {photo && !loading && (
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => setCropMode(v => !v)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors border ${
                cropMode
                  ? 'bg-[#1B5A4A] text-white border-[#1B5A4A]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              ✂️ Crop Mode
            </button>
            {cropMode && (
              <>
                <button
                  onClick={() => setZoom(z => Math.min(z + 0.15, 3))}
                  className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-700 font-bold text-lg flex items-center justify-center hover:bg-gray-50"
                >+</button>
                <button
                  onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))}
                  className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-700 font-bold text-lg flex items-center justify-center hover:bg-gray-50"
                >−</button>
                <button
                  onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
                >Reset</button>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Pricing Row */}
      <div className="flex items-center justify-center gap-6 py-3 bg-white mx-4 rounded-xl shadow-sm mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Full Price</p>
          <p className="text-lg font-bold text-[#C0392B] line-through decoration-2">${fullPrice}</p>
        </div>
        <div className="w-px h-10 bg-gray-200"/>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Sale Price</p>
          <p className="text-2xl font-black text-gray-900">${salePrice}</p>
        </div>
        <div className="w-px h-10 bg-gray-200"/>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Bundle Price</p>
          <p className="text-2xl font-black text-[#1B5A4A]">${bundlePrice}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-around py-3 bg-white mx-4 rounded-xl shadow-sm mb-3">
        <ToolbarBtn
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
          label="Add"
          onClick={() => {}}
        />
        <ToolbarBtn
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="2.5"/><path d="M21 12v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h8"/><path d="m3 16 5-5 4 4 2-2 4 4"/></svg>}
          label="Art"
          onClick={triggerUpload}
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
          onClick={clearPhoto}
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
          {/* Size picker */}
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Size (inches)</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => setActiveSize(size)}
                  className={`size-btn ${activeSize.id === size.id ? 'active' : ''}`}
                >
                  <span className="size-label">{size.label}</span>
                  <span className={`size-inches ${activeSize.id === size.id ? 'text-white/80' : 'text-gray-400'}`}>
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
                  onClick={() => setFrameColor(c.id)}
                  title={c.label}
                  className="relative flex flex-col items-center gap-1"
                >
                  <span
                    className={`w-10 h-10 rounded-full border-[3px] transition-all block shadow-sm ${
                      frameColor === c.id
                        ? 'border-[#1B5A4A] scale-110 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: c.swatch }}
                  />
                  <span className={`text-[10px] font-semibold ${frameColor === c.id ? 'text-[#1B5A4A]' : 'text-gray-500'}`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload CTA */}
      <div className="px-4 pb-6">
        <button
          onClick={triggerUpload}
          className="w-full bg-[#1B5A4A] hover:bg-[#154739] text-white font-bold text-base py-4 rounded-xl transition-colors shadow-md active:scale-[0.98]"
        >
          {photo ? 'Change Photo' : 'Upload Photos'}
        </button>
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
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
