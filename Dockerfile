# Stage 1: Build dependencies
FROM python:3.12 AS builder

WORKDIR /app
RUN pip install --no-cache-dir poetry
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-root

# Stage 2: Final slim image
FROM python:3.12-slim

WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY neon_hub_config ./neon_hub_config

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000
ENV OVOS_CONFIG_BASE_FOLDER=neon \
    OVOS_CONFIG_FILENAME=neon.yaml

EXPOSE 8000

USER 1000

# Run the application
CMD ["uvicorn", "neon_hub_config.main:app", "--host", "0.0.0.0", "--port", "8000"]
