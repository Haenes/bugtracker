from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from src.auth.schemas import SearchUserSchema


class CreateProjectSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=3, max_length=100)
    key: str = Field(min_length=3, max_length=10)
    description: str | None = None
    is_favorite: bool = False


class UpdateProjectSchema(CreateProjectSchema):
    name: str | None = Field(min_length=3, max_length=100, default=None)
    key: str | None = Field(min_length=3, max_length=10, default=None)
    description: str | None = None
    is_favorite: bool | None = None


class ProjectSchema(CreateProjectSchema):
    id: UUID
    created_at: datetime
    updated_at: datetime


class ProjectsSchema(ProjectSchema):
    role_id: int


class CreatedProjectSchema(BaseModel):
    id: UUID


class SearchProject(BaseModel):
    id: UUID
    name: str
    key: str


class DataForInviteSchema(BaseModel):
    user: SearchUserSchema
    invite_token: str


class CreateProjectInviteSchema(BaseModel):
    role_id: int
    max_uses: int | None = None
    expires_at: datetime | None = None


class UpdateProjectInviteSchema(CreateProjectInviteSchema):
    role_id: int | None = None


class CreatedProjectInviteSchema(BaseModel):
    id: int


class ProjectInviteSchema(CreateProjectInviteSchema):
    id: int
    creator_id: UUID
    invite_token: str
    use_count: int
    created_at: datetime
