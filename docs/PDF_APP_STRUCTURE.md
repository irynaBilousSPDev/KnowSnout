# KnowSnout — PDF app structure (source of truth)

Derived from `docs/design/KnowSnout-UI-Design-Setup.pdf` + module PDFs.  
**Do not invent alternate IA.** Profile is header (`ProfileEntry` → Мої дані), not a bottom tab.

**Active visual:** Organic PDF (cream + sage CTA + Caprasimo/Figtree) in `src/theme/brand.ts`.  
Variant 12 color remap — later. Refs: `docs/design/refs/` (generate via `scripts/extract_pdf_refs.py`).

## Bottom tabs (mobile)

Order matches product modules 01→02→03→04→06:

| # | Tab UA | Route | Module |
|--|--|--|--|
| 1 | **Перевір** | `(tabs)/index` | 01 Вхід і Перевір |
| 2 | **Улюбленці** | `(tabs)/pets` | 02 |
| 3 | **Стрічка** | `(tabs)/stories` | 03 |
| 4 | **Спільнота** | `(tabs)/community` | 04 |
| 5 | **Довідники** | `(tabs)/directories` | 06 F |

Nested (not tabs): `history`, `quiz`.  
Default landing after auth/onboarding: **Перевір**.

## Module map → routes

### 01 Вхід і Перевір
- Auth: `/(auth)/login`, `register`
- Onboarding: `/onboarding` (1–3)
- Hub: `(tabs)/index` — Нещодавно · stats · Корм · Рослини · Порода · Порівняти
- History: `(tabs)/history`
- Food: `scan-food` → `result`
- Plant: `plant-safety` → `plant-result`
- Breed: `breed-scan` → `breed-result`
- Compare: `compare-food`
- Pet form accordion: `pet-form`

### 02 Улюбленці
- List: `(tabs)/pets`
- Hub switcher: `pet-hub`
- Care today: `pet-care` / `care-hub`
- Profile view: `pet-profile`
- Vaccines: `pet-vaccines` · Vet/meds: `pet-vet-log`
- Play: `play-guides` · Habits: `pet-habits` · Calendar: `pet-calendar`
- Travel + passport: `pet-travel`, `pet-travel-wizard`, `pet-passport`

### 03 Стрічка
- Feed: `(tabs)/stories`
- Spotlight hub: `spotlight-hub` (+ rules, apply, ranking, winners, won, guest-vote)
- Comments: `story-comments`
- User profile: `user-profile`
- Activity: `activity` · Messages: `messages` · DM: `dm/[userId]`
- Friends: `friends`, requests, search, invite
- Walk: `walk-plan` · Global search: `search`

### 04 Спільнота
- Hub: `(tabs)/community` → Quiz · Forum · Blog
- Quiz hub: `(tabs)/quiz` (+ breed/wiki/trivia/zoom/heavier/myth, results, leaderboard, achievements)
- Forum: `forum` → category, thread, new, author, search, rules, notifications
- Blog: `blog` → article, bookmarks

### 05 Профіль і службові (header, not tab)
- `my-data`, `settings`, `notifications`, `help`, `help-article`, `support`
- `privacy`, `data-sources`, `subscription`, `edit-account`, `blocked-users`, `delete-account`

### 06 Довідники (F)
- Hub: `(tabs)/directories`
- List: `directory-list` · Detail: `directory-detail`
- Carriers: `directory-carriers` · Chat: `directory-chat`
- Review: `directory-review` · Report: `directory-report`

### 07 Адмінка
- `/(admin)/*` — dashboard, moderation, CMS, spotlight, blog, products, quiz-bank, monetization, team

## Sticky section labels (design PDFs)

`Вхід і Перевір · Улюбленці · Стрічка · Спільнота · Профіль і Службові · Довідники`
