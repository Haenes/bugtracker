# Installation Instructions

1) Clone repository: `git clone https://github.com/Haenes/bugtracker.git`
2) Add the following .env file in the root directory (where it's located README.md):
```python3
# You can leave everything as it is,
# the application will start and work correctly
# (except for the mail service).

# IF "DEV" - reload uvicorn server after changes in /backend/src. If "PROD" - no.
ENV = "DEV"

# If you are using 127.0.0.1 instead of localhost -> Replace localhost to 127.0.0.1
DEV_BACKEND_URL = http://localhost:8000
PROD_BACKEND_URL = http://localhost/api

JWT_SECRET = "SUPER_SECRET"
MANAGER_SECRET = "SUPER_SECRET"

TEST_DB_URI = "postgresql+asyncpg://test:SUPER_STRONG@db:5432/test_bugtracker"
TEST_DB = "test_bugtracker"
DB_URI = "postgresql+asyncpg://test:SUPER_STRONG@db:5432/bugtracker"

POSTGRES_PASSWORD = "SUPER_STRONG"
POSTGRES_USER = "test"
POSTGRES_HOST = "db"
POSTGRES_PORT = "5432"
POSTGRES_DB = "bugtracker"
PGDATA = "var/lib/postgresql/data/pgdata"

REDIS_USER = "api"
REDIS_PASSWORD = "Testing"
```

3) Next, you need to run docker compose and there are two options here:
   - Run DEV environment (support hot-reload): `docker compose up`
   - Run PROD environment (faster loading and work): `docker compose -f compose.prod.yml up`

>If you have permission denied error - add sudo to the beginning of the command.\
>If you after DEV env want to see PROD env or vice-versa, you need to add `--build` to the command.

4) Create test user:
   ```
   docker compose exec db psql -v ON_ERROR_STOP=1 --username "test" --dbname "bugtracker" -c "INSERT INTO auth_user (email, username, first_name, hashed_password, is_verified) VALUES ('test@test.com', 'test', 'Test', '\$argon2id\$v=19\$m=65536,t=3,p=4\$/v2CmfuJO+AOnQSMjnc8wA\$slYsoCYIqtlBg35ORUcswa6HgKyHdGDION57I5V8xH8','t')"
   ```

6) App is running after this line in shell: `backend     | INFO:     Application startup complete.`
7) App location depends on step 3 and DEV/PROD_BACKEND_URL inside .env:
   - DEV: [here](http://localhost:5173) or [here](http://127.0.0.1:5173)
   - PROD: [here](http://localhost) or [here](http://127.0.0.1/)
>If first link isn't working use the second AND change DEV_BACKEND_URL and/or PROD_BACKEND_URL in .env.\
>Replace `localhost` to `127.0.0.1`.
8) Use this credentialls to log in: `Email - test@test.com, Password - Test123#`.

If you want to run tests, use: `docker compose exec backend pytest src/tests` command.
