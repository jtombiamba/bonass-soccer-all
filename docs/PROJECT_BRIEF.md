# PART 1 - PROJECT BRIEF + RISKS

## Project Brief (5–8 bullets)

- **Weekly Friday games**: The group plays every Friday; early Monday a poll is launched to collect availability for that week’s game.
- **Player profiles**: Each roommate creates a profile with name, pseudo, and phone number.
- **Monthly peer evaluations**: Every month each player evaluates 5 peers (0–100) on: pace, assist, defensive, dribbling, shooting.
- **Pre-game self-assessment**: The day before the game, each player self-assesses physical condition; final score = 0.15×pace + 0.3×physical + 0.15×assist + 0.15×defensive + 0.1×dribbling + 0.15×shooting (peer skills = mean of last 5 evaluations).
- **Random team split**: A random player among those who accepted receives a code to trigger team randomization; teams are split by weighted evaluation.
- **Score recording**: After the game, the final score can be stored.
- **Deployment**: Application is deployable on Heroku or Coolify with Docker, CI/CD, and optional Kubernetes.

## Non-goals

- Real-time in-game tracking or live stats.
- Multiple organizations/leagues; single “organization” (the group of friends).
- Mobile native apps; web-only.
- Payment or subscriptions.
- Video/streaming integration.

## Assumptions

- Users are trusted (same friend group); no heavy moderation.
- PostgreSQL, Redis, and object storage (if needed) are available in the deployment environment.
- JWT in localStorage is acceptable for this internal app.
- “Organization” is a single tenant (one group); no multi-tenant SaaS.
- Poll and evaluation deadlines are enforced by the app (e.g. Monday poll, day-before physical condition).

## Failure modes & mitigations

| Failure mode | Mitigation |
|-------------|------------|
| Poll/evaluation not sent on time | Celery Beat with retries; idempotent tasks; optional alerts. |
| Randomization code lost or misused | Code stored server-side; single-use or time-limited; audit log. |
| DB/Redis down | Health checks; Celery retries; clear error messages. |
| JWT theft (localStorage) | Short-lived access token + refresh; HTTPS only. |
| Bad peer data (missing evaluations) | Default/fallback weights; require minimum evaluations before using in formula. |

## Tech stack (no tooling actions in this part)

| Layer | Choice |
|-------|--------|
| Backend API | Django + Django REST Framework |
| Auth | JWT (e.g. djangorestframework-simplejwt) |
| Database | PostgreSQL |
| Background tasks | Celery + Redis |
| API docs | drf-spectacular |
| Frontend | Next.js + TypeScript |
| API client | Axios; JWT in localStorage |
| Package management | Poetry (backend), npm/pnpm (frontend) |
| Repo & CI/CD | GitHub, GitHub Actions |
| Deploy | Docker, docker-compose, optional Kubernetes; Heroku or Coolify |

=== END OF PART 1 ===
