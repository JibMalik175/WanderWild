const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = path.join(__dirname, 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

// role -> fake auth-storage payload (matches zustand persist shape in app/utils/store.ts)
const users = {
  customer: { id: 'demo-cust', name: 'Alex Customer', email: 'customer@wanderwild.com', role: 'customer' },
  agency:   { id: 'demo-agcy', name: 'Globe Travels', email: 'agency@wanderwild.com', role: 'agency', agencyName: 'Globe Travels' },
  admin:    { id: 'demo-admin', name: 'Site Admin', email: 'admin@wanderwild.com', role: 'admin' },
};

function authPayload(role) {
  return JSON.stringify({
    state: { user: users[role], token: 'demo-token', isAuthenticated: true },
    version: 0,
  });
}

// route, output filename, optional role for protected pages
const pages = [
  ['/', 'home', null],
  ['/explore', 'explore', null],
  ['/packages', 'packages', null],
  ['/packages/1', 'package-detail', null],
  ['/ai-itinerary', 'ai-itinerary', null],
  ['/chatbot', 'chatbot', null],
  ['/learning', 'learning', null],
  ['/learning/videos', 'learning-videos', null],
  ['/login', 'login', null],
  ['/register', 'register', null],
  ['/checkout', 'checkout', 'customer'],
  ['/dashboard/customer', 'dashboard-customer', 'customer'],
  ['/dashboard/customer/packages', 'dashboard-customer-packages', 'customer'],
  ['/dashboard/customer/inquiries', 'dashboard-customer-inquiries', 'customer'],
  ['/dashboard/agency', 'dashboard-agency', 'agency'],
  ['/dashboard/agency/packages', 'dashboard-agency-packages', 'agency'],
  ['/dashboard/agency/packages/add', 'dashboard-agency-package-add', 'agency'],
  ['/dashboard/agency/bookings', 'dashboard-agency-bookings', 'agency'],
  ['/dashboard/agency/analytics', 'dashboard-agency-analytics', 'agency'],
  ['/dashboard/agency/payments', 'dashboard-agency-payments', 'agency'],
  ['/dashboard/admin', 'dashboard-admin', 'admin'],
  ['/dashboard/admin/analytics', 'dashboard-admin-analytics', 'admin'],
  ['/dashboard/admin/management', 'dashboard-admin-management', 'admin'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, label) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + label + ' after ' + ms + 'ms')), ms))]);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();
  // Several pages call alert() on API failure (Supabase is offline here). A native dialog
  // blocks the renderer and hangs automation, so auto-dismiss any dialog that pops up.
  page.on('dialog', async (d) => { try { await d.dismiss(); } catch (e) {} });
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  // Neutralize blocking native dialogs BEFORE any page script runs. Several pages call
  // alert() on API failure (Supabase is offline here); a native modal freezes the renderer.
  await page.evaluateOnNewDocument(() => {
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => null;
  });
  // disable CSS animations/transitions + backdrop-filter (the latter hangs fullPage capture in headless Chromium)
  await page.evaluateOnNewDocument(() => {
    const css = `*,*::before,*::after{animation:none!important;transition:none!important;animation-duration:0s!important;scroll-behavior:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`;
    const apply = () => { const s = document.createElement('style'); s.textContent = css; (document.head || document.documentElement).appendChild(s); };
    apply();
    document.addEventListener('DOMContentLoaded', apply);
  });

  // establish origin so we can write localStorage
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  const results = [];
  const skipExisting = process.env.SKIP_EXISTING === '1';
  for (const [route, name, role] of pages) {
    try {
      const existing = path.join(OUT, name + '.png');
      if (skipExisting && fs.existsSync(existing) && fs.statSync(existing).size > 0) {
        results.push(`  • ${name.padEnd(32)} ${route}  (skipped, already captured)`);
        continue;
      }
      await page.evaluate((auth) => {
        if (auth) localStorage.setItem('auth-storage', auth);
        else localStorage.removeItem('auth-storage');
      }, role ? authPayload(role) : null);

      await page.goto(BASE + route, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      // let any data-fetch fallbacks settle + lazy content render
      await sleep(1500);
      // trigger lazy-load by scrolling through, then back to top (guarded against a blocked renderer)
      await withTimeout(page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      }), 8000, 'scroll').catch(() => {});
      await sleep(400);

      const finalPath = await page.evaluate(() => location.pathname);
      const file = path.join(OUT, name + '.png');
      try {
        await withTimeout(page.screenshot({ path: file, fullPage: true }), 20000, 'fullPage');
      } catch (capErr) {
        // fullPage hung/failed (e.g. very tall page) -> fall back to a tall viewport capture
        await page.evaluate(() => window.scrollTo(0, 0));
        await withTimeout(page.screenshot({ path: file, fullPage: false }), 15000, 'viewport');
      }
      const redirected = finalPath !== route && !(route !== '/' && finalPath.startsWith(route));
      results.push(`  ✓ ${name.padEnd(32)} ${route}${redirected ? '  -> redirected to ' + finalPath : ''}`);
    } catch (e) {
      results.push(`  ✗ ${name.padEnd(32)} ${route}  ERROR: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Captured screenshots to: ' + OUT + '\n');
  console.log(results.join('\n'));
})();
