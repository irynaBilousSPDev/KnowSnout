# KnowSnout — UI Kit v2 implementation roadmap

Source: `docs/design/*.pdf` · Structure first · Visual/brand later · Mock APIs OK  
Admin = Wave 7 (last).

## Visual pass (Variant 12 · 2026-08-21)

| Module | visual |
|--|--|
| Design system (tokens, ListRow, HubHero, auth shell) | done |
| Вхід і Перевір | done |
| Улюбленці | done |
| Стрічка / Spotlight / friends | done |
| Спільнота (quiz / forum / blog) | done |
| Профіль і службові | done |
| Довідники | done |
| Адмінка | done |

Status: `done` | `stub` | `missing`

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
| Хаб Перевір + recent/stats | done | `(tabs)/index` |
| Історія + фільтри | done | `(tabs)/history` |
| Порівняти 2 корми | done | `compare-food` |
| Скан штрихкод / етикетка | done | `scan-food` |
| Рослина / порода | done | `plant-safety`, `breed-scan` |
| Профіль-акордеон форма | done | `pet-form` |

## Wave 2 — Улюбленці

| Screen | Status | Route |
|--|--|--|
| Список / профіль / догляд | done | pets, pet-profile, pet-care |
| Щеплення / ліки | done | pet-vaccines, pet-vet-log |
| Ігри | done | play-guides |
| Звички | done | `pet-habits` |
| Календар + Google template / ICS export | done | `pet-calendar` |
| Travel wizard | done | `pet-travel-wizard` |
| Passport / travel checklist | done | pet-passport, pet-travel |

## Wave 3 — Стрічка

| Screen | Status | Route |
|--|--|--|
| Feed / comments / DM | done | stories, story-comments, messages |
| Contests scaffold | done | contests, contest-entry |
| Spotlight rules / ranking / winners | done | spotlight-hub, spotlight-rules, spotlight-apply, spotlight-ranking, spotlight-winners, spotlight-won |
| Friends graph | done | friends, friend-requests, friend-search |
| Walks | done | walk-plan |
| Activity / global search | done | activity, search |

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

