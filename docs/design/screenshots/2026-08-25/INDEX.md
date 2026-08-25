# Screenshots · 2026-08-25

**Source of truth for pixel work** (user-sent design sheets).  
Do **not** ask the user to re-send these. Do **not** use `_NOT-MOCK_*` or `.tmp-screens/` as design truth.

## Rule for module 05
Implement **from screenshots only** — treat existing quiz/forum screens as non-authority. Rebuild layout/copy to match sheets; do not “adapt” old UI.

## How to use
1. Open the sheet for the screen ID you are implementing.
2. Match **content below** chrome; keep locked `AppChromeHeader` (avatar + paw badge).
3. Module **05** = Quizzes + Forum + Achievements.

## Named packs (preferred)

| File | Screens |
|--|--|
| `05.01-05.03-quiz-hub-origin-group.png` | Квіз-хаб · Звідки порода · Група тварин |
| `05.04-05.06-breed-zoom-heavier.png` | Вгадай породу · Зум-загадка · Хто важчий |
| `05.07-05.09-myth-results-ranking.png` | Правда/міф · Результати · Рейтинг |
| `05.10-05.12-achievements-forum-cats.png` | Досягнення · Форум категорії · Стрічка категорії |
| `05.13-05.15-forum-thread-compose-search.png` | Тред · Нове питання · Пошук і теги |
| `05.16-05.18-forum-author-notify-rules.png` | Профіль автора · Сповіщення форуму · Правила |
| `05.19-05.21-blog-categories-list-article.png` | Блог категорії · Статті · Стаття |
| `05.22-05.23-blog-comments-bookmarks.png` | Стаття з коментарями · Збережене |

## Timed originals
Every attachment also kept as `HHMMSS-hash.png` (same folder).

## Not design
- `.tmp-screens/` — QA captures of the running app
- `_NOT-MOCK_*` — live UI after deploy
- Existing `quiz*.tsx` / forum code — **not** design truth for this pass
