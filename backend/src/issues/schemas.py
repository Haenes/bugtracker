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


class CreateIssueSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    title: str = Field(max_length=255)
    description: str | None = None
    type: IssueType
    priority: IssuePriority = IssuePriority.medium.value
    status: IssueStatus = IssueStatus.to_do.value


class UpdateIssueSchema(CreateIssueSchema):
    title: str | None = Field(max_length=255, default=None)
    description: str | None = None
    type: IssueType | None = None
    priority: IssuePriority | None = None
    status: IssueStatus | None = None


class IssueSchema(CreateIssueSchema):
    created: datetime
    updated: datetime


class PaginationIssue(IssueSchema):
    id: int


class CreatedIssueSchema(PaginationIssue):
    project_id: int


class SearchIssue(BaseModel):
    project_id: int
    id: int
    title: str
