from .base import *

DEBUG = True

# Use SQLite for local dev if PostgreSQL is not available
import subprocess
try:
    subprocess.run(['pg_isready'], capture_output=True, check=True)
except (subprocess.CalledProcessError, FileNotFoundError):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Use in-memory channel layer for dev without Redis
try:
    import redis
    r = redis.Redis(host='localhost', port=6379)
    r.ping()
except Exception:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
