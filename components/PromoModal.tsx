'use client'
import { useState } from 'react'

const PROMO_CODES = ['MYWALL35', 'LUCKY35']

export default function PromoModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  // Rotate between active promo codes — both verified 35% off, no expiry
  const [code] = useState(() => PROMO_CODES[Math.floor(Math.random() * PROMO_CODES.length)])

  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-md pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Green header */}
        <div className="bg-[#1B5A4A] rounded-t-2xl px-6 py-5 text-white text-center">
          <div className="text-3xl mb-1">🎉</div>
          <h2 className="text-xl font-black tracking-tight">You Unlocked 35% Off!</h2>
          <p className="text-[#a7d5c6] text-sm mt-1">Auto-applies at checkout on smallwoodhome.com</p>
        </div>

        <div className="px-6 pt-5">
          {/* Code box */}
          <div className="bg-[#f5f0eb] border-2 border-dashed border-[#1B5A4A] rounded-xl p-4 flex items-center justify-between mb-4">
            <span className="text-2xl font-black tracking-widest text-[#1B5A4A]">{code}</span>
            <button
              onClick={handleCopy}
              className="bg-[#1B5A4A] text-white text-sm font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
              style={{ minWidth: 80 }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          {/* Auto-apply notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2.5">
            <span className="text-green-600 text-lg flex-shrink-0">✅</span>
            <p className="text-[12px] text-green-800 font-semibold leading-snug">Discount auto-applied at checkout — no need to enter anything!</p>
          </div>

          {/* Instructions */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-[#1B5A4A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
              <span>Customize your frame below &amp; upload your photo</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-[#1B5A4A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
              <span>Tap &ldquo;Add to Cart&rdquo; — your 35% discount is already applied</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-[#1B5A4A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
              <span>Complete checkout on <strong>smallwoodhome.com</strong> 🎉</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#1B5A4A] text-white font-black py-3.5 rounded-xl text-base tracking-wide"
          >
            Start Designing →
          </button>
        </div>
      </div>
    </div>
  )
}
