from datetime import datetime

from fastapi_users import schemas


class UserRead(schemas.BaseUser[int]):
    username: str
    first_name: str
    last_name: str
    date_joined: datetime


class UserCreate(schemas.BaseUserCreate):
    username: str
    first_name: str
    last_name: str


class UserUpdate(schemas.BaseUserUpdate):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
