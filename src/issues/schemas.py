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

    title: str = Field(max_length=255)
    description: str | None = Field(default="")
    type: IssueType
    priority: IssuePriority
    status: IssueStatus


class IssueSchema(CreateUpdateIssueSchema):
    key: int
    created: datetime
    updated: datetime


class PaginationIssue(IssueSchema):
    id: int


class CreatedIssueSchema(PaginationIssue):
    project_id: int
