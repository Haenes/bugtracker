import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.environ.get("JWT_SECRET")
MAX_AGE = 10800
MANAGER_SECRET = os.environ.get("MANAGER_SECRET")
