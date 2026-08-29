import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8081';
const OUT = __dirname;

const ROUTES = [
  ['spotlight-hub', '/(app)/spotlight-hub'],
  ['spotlight-rules', '/(app)/spotlight-rules'],
  ['spotlight-apply', '/(app)/spotlight-apply'],
  ['spotlight-entry', '/(app)/spotlight-entry'],
  ['spotlight-ranking', '/(app)/spotlight-ranking'],
  ['spotlight-winners', '/(app)/spotlight-winners'],
  ['spotlight-won', '/(app)/spotlight-won'],
  ['spotlight-vote', '/spotlight-vote'],
  ['friends', '/(app)/friends'],
  ['friend-search', '/(app)/friend-search'],
  ['friend-invite', '/(app)/friend-invite'],
  ['friend-requests', '/(app)/friend-requests'],
  ['my-profile', '/(app)/my-profile'],
  ['user-profile', '/(app)/user-profile?id=fu-1'],
  ['messages', '/(app)/messages'],
  ['dm-oksana', '/(app)/dm/fu-1'],
  ['walk-plan', '/(app)/walk-plan'],
  ['activity', '/(app)/activity'],
  ['search', '/(app)/search?q=%D0%BA%D0%BE%D1%80%D0%B3%D0%B8'],
  ['story-post', '/(app)/story-post'],
  ['story-comments', '/(app)/story-comments'],
  ['story-tag', '/(app)/story-tag'],
  ['story-compose', '/(app)/story-compose'],
];

async function ensureLogin(page) {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(1000);
  const skip = page.getByText('Пропустити');
  if (await skip.count()) {
    await skip.first().click();
    await page.waitForTimeout(800);
  }
  await page.goto(BASE + '/(auth)/login', {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  const email = page.locator('input').first();
  const pass = page.locator('input[type="password"]').first();
  if (await email.count()) await email.fill('demo@knowsnout.com');
  if (await pass.count()) await pass.fill('demo1234');
  const loginBtn = page.getByText(/Увійти|Вхід/);
  if (await loginBtn.count()) {
    await loginBtn.first().click();
    await page.waitForTimeout(2800);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 402, height: 874 } });
  await ensureLogin(page);

  const report = [];
  for (const [name, route] of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1600);
      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
      const text = (await page.locator('body').innerText()).replace(/\n+/g, ' | ');
      const bad =
        text.includes('Пропустити') && text.includes('Скануй')
          ? 'ONBOARDING'
          : text.includes('This screen doesn')
            ? 'MISSING'
            : 'OK';
      report.push({ name, bad, snippet: text.slice(0, 140) });
      console.log(name, bad, text.slice(0, 90));
    } catch (e) {
      report.push({ name, bad: 'ERR', snippet: String(e.message).slice(0, 120) });
      console.log(name, 'ERR', e.message.slice(0, 100));
    }
  }
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
