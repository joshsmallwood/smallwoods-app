/**
 * FrameDesigner Test Suite v2
 * Updated for FrameForest-style layout (4 icon buttons: Size, Style, Mat, Clear)
 * Scope: everything WITHIN the designer. No Shopify cart/checkout.
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
    return b ? { w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right) } : null;
  });
}

async function openSizePanel(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Size"]') ||
      [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Size');
    btn?.click(); return !!btn;
  });
}

async function selectSize(page, label) {
  await openSizePanel(page);
  await page.waitForTimeout(400);
  const selected = await page.evaluate((lbl) => {
    const btn = [...document.querySelectorAll('button[aria-pressed]')].find(b =>
      b.getAttribute('aria-label')?.startsWith(lbl)
    ) || [...document.querySelectorAll('button')].find(b => b.textContent?.trim().startsWith(lbl));
    btn?.click(); return !!btn;
  }, label);
  await page.waitForTimeout(400);
  return selected;
}

async function openStylePanel(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Style"]') ||
      [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Style');
    btn?.click(); return !!btn;
  });
}

async function runTests(page, vp) {
  const tag = `[${vp.label}]`;
  const vw = vp.w;

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  assert(true, `${tag} Page loads`);

  const frame = await getFrame(page);
  assert(!!frame, `${tag} Frame renders`, frame ? `${frame.w}x${frame.h}` : 'missing');

  if (frame) assert(frame.right <= vw + 5, `${tag} Frame fits viewport`, `right=${frame.right}`);

  const controlBtns = await page.evaluate(() => {
    const labels = ['Size', 'Style', 'Mat', 'Clear'];
    return labels.filter(lbl =>
      [...document.querySelectorAll('button')].some(b =>
        b.textContent?.trim() === lbl && b.getBoundingClientRect().height > 0
      )
    );
  });
  assert(controlBtns.length === 4, `${tag} 4 control buttons (Size/Style/Mat/Clear)`, `found: ${controlBtns.join(',')}`);

  const overflow = await page.evaluate((vw) =>
    [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.right > vw + 2 && r.width > 10 && r.height > 10 && !['HTML','BODY'].includes(el.tagName);
    }).length, vw);
  assert(overflow === 0, `${tag} No overflow`, overflow > 0 ? `${overflow} elements` : 'clean');

  const cta = await page.evaluate((vh) => {
    const btn = [...document.querySelectorAll('button')].find(b =>
      b.textContent?.includes('Upload') || b.textContent?.includes('Add to Cart')
    );
    const r = btn?.getBoundingClientRect();
    return r ? { present: true, bottom: Math.round(r.bottom) } : { present: false, bottom: 0 };
  }, vp.h);
  assert(cta.present, `${tag} CTA button present`);
  assert(cta.bottom <= vp.h + 5, `${tag} CTA fits viewport`, `bottom=${cta.bottom}`);

  // Size panel
  await openSizePanel(page);
  await page.waitForTimeout(400);
  const sizeCount = await page.evaluate(() =>
    [...document.querySelectorAll('button[aria-pressed]')].filter(b =>
      b.getAttribute('aria-label')?.match(/\$\d+/)
    ).length
  );
  assert(sizeCount >= 9, `${tag} Size panel: all options`, `found ${sizeCount}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // Size proportions
  for (const s of [
    { label: '25×25', ratio: 1.0, tol: 0.15 },
    { label: '44×22', ratio: 1.5, tol: 0.6 },
    { label: '8×10', ratio: 0.8, tol: 0.15 },
  ]) {
    await selectSize(page, s.label);
    const f = await getFrame(page);
    if (f) {
      const ratio = f.w / f.h;
      assert(f.right <= vw + 5 && Math.abs(ratio - s.ratio) <= s.tol,
        `${tag} Size ${s.label}: fits+proportional`, `ratio=${Math.round(ratio*100)/100}`);
    } else {
      assert(false, `${tag} Size ${s.label}`, 'no frame');
    }
  }
  await selectSize(page, '25×17');
  await page.waitForTimeout(300);

  // Style panel
  await openStylePanel(page);
  await page.waitForTimeout(400);
  const swatchCount = await page.evaluate(() =>
    [...document.querySelectorAll('button[aria-label]')].filter(b =>
      ['Walnut','Oak','Black','White'].includes(b.getAttribute('aria-label')||'') &&
      b.getBoundingClientRect().height > 0
    ).length
  );
  assert(swatchCount === 4, `${tag} Style panel: 4 swatches`, `found ${swatchCount}`);

  // Color change
  for (const color of ['Black', 'Walnut']) {
    const changed = await page.evaluate((c) => {
      const btn = document.querySelector(`button[aria-label="${c}"]`);
      btn?.click(); return !!btn;
    }, color);
    await page.waitForTimeout(200);
    const img = await page.evaluate(() =>
      document.querySelector('[style*="border-image-source"]')?.style.borderImageSource || ''
    );
    assert(changed && img.includes('frame_rotated'), `${tag} Color ${color} updates frame`);
  }

  // Frame rotation
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  const fBefore = await getFrame(page);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Frame')?.click();
  });
  await page.waitForTimeout(400);
  const fAfter = await getFrame(page);
  const rBefore = fBefore ? fBefore.w / fBefore.h : 0;
  const rAfter = fAfter ? fAfter.w / fAfter.h : 0;
  assert(Math.abs(rBefore - rAfter) > 0.2, `${tag} Frame rotation flips orientation`,
    `before=${Math.round(rBefore*100)/100} after=${Math.round(rAfter*100)/100}`);

  // Art button exists
  const artExists = await page.evaluate(() =>
    [...document.querySelectorAll('button')].some(b => b.textContent?.trim() === 'Art')
  );
  assert(artExists, `${tag} Art button present`);

  // Gallery wall
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === '+ Frame')?.click();
  });
  await page.waitForTimeout(600);
  const frames2 = await page.evaluate(() => document.querySelectorAll('[style*="border-image-source"]').length);
  assert(frames2 === 2, `${tag} Gallery wall: 2 frames`, `count=${frames2}`);
  const overflow2 = await page.evaluate((vw) =>
    [...document.querySelectorAll('[style*="border-image-source"]')].some(f => f.getBoundingClientRect().right > vw + 5)
  , vw);
  assert(!overflow2, `${tag} Gallery wall: 2 frames fit`, overflow2 ? 'OVERFLOW' : 'ok');

  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === '+ Frame')?.click();
  });
  await page.waitForTimeout(600);
  const frames3 = await page.evaluate(() => document.querySelectorAll('[style*="border-image-source"]').length);
  assert(frames3 === 3, `${tag} Gallery wall: 3 frames`, `count=${frames3}`);
  const overflow3 = await page.evaluate((vw) =>
    [...document.querySelectorAll('[style*="border-image-source"]')].some(f => f.getBoundingClientRect().right > vw + 5)
  , vw);
  assert(!overflow3, `${tag} Gallery wall: 3 frames fit`, overflow3 ? 'OVERFLOW' : 'ok');

  // Print Refill
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Switch to Print Refill"]')?.click();
  });
  await page.waitForTimeout(300);
  const refillActive = await page.evaluate(() =>
    document.querySelector('button[aria-label="Switch to Frame"]') !== null
  );
  assert(refillActive, `${tag} Print Refill toggle activates`);
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
console.log('Running FrameDesigner test suite v2...\n');
for (const vp of VIEWPORTS) {
  console.log(`Testing ${vp.label}...`);
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.w, height: vp.h });
  page.on('console', msg => { if (msg.type() === 'error') console.log(`  [JS ERROR] ${msg.text().substring(0,100)}`); });
  await runTests(page, vp);
  await page.close();
}
await browser.close();

console.log('\n' + '='.repeat(70));
console.log(`RESULTS: ${passed} passed  ${failed} failed  (${passed+failed} total)`);
console.log('='.repeat(70));
for (const r of results) {
  console.log(`${r.s} ${r.name}${r.detail && r.detail !== 'ok' && r.detail !== 'clean' ? '  →  ' + r.detail : ''}`);
}
console.log('='.repeat(70));
process.exit(failed > 0 ? 1 : 0);
