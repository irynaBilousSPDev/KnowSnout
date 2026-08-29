# KnowSnout — UI Kit v2 implementation roadmap

Source: `docs/design/*.pdf` · Organic PDF visual active · Variant 12 colors later  
Admin = Wave 7 (last).

## Visual pass (brand kit · screenshots · 2026-08-24)

| Module | visual |
|--|--|
| Design system (tokens Manrope/Inter, PrimaryButton pill, AuthShell) | brand |
| 01 Вхід і онбординг | brand |
| 02 Перевір | brand |
| 03 Улюбленці | brand |
| 04 Стрічка / Spotlight / friends | brand |
| Спільнота (quiz / forum / blog) | organic → next |
| Спільнота (quiz / forum / blog detail) | brand |
| 06 Довідники F | brand |
| 07 Профіль / налаштування / акаунт | brand |
| 08 Системні / дозволи / помилки | brand |
| 09 Ветеринари PRO | brand |
| 10 Поведінка / кінологи | brand |
| Профіль і службові (legacy row) | brand |
| Довідники (legacy row) | brand |
| Адмінка | later |

Status: `brand` = matched to brandbook + user/HTML screens · `organic` = old pass · next = when screenshots arrive  
**Header locked:** do not remap `AppChromeHeader` per-screen.

## Navigation (Wave 0)

| Item | Status | Route |
|--|--|--|
| Tab Перевір | done | `(tabs)/index` |
| Tab Улюбленці | done | `(tabs)/pets` |
| Tab Стрічка | done | `(tabs)/stories` |
| Tab Спільнота | done | `(tabs)/community` |
| Tab Довідники | done | `(tabs)/directories` |
| Журнал nested (not tab) | done | `(tabs)/history` href null |
| Квіз hub nested | done | `(tabs)/quiz` href null |

## Wave 1 — Вхід і Перевір

| Screen | Status | Route |
|--|--|--|
| Реєстрація / логін | done | `(auth)/*` |
| Онбординг 1–3 | done | `onboarding` |
| Хаб Перевір + recent/stats | done | `(tabs)/index` 02.01 |
| Історія + фільтри | done | `(tabs)/history` 02.11 |
| Порівняти 2 корми | done | `compare-food` 02.12 |
| Скан штрихкод / етикетка / AI | done | `scan-food` 02.02–02.05 |
| Корм не в базі | done | `food-not-found` 02.06 |
| Ліміт AI-сканів | done | `ai-limit` 02.07 |
| Рослина / порода | done | `plant-safety`, `plant-result`, `breed-scan`, `breed-result` 02.08–02.10 |
| Профіль-акордеон форма | done | `pet-form` |

## Wave 2 — Улюбленці

| Screen | Status | Route |
|--|--|--|
| Список / empty / вид wizard | done | pets 03.01–03.02, `pet-species` 03.03 |
| Профіль-акордеон + хаб + перегляд | done | `pet-form` 03.04, `pet-hub` 03.05, `pet-profile` 03.06–03.07 |
| Догляд сьогодні | done | `care-hub` 03.08 |
| Щеплення / ліки | done | pet-vaccines, pet-vet-log 03.09–03.12 |
| Ігри | done | play-guides 03.13 |
| Звички | done | `pet-habits` 03.14 |
| Календар + Google template / ICS export | done | `pet-calendar` 03.15 |
| Travel wizard | done | `pet-travel-wizard` 03.17 |
| Passport / travel checklist | done | pet-passport 03.16, pet-travel |

## Wave 3 — Стрічка

| Screen | Status | Route |
|--|--|--|
| Feed / comments / DM | done | stories, story-comments **04.02**, messages **04.13**, dm **04.14+04.16** |
| Spotlight hub → guest vote | done | **04.17–04.24** hub/rules/apply/entry/ranking/winners/won/guest-vote |
| Friends graph | done | friends **04.08**, friend-requests **04.10**, friend-search **04.09** |
| Invite QR | done | friend-invite **04.11** |
| Other user + my profile | done | user-profile **04.12**, my-profile **04.25** |
| Walks | done | walk-plan **04.15**, invite card in DM **04.16** |
| Activity / global search | done | activity **04.26**, search **04.07** |
| Post / compose / comments / tag | done | story-post **04.01**, story-compose **04.03**, story-tag **04.04**, story-comments **04.02** |

## Wave 4 — Спільнота

| Screen | Status | Route |
|--|--|--|
| Quiz hub 05.01 | done | `(tabs)/quiz` |
| Origin / group wiki 05.02–03 | done | `wiki-quiz?category=` |
| Breed / zoom / heavier 05.04–06 | done | `breed-quiz`, `quiz-zoom`, `quiz-heavier` |
| Myth / results / ranking 05.07–09 | done | `quiz-myth`, `quiz-results`, `quiz-leaderboard` |
| Achievements 05.10 | done | `achievements` |
| Forum cats / feed 05.11–12 | done | `forum`, `forum-category` |
| Thread / compose / search 05.13–15 | done | `forum-thread`, `forum-new`, `forum-search` |
| Author / notify / rules 05.16–18 | done | `forum-author`, `forum-notifications`, `forum-rules` |
| Blog cats / list / article 05.19–21 | done | `blog`, `blog-category`, `blog-article` |
| Comments / bookmarks 05.22–23 | done | `blog-article` composer, `blog-bookmarks` |
| Community hub entry | done | `(tabs)/community` |
| Quiz hub nested | done | `(tabs)/quiz` href null |

