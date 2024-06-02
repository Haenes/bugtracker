from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class ProjectType(Enum):
    fullstack = "Fullstack"
    frontend = "Front-end"
    backend = "Back-end"


class CreateUpdateProjectSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int = Field(ge=1)
    name: str = Field(min_length=3, max_length=255)
    key: str = Field(min_length=3, max_length=10)
    type: ProjectType
    author_id: int
    starred: bool = Field(default=False)


class ProjectSchema(CreateUpdateProjectSchema):
    created: datetime
