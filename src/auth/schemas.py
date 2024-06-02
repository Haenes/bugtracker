from datetime import datetime

from fastapi_users import schemas


class UserRead(schemas.BaseUser[int]):
    is_staff: bool = False
    username: str
    first_name: str
    last_name: str
    date_joined: datetime


class UserCreate(schemas.BaseUserCreate):
    is_staff: bool | None = False
    username: str
    first_name: str
    last_name: str


class UserUpdate(schemas.BaseUserUpdate):
    is_staff: bool | None = None
    username: str
    first_name: str
    last_name: str
