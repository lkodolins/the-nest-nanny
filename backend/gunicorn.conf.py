import os


# Resolve port from environment in Python so we don't rely on shell expansion.
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Keep defaults simple; Railway instances are usually single-core on starter plans.
workers = int(os.getenv("WEB_CONCURRENCY", "2"))
threads = int(os.getenv("GUNICORN_THREADS", "2"))
timeout = int(os.getenv("GUNICORN_TIMEOUT", "60"))
