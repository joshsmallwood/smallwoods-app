'use client'

export default function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">Product Info</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-[#1B5A4A] text-lg">🖼️</span>
            <div>
              <p className="font-semibold text-gray-800">Custom Wood Framed Sign</p>
              <p>Handcrafted in the USA with solid wood frames and archival-quality printing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#1B5A4A] text-lg">📦</span>
            <div>
              <p className="font-semibold text-gray-800">Ships in 1-3 Business Days</p>
              <p>Each piece is made to order and ships directly to your door.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#1B5A4A] text-lg">✨</span>
            <div>
              <p className="font-semibold text-gray-800">Premium Materials</p>
              <p>Solid hardwood frames, acid-free mat board, and UV-resistant prints that last generations.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[#1B5A4A] text-lg">💚</span>
            <div>
              <p className="font-semibold text-gray-800">Satisfaction Guaranteed</p>
              <p>If you&apos;re not 100% happy, we&apos;ll make it right.</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#1B5A4A] text-white font-bold py-3 rounded-xl"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
