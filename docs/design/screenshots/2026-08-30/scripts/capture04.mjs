import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8081';
const OUT = __dirname;

const ROUTES = [
  ['spotlight-hub', '/(app)/spotlight-hub'],
  ['friends', '/(app)/friends'],
  ['my-profile', '/(app)/my-profile'],
  ['messages', '/(app)/messages'],
  ['activity', '/(app)/activity'],
  ['search', '/(app)/search'],
  ['friend-search', '/(app)/friend-search'],
  ['walk-plan', '/(app)/walk-plan'],
  ['spotlight-ranking', '/(app)/spotlight-ranking'],
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 402, height: 874 } });

  // Normal UI path: skip onboarding if shown
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(1200);
  const skip = page.getByText('Пропустити');
  if (await skip.count()) {
    await skip.first().click();
    await page.waitForTimeout(1000);
  }

  // Login form
  await page.goto(BASE + '/(auth)/login', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForTimeout(1200);
  const email = page.locator('input').first();
  const pass = page.locator('input[type="password"]').first();
  if (await email.count()) await email.fill('demo@knowsnout.com');
  if (await pass.count()) await pass.fill('demo1234');
  const loginBtn = page.getByText(/Увійти|Вхід/);
  if (await loginBtn.count()) {
    await loginBtn.first().click();
    await page.waitForTimeout(2500);
  }

  for (const [name, route] of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    const text = await page.locator('body').innerText();
    console.log(
      name,
      text.includes('Пропустити') && text.includes('Скануй корм')
        ? 'STILL_ONBOARDING'
        : 'CAPTURED',
      text.slice(0, 60).replace(/\n/g, ' | '),
    );
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
