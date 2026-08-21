# KnowSnout Brand Book

Professional brand guidelines. Former name: SnoutScore.

**Markets:** Ukraine + Poland · **Product:** pet care trust (food · plants · breed · health · travel · community)

**Design source (2026-08):** UI Kit v2 PDF mocks under `docs/design/`  
**Active visual (Organic first):** cream surface + sage CTA + Caprasimo/Figtree — see `src/theme/brand.ts`.  
**Deferred:** Brandbook Variant 12 (navy/forest/rose) color remap after layout fidelity.

---

## 1. Brand idea

**KnowSnout** = know your pet’s world with confidence.  
The mark is a snout + signal waves: *we read the signal so you don’t have to guess.*

| Attribute | Expression |
|--|--|
| Trust | Honest checks, no fear marketing |
| Clarity | One primary action per screen |
| Care | Warm toward pets, precise toward ingredients |
| Modern | Tech-clean, not clinic-cold |

**Tagline (UA):** *Знай свою мордочку.*  
**Tagline (EN):** *Know your snout.*  
**Food line (keep):** *Know what’s in the bowl — before you buy.*

**Domain:** https://knowsnout.com/  
**GitHub:** https://github.com/irynaBilousSPDev/KnowSnout.git

---

## 2. Logo system

### 2.1 Primary lockup (in-app)
Horizontal: **icon mark + wordmark “KnowSnout”** in brand navy (or forest on health contexts).  
Implemented in `src/components/BrandLogo.tsx`.  
Logo should be **recolored to the theme**, not pasted as the old lime/teal gradient on top of the new palette.

### 2.2 App icon / mark
Icon alone (snout + waves). Tile corner radius ≈ **30%** of side; mark ≈ **70%** of tile. Soft short shadow.  
Header icon ≈ 44px · App icon ≥ 64px.  
Files: `assets/brand/*`, `assets/images/icon.png`

### 2.3 Clear space
Keep empty margin ≥ **½ icon height** on all sides.

### 2.4 Don’ts
- Don’t keep the old lime→teal gradient as the default product chrome
- Don’t mix rose tint and green tint in the same UI block
- Don’t stretch / rotate / outline the mark
- Don’t place the mark on busy photo without a soft scrim

### 2.5 Mono / tile variants (from kit)
| Tile | Mark |
|--|--|
| White | Navy `#122A4C` |
| Green tint `#E3E9DF` | Forest `#2F5233` |
| Rose tint `#F4DADF` | Rose `#E8879A` |
| Navy `#122A4C` | White |
| Forest `#2F5233` | White |
| Deep `#0C1C33` | Rose `#E8879A` |

---

## 3. Color — Variant 12 (active)

Sampled from kit brandbook PDF (2026-08-21).

| Token | Hex | Role |
|--|--|--|
| **Нафтовий (navy)** | `#122A4C` | Structure, nav, headers, primary actions |
| **Глибокий (navyDeep)** | `#0C1C33` | Ink / deepest text & bars |
| **Лісова зелень (forest)** | `#2F5233` | Safe / healthy / success / “good” scores |
| **Троянда (rose)** | `#E8879A` | Emotional accent, active details, secondary CTA glow |
| **Рожевий тінт** | `#F4DADF` | Soft rose fills (don’t mix with green tint in one block) |
| **Зелений тінт** | `#E3E9DF` | Soft success / mist fills |
| **Тло (surface)** | `#F7F1ED` | App background |
| **Surface elevated** | `#FFFFFF` | Cards / sheets |
| **Score poor** | `#C45C3E` | Low food score |
| **Score fair** | `#C4922A` | Mid score |
| **Score good** | `#2F5233` | High score (= forest) |

### Roles (from kit)
- **Blue (navy / deep):** navigation, headers, primary actions  
- **Green (forest):** everything “good / safe / normal”  
- **Rose:** button accent / active / emotional details  
- **Tints:** never mix rose tint + green tint in one block  

### Gradients
Prefer navy → forest for brand moments:

`linear-gradient(135deg, #122A4C 0%, #2F5233 100%)`

### Contrast
Body text: navyDeep `#0C1C33` on surface `#F7F1ED`.  
Primary buttons: navy fill + white label (AA).  
Rose accents on white: large enough or pair with tint backgrounds.

---

## 4. Typography

| Role | Face | Notes |
|--|--|--|
| **Wordmark** | Geometric sans (in logo) | Don’t recreate in random fonts |
| **UI body / titles (current app)** | DM Sans | Keep until kit font pass |
| **Kit display (optional later)** | Caprasimo (titles) + Figtree (body) | From UI Kit overview — not required for structure ship |
| **Optional marketing** | Fraunces | Landing only |

---

## 5. UI principles (product)

1. **Brand first** on entry screens — lockup in theme colors.  
2. First viewport: brand + one job. No dashboard clutter.  
3. Cards only when they wrap an interaction.  
4. Motion: short, purposeful.  
5. Photography: real pets / food; no stock collage in hero.

### Component mapping
| Element | Treatment |
|--|--|
| Primary button | Navy `#122A4C`, rounded-2xl, white label |
| Secondary | White / elevated, mist border, ink label |
| Accent / active chip | Rose or rose tint |
| Success / safe | Forest + forest tint |
| Tab active | Navy |
| Score good | Forest |

---

## 6. Voice & tone

- Direct, calm, Ukrainian in UI.  
- No “miracle detox” claims.  
- Vaccines / borders: *інформаційно; уточнюй у ветлікаря / перевізника.*  
- Species: Собака / Кіт / Інше (+ multi-species later).

---

## 7. File checklist for stores

| Asset | Source |
|--|--|
| App icon | Export 1024² from navy/forest tile variants |
| Splash | icon on `#F7F1ED` |
| Favicon | icon crop |
| Feature graphic | lockup + tagline |

---

## 8. Implementation in this repo

- Tokens: [`src/theme/brand.ts`](src/theme/brand.ts) + `tailwind.config.js`  
- Docs PDF: [`docs/design/KnowSnout-UI-kit-v2-brandbook.pdf`](docs/design/KnowSnout-UI-kit-v2-brandbook.pdf)  
- Component: `src/components/BrandLogo.tsx`  
- Assets: `assets/brand/*` — **Variant 12 navy/forest/rose** (regenerated via `scripts/recolor_brand_assets.py`; tiles in `assets/brand/tiles/`)  

Legacy `brand.teal*` keys remain as aliases → navy/forest so call sites don’t break mid-migrate.

When in doubt: **trust the kit brandbook PDF (Variant 12)**.
