# KnowSnout — UI Kit v2 implementation roadmap

Source: `docs/design/*.pdf` · Organic PDF visual active · Variant 12 colors later  
Admin = Wave 7 (last).

## Visual pass (Organic PDF · 2026-08-21)

| Module | visual |
|--|--|
| Design system (tokens, fonts Caprasimo/Figtree, ListRow, HubHero, auth shell) | organic |
| Вхід і Перевір | organic |
| Улюбленці | organic |
| Стрічка / Spotlight / friends | organic |
| Спільнота (quiz / forum / blog) | organic |
| Профіль і службові | organic |
| Довідники | organic |
| Адмінка | organic |

Status: `organic` | `stub` | `missing` · Variant 12 remap = later

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
| Quiz hub + classic quizzes | done | quiz, breed-quiz, wiki-quiz, trivia-quiz |
| Zoom / heavier / myth quizzes | done | quiz-zoom, quiz-heavier, quiz-myth |
| Leaderboard / badges | done | quiz-leaderboard, achievements |
| Forum | done | forum, forum-category, forum-thread, forum-new, forum-rules, forum-search |
| Blog | done | blog, blog-article, blog-bookmarks |

## Wave 5 — Профіль і службові

| Screen | Status | Route |
|--|--|--|
| Мої дані / sources / 404 | done | my-data, data-sources, +not-found |
| Notifications / help / language | done | `notifications`, `help`, `settings` |
| Subscription shell | done | `subscription` |
| Blocked / edit account | done | `blocked-users`, `edit-account` |

## Wave 6 — Довідники F

| Screen | Status | Route |
|--|--|--|
| Hub / list / detail / review / report | done | `directories/*` via tab + stack |
| Категорія Магазини (P1e) | done mock | `shops` + `marketOffers` · SQL `20260321245000` unrun |
| Chat із закладом (local) | done | `directory-chat` |
| Перевізники F4b/c (routes / vehicle) | done | `directory-carriers` + transport detail |

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

