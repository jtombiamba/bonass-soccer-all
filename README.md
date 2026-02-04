# Bonass Soccer – Football Team Management

Web application for a group of friends to schedule Friday games, run weekly availability polls, monthly peer evaluations, and balanced team distribution.

## Features

- **Weekly polls**: Every Monday a poll is launched for the Friday game; players answer available/not available.
- **Player profiles**: Name, pseudo, phone (after registering).
- **Monthly evaluations**: Each player evaluates up to 5 peers (0–100) on pace, assist, defensive, dribbling, shooting.
- **Pre-game physical condition**: Day before the game, each player self-assesses (0–100). Final score = weighted formula (0.15×pace + 0.3×physical + 0.15×assist + 0.15×defensive + 0.1×dribbling + 0.15×shooting).
- **Team distribution**: A random available player receives a code to launch balanced team split; after the game, final score can be stored.

## Stack

- **Backend**: Django + Django REST Framework, JWT (Simple JWT), PostgreSQL, Celery + Redis, drf-spectacular
- **Frontend**: Next.js 14 + TypeScript, Axios, JWT in localStorage
- **Infra**: Docker, docker-compose, Kubernetes manifests, GitHub Actions CI/CD, Coolify/Heroku-ready

## Repository layout

- `backend/` – Django API (auth, evaluations, players, poll apps)
- `frontend/` – Next.js app
- `infra/` – docker-compose, K8s, env examples
- `docs/` – Project brief and risks

## Quick start (local)

### Backend

```bash
cd backend
cp .env.example .env   # edit DATABASE_URL, SECRET_KEY, CELERY_BROKER_URL
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver
```

In another terminal: Redis, then `poetry run celery -A config worker -l info` and `poetry run celery -A config beat -l info`.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`.

### Full stack with Docker

```bash
cd infra
cp .env.example .env
docker-compose up -d
```

Backend: http://localhost:8000  
API docs: http://localhost:8000/api/docs/  
Frontend: http://localhost:3000  

## Deploy (Coolify / Heroku)

- **Coolify**: Use `infra/docker-compose.yml` or `infra/coolify-docker-compose.yml`; set env vars (SECRET_KEY, POSTGRES_PASSWORD, CORS_ALLOWED_ORIGINS, NEXT_PUBLIC_API_URL).
- **Heroku**: See `heroku.yml` and `Procfile`; use Heroku Postgres and Redis add-ons, set config vars.

## Tests

- Backend: `cd backend && poetry run pytest -v`
- Frontend: `cd frontend && npm run build`

## License

See [LICENSE](LICENSE).
