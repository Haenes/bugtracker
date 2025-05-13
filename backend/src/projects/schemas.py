from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class CreateProjectSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    name: str = Field(min_length=3, max_length=100)
    key: str = Field(min_length=3, max_length=10)
    description: str | None = Field(min_length=1, default=None)
    is_favorite: bool = False


class UpdateProjectSchema(CreateProjectSchema):
    name: str | None = Field(min_length=3, max_length=100, default=None)
    key: str | None = Field(min_length=3, max_length=10, default=None)
    description: str | None = Field(min_length=1, default=None)
    is_favorite: bool | None = None


class ProjectSchema(CreateProjectSchema):
    id: UUID
    created_at: datetime
    updated_at: datetime


class PaginationProject(ProjectSchema):
    pass


class CreatedProjectSchema(BaseModel):
    id: UUID


class SearchProject(BaseModel):
    id: UUID
    name: str
    key: str
