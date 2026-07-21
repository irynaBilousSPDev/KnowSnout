# KnowSnout

Cross-platform pet care app (food scan · plants · breed · care) for **Android + iOS + Web**, built with **Expo SDK 54**, **TypeScript**, **NativeWind**, **Supabase**, and **OpenAI Vision** (via Edge Function).

- **Site:** https://knowsnout.com/
- **GitHub:** https://github.com/irynaBilousSPDev/KnowSnout.git
- Brand: [`BRANDBOOK.md`](./BRANDBOOK.md) · vision: [`PRODUCT_VISION.md`](./PRODUCT_VISION.md)

> **Note:** Targets **Expo SDK 54** for Expo Go compatibility.

## Quick start (demo / mock mode)

Works without Supabase or OpenAI keys:

```bash
npm install
npm start
```

1. Open in **Expo Go** on your phone (camera needs a real device).
2. Sign in with any email/password (demo mode).
3. Tap **Demo scan (mock data)** to see the Result screen with sample JSON.

`.env` ships with `EXPO_PUBLIC_USE_MOCK_AI=true`.

## Your checklist (accounts & secrets)

Do these once — the agent cannot create accounts for you:

1. **Node.js** ≥ 20.19.4 (or current LTS) — you currently may see engine warnings on 20.17.
2. Install **Expo Go** on Android/iOS.
3. Create a [Supabase](https://supabase.com) project named `SnoutScore`.
4. Create an [OpenAI](https://platform.openai.com) API key and set a **hard spending limit**.
5. Copy Project URL + `anon` key into local `.env` (see `.env.example`).
6. In Supabase SQL Editor, run [`supabase/migrations/20260321120000_init_scans.sql`](supabase/migrations/20260321120000_init_scans.sql).
7. Auth → Providers → Email on. For MVP, disable **Confirm email**.
8. Install [Supabase CLI](https://supabase.com/docs/guides/cli), then:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy analyze-label
```

9. Set `EXPO_PUBLIC_USE_MOCK_AI=false` in `.env` when you want real Vision analysis.

Never put `OPENAI_API_KEY` or `service_role` in the app or git.

## App structure

```
app/                  Expo Router screens
  (auth)/             login, register
  (app)/              protected scan, history, result
src/
  components/         UI building blocks
  services/           supabase, auth, analysis, scans
  hooks/              useAuth, useAnalyzeLabel
  constants/          mock analysis + score colors
  lib/                env, image helpers, result store
supabase/
  migrations/         scans table + RLS + storage
  functions/          analyze-label (OpenAI proxy)
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server |
| `npm run android` / `ios` / `web` | Platform targets |
| `npm run typecheck` | TypeScript check |

## EAS (later)

`eas.json` is stubbed. When ready:

```bash
npm i -g eas-cli
eas login
eas init
eas build --platform all --profile preview
```

## Security model

- Client holds only `EXPO_PUBLIC_SUPABASE_URL` + anon key.
- OpenAI calls go through `analyze-label` Edge Function with the user JWT.
- `scans` rows and `scan-images` objects are protected by RLS (`auth.uid()`).
