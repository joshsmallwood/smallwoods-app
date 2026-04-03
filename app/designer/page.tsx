import FrameDesigner from '@/components/FrameDesigner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Custom Wood Frame Designer | Smallwoods',
  description: 'Design your custom wood framed sign. Upload your photo, choose size and frame color.',
}

export default function DesignerPage() {
  return <FrameDesigner />
}
