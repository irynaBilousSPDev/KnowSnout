import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:8081';
const OUT = __dirname;

/** Every Стрічка / 04 frame → route + must-have UA strings from HTML */
const FRAMES = [
  {
    id: '04.01-story-post',
    route: '/(app)/story-post',
    must: ['Пост', 'Марта та Тукан', 'Оболоні', '48', '12'],
  },
  {
    id: '04.02-story-comments',
    route: '/(app)/story-comments',
    must: ['Коментарі', 'Оксана', 'Ігор', 'парк', 'Написати'],
  },
  {
    id: '04.03-story-compose',
    route: '/(app)/story-compose',
    must: ['Скасувати', 'Новий пост', 'Опублікувати'],
  },
  {
    id: '04.04-story-tag',
    route: '/(app)/story-tag',
    must: ['Скасувати', 'Позначити', 'Готово', 'Тукан', 'Оксана'],
  },
  {
    id: '04.07-search',
    route: '/(app)/search?q=%D0%BA%D0%BE%D1%80%D0%B3%D0%B8',
    must: ['корги', 'ЛЮДИ', 'СТАТТІ', 'КВІЗИ'],
  },
  {
    id: '04.08-friends',
    route: '/(app)/friends',
    must: ['Друзі', 'Підписки', 'Пропозиції', 'Відписатись', 'Оксана'],
  },
  {
    id: '04.09-friend-search',
    route: '/(app)/friend-search',
    must: ['Контакти', 'Поруч', 'Ярослава', 'Додати'],
  },
  {
    id: '04.10-friend-requests',
    route: '/(app)/friend-requests',
    must: ['Запит'],
  },
  {
    id: '04.11-friend-invite',
    route: '/(app)/friend-invite',
    must: ['knowsnout.app'],
  },
  {
    id: '04.12-user-profile',
    route: '/(app)/user-profile?userId=fu-1',
    must: ['Профіль', 'Оксана', 'Пости', 'Друзі'],
  },
  {
    id: '04.13-messages',
    route: '/(app)/messages',
    must: ['Чат', 'Оксана', 'Ігор'],
  },
  {
    id: '04.14-dm',
    route: '/(app)/dm/fu-1',
    must: ['Оксана', 'Написати'],
  },
  {
    id: '04.15-walk-plan',
    route: '/(app)/walk-plan',
    must: ['Прогулянка', 'Створити', 'Оболоні', 'Google'],
  },
  {
    id: '04.16-dm-walk',
    route: '/(app)/dm/fu-1',
    must: ['Оксана', 'Прогулянка', 'Прийду', 'Не можу'],
  },
  {
    id: '04.17-spotlight-hub',
    route: '/(app)/spotlight-hub',
    must: ['SnoutSpotlight', 'Активний конкурс', '214', 'Взяти участь'],
  },
  {
    id: '04.18-spotlight-rules',
    route: '/(app)/spotlight-rules',
    must: ['Найкумедніша поза', 'Правила', 'Подати заявку', 'Plus'],
  },
  {
    id: '04.19-spotlight-apply',
    route: '/(app)/spotlight-apply',
    must: ['Заявка', 'Надіслати', 'Тукан', 'морозива'],
  },
  {
    id: '04.20-spotlight-entry',
    route: '/(app)/spotlight-entry',
    must: ['Учасник', 'Тукан', '128', '47', 'Поділитися'],
  },
  {
    id: '04.21-spotlight-ranking',
    route: '/(app)/spotlight-ranking',
    must: ['Рейтинг', 'Аполлон', '312', 'Муся', 'Тукан'],
  },
  {
    id: '04.22-spotlight-winners',
    route: '/(app)/spotlight-winners',
    must: ['Переможці', 'Рекс', 'Соня'],
  },
  {
    id: '04.23-spotlight-won',
    route: '/(app)/spotlight-won',
    must: ['переміг', '312', 'Plus'],
  },
  {
    id: '04.24-spotlight-vote',
    route: '/spotlight-vote',
    must: ['knowsnout.app/vote', 'Тукана', '128', 'Проголосувати'],
  },
  {
    id: '04.25-my-profile',
    route: '/(app)/my-profile',
    must: ['Мій профіль', 'Марта Ковальчук', '@marta.k', 'Plus', 'Тукан'],
  },
  {
    id: '04.26-activity',
    route: '/(app)/activity',
    must: ['Активність'],
  },
  {
    id: '04.feed-stories',
    route: '/(app)/(tabs)/stories',
    must: ['Стрічка'],
  },
];

async function ensureLogin(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(1500);
  const skip = page.getByText('Пропустити');
  if (await skip.count()) {
    await skip.first().click();
    await page.waitForTimeout(1000);
  }
  await page.goto(BASE + '/(auth)/login', {
    waitUntil: 'networkidle',
    timeout: 90000,
  });
  await page.waitForTimeout(1200);
  const email = page.locator('input').first();
  const pass = page.locator('input[type="password"]').first();
  if (await email.count()) await email.fill('demo@knowsnout.com');
  if (await pass.count()) await pass.fill('demo1234');
  const loginBtn = page.getByText(/Увійти|Вхід/);
  if (await loginBtn.count()) {
    await loginBtn.first().click();
    await page.waitForTimeout(3000);
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 402, height: 874 } });
  await ensureLogin(page);

  const report = [];
  for (const frame of FRAMES) {
    try {
      await page.goto(BASE + frame.route, {
        waitUntil: 'networkidle',
        timeout: 90000,
      });
      await page.waitForTimeout(1800);
      const shot = path.join(OUT, `${frame.id}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      const text = await page.locator('body').innerText();
      const inputVals = await page.evaluate(() => {
        const nodes = Array.from(
          document.querySelectorAll('input, textarea'),
        );
        return nodes
          .map((n) => {
            const el = n;
            const v = 'value' in el ? String(el.value || '') : '';
            const ph = el.getAttribute('placeholder') || '';
            return `${v} ${ph}`;
          })
          .join(' ');
      });
      const flat = `${text} ${inputVals}`.replace(/\s+/g, ' ');
      const missing = frame.must.filter((m) => !flat.includes(m));
      const blocked =
        flat.includes('Пропустити') && flat.includes('Скануй')
          ? 'ONBOARDING'
          : flat.includes('Щось пішло не так') || flat.includes('не знайдено')
            ? 'ERROR_STATE'
            : missing.length
              ? 'MISSING_COPY'
              : 'PASS';
      report.push({
        id: frame.id,
        route: frame.route,
        status: blocked,
        missing,
        snippet: flat.slice(0, 160),
      });
      console.log(
        blocked === 'PASS' ? '✅' : '❌',
        frame.id,
        blocked,
        missing.length ? missing.join(',') : '',
      );
    } catch (e) {
      report.push({
        id: frame.id,
        route: frame.route,
        status: 'ERR',
        missing: [],
        snippet: String(e.message).slice(0, 160),
      });
      console.log('❌', frame.id, 'ERR', e.message.slice(0, 80));
    }
  }

  const outPath = path.join(OUT, 'qa04-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  const fail = report.filter((r) => r.status !== 'PASS');
  console.log('\nSUMMARY', report.length - fail.length, '/', report.length, 'PASS');
  if (fail.length) {
    console.log('FAILS:');
    for (const f of fail) console.log('-', f.id, f.status, f.missing?.join('|') || f.snippet);
  }
  await browser.close();
  process.exit(fail.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
