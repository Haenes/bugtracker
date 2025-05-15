from datetime import datetime
from uuid import UUID

from fastapi_users import schemas
from pydantic import BaseModel, Field


class UserRead(schemas.BaseUser[UUID]):
    username: str
    first_name: str
    created_at: datetime


class UserCreate(schemas.BaseUserCreate):
    username: str = Field(min_length=4)
    first_name: str


class UserUpdate(schemas.BaseUserUpdate):
    username: str | None = Field(min_length=4, default=None)
    first_name: str | None = None


class SearchUser(BaseModel):
    id: UUID
    first_name: str
