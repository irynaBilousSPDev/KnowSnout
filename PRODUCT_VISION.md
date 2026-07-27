# SnoutScore — product vision backlog (do not lose ideas)

Everything below is captured for stepwise delivery.  
**Code/DB:** English · **UI:** Ukrainian first (PL later).

---

## North star
Trust + care for pets at home and on the road — then a gentle social layer for pet lovers, shelters, and charity. Start with **dogs & cats**.

---

## Phase map (priority)

### P0 — Core (in progress / next)
- [x] Food scan (barcode → catalog → OFF → photo + AI)
- [x] History filters dog/cat
- [x] Pets CRUD + rich profile + avatars + album
- [x] Favorite food link (pet ↔ history) + feeding notes (ate all / short note)
- [x] Vaccine calendar + reminders (UA/PL) — **v1**: log + due status; optional add to device/Google Calendar; in-app push later
- [x] Travel checklists Schengen / non-Schengen — **v1** checkbox packs on pet profile
- [ ] User profile (basic): name, city, “how many kids”, list of pets
- [x] **Daily care habits:** water bowl refresh + short play reminder (esp. cats) — **v1** on pet profile

### P0c — IA: «Перевір» hub + journal (2026-07-21) — **SHIPPED UI**

| Tab | Role |
|--|--|
| **Перевір** | Hub: **Корм** · **Рослина** · **Порода** |
| **Журнал** | Inner tabs: Корм · Рослини · Породи |
| Улюбленці / Стрічка | unchanged |

### P1c — Breed from photo / name (do not lose)