## Wave 5 — Профіль і службові

| Screen | Status | Route |
|--|--|--|
| Мої дані / sources / 404 | done | my-data, data-sources, +not-found |
| Notifications / help / language | done | `notifications`, `help`, `settings` |
| Subscription shell | done | `subscription` |
| Blocked / edit account | done | `blocked-users`, `edit-account` |
| Settings hub 07.01 | done | `settings` → payments, appearance, privacy |
| Payments 07.02 | done mock | `payments` |
| Privacy 07.03 | done | `privacy` → blocked-users |
| Appearance 07.05 | done | `appearance` + `AppThemeProvider` |
| Edit account 07.07 | done | `edit-account` |
| My account 07.08 | done | `my-data` ← my-profile, community, settings |
| Help / support / delete 07.09–07.12 | done | `help`, `help-article`, `support`, delete modal |
| Social profile 04.25 | done | `my-profile` → my-data, settings, appearance, payments |

## Wave 5b — Системні (08)

| Screen | Status | Route / wiring |
|--|--|--|
| Network error full screen | done | `network-error` ← toast banner «Детальніше» |
| Camera permission | done | `camera-permission` ← `scan-food` |
| Notification permission | done | `notification-permission` ← notifications banner |
| Pet photos empty | done | `pet-photos` ← pet-profile album empty |
| Camera gallery / save demo | done | `camera-gallery`, `pet-save-demo` |
| Toast / AI loading | done | `ToastProvider`, `AppToast` |

## Wave 6 — Довідники F

| Screen | Status | Route |
|--|--|--|
| Hub / list / detail / review / report | done | `directories/*` via tab + stack |
| Категорія Магазини (P1e) | done mock | hub tile `shops` → `directory-list?category=shops` · SQL `20260321245000` unrun |
| Поведінка й навчання (10 hub entry) | done | tile `behavior` → `specialist-behavior` |
| Chat із закладом (local) | done | `directory-chat` |
| Перевізники F4b/c (routes / vehicle) | done | `directory-carriers` + transport detail |

## Wave 6b — Ветеринари (09)

| Screen | Status | Route |
|--|--|--|
| Hub / search / filters | done | `vet-hub`, `vet-search` |
| Doctor profile + reviews | done | `vet-doctor-profile`, `vet-doctor-review` |
| Clinic profile + actions | done | `vet-clinic-profile` (site / route / call) |
| Booking | done mock | `vet-booking` ← doctor profile «Записатися» |
| PRO setup / cabinet / tariffs link | done | `vet-pro-setup`, `vet-pro-cabinet` → `specialist-tariffs` |

## Wave 6c — Кінологи / поведінка (10)

| Screen | Status | Route |
|--|--|--|
| Hub | done | `specialist-behavior` |
| Search + profile | done | `specialist-search`, `specialist-profile` |
| Booking + tariffs | done mock | `specialist-booking`, `specialist-tariffs` |
| Entry | done | Довідники → секція «Також»: behavior + shops · 06.01 grid = 6 tiles |

## Gap-close waves (2026-08-29)

| Wave | Scope | Status |
|--|--|--|
| **A** Navigation | my-profile gear → settings · my-data blocked · payments · 08.04/08.05 in scan + vaccines | done |
| **B** Pixel + docs | 05 quiz/forum/blog 05.01–05.23 · roadmap 06–10 · 06.01 six-grid | done |
| **C** Product depth | `booking.ts` unified mock · cynologist pro → tariffs/cabinet · PL `plCore` | done mock |
| **D** Backend | Supabase specialists · social SQL · Stripe | stub — see REMINDERS |

## Wave 7 — Адмінка

| Screen | Status | Route |
|--|--|--|
| Web admin shell | done | `app/(admin)/*` |

## Cloud SQL scaffolds (local UI first)

| Migration | Status | Notes |
|--|--|--|
| `20260321240000_forum_local_cloud.sql` | done | applied 2026-08-21 |
| `20260321241000_friends_graph.sql` | done | applied 2026-08-21 |
| `20260321242000_directories_trust.sql` | done | applied 2026-08-21 |
| `20260321243000_spotlight_cloud.sql` | done | applied 2026-08-21 |
| `20260321245000_directory_shops.sql` | stub | run before cloud `shops` rows |

## Gap close 2026-08-21 (was missing / stub)

| Item | Status |
|--|--|
| Guest voting web | done — `/spotlight-vote` + in-app |
| Friend invite link/QR code | done — `friend-invite` / accept |
| Photo tags pets/friends | done — stories compose + feed |
| Other user profile | done — `user-profile` |
| Forum author + notifications | done |
| Pet hub switcher + bird/parrot | done — `pet-hub`, species `bird` |
| Toast / AI loading / network | done — `ToastProvider` |
| Stories dark theme | done — settings theme |
| Directory chat | done |
| Carriers F4b/c | done — `directory-carriers` |
| Google Calendar useful stub | done — deep link + ICS share |
| Cloud SQL scaffolds | stub — migrations `240000`–`243000` (запустити) |
| Pixel-perfect `.dc.html` | missing — no HTML mockups in repo; structure + brand only |
| Account nav wiring (07 ↔ 04) | done — my-profile ↔ my-data, settings, appearance, payments |
| Global dark theme apply | done — `AppThemeProvider` + appearance refresh |
| Module 08 permission flows | done — camera/notify screens in real paths |
| Vet booking 09.04 | done mock — `vet-booking` |
| Directory shops hub tile | done — `directories` tab |

