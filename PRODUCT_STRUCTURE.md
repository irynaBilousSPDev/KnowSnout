# KnowSnout — product structure (UA/PL markets)

Code & DB field names: **English**.  
User interface: **Ukrainian** first (Polish later via the same i18n keys).  
This does **not** break the database.

---

## 1. Vision
One app for caring for pets at home and when travelling: food trust, pet profiles, health docs, play tips — starting with **dogs & cats**, then other popular pets.

Markets v1: **Ukraine + Poland**.

---

## 2. Modules (build order)

### A. Food intelligence (core — in progress)
| Feature | Status | Open data |
|--|--|--|
| Barcode scan | Done | Open Pet Food Facts / Open Food Facts |
| Photo ingredients + AI | Done | OpenAI (paid, cached in our DB) |
| Own `products` catalog | Done | — |
| History Dog/Cat filters | Done | — |
| External **ratings only** (Allegro etc.) | **v1 shipped** (score + link; mock / Edge) | Official APIs, not review-text scrape |
| Compare 2 foods | Later | Our catalog |
| Prices / shop links | Later | Affiliate / Allegro API |

**Ratings idea (your note):** show paw-style aggregate score from Allegro (PL) / major UA shops when API allows — **score + link**, not mass-imported review texts.

### B. My pets
| Feature | Status | Notes |
|--|--|--|
| Pet profile basics | Done | Add / edit / delete |
| View profile vs edit form | Done | Nice profile + form |
| Avatar (cartoon / photo) | Done (MVP) | Pack + gallery photo |
| Photo album | Done (MVP) | Local URI; storage upload later |
| Favorite food field | Done (field) | Link to scans later |
| Match food ↔ pet allergies | After profiles | |
| Vaccine calendar + reminders | Next | See PRODUCT_VISION.md |
| Breed guess from photo | Later | ML / Vision |
| Microchip number | Done | Private field |
| Shelter origin badge | Schema ready | `origin` + extras |

See also **`PRODUCT_VISION.md`** for social, charity, adoption, sponsorship backlog.

### C. Health & documents
| Feature | Status | Open data |
|--|--|--|
| Vaccine calendar + reminders | **v1 shipped** (log + due status; push later) | Content tables we maintain (UA/PL rules) |
| Pet passport checklist | Phase C | Gov sources (UA / PL / EU) — curated, versioned |
| Schengen vs non-Schengen travel checklist | **v1 shipped** (local progress) | EU pet travel rules + UA specifics — **informational**, not legal advice |
| Meds / vet visit log | Later | Private to user |

**No single open “vaccine barcode DB”.** We curate rule packs per country + species.

### D. Play & enrichment
| Feature | Status | Open data |
|--|--|--|
| Toy ideas by species/size/age | **v1 shipped** (species packs) | Curated content (+ optional community) |
| How to play / enrichment tips | **v1 shipped** | Editorial + vet-reviewed later |

### D2. Plant safety (houseplants & more)
| Feature | Status | Notes |
|--|--|--|
| Search plant by name | **v1** | UA/EN/PL + Latin + aliases; offline seed + Supabase cache |
| Photo ID → toxicity for dog/cat | **v1** | Mock AI demo; Edge `identify-plant` + toxicity lookup |
| Link verdict to active pet | **v1** | Pet profile → species; can switch dog/cat |
| Disclaimer | **v1** | Not a vet diagnosis |

Entry: `/(app)/plant-safety`. SQL: `20260321220000_plant_safety.sql`. Details in `PRODUCT_VISION.md` § P1b.

### E. Community trust
| Feature | Status |
|--|--|
| In-app paw reviews on products | After food catalog is sticky |
| External store rating badges | **v1** Allegro score + link on result |

---

## 3. Legal / trust notes
- **Microchip:** OK to store as **private** owner note (like a passport number in a wallet). Do **not** build a public chip search. Follow GDPR/UA privacy.
- **Vaccines / border rules:** always “information based on official guides, verify with vet / carrier”.
- **Breed AI:** show confidence; mixes are common; no medical claims.
- **External ratings:** prefer official APIs/partners; avoid scraping ToS-protected review bodies.

---

## 4. Language strategy
| Layer | Language |
|--|--|
| TypeScript / SQL columns | English (`product_name`, `species`) |
| UI strings | Ukrainian (`uk`), later `pl` |
| AI prompts | English (more stable) → UI shows Ukrainian labels around results |
| User-generated reviews | User’s language as typed |

No DB rewrite needed when adding Polish UI — only new locale files.

---

## 5. Suggested roadmap (practical)

**Now (this week)**  
1. Food MVP polish + own catalog  
2. Ukrainian UI  
3. `pets` table + add/list/edit profiles  

**Next**  
4. Vaccine calendar v1 (dog/cat, UA+PL) + reminders  
5. Travel checklist Schengen / non-Schengen  
6. User profile (basic + pets count)  
7. Link favorite food ↔ scan history  

**Then**  
8. Allegro rating badge  
9. Chat / social (see PRODUCT_VISION.md)  
10. Charity & shelters directory  
11. Adoption + virtual sponsorship (shelter-led)  
12. More species  

---

## 6. Monetization (aligned with costs)
- Free: barcode + limited AI scans  
- Plus: unlimited AI, pets, reminders, travel packs  
- Affiliate: shop / toy links (UA/PL)

OpenAI spend stays controlled by **catalog cache + rate limits**.
