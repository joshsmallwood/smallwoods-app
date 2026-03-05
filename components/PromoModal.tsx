'use client'
import { useState } from 'react'

export default function PromoModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const code = 'MYWALL35'

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
          <p className="text-[#a7d5c6] text-sm mt-1">Apply at checkout on smallwoodhome.com</p>
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

          {/* Instructions */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-[#1B5A4A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
              <span>Finish customizing your design below</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-[#1B5A4A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
              <span>Visit <strong>smallwoodhome.com</strong> to place your order</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-[#1B5A4A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
              <span>Enter <strong>{code}</strong> at checkout for 35% off</span>
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
