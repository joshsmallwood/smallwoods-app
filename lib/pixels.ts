/* eslint-disable */
/**
 * pixels.ts — Smallwoods Event Tracking Layer
 *
 * Fires Meta Pixel, GA4, and TikTok Pixel events at every meaningful
 * interaction in the frame builder. All events are non-blocking and
 * fail silently — never break the UI.
 *
 * Meta Pixel IDs:
 *   1660571784197503 (primary)
 *   336179884248606  (secondary)
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void
      identify: (params: Record<string, unknown>) => void
      push?: (...args: unknown[]) => void
    }
    TiktokAnalyticsObject?: string
    _swPixelInitialized?: boolean
  }
}

export function initPixels() {
  if (typeof window === 'undefined') return
  if (window._swPixelInitialized) return
  window._swPixelInitialized = true
  injectMetaPixel('1660571784197503')
  injectMetaPixel('336179884248606')
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
  if (ga4Id) injectGA4(ga4Id)
  const ttId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  if (ttId) injectTikTok(ttId)
}

function injectMetaPixel(pixelId: string) {
  try {
    if (!window.fbq) {
      const n: any = function (...args: unknown[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args)
      }
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []
      window.fbq = n
      window._fbq = n
      const s = document.createElement('script')
      s.async = true
      s.src = 'https://connect.facebook.net/en_US/fbevents.js'
      const x = document.getElementsByTagName('script')[0]
      x.parentNode?.insertBefore(s, x)
    }
    window.fbq?.('init', pixelId)
    window.fbq?.('track', 'PageView')
  } catch (e) {
    console.warn('[pixels] Meta init failed', e)
  }
}

function injectGA4(measurementId: string) {
  try {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function (...args: unknown[]) { window.dataLayer!.push(args) }
    window.gtag('js', new Date())
    window.gtag('config', measurementId, { send_page_view: true })
  } catch (e) { console.warn('[pixels] GA4 init failed', e) }
}

function injectTikTok(pixelId: string) {
  try {
    if (!window.ttq) {
      window.TiktokAnalyticsObject = 'ttq'
      const ttq: any = (window as any).ttq = []
      const methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie']
      methods.forEach((m: string) => { ttq[m] = (...args: unknown[]) => ttq.push([m, ...args]) })
      const s = document.createElement('script')
      s.async = true
      s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${pixelId}&lib=ttq`
      document.head.appendChild(s)
    }
    window.ttq?.track('page_view')
  } catch (e) { console.warn('[pixels] TikTok init failed', e) }
}

function fbq(event: string, params?: Record<string, unknown>) {
  try { window.fbq?.('track', event, params) } catch {}
}
function gtag(event: string, params?: Record<string, unknown>) {
  try { window.gtag?.('event', event, params) } catch {}
}
function ttq(event: string, params?: Record<string, unknown>) {
  try { window.ttq?.track(event, params) } catch {}
}

export function trackViewContent(params: { sizeId: string; colorId: string; price: number }) {
  fbq('ViewContent', { content_name: 'Custom Wood Framed Sign', content_ids: [`cwfs-${params.sizeId}-${params.colorId}`], content_type: 'product', value: params.price, currency: 'USD' })
  gtag('view_item', { currency: 'USD', value: params.price, items: [{ item_id: `cwfs-${params.sizeId}-${params.colorId}`, item_name: 'Custom Wood Framed Sign', price: params.price, quantity: 1 }] })
  ttq('ViewContent', { content_id: `cwfs-${params.sizeId}-${params.colorId}`, value: params.price, currency: 'USD' })
}

export function trackSizeSelected(params: { sizeId: string; sizeLabel: string; price: number }) {
  gtag('select_item', { items: [{ item_id: `cwfs-${params.sizeId}`, item_variant: params.sizeId, price: params.price }] })
  fbq('CustomizeProduct', { customization_type: 'size', customization_value: params.sizeLabel, value: params.price, currency: 'USD' })
}

export function trackColorSelected(params: { colorId: string; colorLabel: string; sizeId: string; price: number }) {
  gtag('select_item', { items: [{ item_id: `cwfs-${params.sizeId}-${params.colorId}`, item_variant: `${params.sizeId}/${params.colorId}`, price: params.price }] })
  fbq('CustomizeProduct', { customization_type: 'color', customization_value: params.colorLabel, value: params.price, currency: 'USD' })
}

export function trackPhotoUploaded(params: { sizeId: string; colorId: string; price: number; quality: 'excellent' | 'good' | 'low'; frameCount: number }) {
  const value = params.price * params.frameCount
  fbq('CustomizeProduct', { content_name: 'Custom Wood Framed Sign', content_ids: [`cwfs-${params.sizeId}-${params.colorId}`], customization_type: 'photo_upload', photo_quality: params.quality, frame_count: params.frameCount, value, currency: 'USD' })
  gtag('photo_uploaded', { size_id: params.sizeId, color_id: params.colorId, photo_quality: params.quality, frame_count: params.frameCount, value, currency: 'USD' })
  ttq('AddToWishlist', { content_id: `cwfs-${params.sizeId}-${params.colorId}`, value, currency: 'USD' })
}

export function trackAddToCart(params: { frames: Array<{ sizeId: string; colorId: string; price: number; sizeLabel: string; colorLabel: string }>; totalValue: number; discountedValue: number; promoCode: string }) {
  fbq('AddToCart', { content_ids: params.frames.map(f => `cwfs-${f.sizeId}-${f.colorId}`), content_type: 'product', num_items: params.frames.length, value: params.discountedValue, currency: 'USD' })
  gtag('add_to_cart', { currency: 'USD', value: params.discountedValue, coupon: params.promoCode, items: params.frames.map(f => ({ item_id: `cwfs-${f.sizeId}-${f.colorId}`, price: f.price, quantity: 1 })) })
  ttq('AddToCart', { content_id: params.frames[0] ? `cwfs-${params.frames[0].sizeId}-${params.frames[0].colorId}` : 'cwfs', quantity: params.frames.length, value: params.discountedValue, currency: 'USD' })
}

export function trackInitiateCheckout(params: { frames: Array<{ sizeId: string; colorId: string; price: number }>; totalValue: number; discountedValue: number; promoCode: string; numItems: number }) {
  fbq('InitiateCheckout', { content_ids: params.frames.map(f => `cwfs-${f.sizeId}-${f.colorId}`), content_type: 'product', num_items: params.numItems, value: params.discountedValue, currency: 'USD' })
  gtag('begin_checkout', { currency: 'USD', value: params.discountedValue, coupon: params.promoCode, items: params.frames.map(f => ({ item_id: `cwfs-${f.sizeId}-${f.colorId}`, price: f.price, quantity: 1 })) })
  ttq('InitiateCheckout', { value: params.discountedValue, currency: 'USD', quantity: params.numItems })
}

export function trackGalleryWallAdded(params: { frameCount: number; totalValue: number }) {
  gtag('gallery_wall_add', { frame_count: params.frameCount, value: params.totalValue, currency: 'USD' })
  fbq('CustomizeProduct', { customization_type: 'gallery_wall', frame_count: params.frameCount, value: params.totalValue, currency: 'USD' })
}

export function trackEmailCaptured(params: { email: string; source: 'pre_upload' | 'post_upload' | 'abandon_intent'; cartValue?: number }) {
  fbq('Lead', { content_name: 'Email Capture', content_category: params.source, value: params.cartValue ?? 0, currency: 'USD' })
  gtag('generate_lead', { currency: 'USD', value: params.cartValue ?? 0, source: params.source })
  ttq('CompleteRegistration', { value: params.cartValue ?? 0, currency: 'USD' })
}

export function trackSizeQuizStarted() { gtag('size_quiz_start', {}) }

export function trackSizeQuizCompleted(params: { recommendedSize: string; accepted: boolean }) {
  gtag('size_quiz_complete', { recommended_size: params.recommendedSize, accepted: params.accepted })
}
