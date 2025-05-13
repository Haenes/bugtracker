from datetime import datetime
from uuid import UUID

from fastapi_users import schemas


class UserRead(schemas.BaseUser[UUID]):
    username: str
    first_name: str
    created_at: datetime


class UserCreate(schemas.BaseUserCreate):
    username: str
    first_name: str


class UserUpdate(schemas.BaseUserUpdate):
    username: str | None = None
    first_name: str | None = None
