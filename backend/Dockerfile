FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (production includes base.txt)
COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/production.txt daphne

# Copy project
COPY . .

RUN mkdir -p staticfiles static media
RUN chmod +x entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./entrypoint.sh"]
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers ${WEB_CONCURRENCY:-1} --threads ${GUNICORN_THREADS:-1} --timeout ${GUNICORN_TIMEOUT:-120} --access-logfile - --error-logfile -"]
