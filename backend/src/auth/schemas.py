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


class SearchUserSchema(BaseModel):
    id: UUID
    first_name: str


class UsersInProjectSchema(BaseModel):
    user_id: UUID
    username: str
    role_id: int
    joined_at: datetime


class NoUsersInProjectSchema(BaseModel):
    detail: str


class UpdateUserInProjectSchema(BaseModel):
    role_id: int = Field(gt=0, le=3, default=3)
