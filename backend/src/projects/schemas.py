from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class CreateProjectSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    name: str = Field(min_length=3, max_length=255)
    key: str = Field(min_length=3, max_length=10)
    favorite: bool = False


class UpdateProjectSchema(CreateProjectSchema):
    name: str | None = Field(min_length=3, max_length=255, default=None)
    key: str | None = Field(min_length=3, max_length=10, default=None)
    favorite: bool | None = None


class ProjectSchema(CreateProjectSchema):
    id: int
    created: datetime
    updated: datetime


class PaginationProject(ProjectSchema):
    pass


class CreatedProjectSchema(ProjectSchema):
    pass


class SearchProject(BaseModel):
    id: int
    name: str
    key: str
