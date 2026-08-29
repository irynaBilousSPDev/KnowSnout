# Screenshots · 2026-08-30

**QA captures** of Module 04 (SnoutStories / social) from the running web app.  
These are **not** design mocks — use dated sheets under `2026-08-24` / `2026-08-25` for pixel truth.

## How to use
- Compare live UI regressions against these captures after deploy.
- See `qa04-report.json` for route + PASS/FAIL audit from the capture run.
- Re-run: `node docs/design/screenshots/2026-08-30/scripts/qa04-full.mjs` (local Expo web).

## Module 04 — Стрічка / соціальне

| File | Screen |
|--|--|
| `04.feed-stories.png` | Tab feed (stories) |
| `04.01-story-post.png` | Post detail |
| `04.02-story-comments.png` | Comments |
| `04.03-story-compose.png` | Compose post |
| `04.04-story-tag.png` | Tag pets on photo |
| `04.07-search.png` | Global search |
| `04.08-friends.png` | Friends list |
| `04.09-friend-search.png` | Find friends |
| `04.10-friend-requests.png` | Friend requests |
| `04.11-friend-invite.png` | Invite QR |
| `04.12-user-profile.png` | User profile |
| `04.13-messages.png` | Messages inbox |
| `04.14-dm.png` | Direct message |
| `04.15-walk-plan.png` | Walk plan |
| `04.16-dm-walk.png` | DM walk invite |
| `04.17-spotlight-hub.png` | Spotlight hub |
| `04.18-spotlight-rules.png` | Spotlight rules |
| `04.19-spotlight-apply.png` | Apply to contest |
| `04.20-spotlight-entry.png` | Contest entry |
| `04.21-spotlight-ranking.png` | Ranking |
| `04.22-spotlight-winners.png` | Winners archive |
| `04.23-spotlight-won.png` | You won |
| `04.24-spotlight-vote.png` | Guest vote |
| `04.25-my-profile.png` | My profile |
| `04.26-activity.png` | Activity feed |

## Artifacts
- `qa04-report.json` — text audit per screen
- `audit.json` — capture metadata
- `scripts/` — Playwright capture helpers (source: `.tmp-screens/`)
