import StudioBuilder from '@/components/StudioBuilder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Studio | Custom Wall Art | Smallwoods',
  description: 'Design premium custom wood framed signs in our new Studio.',
}

export default function StudioPage() {
  return <StudioBuilder />
}
