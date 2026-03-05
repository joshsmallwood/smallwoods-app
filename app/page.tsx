import FrameConfigurator from '@/components/FrameConfigurator'

// FAQ structured data for Google rich results (FAQ snippet in search)
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long until my custom wood frame arrives?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most orders are produced in 1–2 business days, then shipped via UPS. Standard shipping takes 2–5 business days. Order before 3 PM CT and production starts same day.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I upload my photo for a custom wood frame?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tap "Upload Your Photo to Continue" and select any photo from your device. JPG, PNG, and HEIC files are all supported. We recommend at least 1MB for best print quality.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the frame include hanging hardware?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Every frame ships with a sawtooth hanger pre-attached to the back. All you need is a nail and a level. Hanging typically takes under 2 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the return policy for custom wood frames?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Because every frame is custom-made just for you, we don\'t accept returns. However, if your print arrives damaged or doesn\'t look right, we\'ll reprint it for free — no questions asked. 100% satisfaction guaranteed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I include a gift message with my order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Check the "This is a gift" box and type your personal message. It\'ll be printed on a card and included inside the box at no extra cost.',
      },
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FrameConfigurator />
    </>
  )
}
