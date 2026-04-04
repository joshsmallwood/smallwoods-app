'use client'
import { useState, useRef } from 'react'

const SIZES = [
  { id: '13x13', label: '13×13"', price: 55, compareAt: 109, popular: true },
  { id: '25x17', label: '25×17"', price: 65, compareAt: 129 },
  { id: '25x25', label: '25×25"', price: 75, compareAt: 149 },
  { id: '44x22', label: '44×22"', price: 109, compareAt: 219 }
]

const COLORS = [
  { id: 'stained', label: 'Stained', hex: '#6b4d30' },
  { id: 'black', label: 'Black', hex: '#1c1c1c' },
  { id: 'white', label: 'White', hex: '#f0ece4' },
  { id: 'grey', label: 'Weathered', hex: '#9ca3af' }
]

export default function StudioBuilder() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [size, setSize] = useState(SIZES[1])
  const [color, setColor] = useState(COLORS[0])
  const [activeTab, setActiveTab] = useState<'upload' | 'frame' | 'size'>('upload')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]))
      setActiveTab('frame')
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] max-w-[480px] mx-auto bg-[#F7F5F0] font-sans relative overflow-hidden">
      
      {/* HEADER */}
      <header className="flex justify-between items-center p-4 bg-white border-b border-[#e5dfd5] z-10 shadow-sm">
        <div className="text-[14px] font-black tracking-widest text-[#143639]">SMALLWOODS</div>
        <div className="flex gap-3 items-center">
          <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider">Studio</div>
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#143639" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </header>

      {/* CANVAS / EMPTY STATE */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {!photo ? (
          <div 
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center w-full max-w-[340px] aspect-[4/5] border-2 border-dashed border-[#143639]/30 rounded-[32px] bg-white cursor-pointer hover:scale-[1.02] transition-transform shadow-[0_20px_40px_rgba(20,54,57,0.06)]"
          >
            <div className="w-20 h-20 bg-[#143639] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#143639]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h2 className="text-2xl font-black text-[#143639] mb-2 tracking-tight">Upload Photo</h2>
            <p className="text-[15px] text-[#666] text-center px-8 font-medium leading-relaxed">Choose a high-res photo from your device to begin.</p>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full h-full p-4">
            {/* The Frame Visualization */}
            <div 
              style={{ borderColor: color.hex }}
              className="relative bg-white shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex items-center justify-center overflow-hidden"
            >
              <div style={{ borderWidth: '14px', borderStyle: 'solid', borderColor: color.hex, width: '100%', height: '100%', position: 'absolute', zIndex: 10, pointerEvents: 'none', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }} />
              <img src={photo} alt="Your custom print" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </main>

      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />

      {/* CONTROLS & CART FOOTER */}
      <div className="bg-white rounded-t-[24px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-[#e5dfd5] flex flex-col z-20">
        
        {/* TABS */}
        <div className="flex px-4 pt-6 pb-2 gap-2">
          {['upload', 'size', 'frame'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-2 rounded-xl text-[13px] font-bold capitalize tracking-wide transition-all ${activeTab === tab ? 'bg-[#143639] text-white shadow-md' : 'bg-[#f5f0e8] text-[#143639]/70 hover:bg-[#eae4db]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB PANELS */}
        <div className="px-6 py-4 min-h-[100px]">
          {activeTab === 'upload' && (
             <button onClick={() => fileRef.current?.click()} className="w-full py-4 border-2 border-[#143639] text-[#143639] font-bold rounded-xl flex items-center justify-center gap-2">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
               {photo ? 'Replace Photo' : 'Select Photo'}
             </button>
          )}

          {activeTab === 'size' && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {SIZES.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSize(s)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 min-w-[90px] snap-center transition-all ${size.id === s.id ? 'border-[#143639] bg-[#143639]/5' : 'border-[#e5dfd5] bg-white'}`}
                >
                  <span className="font-black text-[#143639] text-lg">{s.label}</span>
                  {s.popular && <span className="text-[9px] font-bold uppercase tracking-wider text-[#e67e22] mt-1">Popular</span>}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'frame' && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {COLORS.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setColor(c)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 min-w-[90px] snap-center transition-all ${color.id === c.id ? 'border-[#143639] bg-[#143639]/5' : 'border-[#e5dfd5] bg-white'}`}
                >
                  <div className="w-10 h-10 rounded-full mb-2 border border-black/10" style={{ backgroundColor: c.hex }} />
                  <span className="font-bold text-[#143639] text-[12px]">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ADD TO CART */}
        <div className="px-6 pb-8 pt-4 border-t border-[#f0ece4]">
          <div className="flex justify-between items-baseline mb-4 px-2">
            <span className="text-[14px] font-bold text-[#888]">Total (Save {Math.round((1 - (size.price / size.compareAt)) * 100)}%)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] text-[#aaa] line-through">${size.compareAt}</span>
              <span className="text-[28px] font-black text-[#143639]">${size.price}</span>
            </div>
          </div>
          <button 
            disabled={!photo}
            className={`w-full py-4 rounded-2xl text-[18px] font-black tracking-wide transition-all shadow-xl ${photo ? 'bg-[#143639] text-white shadow-[#143639]/20 hover:scale-[1.01]' : 'bg-[#e5dfd5] text-[#888] shadow-none'}`}
          >
            {photo ? `Add to Cart — $${size.price}` : 'Upload Photo to Continue'}
          </button>
        </div>

      </div>
    </div>
  )
}
