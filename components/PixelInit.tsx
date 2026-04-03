'use client'

import { useEffect } from 'react'
import { initPixels } from '@/lib/pixels'

/**
 * PixelInit — drops into layout, initializes all tracking pixels on mount.
 * Client component, renders nothing visible.
 */
export default function PixelInit() {
  useEffect(() => {
    initPixels()
  }, [])
  return null
}
