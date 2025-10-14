#!/usr/bin/env bash
set -e

# optional wait for DB if you ever need it
# python - <<'PY'
# import os, time, psycopg
# url = os.environ["DATABASE_URL"]
# for _ in range(60):
#     try:
#         with psycopg.connect(url) as _:
#             break
#     except Exception:
#         time.sleep(1)
# PY

# run migrations idempotently
alembic -c /app/alembic.ini upgrade head

# start the app
exec "$@"