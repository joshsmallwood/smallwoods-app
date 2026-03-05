'use client'

import { useState, useRef, useCallback } from 'react'
import InfoModal from './InfoModal'

type FrameColor = 'walnut' | 'oak' | 'black' | 'white'
type FrameSize = '25x17' | '20x16' | '16x12' | '11x8.5'

const FRAME_COLORS: { id: FrameColor; label: string; swatch: string }[] = [
  { id: 'walnut', label: 'Walnut', swatch: '#5a3010' },
  { id: 'oak', label: 'Oak', swatch: '#c8a060' },
  { id: 'black', label: 'Black', swatch: '#1a1a1a' },
  { id: 'white', label: 'White', swatch: '#f0ece4' },
]

const SIZES: FrameSize[] = ['25x17', '20x16', '16x12', '11x8.5']

const FRAME_CLASS: Record<FrameColor, string> = {
  walnut: 'frame-walnut',
  oak: 'frame-oak',
  black: 'frame-black',
  white: 'frame-white',
}

export default function FrameConfigurator() {
  const [frameColor, setFrameColor] = useState<FrameColor>('walnut')
  const [activeSize, setActiveSize] = useState<FrameSize>('25x17')
  const [photo, setPhoto] = useState<string | null>(null)
  const [showFrameBar, setShowFrameBar] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const triggerUpload = () => fileInputRef.current?.click()

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0eb] max-w-md mx-auto md:max-w-2xl">
      {/* Top Banner */}
      <div className="bg-[#1B5A4A] text-white text-center py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
        <span>🐾 Unlock an EXTRA 30% Off! 🐾</span>
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
          <button aria-label="Cart" className="p-1 relative">
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
          className={`relative ${FRAME_CLASS[frameColor]} rounded-sm cursor-pointer`}
          style={{ padding: '24px', width: '100%', maxWidth: '360px' }}
          onClick={!photo ? triggerUpload : undefined}
        >
          {/* Mat */}
          <div className="mat-inner w-full aspect-[17/25] flex items-center justify-center overflow-hidden relative">
            {photo ? (
              <img
                src={photo}
                alt="Uploaded photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400 select-none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span className="text-base font-medium text-gray-500">Add Photo</span>
                <span className="text-xs text-gray-400">Tap to upload your image</span>
              </div>
            )}
          </div>
        </div>

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
          <p className="text-lg font-bold text-[#C0392B] line-through decoration-2">$150</p>
        </div>
        <div className="w-px h-10 bg-gray-200"/>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Sale Price</p>
          <p className="text-2xl font-black text-gray-900">$109</p>
        </div>
        <div className="w-px h-10 bg-gray-200"/>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-0.5">Bundle Price</p>
          <p className="text-2xl font-black text-[#1B5A4A]">$55</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-around py-3 bg-white mx-4 rounded-xl shadow-sm mb-3">
        <ToolbarBtn
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
          label="Add"
          onClick={() => { console.log('Add clicked') }}
        />
        <ToolbarBtn
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="13.5" cy="6.5" r="2.5"/>
              <path d="M21 12v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h8"/>
              <path d="m3 16 5-5 4 4 2-2 4 4"/>
            </svg>
          }
          label="Art"
          onClick={() => { console.log('Art clicked') }}
        />
        <ToolbarBtn
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="18" rx="1"/>
              <rect x="6" y="7" width="12" height="10"/>
            </svg>
          }
          label="Frame"
          onClick={() => setShowFrameBar(v => !v)}
          active={showFrameBar}
        />
        <ToolbarBtn
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          }
          label="Clear"
          onClick={() => setPhoto(null)}
        />
        <ToolbarBtn
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          }
          label="Info"
          onClick={() => setShowInfo(true)}
        />
      </div>

      {/* Frame Selector Bar */}
      {showFrameBar && (
        <div className="bg-white mx-4 rounded-xl shadow-sm mb-3 p-3">
          {/* Top row: Frames pill + size buttons */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button className="bg-[#1B5A4A] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="18,15 12,9 6,15"/>
              </svg>
              Frames
            </button>
            {SIZES.map(size => (
              <button
                key={size}
                onClick={() => setActiveSize(size)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeSize === size
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {/* Color swatches */}
          <div className="flex items-center gap-3">
            {FRAME_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setFrameColor(c.id)}
                title={c.label}
                className="relative flex flex-col items-center gap-1"
              >
                <span
                  className={`w-9 h-9 rounded-full border-2 transition-all block ${
                    frameColor === c.id
                      ? 'border-[#1B5A4A] scale-110 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.swatch }}
                />
                <span className="text-[10px] text-gray-500 font-medium">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload CTA */}
      <div className="px-4 pb-6">
        <button
          onClick={triggerUpload}
          className="w-full bg-[#1B5A4A] hover:bg-[#154739] text-white font-bold text-base py-4 rounded-xl transition-colors shadow-md active:scale-[0.98]"
        >
          Upload Photos
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}

function ToolbarBtn({
  icon, label, onClick, active,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
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
