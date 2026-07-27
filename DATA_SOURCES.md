# KnowSnout — data sources & attribution

**Canonical list for the app:** [`src/data/dataSources.ts`](src/data/dataSources.ts)  
**In-app:** Мої дані → **Джерела даних** (не засмічує основні екрани).

## How we keep this ordered

1. Adding / removing / changing an external API or dataset → **update `src/data/dataSources.ts` in the same PR**.
2. Short on-screen credits stay minimal; full list lives on the Sources screen + this pointer file.
3. Never put secrets in this file. API keys stay in Supabase secrets / `.env` (not committed).
4. Product claims: food scores, plant toxicity, breed ID, quiz facts are **informational** — not veterinary or pedigree advice.

## Snapshot (see TS for details)

| Source | Used for |
|--|--|
| Open Pet Food Facts / Open Food Facts | Food barcode / ingredients |
| OpenAI (server Edge only) | Label / plant / **breed** vision |
| TheDogAPI / TheCatAPI | Breed search + enrich after vision + photo quiz (dog list often needs free `x-api-key`) |
| Wikidata (CC0) | Quiz origin / animal group + enrich |
| Open Trivia DB (CC BY-SA) | Animals trivia quiz |
| KnowSnout plants seed + Supabase | Plant safety cache |
| Allegro (optional API) | Store score + link on food result (mock by default) |
| Supabase | Auth, journal, quiz scores, storage |

Last process note: **2026-07-27** — Allegro store-score badge (mock + Edge `store-rating`).
