# Backend – Football Team Management API

Django + DRF API. Use **pyenv** for the project Python version.

## Setup with pyenv

1. Install [pyenv](https://github.com/pyenv/pyenv#installation) (and pyenv-virtualenv if you like).
2. In the `backend/` directory, install the version from `.python-version`:
   ```bash
   pyenv install -s   # installs 3.11.7 if missing
   ```
3. Use that version for this project (pyenv reads `.python-version` automatically when you `cd` here, or set it explicitly):
   ```bash
   pyenv local 3.11.7
   ```
4. Install dependencies with Poetry (Poetry will use the pyenv Python):
   ```bash
   poetry install
   ```
5. Copy env and run migrations:
   ```bash
   cp .env.example .env   # edit DATABASE_URL, SECRET_KEY, CELERY_BROKER_URL
   poetry run python manage.py migrate
   poetry run python manage.py runserver
   ```

For Celery: start Redis, then `poetry run celery -A config worker -l info` and `poetry run celery -A config beat -l info`.
