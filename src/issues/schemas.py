from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class IssueType(Enum):
    bug = "Bug"
    feature = "Feature"


class IssuePriority(Enum):
    lowest = "Lowest"
    low = "Low"
    medium = "Medium"
    high = "High"
    highest = "Highest"


class IssueStatus(Enum):
    to_do = "To do"
    in_progress = "In progress"
    done = "Done"


class CreateUpdateIssueSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int = Field(ge=1)
    project_id: int
    key: int = Field(default=1)
    title: str = Field(max_length=255)
    description: str | None = Field(default="")
    type: IssueType
    priority: IssuePriority
    status: IssueStatus
    author_id: int


class IssueSchema(CreateUpdateIssueSchema):
    created: datetime
    updated: datetime
