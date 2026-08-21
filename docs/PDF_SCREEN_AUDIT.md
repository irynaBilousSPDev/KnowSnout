# PDF map vs app — screen audit (2026-08-21)

Source: `docs/design/KnowSnout-UI-Design-Setup.pdf` (~100 screens, 7 modules).  
App routes under `app/`: **~103 screen files**.

Legend: **OK** = route exists · **PARTIAL** = route exists but not full PDF composition · **MISSING** = no dedicated screen

## 01 Вхід і Перевір
| PDF screen | Status | Route |
|--|--|--|
| Реєстрація | OK | `(auth)/register` |
| Онбординг 1–3 | OK | `onboarding` |
| Хаб «Перевір» | OK | `(tabs)/index` |
| Історія | OK | `(tabs)/history` |
| Скан штрихкод / етикетка | OK | `scan-food` |
| Результат корму | OK | `result` |
| Порівняти 2 корми | OK | `compare-food` |
| Рослина → результат | OK | `plant-safety`, `plant-result` |
| Порода форма → результат | OK | `breed-scan`, `breed-result` |
| Профіль тварини (акордеон) | OK | `pet-form` |

## 02 Улюбленці
| PDF screen | Status | Route |
|--|--|--|
| Список | OK | `(tabs)/pets` |
| Хаб тварини | OK | `pet-hub` |
| Догляд сьогодні | OK | `pet-care`, `care-hub` |
| Профіль перегляд | OK | `pet-profile` |
| Щеплення / Ліки | OK | `pet-vaccines`, `pet-vet-log` |
| Ігри / Звички / Календар | OK | `play-guides`, `pet-habits`, `pet-calendar` |
| Документи + подорожі | OK | `pet-travel`, `pet-passport`, `pet-travel-wizard` |
| Окремі форми щеплення/ліків | PARTIAL | inline у vaccines/vet-log |

## 03 Стрічка
| PDF screen | Status | Route |
|--|--|--|
| Стрічка / реакції | OK | `(tabs)/stories` |
| Spotlight hub + rules/apply/ranking/winners/won | OK | `spotlight-*` |
| Гостьове голосування | OK | `spotlight-vote`, `spotlight-guest-vote` |
| Коментарі / чужий профіль | OK | `story-comments`, `user-profile` |
| Активність / чат / DM | OK | `activity`, `messages`, `dm/[userId]` |
| Друзі / пошук / запити / invite | OK | `friends`, `friend-*` |
| Прогулянка | OK | `walk-plan` |
| Глобальний пошук | OK | `search` |
| Запрошення прогулянки в чаті | PARTIAL | текст/мок, не окремий екран |
| Теги на фото | PARTIAL | у compose, не окремий екран |

## 04 Спільнота
| PDF screen | Status | Route |
|--|--|--|
| Квіз-хаб + 6 форматів + результати + рейтинг | OK | `quiz`, `*-quiz`, `quiz-results`, `quiz-leaderboard` |
| Форум (кат/тред/нове/пошук/правила/сповіщення/автор) | OK | `forum*` |
| Блог (кат/стаття/закладки) | OK | `blog*` |
| Досягнення | OK | `achievements` |
| Блог коментарі | PARTIAL | стаття без повноцінних коментарів PDF |

## 05 Профіль і службові
| PDF screen | Status | Route |
|--|--|--|
| Мої дані / налаштування / сповіщення | OK | `my-data`, `settings`, `notifications` |
| Довідка / стаття / підтримка | OK | `help`, `help-article`, `support` |
| Приватність / джерела / підписка | OK | `privacy`, `data-sources`, `subscription` |
| Редагування / заблоковані / видалення | OK | `edit-account`, `blocked-users`, `delete-account` |
| 404 | OK | `+not-found` |
| Share / report / camera / toast | PARTIAL | компоненти, не окремі «екрани» |
| AI loading / network / permissions / empty pets | PARTIAL | shared states, не окремі маршрути |
| Темна тема стрічки | PARTIAL | stub у stories/settings |

## 06 Довідники
| PDF screen | Status | Route |
|--|--|--|
| Хаб / список / картка / відгук / скарга | OK | `directories`, `directory-*` |
| Перевізники / чат | OK | `directory-carriers`, `directory-chat` |

## 07 Адмінка
| PDF screen | Status | Route |
|--|--|--|
| Дашборд + moderation/CMS/spotlight/blog/products/quiz/monetization/team | OK | `(admin)/*` |

## Висновок

1. **Маршрути ≈ мапа PDF:** майже всі екрани з Design-Setup **є як routes** (~100).
2. **Вигляд ≠ макети `.dc.html`:** HTML-макетів у репо немає. Organic pass змінив токени/шрифти/хаби — це **не** піксельна копія кожного PDF-екрана.
3. Якщо на https://www.knowsnout.com/ «нічого не змінилось» — можливий кеш CDN / старий білд; локально має бути cream + Caprasimo на заголовках після hard refresh.
