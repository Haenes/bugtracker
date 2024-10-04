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

VERIFY_URL = "127.0.0.1:8000/auth/verify"
