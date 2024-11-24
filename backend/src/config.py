import os
from dotenv import load_dotenv

load_dotenv()


DB_URI = os.environ.get("DB_URI")
TEST_DB_URI = os.environ.get("TEST_DB_URI")

REDIS_USER = os.environ.get("REDIS_USER")
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
REDIS_EXPIRE_TIME = 600

SMTP_HOST = os.environ.get("SMTP_HOST")
SMTP_PORT = os.environ.get("SMTP_PORT")
SMTP_USER = os.environ.get("SMTP_USER")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")

VERIFY_URL_BACKEND = "http://127.0.0.1:8000/auth/verify"
VERIFY_URL_FRONTEND = "http://127.0.0.1:5173/verify"

PASSWORD_RESET_URL_FRONTEND = "http://127.0.0.1:5173/reset-password"
PASSWORD_RESET_URL_BACKEND = "http://127.0.0.1:8000/auth/reset-password"


class CeleryConfig:
    task_serializer = "pickle"
    accept_content = ["application/json", "application/x-python-serialize"]
    broker_connection_retry_on_startup = False
