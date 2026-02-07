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

The backend uses **pyenv** for the virtual environment (see `backend/.python-version`). After installing pyenv:

```bash
cd backend
pyenv install -s        # install Python from .python-version if needed
pyenv local 3.11.7      # or whatever version is in .python-version
cp .env.example .env    # edit DATABASE_URL, SECRET_KEY, CELERY_BROKER_URL
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

## Email Testing (Development)

For local email testing, the project includes a [MailHog](https://github.com/mailhog/MailHog) service that captures outgoing emails and provides a web interface to inspect them.

To start MailHog alongside the other services, use the development override compose file:

```bash
cd infra
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

MailHog's SMTP server will be available at `mailhog:1025` inside the Docker network, and the web UI at http://localhost:8025.

The Django backend is configured to automatically use MailHog when `DEBUG=True` (default in development). No extra environment variables are needed. If you wish to use a different email backend, you can override the settings in `backend/.env` (see the commented examples in `backend/.env.example`).

## Email Configuration for Production

In production, you must configure a real SMTP server to send emails. Set the following environment variables in your production environment (e.g., in Coolify/Heroku config vars, or in `backend/.env`):

- `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
- `EMAIL_HOST` (your SMTP server address)
- `EMAIL_PORT` (usually 587 for TLS)
- `EMAIL_HOST_USER` (your SMTP username)
- `EMAIL_HOST_PASSWORD` (your SMTP password)
- `EMAIL_USE_TLS=True` (or `False` if using SSL)
- `DEFAULT_FROM_EMAIL` (sender address)

Examples are provided in `backend/.env.example`. Ensure `DEBUG=False` in production.

### Superuser Creation

When deploying the application, a superuser is automatically created if it does not already exist. The superuser credentials are read from the following environment variables:

- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_PASSWORD` (default: `changeme`)
- `ADMIN_EMAIL` (default: `admin@example.com`)

These variables are optional; if any of them is missing, superuser creation will be skipped. The superuser can be used to access the Django admin interface at `/admin/`.

### Password Reset

The API provides password reset endpoints that use JWT tokens sent via email:

- `POST /api/auth/password-reset/` – request a reset token (requires email)
- `POST /api/auth/password-reset/confirm/` – confirm reset with token and new password

The reset token is valid for 1 hour (configurable via `SIMPLE_JWT.PASSWORD_RESET_TOKEN_LIFETIME`). Emails are sent using the configured email backend (see Email Configuration above).

## Deploy (Coolify / Heroku)

- **Coolify**: Use `infra/docker-compose.yml` or `infra/coolify-docker-compose.yml`; set env vars (SECRET_KEY, POSTGRES_PASSWORD, CORS_ALLOWED_ORIGINS, NEXT_PUBLIC_API_URL).
- **Heroku**: See `heroku.yml` and `Procfile`; use Heroku Postgres and Redis add-ons, set config vars.

### Automated Docker Image Builds with GitHub Container Registry

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and pushes Docker images to GitHub Container Registry (GHCR) on every push to the `main` branch and on version tags (`v*`, `release-*`).

**Image naming:**
- Backend: `ghcr.io/<owner>/<repository>/backend:<tag>`
- Frontend: `ghcr.io/<owner>/<repository>/frontend:<tag>`

**Tags:**
- `latest` – images built from the `main` branch.
- `sha-<short_sha>` – commit‑based tag for reproducibility.
- `<tag_name>` – for version tags (e.g., `v1.0.0`).

**How to use with Coolify:**

1. **Registry authentication** – In Coolify, add a Docker registry for `ghcr.io` using a GitHub Personal Access Token with `read:packages` scope.
2. **Pre‑built images** – Use the provided `infra/coolify-pull.yml` compose file, which references the pre‑built images instead of building from source.
3. **Environment variables** – Set `GITHUB_REPOSITORY` (e.g., `owner/repo`) and optionally `IMAGE_TAG` (defaults to `latest`) in Coolify’s resource configuration, alongside the other required variables (SECRET_KEY, POSTGRES_PASSWORD, etc.).

**Workflow:**
- Push to `main` → images are built, tagged with `latest` and `sha-<short_sha>`, and pushed to GHCR.
- Create a Git tag → images are tagged with the tag name and `sha-<short_sha>`.
- Coolify can then deploy the new images by updating the `IMAGE_TAG` environment variable or by using the `latest` tag (not recommended for production).

For more details, see the [CI/CD plan](plans/docker-registry-ci.md).

## Tests

- Backend: `cd backend && poetry run pytest -v`
- Frontend: `cd frontend && npm run build`

## License

See [LICENSE](LICENSE).
