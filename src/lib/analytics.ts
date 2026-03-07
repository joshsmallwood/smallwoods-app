export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  // Meta Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', eventName, data)
  }
  // GA4
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, data)
  }
  // TikTok
  if ((window as any).ttq) {
    (window as any).ttq.track(eventName, data)
  }
}
