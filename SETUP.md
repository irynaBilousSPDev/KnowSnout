# KnowSnout setup checklist

Use this while connecting real backends. Demo mode works without any of this.

## 1. Tools

- [ ] Node.js LTS ≥ 20.19.4
- [ ] Git
- [ ] Expo Go on phone
- [ ] (Optional) Supabase CLI
- [ ] (Optional) EAS CLI for store builds later

## 2. Supabase

- [ ] Create project
- [ ] Copy URL + anon key → `.env`
- [x] Run SQL migration `supabase/migrations/20260321120000_init_scans.sql`
- [x] Run SQL migration `supabase/migrations/20260321140000_products_catalog.sql`
- [x] Run SQL migration `supabase/migrations/20260321150000_products_species.sql`
- [x] Run SQL migration `supabase/migrations/20260321160000_pets.sql`
- [x] Run SQL migration `supabase/migrations/20260321170000_pet_avatar_album.sql`
- [x] Run SQL migration `supabase/migrations/20260321180000_pet_profile_fields.sql`
- [x] `20260321190000_favorite_food_feeding.sql`
- [x] `20260321210000_pet_vaccines.sql`
- [x] `20260321200000_snout_stories.sql`
- [x] **Нове:** `20260321232000_story_posts_feed_fields.sql` (privacy / species / story-images bucket)
- [x] **Нове:** `20260321233000_plant_catalog_expand.sql` (+27 рослин у кеш Supabase)
- [x] **Нове:** `20260321234000_story_comments_author.sql` (ім’я автора в коментарях)
- [x] **Нове:** `20260321220000_plant_safety.sql` (кеш рослин + токсичність + історія перевірок)
- [x] **Нове:** `20260321230000_quiz_sessions.sql` (результати квізу + рейтинг в акаунті)
- [x] **Нове:** `20260321231000_quiz_sessions_trivia.sql` (категорія Open Trivia Animals)
- [x] **Нове:** `20260321235000_pet_life_stage.sql` (`pets.life_stage` для матчу корму ↔ профіль)
- [x] **Нове:** `20260321236000_pet_vet_logs.sql` (журнал ліків / візитів до вета)
- [ ] Email auth enabled; confirm-email off for MVP
- [ ] Set secret `OPENAI_API_KEY`
- [ ] Deploy `analyze-label` function
- [ ] (Plant photo ID) Deploy `identify-plant` function
- [ ] (Breed photo ID) Deploy `identify-breed` function

## 3. OpenAI

- [ ] Create API key
- [ ] Set monthly spend limit
- [ ] Store key only in Supabase secrets

## 4. App switch to production AI

- [ ] `.env`: `EXPO_PUBLIC_USE_MOCK_AI=false`
- [ ] Restart Expo (`npx expo start -c`)
- [ ] Sign up a real user and scan a label on device

## 5. GitHub

Remote: https://github.com/irynaBilousSPDev/KnowSnout.git

```bash
git remote -v
git push -u origin main
```

## 6. Web на своєму домені (Vercel)

Домен: **https://knowsnout.com/** (зараз ще Hostinger parked page — нормально до DNS).

Локальний білд: `npm run export:web` → `dist/`. Конфіг: `vercel.json`.

1. Запуш репо на GitHub (`KnowSnout`).
2. [vercel.com](https://vercel.com) → **Add New Project** → імпорт `KnowSnout`.
3. Framework Preset: **Other**. Build / Output уже в `vercel.json`.
4. **Environment Variables** (Production), ті самі що в `.env`:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_USE_MOCK_AI` (`true` спочатку ок)
5. Deploy → отримаєш `*.vercel.app`.
6. **Settings → Domains** → додай `knowsnout.com` і `www.knowsnout.com`.
7. У **Hostinger** DNS постав записи як каже Vercel (зазвичай `A` / `CNAME`) — після цього parked page зникне.
8. Supabase → **Authentication → URL configuration**:
   - Site URL: `https://knowsnout.com`
   - Redirect URLs: `https://knowsnout.com/**` і `https://ТВІЙ-ПРОЕКТ.vercel.app/**`

```bash
npx vercel
npx vercel --prod
npx vercel domains add knowsnout.com
```

Камера/share на вебі обмеженіші за телефон — для логіну, журналу й UI це нормально.
