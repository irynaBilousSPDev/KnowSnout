# KnowSnout — product vision backlog (do not lose ideas)

Everything below is captured for stepwise delivery.  
**Code/DB:** English · **UI:** Ukrainian first (PL later).  
**Brand:** KnowSnout (formerly SnoutScore).

---

## North star
Trust + care for pets at home and on the road — then a gentle social layer for pet lovers, shelters, and charity.  
**Start with dogs & cats**; long-term = **all companion animals** (classic home pets and “not-quite-domestic” companions people keep).  
**Must-have community knowledge:** forum (ask + share experience) + editorial blog by categories — distinct from photo Stories.

---

## Phase map (priority)

### P0v — Pixel UI from design project (hard reset)

**Status (2026-08-22):** modules **1–7 shipped** on `main` (phone HTML + брендбук chrome). Ignore current app chrome as historical reference only.

**Source of truth (full pack):** `docs/design/KnowSnout_project/`  
(= Downloads `KnowSnout UI Design Setup (2)/KnowSnout_project` + same module HTML as `Downloads/knowsnout`).

| Layer | What | Tokens |
|--|--|--|
| **Брендбук (ЗАТВЕРДЖЕНО)** | Color + type for product | Teal `#0E6E5D`, canvas `#F4F3F1`, Manrope + Inter, ink `#152233` |
| **Module `.dc.html` phones** | Screen layout / copy / IA | Inline `:root` **overrides** Organic CSS with brandbook teal |
| **Organic `_ds/.../styles.css`** | Component patterns (btn/card/field/seg), spacing, radii scaffolding | Default cream/terracotta/Caprasimo — **do not ship as app colors**; screens already retoken to brandbook |
| **`assets/ref-*.png`** | Older concepts only — **not** visual truth | — |

**Locked choice (2026-08-21):** option **1** — phone HTML + брендбук. Organic = class/spacing scaffold only; `ref-*.png` ignored for look.

Modules order (done): Вхід і Перевір → Улюбленці → Стрічка → Спільнота → Профіль → Довідники → Адмінка.

### P0 — Core (in progress / next)
- [x] Food scan (barcode → catalog → OFF → photo + AI)
- [x] History filters dog/cat
- [x] Pets CRUD + rich profile + avatars + album
- [x] Favorite food link (pet ↔ history) + feeding notes (ate all / short note)
- [x] Vaccine calendar + reminders (UA/PL) — **v1**: log + due status; optional add to device/Google Calendar; in-app push later
- [x] Travel checklists Schengen / non-Schengen — **v1** checkbox packs on pet profile
- [x] User profile (basic): name, city, pets list (“діти”) in Мої дані
- [x] **Daily care habits:** water bowl refresh + short play reminder (esp. cats) — **v1** on pet profile

### P0c — IA: «Перевір» hub + journal (2026-07-21) — **SHIPPED UI**

**Visual truth (active):** Organic PDF kit (cream/sage, Caprasimo+Figtree) — Variant 12 colors later.\n\n**PDF structure source of truth:** `docs/PDF_APP_STRUCTURE.md` (from Design-Setup map). Tabs: **Перевір · Улюбленці · Стрічка · Спільнота · Довідники**; default landing = Перевір. Check hub = Нещодавно + stats + Корм/Рослини/Порода/Порівняти. Profile = header, not a tab.

| Tab | Role |
|--|--|
| **Перевір** | Hub + Історія + Порівняти (default landing) |
| **Улюбленці** | Список → хаб тварини |
| **Стрічка** | Feed + Spotlight / друзі / чат |
| **Спільнота** | Квіз · Форум · Блог |
| **Довідники** | F1–F6 |

### P0d — IA: UI Kit v2 tabs (2026-08-21) — **STRUCTURE SHIPPED (mock-first)**

| Tab | Role |
|--|--|
| **Перевір** | Hub + journal/compare/onboarding links (journal tab hidden) |
| **Улюбленці** | Profiles + care depth |
| **Стрічка** | Stories + Spotlight/friends entry points |
| **Спільнота** | Quiz + forum + blog hubs |
| **Довідники** | Module F trust directory |
| **Адмінка** | `/(admin)` test shell (Wave 7) |

Roadmap: `docs/IMPLEMENTATION_ROADMAP.md` · Design PDFs: `docs/design/` · Agent rule: `.cursor/rules/kit-slice.mdc`  
**Creative brief synced 2026-08-21:** `CREATIVE_BRIEF.md` §0 — contradictions resolved (tabs + Variant 12); vision P3–P6 / Care C* explicitly retained as horizon (not dropped by PDF map).

Visual: **Variant 12** active in `BRANDBOOK.md` / `src/theme/brand.ts`. Paid APIs remain mock where not live.

### P1c — Breed from photo / name (do not lose)

