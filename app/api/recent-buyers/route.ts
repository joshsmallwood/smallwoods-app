import { NextResponse } from 'next/server'

const NEON_URL = 'https://ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/sql'
const NEON_CONN = 'postgresql://neondb_owner:npg_50fAjkvCiztp@ep-divine-bird-ai2sr3dd-pooler.c-4.us-east-1.aws.neon.tech/neondb'

const NAMES = [
  'Sarah','Ashley','Emily','Jessica','Megan','Lauren','Rachel','Amanda',
  'Jennifer','Brittany','Melissa','Stephanie','Kayla','Taylor','Morgan',
  'Amber','Heather','Samantha','Courtney','Chelsea','Lindsey','Kaitlyn',
  'Danielle','Nicole','Hannah','Madison','Kimberly','Tiffany','Alexis',
]

const PROVINCE_ABBR: Record<string, string> = {
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
  const m = variant.match(/(\d+)["\u201c\u201d]?\s*[xX]\s*(\d+)/)
  return m ? `${m[1]}\u00d7${m[2]}` : null
}

function parseColor(variant: string): string | null {
  const parts = variant.split('/')
  if (parts.length >= 2) {
    const c = parts[1].trim()
    if (c === 'Black') return 'Black'
    if (c === 'White') return 'White'
    if (c === 'Oak' || c === 'Natural') return 'Oak'
    if (c === 'Walnut' || c === 'Stained' || c === 'Stain') return 'Walnut'
    if (c === 'No Frame') return null // skip no-frame
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

    // Simple query — no LATERAL, use jsonb_array_elements in FROM
    const query = `
      SELECT DISTINCT ON (city, state)
        city, state, variant
      FROM (
        SELECT
          shipping_address_city AS city,
          shipping_address_province AS state,
          jsonb_array_elements(line_items)->>'variant_title' AS variant
        FROM shopify_orders
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND shipping_address_country = 'United States'
          AND shipping_address_city IS NOT NULL
          AND shipping_address_province IS NOT NULL
          AND line_items IS NOT NULL
      ) sub
      WHERE variant ~ '[0-9]+.*[xX].*[0-9]+'
      LIMIT 30
    `

    const res = await fetch(NEON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_CONN,
      },
      body: JSON.stringify({ query, params: [] }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`DB error: ${res.status} — ${errText.slice(0,200)}`)
    }
    const data = await res.json()
    const rows: Array<{ city: string; state: string; variant: string }> = data.rows ?? []

    if (rows.length < 5) {
      return NextResponse.json({ buyers: [], cached: false, source: 'fallback', rowCount: rows.length })
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
    return NextResponse.json({ buyers, cached: false, source: 'neon', rowCount: rows.length })
  } catch (e) {
    return NextResponse.json({ buyers: [], error: String(e), source: 'error' }, { status: 500 })
  }
}
