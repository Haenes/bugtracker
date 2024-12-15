from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class CreateProjectSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    name: str = Field(min_length=3, max_length=255)
    key: str = Field(min_length=3, max_length=10)
    starred: bool = False


class UpdateProjectSchema(CreateProjectSchema):
    name: str | None = Field(min_length=3, max_length=255, default=None)
    key: str | None = Field(min_length=3, max_length=10, default=None)
    starred: bool | None = None


class ProjectSchema(CreateProjectSchema):
    created: datetime
    updated: datetime


class PaginationProject(ProjectSchema):
    id: int


class CreatedProjectSchema(PaginationProject):
    pass
