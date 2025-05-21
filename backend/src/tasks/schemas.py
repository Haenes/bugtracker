from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class CreateTaskSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=3, max_length=100)
    description: str | None = None
    type_id: int = Field(ge=1, default=4)
    priority_id: int = Field(ge=1, default=2)
    status_id: int = Field(ge=1, default=1)
    assignee_id: UUID | None = None
    deadline_at: datetime | None = None


class UpdateTaskSchema(CreateTaskSchema):
    name: str | None = Field(max_length=100, default=None)
    description: str | None = None
    type_id: int | None = Field(ge=1, default=None)
    priority_id: int | None = Field(ge=1, default=None)
    status_id: int | None = Field(ge=1, default=None)


class TaskSchema(CreateTaskSchema):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime


class TaskSchemaGet(TaskSchema):
    type: str
    priority: str
    status: str


class TaskStatus(BaseModel):
    id: int
    name: str


class TaskPriority(BaseModel):
    id: int
    name: str


class TaskType(BaseModel):
    id: int
    name: str


class CreatedTaskSchema(BaseModel):
    id: UUID


class SearchTask(BaseModel):
    project_id: UUID
    id: UUID
    name: str


class CreateTaskCommentSchema(BaseModel):
    text: str


class TaskCommentSchema(CreateTaskCommentSchema):
    id: int
    user_id: UUID
    task_id: UUID
    created_at: datetime


class NoTaskCommentsResponse(BaseModel):
    results: str


class NoTaskChangesResponse(NoTaskCommentsResponse):
    pass
