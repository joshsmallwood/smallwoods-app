'use client'

import { useEffect } from 'react'

interface CartItem {
  variantId: string
  size: string
  color: string
  price: number
  discountedPrice: number
  compareAt: number
  quantity: number
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  promoCode: string
  giftMessage?: string
  onAddAnother?: (sizeId?: string) => void
}

const UPSELL_SIZES = [
  { label: '8×10', id: '8x10', price: 69, discounted: 45 },
  { label: '13×13', id: '13x13', price: 79, discounted: 51 },
  { label: '12×16', id: '12x16', price: 89, discounted: 58 },
]

export default function CartDrawer({ isOpen, onClose, items, promoCode, giftMessage, onAddAnother }: CartDrawerProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const totalDiscounted = items.reduce((s, i) => s + i.discountedPrice * i.quantity, 0)
  const totalCompareAt = items.reduce((s, i) => s + i.compareAt * i.quantity, 0)
  const savings = totalCompareAt - totalDiscounted

  const handleCheckout = () => {
    const cartParts = items.map(i => `${i.variantId}:${i.quantity}`).join(',')
    let url = `https://smallwoodhome.com/cart/${cartParts}?discount=${promoCode}`
    if (giftMessage && giftMessage.trim()) {
      url += `&note=${encodeURIComponent(`🎁 Gift message: ${giftMessage.trim()}`)}`
    }
    // Pass UTM params through
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search)
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ttclid']
      for (const key of utmKeys) {
        const val = sp.get(key)
        if (val) url += `&${key}=${encodeURIComponent(val)}`
      }
    }
    window.location.href = url
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(0,0,0,0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 10001,
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>🛒 Your Cart</h2>
            <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6', border: 'none', fontSize: 18, color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>

        {/* Savings banner */}
        {savings > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #1B5A4A, #2d7a65)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>You&apos;re saving ${savings}!</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>35% off applied automatically</div>
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🖼️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Custom Wood Framed Sign</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{item.size} · {item.color}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1B5A4A' }}>${item.discountedPrice}</div>
                <div style={{ fontSize: 10, color: '#aaa', textDecoration: 'line-through' }}>${item.compareAt}</div>
              </div>
            </div>
          ))}

          {/* Upsell */}
          <div style={{ marginTop: 20, padding: '16px', borderRadius: 12, background: '#fffbeb', border: '2px dashed #F5C842' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1B5A4A', marginBottom: 4 }}>🖼️ Add another frame for 35% off</div>
            <div style={{ fontSize: 11, color: '#78716c', marginBottom: 12 }}>Build a gallery wall — same discount applies!</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {UPSELL_SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { if (onAddAnother) onAddAnother(s.id); else onClose(); }}
                  style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'white', border: '1px solid #e5e0d8', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1B5A4A'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(27,90,74,0.15)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e0d8'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                  aria-label={`Add ${s.label} frame for $${s.discounted}`}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{s.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#1B5A4A' }}>${s.discounted}</div>
                  <div style={{ fontSize: 9, color: '#aaa', textDecoration: 'line-through' }}>${s.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #eee', padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
            {['🔒 Secure', '🚚 Free Shipping', '💯 Free Reprints'].map(t => (
              <span key={t} style={{ fontSize: 10, color: '#666', fontWeight: 600 }}>{t}</span>
            ))}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>Total</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#1B5A4A' }}>${totalDiscounted}</span>
              <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through', marginLeft: 8 }}>${totalCompareAt}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #1B5A4A 0%, #2d7a65 100%)',
              color: 'white',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(27,90,74,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            🛒 Continue to Checkout
          </button>
        </div>
      </div>
    </>
  )
}
