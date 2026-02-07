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

## Email Configuration

The system sends emails for poll notifications, distribution codes, and evaluation assignments. In production, you can use a free Gmail account as SMTP server.

### Gmail SMTP Setup

1. Update the environment variables in `.env` (or set them in your deployment platform):
   - `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USE_TLS=True`
   - `EMAIL_HOST_USER=your-email@gmail.com`
   - `EMAIL_HOST_PASSWORD=your-app-password` (see below)
   - `DEFAULT_FROM_EMAIL=your-email@gmail.com`

2. **App Password**: If your Gmail account has 2‑factor authentication enabled, you must generate an [App Password](https://support.google.com/accounts/answer/185833) and use it as `EMAIL_HOST_PASSWORD`. Without 2FA you may need to enable “Less secure app access” (deprecated).

3. Ensure `DEBUG=False` in production; otherwise the development MailHog configuration will be used.

4. The provided `coolify-docker-compose.yml` and Kubernetes manifests already include placeholders for these variables. Fill them in your deployment environment.

### Testing

You can test email delivery using the Django shell:
```bash
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test body', 'from@example.com', ['to@example.com'], fail_silently=False)
```

### Limits & Security

- Gmail imposes daily sending limits (approx. 500 messages per day for free accounts).
- Consider using a dedicated transactional email service (SendGrid, Mailgun) for higher volumes.
