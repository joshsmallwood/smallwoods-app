import { NextResponse } from 'next/server'

const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const DB_CREDS = Buffer.from('neondb_owner:npg_50fAjkvCiztp').toString('base64')
const NEON_CONN = 'postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb'

const NAMES = [
  'Sarah','Ashley','Emily','Jessica','Megan','Lauren','Rachel','Amanda',
  'Jennifer','Brittany','Melissa','Stephanie','Kayla','Taylor','Morgan',
  'Amber','Heather','Samantha','Courtney','Chelsea','Lindsey','Kaitlyn',
  'Danielle','Nicole','Hannah','Madison','Kimberly','Tiffany','Alexis',
]

const PROVINCE_ABBR: Record<string,string> = {
  Alabama:'AL',Alaska:'AK',Arizona:'AZ',Arkansas:'AR',California:'CA',
  Colorado:'CO',Connecticut:'CT',Delaware:'DE',Florida:'FL',Georgia:'GA',
  Hawaii:'HI',Idaho:'ID',Illinois:'IL',Indiana:'IN',Iowa:'IA',
  Kansas:'KS',Kentucky:'KY',Louisiana:'LA',Maine:'ME',Maryland:'MD',
  Massachusetts:'MA',Michigan:'MI',Minnesota:'MN',Mississippi:'MS',
  Missouri:'MO',Montana:'MT',Nebraska:'NE',Nevada:'NV','New Hampshire':'NH',
  'New Jersey':'NJ','New Mexico':'NM','New York':'NY','North Carolina':'NC',
  'North Dakota':'ND',Ohio:'OH',Oklahoma:'OK',Oregon:'OR',Pennsylvania:'PA',
  'Rhode Island':'RI','South Carolina':'SC','South Dakota':'SD',Tennessee:'TN',
  Texas:'TX',Utah:'UT',Vermont:'VT',Virginia:'VA',Washington:'WA',
  'West Virginia':'WV',Wisconsin:'WI',Wyoming:'WY',
}

function parseSize(variant: string): string | null {
  const m = variant.match(/(\d+)["\u201c\u201d]?\s*x\s*(\d+)/i)
  return m ? `${m[1]}\u00d7${m[2]}` : null
}

function parseColor(variant: string): string | null {
  const parts = variant.split('/')
  if (parts.length >= 2) {
    const c = parts[1].trim()
    if (['Black','White','Oak','Walnut','Stained'].includes(c)) {
      return c === 'Stained' ? 'Walnut' : c
    }
  }
  return null
}

let cache: { buyers: unknown[]; ts: number } | null = null
const CACHE_TTL = 15 * 60 * 1000

export async function GET() {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json({ buyers: cache.buyers, cached: true, source: 'neon' })
    }

    const res = await fetch(NEON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${DB_CREDS}`,
        'Neon-Connection-String': NEON_CONN,
      },
      body: JSON.stringify({
        query: `SELECT DISTINCT ON (o.shipping_address_city, o.shipping_address_province)
          o.shipping_address_city AS city,
          o.shipping_address_province AS state,
          li.elem->>'variant_title' AS variant
        FROM shopify_orders o,
          LATERAL jsonb_array_elements(o.line_items) AS li(elem)
        WHERE o.created_at >= NOW() - INTERVAL '7 days'
          AND o.shipping_address_city IS NOT NULL
          AND o.shipping_address_province IS NOT NULL
          AND o.shipping_address_country = 'United States'
          AND li.elem->>'variant_title' ~ '\\d+.*x.*\\d+'
        ORDER BY o.shipping_address_city, o.shipping_address_province, o.created_at DESC
        LIMIT 30`,
        params: [],
      }),
    })

    if (!res.ok) throw new Error(`DB error: ${res.status}`)
    const data = await res.json()
    const rows: Array<{ city: string; state: string; variant: string }> = data.rows ?? []

    if (rows.length < 5) {
      return NextResponse.json({ buyers: [], cached: false, source: 'fallback' })
    }

    let nameIdx = 0
    const buyers = rows
      .map((r) => {
        const size = parseSize(r.variant)
        const color = parseColor(r.variant)
        if (!size || !color) return null
        const stateAbbr = PROVINCE_ABBR[r.state] ?? r.state
        const name = NAMES[nameIdx % NAMES.length]
        nameIdx++
        return { name, location: `${r.city}, ${stateAbbr}`, size, color }
      })
      .filter(Boolean)
      .slice(0, 20)

    cache = { buyers, ts: Date.now() }
    return NextResponse.json({ buyers, cached: false, source: 'neon' })
  } catch (e) {
    return NextResponse.json({ buyers: [], error: String(e), source: 'error' }, { status: 500 })
  }
}
