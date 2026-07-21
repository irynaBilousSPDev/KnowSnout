# KnowSnout Brand Book

Professional brand guidelines derived from the official logo mark  
(`assets/brand/logo-icon-transparent.png`). Former name: SnoutScore.

**Markets:** Ukraine + Poland · **Product:** pet care trust (food · plants · breed · health · travel)

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
Horizontal: **same icon mark + wordmark “KnowSnout” in DM Sans Bold**  
Implemented in `src/components/BrandLogo.tsx` (icon asset + text — no need to redraw the mark).  
Optional later: export a polished PNG lockup for stores / ads.

### 2.2 App icon / mark
Icon alone (gradient snout + waves).  
File: `assets/brand/logo-icon-transparent.png` (and `assets/images/icon.png` for stores)  
Use: app icon, favicon, watermark, avatar, empty-state mark.

### 2.3 Clear space
Keep empty margin ≥ **½ icon height** on all sides.  
Do not crop waves, nose, or jowls.

### 2.4 Minimum sizes
| Use | Min width |
|--|--|
| Full lockup (digital) | 140 px |
| Icon only | 28 px |
| Print lockup | 30 mm |

### 2.5 Don’ts
- Don’t recolor the gradient mark (except approved mono)
- Don’t add drop shadows / glow / outline to the logo
- Don’t stretch or rotate
- Don’t place on busy photo without a solid or soft scrim
- Don’t rewrite the wordmark in another font in official materials

### 2.6 Mono versions (when needed)
- On dark: white wordmark + single-color mark `#00E0C7`
- On light: ink wordmark `#111B2F` + full-color mark preferred

---

## 3. Color

Sampled from logo files (2026-07).

| Token | Hex | Role |
|--|--|--|
| **Snout Lime** | `#72ED2F` | Gradient start, energy, success accents |
| **Snout Teal** | `#00E0C7` | Gradient end, primary interactive |
| **Snout Ink** | `#111B2F` | Wordmark, primary text |
| **Surface** | `#F7FAF9` | App background |
| **Surface elevated** | `#FFFFFF` | Cards / sheets |
| **Mist** | `#DFF7F1` | Soft chips, secondary fills |
| **Score poor** | `#C45C3E` | Low food score |
| **Score fair** | `#C4922A` | Mid score |
| **Score good** | `#0A9B7A` | High score (brand-aligned green) |

### Gradients
Official mark gradient (top-left → bottom-right):

`linear-gradient(135deg, #72ED2F 0%, #00E0C7 100%)`

In product UI use the gradient sparingly: logo, score ring accents, splash — **not** full-screen purple-style washes.

### Contrast
Body text on Surface: Ink `#111B2F`.  
Primary buttons: Teal fill `#00A894`–`#0A7A6E` with white label (AA).  
Never put Lime text on white at small sizes.

---

## 4. Typography

| Role | Face | Notes |
|--|--|--|
| **Wordmark** | Geometric sans (in logo file) | Never recreate in UI copy |
| **UI body / UI titles** | DM Sans | Already in app |
| **Optional marketing display** | Fraunces | Landing only; prefer logo + DM Sans in-product |

Hierarchy: one strong title, one short support line. Avoid dense newspaper layouts.

---

## 5. UI principles (product)

1. **Brand first** on entry screens — full lockup, not tiny nav text.  
2. First viewport: brand + one job (scan / sign in). No dashboard clutter.  
3. Cards only when they wrap an interaction (pet row, scan row).  
4. Motion: short, purposeful (tab switch, score appear) — not decorative noise.  
5. Photography: real pet food / pets; no stock collage in hero.

### Component mapping
| Element | Treatment |
|--|--|
| Primary button | Teal fill, rounded-2xl, white label |
| Secondary | Mist fill, ink label |
| Ghost | Transparent, teal/ink label |
| Tab active | Teal / ink |
| Score gauge | Tone colors + optional teal ring |

---

## 6. Voice & tone

- Direct, calm, Ukrainian in UI.  
- No “miracle detox” claims.  
- Vaccines / borders: *інформаційно; уточнюй у ветлікаря / перевізника.*  
- Species labels: Собака / Кіт / Інше.

---

## 7. File checklist for stores

| Asset | Source |
|--|--|
| App icon | `logo-icon.png` (export 1024²) |
| Splash | icon centered on `#F7FAF9` |
| Favicon | icon crop |
| Feature graphic | full lockup + tagline |

---

## 8. Implementation in this repo

- Tokens: `src/theme/brand.ts` + `tailwind.config.js`  
- Component: `src/components/BrandLogo.tsx`  
- Assets: `assets/brand/*` (source) and `assets/images/brand-logo-*.png` (bundled)
- App icon / splash paths updated in `app.json` where applicable  

When in doubt: **trust the logo files**, not approximations.