| Step | Approach |
|--|--|
| Species | Dog or cat (user picks) |
| Name search | **Open APIs:** [TheDogAPI](https://thedogapi.com/) / [TheCatAPI](https://thecatapi.com/) breed catalogs |
| Photo ID | Vision (`identify-breed` Edge) → breed name → **enrich** from TheDogAPI/TheCatAPI (temperament, origin, image); mock if no key / `USE_MOCK_AI` |
| UX | Confidence % · never claim pedigree / medical diagnosis |
| History | Журнал → Породи (local v1; cloud later) |

Status: **shipped** — search + photo vision Edge (`identify-breed`); enrich from Dog/Cat APIs; mock when no key.


### P1 — Care depth
- Food ↔ pet allergies / life stage match — **shipped** (informational hints on result + pet profile; `pets.life_stage` column)
- Meds & vet visit log — **shipped** (thin log: meds / visit / note; `pet_vet_logs`)
- Toys & how-to-play guides — **shipped** (editorial packs dog/cat/other; `play-guides`)
- External store **scores only** (Allegro) — **shipped as temporary PL example** (badge on result; mock default; Edge `store-rating`). **Superseded by P1e «Де купити»** below — Allegro = one of many PL online channels, not the product end-state.
- Quiz of the day + streak — **shipped** (local AsyncStorage; rotates category by day)
- Passport / docs checklist — **shipped** (local packs home + EU; `pet-passport`)
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

**Status 2026-07-27:** curated catalog expanded (~50 species in seed + SQL upsert); client merges seed∪Supabase cache. Paid Plant ID / PlantNet still deferred until accuracy budget justifies it.

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
| Heart / like | KnowSnout teal hearts |
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

**Human reminder:** UI + cloud client shipped (posts, likes, comments). **Follows + report/block** sync to Supabase when logged in (UUID peers). **Care streak** on own author card (local). **DM inbox** + thread UI; run `20260321239000_dm_threads.sql` for cloud DMs. Share: Telegram + copy deep link.
**Also critical:** `20260321190000_favorite_food_feeding.sql` for pet create + profile feeding.

**Status 2026-07-27:** feed list + publish + likes + **comments** via Supabase; social P2 scaffold above. P0: `EXPO_PUBLIC_USE_MOCK_AI=false` — deploy Edge + `OPENAI_API_KEY` secret in Dashboard.

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

Ship order: ~~share buttons~~ → ~~contest entry UI v1~~ → ~~contest public detail (pet + owner + gallery)~~ → ~~editorial themes + enter from Stories~~ → ~~auth marketing polish~~ → app-wide UI cohesion (AppScreen) → winners board cloud → prizes/partners.

### P2c — Forum (**обов’язково** / must-have) — «Форум»
**UA working title:** Форум · **Goal:** ділитися досвідом і питати — не плутати з SnoutStories (фото-стрічка) і не з DM.

| Need | Notes |
|--|--|
| Ask | Питання по темах (корм, здоров’я *інформаційно*, поведінка, подорожі, рослини, вид тварини…) |
| Share experience | Відповіді / треди від власників |
| Categories | За видом тварини + темою; пізніше — притулки / усиновлення |
| Trust | Модерація, без меддіагнозів; дисклеймер «не заміна вета» |
| Identity | Author card з Мої дані / pets count; optional link to Stories profile |

**Ship after:** Stories sticky + light moderation. **Do not** replace Stories with forum — both stay.

### P2d — Blog (editorial) — «Блог»
**Idea:** редакційний / curated блог **по категоріях** (догляд, корм, подорожі, безпека рослин, види тварин, притулки…).  
Complements forum (UGC Q&A) and Stories (photos).  
Tone: same brand voice — calm, no fear marketing.  
Can live in-app first; knowsnout.com later as SEO surface.

### P3 — Charity & shelters
- Charity hub: curated **links**, posts, campaigns
- Shelter directory: name, city, **address**, contacts, website
- Content mostly maintained / verified (anti-spam)

### P4 — Adoption (“хто шукає родину”)
- Listings filled by **responsible shelter staff** (not random users)
- Shelter workflows / procedures before matching owner
- If adopter already has KnowSnout history (pets, care) → easier trust for next pet
- On adopted pet profile: **“from shelter X”** + optional shelter badge

### P5 — Virtual sponsorship (“віртуальне утримання”)
- Support a **specific** shelter animal financially (not only generic shelter donate)
- Clear status: sponsored / needs help
- Transparency notes (shelter-reported); KnowSnout is facilitator, not bank on day one (links / partners first)

### P6 — Species expansion (велика перспектива)
**MVP:** dogs & cats only.  
**Target:** усі домашні улюбленці **і «не зовсім домашні»** companion animals, яких люди тримають (кролики, птахи, гризуни, рептилії, екзотика тощо — поетапно).

| Wave | Examples | Notes |
|--|--|--|
| 1 (now) | Dog, cat | Food · plant · breed · care · travel |
| 2 | Rabbit, bird, small mammal | Profiles + care packs; food/plant where data exists |
| 3 | Reptile / exotic / other | Honest “limited data” UX; never fake completeness |

Architecture: keep `species` extensible; UI copy «Собака / Кіт / Інше» → richer species picker later. Brand & IA must not lock to “only dogs & cats forever”.

---

## Profile model (target)

### User profile
| Field | Notes |
|--|--|
| Display name, photo | Required for chat |
| **Country** | UA / PL first; others later — **Settings** (required for good «Де купити»); optional at register |
| **City** | Free text or picker later — same: Settings now, optional at register |
| Bio (short) | Optional |
| Pets (“діти”) | Count + links to pet profiles |
| Shelter staff flag | Later, verified |
| Charity / shelter follows | Later |

**Registration UX (locked 2026-08-24):** keep signup **light** — email/phone + password (+ verify). **Do not** force country/city on the register form. Offer optional “Країна / місто” skippable step **or** prompt later in Settings / first scan / onboarding tip. Auto-detect remains fallback until the user sets them.

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

## Captured 2026-08-24 — Trust: never invent a scan result

**Rule (locked):** if barcode / photo / AI cannot identify the thing **as what the user asked** (pet food label, plant, dog/cat breed), the UI must say **не знайдено / не розпізнано**. Do **not** invent a “close” product, plant, or breed (perfume photo ≠ Brit Care / monstera / labrador).

Better empty than a confident lie — trust drops otherwise.

Applies to mock **and** live Edge (`analyze-label`, `identify-plant`, `identify-breed`). Mock photo must not return a canned hit. Explicit demo with empty image / barcode catalog is separate.

---

## Legal / trust (always)

- Chip = private owner note, never public registry search
- Vaccines / borders = informational; verify with vet / carrier
- Adoption & sponsorship = shelter-led; no false “instant adopt” promises
- GDPR / UA privacy for photos & chat
- Charity listings curated to reduce fraud
- **Buy links / prices:** informational only; availability & price can be stale; never scrape review *text* into our UI; respect each marketplace ToS / robots; prefer official partner APIs where they exist; attribute source; no “we sell this” claim unless we do.
- **Scan / photo ID:** if we cannot identify the subject as pet food, a plant, or a dog/cat breed, say **не розпізнано**. Never invent a nearby catalog hit (trust > fake completeness).

---

## Captured 2026-08-24 — P1e «Де купити» (after food scan + directories shops)

**Trigger:** on food **Результат** (02.05), replace single Allegro badge with a **«Де купити»** block: several options for *this* product in the user’s country.  
**Also:** new **Довідники** category **«Магазини»** (pet food / pet shops / marketplaces) — browse by country/city later; fill via catalog + scrape/API when we deepen Wave 6 / data ops (not in current UI-kit slice).

### Country / city resolution (order)
1. **Settings** — user-chosen **країна** + **місто** (UA / PL first) — *override*
2. Optional at **registration or later** — never block signup; skippable
3. **Auto** — device locale / IP / last known profile if Settings empty / «Авто»
4. Fallback: UA until more markets ship

**Settings UI:** always editable under профіль / налаштування (країна + місто), independent of when the user first filled them.

### Result card — what to show
| Channel | Rule |
|--|--|
| **Online** | 2–5 country-relevant platforms/shops that list this SKU/barcode/name; **price if known**; deep link / search URL; stock hint if available |
| **Stationary** | Several brick-and-mortar pet stores / chains; if **geolocation allowed** → prefer within **~30 km**; else city from profile/settings |
| Empty | Honest «поки немає пропозицій у цій країні» + CTA to directories shops / add product |

**PL examples (not exclusive):** Allegro, Zooplus/other PL pets e-com, local chains — whichever we can license or partner.  
**UA examples:** Rozetka / Allo / local pet e-com + stationary chains — TBD per partnership & ToS.  
**Other countries:** same pattern when we add market packs.

### Data architecture (target)
| Layer | Notes |
|--|--|
| `markets` / country packs | Which online + chain IDs are active per country |
| `product_offers` | barcode/product_id · retailer_id · price · currency · url · stock · updated_at · source |
| `retailers` | online \| stationary · country · lat/lng (stores) · brand |
| Client | Mock-first offers by country; live Edge lookup later; **never** put retailer API secrets in the app |
| Geo | Optional permission; radius default **30 km**; degrade gracefully if denied |

### Delivery waves
| Wave | What |
|--|--|
| **UI now / soon** | «Де купити» shell on result (mock offers by country) + Довідники → **Магазини** category stub |
| **Data later (≈ Wave 6 / scrape ops)** | Bulk fill offers (partner API preferred; controlled scrape only where legal); admin tools to curate retailers |
| **Not now** | Full scrape pipeline, paid geo APIs, multi-country beyond UA/PL |

**Status (2026-08-24):** mock slice **in app** — Settings країна/місто/гео (не на реєстрації); result «Де купити» (UA/PL packs); Довідники → Магазини. Live prices / GPS / scrape = later.

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

**Status:** v1 shipped 2026-07-27 — hub `care-hub` (pick pet → progress 0–3) + `pet-care` tiles water / play / feed; entry from Улюбленці + profile. Tab promotion still deferred.

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

Rules: confidence never = pedigree; UA UI; **quiz of the day + streak shipped** (local); attribute APIs (+ Wikidata if used).

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
