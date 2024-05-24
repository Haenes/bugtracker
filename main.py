from datetime import datetime
from enum import Enum
from typing import Annotated

from fastapi import Depends, FastAPI, Path
from pydantic import BaseModel, Field, ConfigDict

from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import get_async_session
from db.models import Project

app = FastAPI()


class ProjectType(Enum):
    FULLSTACK = "Fullstack"
    FRONTEND = "Front-end"
    BACKEND = "Back-end"


class ProjectSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int = Field(ge=1)
    name: str = Field(min_length=3, max_length=255)
    key: str = Field(min_length=3, max_length=10)
    type: ProjectType
    author_id: int
    starred: bool = Field(default=False)
    created: datetime


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
    TO_DO = "To do"
    IN_PROGRESS = "In progress"
    DONE = "Done"


class Issue(BaseModel):
    id: int = Field(ge=1)
    project_id: int
    key: int = Field(default=1)
    title: str = Field(max_length=255)
    description: str | None = Field(default="")
    type: IssueType
    priority: IssuePriority
    status: IssueStatus
    author_id: int
    created: datetime
    updated: datetime


@app.get("/projects", tags=["Projects"])
async def projects(
        session: AsyncSession = Depends(get_async_session)
        ):
    """ Return all user projects with pagination = 10 projects/page. """

    query = select(Project)
    results = await session.execute(query)

    return results.scalars().all()


@app.post("/projects", status_code=201, tags=["Projects"])
async def create_project(
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ):
    """ Create a new project. """

    stmt = insert(Project).values(**project.model_dump())
    await session.execute(stmt)
    await session.commit()

    return project


@app.get("/projects/{project_id}", tags=["Projects"])
async def get_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Return specified project. """

    query = select(Project).where(Project.id == project_id)
    results = await session.execute(query)

    return results.scalar()


@app.put("/projects/{project_id}", tags=["Projects"])
async def update_project_put(
        project_id: Annotated[int, Path(ge=1)],
        project: ProjectSchema
        ):
    """ Update already exists project via PUT request. """

    pass


@app.delete("/projects/{project_id}", tags=["Projects"])
async def delete_project(project_id: Annotated[int, Path(ge=1)]):
    """ Delete specified project. """

    return {"message": "delete project"}


@app.get("/projects/{project_id}/issues", tags=["Issues"])
async def get_issues(project_id: Annotated[int, Path(ge=1)]) -> list[Issue]:
    """ Return all issues related with specified project. """

    return {"message": "get issues for project"}


@app.post("/projects/{project_id}/issues", status_code=201, tags=["Issues"])
async def create_issue(project_id: Annotated[int, Path(ge=1)]) -> Issue:
    """ Create a new task related to the specified project """

    return {"message": "create issue for project"}


@app.get("/projects/{project_id}/issues/{issue_id}", tags=["Issues"])
async def get_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)]
        ) -> Issue:
    """ Return an issue related to the specified project """

    return {"message": "get issue"}


@app.put("/projects/{project_id}/issues/{issue_id}", tags=["Issues"])
async def update_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)]
        ):
    """ Update an issue related to the specified project """

    return {"message": "update issue"}


@app.delete("/projects/{project_id}/issues/{issue_id}", tags=["Issues"])
async def delete_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)]
        ):
    """ Delete specified issue from specified project """

    return {"message": "delete issue"}


# TODO: revert last changes for bugtracker (finally find more elegant solution)
# TODO: get all necessary data from real db
# TODO: change structure (replace files, add dirs, add routing, etc...)
# TODO: add try/except blocks
# TODO: implement authentication
# TODO: add tests
