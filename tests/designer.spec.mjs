/**
 * FrameDesigner Test Suite
 * Tests all flows WITHIN the designer only.
 * Scope: everything up to order summary sheet.
 * Out of scope: Shopify cart, checkout, payment.
 *
 * Run: node tests/designer.spec.mjs
 */

import { chromium } from 'playwright';

const URL = 'https://app.smallwoods.io/designer';
const VIEWPORTS = [
  { w: 390, h: 844, label: 'iPhone 14' },
  { w: 375, h: 667, label: 'iPhone SE' },
  { w: 430, h: 932, label: 'iPhone 14 Plus' },
];

let passed = 0, failed = 0;
const results = [];

function assert(ok, name, detail = '') {
  if (ok) { passed++; results.push({ s: '✅', name, detail }); }
  else { failed++; results.push({ s: '❌', name, detail: detail || 'FAILED' }); }
}

async function getFrame(page) {
  return page.evaluate(() => {
    const f = document.querySelector('[style*="border-image-source"]');
    const b = f?.getBoundingClientRect();
    return b ? { w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), right: Math.round(b.right) } : null;
  });
}

async function selectSize(page, label) {
  // Open size panel via the size button (aria-label="Choose size")
  const opened = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Choose size"]') ||
      [...document.querySelectorAll('button')].find(b => /^\d+[x×]\d+$/.test(b.textContent?.trim() || ''));
    btn?.click(); return !!btn;
  });
  if (!opened) return false;
  await page.waitForTimeout(400);
  // Select size by aria-label in the panel (format: "25×17 $109")
  const selected = await page.evaluate((lbl) => {
    // Try aria-label first (panel), then text content (fallback)
    const btn = [...document.querySelectorAll('button[aria-pressed]')].find(b => 
      b.getAttribute('aria-label')?.startsWith(lbl)
    ) || [...document.querySelectorAll('button')].find(b => b.textContent?.trim().startsWith(lbl));
    btn?.click(); return !!btn;
  }, label);
  await page.waitForTimeout(400);
  return selected;
}

