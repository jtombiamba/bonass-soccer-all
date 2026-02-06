# backend/Dockerfile (No virtual environment)
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./

# Install directly to system Python (no virtual environment)
RUN uv pip install --system -r pyproject.toml

COPY . .

RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# COPY pyproject.toml ./
# RUN pip install --no-cache-dir poetry && \
#     poetry config virtualenvs.create false && \
#     poetry install --no-dev --no-interaction --no-ansi

# COPY . .
# RUN python manage.py collectstatic --noinput 2>/dev/null || true

# EXPOSE 8000
# CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
