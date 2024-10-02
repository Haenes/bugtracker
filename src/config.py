import os
from dotenv import load_dotenv

load_dotenv()


DB_URI = os.environ.get("DB_URI")
TEST_DB_URI = os.environ.get("TEST_DB_URI")

REDIS_USER = os.environ.get("REDIS_USER")
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD")
REDIS_EXPIRE_TIME = 600