| Step | Approach |
|--|--|
| Species | Dog or cat (user picks) |
| Name search | **Open APIs:** [TheDogAPI](https://thedogapi.com/) / [TheCatAPI](https://thecatapi.com/) breed catalogs |
| Photo ID | Vision model (mock now) → breed name → **enrich** from same open APIs (temperament, origin, image) |
| UX | Confidence % · never claim pedigree / medical diagnosis |
| History | Журнал → Породи (local v1; cloud later) |

Status: **v1 shipped** (search live + photo mock). Next: real vision identify + optional API keys for higher rate limits.


### P1 — Care depth
- Food ↔ pet allergies / life stage match
- Passport / docs checklist
- Meds & vet visit log
- Toys & how-to-play guides
- External store **scores only** (Allegro etc.)
- Breed-from-photo (beta, with confidence)
- **Plant safety for pets** (houseplants & outdoor) — see module below

### P0b — Daily care habits (water & play)
**Idea:** light daily routines tied to a pet profile (especially cats):
- Log / nudge **fresh water** (“поміняти водичку”)
- Optional **water balance** notes (drank / bowl empty)
- Reminder: **~5 minutes play** / enrichment
- Push or in-app checklist — never medical claims

Ship after vaccines v1 or in parallel as a thin “Care today” card on pet profile.

### P1b — Plant safety (“чи шкідлива рослина / вазон”)
**Idea:** scan or search a plant → see if it’s toxic / risky for **this** pet (dog vs cat).

| Step | Approach |
|--|--|
| Identify plant | Photo and/or name search (UA/PL/EN + Latin) |
| Toxicity verdict | Per species (dog/cat): safe / mild GI / toxic / unknown |
| UX | Tie to selected pet profile; clear disclaimer: not a vet diagnosis |

**Data / API strategy (decision):**
- **Prefer a reliable paid API** when it gives better accuracy and fewer false “safe” calls — pet health > saving a few cents.
- Keep results in **our Supabase cache** (`plants`, `plant_toxicity`) so we don’t pay on every repeat lookup.
- Open references (e.g. ASPCA-class lists, PlantNet) remain useful for research / fallback / attribution, but we won’t block the feature on “must be free-only” if a paid provider is safer and licensed for commercial use.
- Always show disclaimer + “contact vet / poison hotline if ingestion suspected”.

**Product rules:**
- Show confidence + never claim veterinary diagnosis
- Prefer Latin name as DB key; UI labels in Ukrainian (+ Polish later)
- Start after food + vaccines are sticky; dogs & cats first
- Rate-limit + cache aggressively to control cost

### P2 — Social: **SnoutStories** (маркетингова назва)
**EN:** SnoutStories · **UA tab:** «Стрічка» · **Tagline:** *Ділися улюбленцями. Збирай сердечка.*

Tabs (щоб не плутати з журналом сканів):
- **Скани** = оцінки корму
- **Стрічка** = SnoutStories
- **Мої дані** = профіль людини (іконка жінка/чоловік/нейтрально або своє фото) — кнопка **навпроти логотипу**, не окрема вкладка
+ **Мої дані** = профіль людини (аватар ♀/♂/нейтрально або фото) — кнопка **навпроти лого**, не окрема вкладка

Inspiration: feed like photo social apps (avatar + name, photo, time ago, heart, comments, “liked by…”), but **content = pets & life with them** — not restaurant food.

| Feature | Notes |
|--|--|
| Post | Photo (+ optional short caption), linked to a pet profile when possible |
| Heart / like | SnoutScore teal hearts |
| Comments | Thread under post |
| Filters | Усі · Коти · Собаки · Мої |
| Views | Список / сітка |
| Privacy | У «Мої»: публічний або лише я |
| Author card | Avatar, display name, optional soft “care streak” bar later |
| Moderation | Report · block · shelter-safe rules |
| Scope v1 | Follow graph light or global UA/PL feed with filters |

Also: DMs / chat (minimal public card: avatar, name, pets count, city).  
In-app paw reviews on **products** stay separate from SnoutStories.

**Do not** launch full Instagram clone before food + vaccines are sticky — ship Stories tab UI early, backend next.

**Human reminder:** UI tab exists with local/demo posts. Before wiring real posts/likes/comments → run `20260321200000_snout_stories.sql` and tell the user (tracked in `REMINDERS.md`).
**Also critical:** `20260321190000_favorite_food_feeding.sql` for pet create + profile feeding.

### P2b — Contests & share (**SnoutSpotlight** working title)
**UA:** «Зіркові мордочки» / конкурси у SnoutStories  
**Goal:** engagement + organic reach (UA + PL).

| Contest | Cadence | Notes |
|--|--|--|
| Фото дня | daily pick | from public Stories posts or contest entries |
| Переможець тижня | weekly | hearts + jury light rule later |
| Переможець місяця | monthly | badge on pet / author card |
| Переможець року | annual | marketing highlight, prize partner later |

**Rules (draft):** public posts only · one entry per pet per period · no medical claims · shelter pets can have a separate track later.

**Share to socials:** system share sheet on **scan result**, **Stories post**, later contest winner card (Instagram / Telegram / etc. via OS share — no hard-coded Instagram SDK for MVP).

Ship order: ~~share buttons~~ → ~~contest entry UI v1~~ → ~~contest public detail (pet + owner + gallery)~~ → ~~auth marketing polish~~ → app-wide UI cohesion (AppScreen) → winners board cloud → prizes/partners.

### P3 — Charity & shelters
- Charity hub: curated **links**, posts, campaigns
- Shelter directory: name, city, **address**, contacts, website
- Content mostly maintained / verified (anti-spam)

### P4 — Adoption (“хто шукає родину”)
- Listings filled by **responsible shelter staff** (not random users)
- Shelter workflows / procedures before matching owner
- If adopter already has SnoutScore history (pets, care) → easier trust for next pet
- On adopted pet profile: **“from shelter X”** + optional shelter badge

### P5 — Virtual sponsorship (“віртуальне утримання”)
- Support a **specific** shelter animal financially (not only generic shelter donate)
- Clear status: sponsored / needs help
- Transparency notes (shelter-reported); SnoutScore is facilitator, not bank on day one (links / partners first)

### P6 — Species expansion
- Rabbits, birds, and other popular pets after dog/cat flows are stable

---

## Profile model (target)

### User profile
| Field | Notes |
|--|--|
| Display name, photo | Required for chat |
| City / country | UA/PL |
| Bio (short) | Optional |
| Pets (“діти”) | Count + links to pet profiles |
| Shelter staff flag | Later, verified |
| Charity / shelter follows | Later |

### Pet profile
| Field | Notes |
|--|--|
| Avatar | Cartoon key **or** photo |
| Album | Multiple photos |
| Basics | name, species, breed, sex, birth, weight |
| Chip | Private |
| Favorite food | Link to product / scan |
| Vaccines | Calendar + reminders |
| Origin | `home` \| `shelter:{id}` — show shelter on profile |
| Notes / allergies | |

---

## Legal / trust (always)
- Chip = private owner note, never public registry search
- Vaccines / borders = informational; verify with vet / carrier
- Adoption & sponsorship = shelter-led; no false “instant adopt” promises
- GDPR / UA privacy for photos & chat
- Charity listings curated to reduce fraud

---

## Captured 2026-07-27 — Care menu + animal quiz

### P1 — «Догляд» as its own menu/hub
**Idea:** lift daily care out of buried pet-profile sections into a clear **Догляд** entry point with:
- **Годування** (feeding log / ate fully / note)
- **Гра** (~5 min play / enrichment)
- **Вода** (fresh water bowl)

| Option | Notes |
|--|--|
| A | New hub screen (pick pet → care today: water / play / feed) linked from Улюбленці or Перевір |
| B | Replace / expand current `pet-care` into a 3-tile menu (Годування · Гра · Вода) |
| C | New bottom tab «Догляд» (heavier IA change) |

**Recommended direction (2026-07-27):** soft **C*** — not a 5th forever-tab yet.
1. First ship **«Догляд сьогодні»** hub (pick pet → 3 tiles: вода / гра / годування) — entry from Улюбленці header + deep link from profile.
2. If it becomes the daily open habit, **promote to bottom tab** and demote Стрічка or merge journal (decide with usage).
Rationale: 5 tabs now crowded; care must feel daily, but tab only earns a slot once the checklist is sticky.

**Status:** recommended path above; user leaned C, open to better.

### P1 — Animal quiz — make it *fun*, not generic trivia
**Idea:** in-app quiz about animals (dogs/cats first).

| Candidate | Fit for KnowSnout |
|--|--|
| Wikidata alone | Powerful facts, but raw SPARQL → dry Q&A unless heavily designed |
| Open Trivia DB | Easy MC, but generic “animals” — off-brand, often dull |
| **TheDogAPI / TheCatAPI (visual)** | On-brand, photo-first, already integrated |

**Recommended direction (cool quiz v1):**
| Round | Mechanic | Data |
|--|--|
| 1 · Вгадай породу | 1 photo + 4 name choices | Dog/Cat API images + breeds |
| 2 · Темперамент | “Яка риса пасує?” | API temperament strings |
| 3 · Fun fact (optional later) | Short fact after answer | Wikidata enrichment by breed name |

Rules: confidence never = pedigree; UA UI; streak / “quiz of the day” later; attribute APIs (+ Wikidata if used).

**Do not start with:** Wikipedia article scrape or plain Open Trivia as the hero experience.

**Status:** direction set — visual breed quiz first; Wikidata as spice later, not the core.  
**v1 shipped (2026-07-27):** `breed-quiz` — 5 rounds, dog/cat, photo + 4 choices; entry from Перевір hub.  
**v1.1:** after each answer show curated fact card (group, temperament, origin, life span, weight/height, cat description) from TheDogAPI/TheCatAPI; prefer breeds with richer profiles; clear trust/disclaimer note (not vet advice / not pedigree).  
**v2 (2026-07-27):** dedicated **Квіз** tab with categories — (1) Вгадай породу + Wikidata enrich, (2) Звідки порода? Wikidata P495, (3) Група тварин Wikidata labels; SPARQL required.  
**v2.1:** multi-source confirmed — also **Open Trivia DB Animals** category (+ Dog/Cat API photo). Not Wikidata-only.

### P2 — Living data-sources registry (order without clutter)
- Canonical: `src/data/dataSources.ts` + `DATA_SOURCES.md`
- In-app: Мої дані → Джерела даних
- Update registry whenever APIs change; don’t plaster every screen with logos

---

## Implementation rule
Ship **one vertical slice at a time**. Ideas stay here until pulled into `PRODUCT_STRUCTURE.md` “Status” columns.