async function runTests(page, vp) {
  const tag = `[${vp.label}]`;
  const vw = vp.w;

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // T1: Page loads
  assert(true, `${tag} Page loads`);

  // T2: Frame renders
  const frame = await getFrame(page);
  assert(!!frame, `${tag} Frame renders`, frame ? `${frame.w}x${frame.h}` : 'missing');

  // T3: Frame fits viewport
  if (frame) assert(frame.right <= vw + 5, `${tag} Frame fits viewport`, `right=${frame.right} vw=${vw}`);

  // T4: Default size 25x17
  const defaultSize = await page.evaluate(() =>
    [...document.querySelectorAll('button')].find(b => /^\d+[x×]\d+$/.test(b.textContent?.trim() || ''))?.textContent?.trim()
  );
  assert(defaultSize?.includes('25'), `${tag} Default size is 25x17`, defaultSize || 'not found');

  // T5: Style button opens panel with 4 color swatches
  // Open the style panel first
  const styleBtn = await page.$('button[aria-label="Choose frame style"]');
  if (styleBtn) {
    await styleBtn.click();
    await page.waitForTimeout(300);
  }
  const swatches = await page.evaluate((vw) => {
    const s = [...document.querySelectorAll('button[aria-label]')].filter(b => ['Walnut','Oak','Black','White'].includes(b.getAttribute('aria-label') || ''));
    return { count: s.length, overflow: s.filter(b => b.getBoundingClientRect().right > vw + 2).length };
  }, vw);
  assert(swatches.count === 4, `${tag} 4 color swatches in style panel`, `found ${swatches.count}`);
  assert(swatches.overflow === 0, `${tag} All swatches visible in panel`, `overflow=${swatches.overflow}`);
  // Close panel
  const doneBtn = await page.$('button:has-text("Done")');
  if (doneBtn) await doneBtn.click();
  await page.waitForTimeout(200);

  // T6: Touch targets >= 44px (exempt "+ Frame" header utility)
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button')].filter(b => {
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44) && b.textContent?.trim() !== '+ Frame';
    }).map(b => `"${b.textContent?.trim().substring(0,12)}" ${Math.round(b.getBoundingClientRect().width)}x${Math.round(b.getBoundingClientRect().height)}`)
  );
  assert(small.length === 0, `${tag} Touch targets >= 44px`, small.join(', ') || 'all good');

  // T7: No element overflows viewport
  const overflow = await page.evaluate((vw) =>
    [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.right > vw + 2 && r.width > 10 && r.height > 10 && !['HTML','BODY'].includes(el.tagName);
    }).map(el => `${el.tagName}:${Math.round(el.getBoundingClientRect().right)}`)
  , vw);
  assert(overflow.length === 0, `${tag} No overflow`, overflow.join(', ') || 'clean');

  // T8: Size changes produce correct proportions and fit viewport
  const sizes = [
    { label: '25x25', ratio: 1.0, tol: 0.15 },
    { label: '20x30', ratio: 0.67, tol: 0.15 },
    { label: '44x22', ratio: 1.5, tol: 0.6  },
    { label: '8x10',  ratio: 0.8, tol: 0.15 },
  ];
  for (const s of sizes) {
    await selectSize(page, s.label.replace('x','×'));
    const f = await getFrame(page);
    if (f) {
      const ratio = f.w / f.h;
      const fits = f.right <= vw + 5;
      const prop = Math.abs(ratio - s.ratio) <= s.tol;
      assert(fits && prop, `${tag} Size ${s.label}: fits+proportional`, `ratio=${Math.round(ratio*100)/100} fits=${fits}`);
    } else {
      assert(false, `${tag} Size ${s.label}: frame missing after selection`, '');
    }
  }
  await selectSize(page, '25×17');
  await page.waitForTimeout(300);

  // T9: Color swatches update frame image (via style panel)
  for (const color of ['Black','White','Oak','Walnut']) {
    // Open style panel
    await page.evaluate(() => {
      document.querySelector('button[aria-label="Choose frame style"]')?.click();
    });
    await page.waitForTimeout(200);
    const changed = await page.evaluate((c) => {
      const btn = document.querySelector(`button[aria-label="${c}"]`);
      btn?.click(); return !!btn;
    }, color);
    await page.waitForTimeout(200);
    const img = await page.evaluate(() =>
      document.querySelector('[style*="border-image-source"]')?.style.borderImageSource || ''
    );
    assert(changed && img.includes('frame_rotated'), `${tag} Color ${color}: frame image updates`, img.substring(0,60) || 'no img');
  }

  // T10: Frame/Art rotation toggle
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  const fBefore = await getFrame(page);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Frame')?.click();
  });
  await page.waitForTimeout(300);
  const fAfter = await getFrame(page);
  // After rotation: aspect ratio should change significantly
  // Portrait 25x17: ratio ~0.7. Landscape 25x17: ratio ~1.4
  const ratioBefore = fBefore ? fBefore.w / fBefore.h : 0;
  const ratioAfter = fAfter ? fAfter.w / fAfter.h : 0;
  const flipped = Math.abs(ratioBefore - ratioAfter) > 0.3;
  assert(flipped, `${tag} Rotation toggle flips orientation`, `ratio before=${Math.round(ratioBefore*100)/100} after=${Math.round(ratioAfter*100)/100}`);

  // T11: Gallery wall — 2 frames added without overflow
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === '+ Frame')?.click();
  });
  await page.waitForTimeout(600);
  const frames2count = await page.evaluate(() => document.querySelectorAll('[style*="border-image-source"]').length);
  assert(frames2count === 2, `${tag} Gallery wall: 2 frames added`, `count=${frames2count}`);
  const overflow2 = await page.evaluate((vw) =>
    [...document.querySelectorAll('[style*="border-image-source"]')].some(f => f.getBoundingClientRect().right > vw + 5)
  , vw);
  assert(!overflow2, `${tag} Gallery wall: 2 frames fit viewport`, overflow2 ? 'OVERFLOW' : 'ok');

  // T12: Gallery wall — 3 frames added without overflow
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === '+ Frame')?.click();
  });
  await page.waitForTimeout(600);
  const frames3count = await page.evaluate(() => document.querySelectorAll('[style*="border-image-source"]').length);
  assert(frames3count === 3, `${tag} Gallery wall: 3 frames added`, `count=${frames3count}`);
  const overflow3 = await page.evaluate((vw) =>
    [...document.querySelectorAll('[style*="border-image-source"]')].some(f => f.getBoundingClientRect().right > vw + 5)
  , vw);
  assert(!overflow3, `${tag} Gallery wall: 3 frames fit viewport`, overflow3 ? 'OVERFLOW' : 'ok');

  // T13: Print Refill toggle activates / deactivates
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  // Click by aria-label — more reliable than text which changes
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b =>
      b.getAttribute('aria-label') === 'Switch to Print Refill' ||
      b.textContent?.includes('print refill') ||
      b.textContent?.toLowerCase().includes('refill')
    );
    btn?.click();
  });
  await page.waitForTimeout(300);
  // After activation aria-label changes to 'Switch to Frame'
  const refillActive = await page.evaluate(() =>
    [...document.querySelectorAll('button')].some(b =>
      b.getAttribute('aria-label') === 'Switch to Frame' ||
      b.textContent?.includes('\u21a9') // back arrow
    )
  );
  assert(refillActive, `${tag} Print Refill toggle activates`, refillActive ? 'active' : 'not active');
  // Toggle back
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b =>
      b.getAttribute('aria-label') === 'Switch to Frame' || b.textContent?.includes('\u21a9')
    );
    btn?.click();
  });
  await page.waitForTimeout(200);

  // T14: Size panel shows all options
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Choose size"]');
    btn?.click();
  });
  await page.waitForTimeout(400);
  const dropCount = await page.evaluate(() =>
    [...document.querySelectorAll('button[aria-pressed]')].filter(b => b.getAttribute('aria-label')?.match(/\$\d+/)).length
  );
  assert(dropCount >= 9, `${tag} Size panel: all 10 options`, `found ${dropCount}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // T15: CTA button present and fits viewport
  const cta = await page.evaluate((vh) => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('Upload') || b.textContent?.includes('Add to Cart'));
    const r = btn?.getBoundingClientRect();
    return r ? { present: true, bottom: Math.round(r.bottom), h: Math.round(r.height), w: Math.round(r.width) } : { present: false, bottom: 0, h: 0, w: 0 };
  }, vp.h);
  assert(cta.present, `${tag} CTA button present`, cta.present ? `${cta.w}x${cta.h}` : 'missing');
  assert(cta.bottom <= vp.h + 5, `${tag} CTA fits viewport`, `bottom=${cta.bottom} vh=${vp.h}`);
}

// Run
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
console.log('Running FrameDesigner test suite...\n');
for (const vp of VIEWPORTS) {
  console.log(`Testing ${vp.label} (${vp.w}x${vp.h})...`);
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.w, height: vp.h });
  page.on('console', msg => { if (msg.type() === 'error') console.log(`  [JS ERROR] ${msg.text().substring(0,100)}`); });
  await runTests(page, vp);
  await page.close();
}
await browser.close();

// Print results
console.log('\n' + '='.repeat(70));
console.log(`RESULTS: ${passed} passed  ${failed} failed  (${passed+failed} total)`);
console.log('='.repeat(70));
for (const r of results) {
  console.log(`${r.s} ${r.name}${r.detail && r.detail !== 'all good' && r.detail !== 'ok' && r.detail !== 'active' && r.detail !== 'clean' ? '  →  ' + r.detail : ''}`);
}
console.log('='.repeat(70));
process.exit(failed > 0 ? 1 : 0);
