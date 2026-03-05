import FrameConfigurator from '@/components/FrameConfigurator'

// Product structured data for Google Shopping / rich product results
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Custom Wood Framed Sign',
  description: 'Personalized custom wood framed sign with your photo. Handcrafted in the USA. Choose from 9 sizes and 5 frame colors. Ships in 1–3 days.',
  brand: { '@type': 'Brand', name: 'Smallwoods' },
  url: 'https://app.smallwoods.io',
  image: 'https://cdn.shopify.com/s/files/1/1091/1314/files/HERO_PRoduct_WEB_1125__0005_Frames-min.jpg?v=1764101397',
  sku: 'CWFS-CUSTOM',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '52',
    highPrice: '249',
    priceCurrency: 'USD',
    offerCount: '9',
    offers: [
      { '@type': 'Offer', name: '8×10 Custom Frame', price: '52', priceCurrency: 'USD', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' }, deliveryTime: { '@type': 'ShippingDeliveryTime', businessDays: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '00:00', closes: '23:59' }, handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' }, transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' } } } },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.74',
    reviewCount: '6494',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'J.M.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Love all three of my prints. By far the best company to order prints/frames from. Shipping is phenomenal.',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Rene K.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Our family\'s photo looks beautiful! Service was prompt. I highly recommend! Quality is top notch.',
    },
  ],
}

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

// BreadcrumbList schema — helps Google show breadcrumb rich results
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Smallwoods Home',
      item: 'https://www.smallwoodhome.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Custom Wood Frames',
      item: 'https://www.smallwoodhome.com/collections/all',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Design Your Custom Frame',
      item: 'https://app.smallwoods.io',
    },
  ],
}

// WebSite schema — enables Google Sitelinks Searchbox potential
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Smallwoods',
  url: 'https://app.smallwoods.io',
  description: 'Design custom wood framed signs with your photos. Handcrafted in the USA.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.smallwoodhome.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

// Organization schema — enables Google Knowledge Panel with logo + social links
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Smallwoods',
  url: 'https://www.smallwoodhome.com',
  logo: 'https://cdn.shopify.com/s/files/1/1091/1314/files/smallwoods-logo.png',
  description: 'Custom wood framed signs and wall art. Handcrafted in the USA with real wood. 3M+ happy families.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'US',
    addressRegion: 'TX',
  },
  sameAs: [
    'https://www.facebook.com/SmallwoodsHome',
    'https://www.instagram.com/smallwoodshome',
    'https://www.tiktok.com/@smallwoodshome',
    'https://www.pinterest.com/smallwoodshome',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: 'https://www.smallwoodhome.com/pages/contact',
    availableLanguage: 'English',
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <FrameConfigurator />
    </>
  )
}
