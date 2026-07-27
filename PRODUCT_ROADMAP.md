# KnowSnout — product & marketing roadmap

## Positioning
**KnowSnout** (was SnoutScore) = trust for pet parents (UA + PL): scan food, plants, breed — care at home and when travelling.

Promise: *Know what’s in the bowl — and keep your pet ready for life & travel.*

Code/DB: **English**. UI: **Ukrainian** first, Polish later (same i18n keys — does not break the DB).

## What works now (MVP)
- Barcode → own catalog → Open Pet/Food Facts → photo + AI if needed
- Own `products` catalog (pay OpenAI once per product)
- History with Dog / Cat / Other filters
- Auth + saved scans
- Ukrainian UI on main screens
- Pets: profiles, avatars, album MVP, view vs edit
- Brand book + transparent logos

## Near-term (next steps)
0. ~~Finish pending SQL~~ (user confirmed) — new: `plant_safety` migration
1. ~~Share~~ · ~~Мої дані~~ · ~~Vaccines~~ · ~~Travel~~ · ~~SnoutSpotlight v1~~ · ~~Water/play v1~~ · ~~Plant safety v1~~
2. SnoutStories cloud backend ✅ (+ comments)
3. Expand plant catalog ✅ / optional paid Plant ID later
4. User profile extras (city / “діти”)

## Later (captured in PRODUCT_VISION.md)
- **SnoutStories** — feed; remind SQL `20260321200000_snout_stories.sql` before real backend
- **SnoutSpotlight contests** — day / week / month / year winners
- Share to socials (extend beyond v1 system sheet)
- Chat / pet-lover social
- Charity hub + shelter directory
- Adoption (“хто шукає родину”) — shelter-staff led
- Virtual sponsorship of a specific animal
- Shelter origin on pet profile
- **Plant safety v1** — name search + photo (mock / `identify-plant`); cache in DB
- Daily care: water + play reminders

## Mid-term pillars

### Food intelligence
- Grow catalog from real scans
- External **scores only** (Allegro PL first; UA shops when API allows) — not mass review text
- Compare 2 foods; affiliate “check price” links

### Health & documents
- Passport checklist, vaccine reminders, meds / vet log
- Official EU / UA / PL guides curated in content tables — not legal advice

### Play & enrichment
- Toys by species/size/age; how to play guides (editorial + later vet-reviewed)

### Pets expansion
- Dogs & cats first → rabbits, birds, and other popular pets
- Optional breed-from-photo (ML) with confidence % — no medical claims

## Monetization (when ready)
1. Free: limited AI scans + barcode catalog
2. Plus: unlimited AI, pets, reminders, travel packs
3. Affiliate: food / toy shop links (UA/PL)

OpenAI cost stays behind **catalog cache + rate limits**.

## Open data we use
| Need | Source |
|--|--|
| Product barcodes | Open Pet Food Facts / Open Food Facts |
| Our scores | Cached AI + community later |
| Vaccines / borders | Curated from official guides (no single open DB) |
| Store ratings | Official APIs only (e.g. Allegro) |

## What not to promise early
- Veterinary diagnosis
- 100% breed accuracy
- Live prices from every shop
- Public microchip registry search

See also: `PRODUCT_STRUCTURE.md` for module status and build order.
