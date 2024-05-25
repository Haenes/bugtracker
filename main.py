from datetime import datetime
from enum import Enum
from typing import Annotated

from fastapi import Depends, FastAPI, Path
from pydantic import BaseModel, Field, ConfigDict

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import get_async_session
from db.models import Project, Issue

app = FastAPI()


class ProjectType(Enum):
    fullstack = "Fullstack"
    frontend = "Front-end"
    backend = "Back-end"


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
    to_do = "To do"
    in_progress = "In progress"
    done = "Done"


class IssueSchema(BaseModel):
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
    created: datetime
    updated: datetime


@app.get("/projects", tags=["Projects"])
async def projects(
        session: AsyncSession = Depends(get_async_session)
        ) -> list[ProjectSchema]:
    """ Return all user projects with pagination = 10 projects/page. """

    query = select(Project)
    results = await session.execute(query)

    return results.scalars().all()


@app.post("/projects", status_code=201, tags=["Projects"])
async def create_project(
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
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
async def update_project(
        project_id: Annotated[int, Path(ge=1)],
        project: ProjectSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> ProjectSchema:
    """ Update already exists project via PUT request. """

    stmt = update(Project).where(
        Project.id == project_id
        ).values(**project.model_dump())
    await session.execute(stmt)
    await session.commit()

    return project


@app.delete("/projects/{project_id}", tags=["Projects"])
async def delete_project(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ):
    """ Delete specified project. """

    stmt = delete(Project).where(Project.id == project_id)
    await session.execute(stmt)
    await session.commit()

    return {"results": "success"}


@app.get("/projects/{project_id}/issues", tags=["Issues"])
async def get_issues(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> list[IssueSchema]:
    """ Return all issues related with specified project. """

    query = select(Issue).where(Issue.project_id == project_id)
    results = await session.execute(query)

    return results.scalars().all()


@app.post("/projects/{project_id}/issues", status_code=201, tags=["Issues"])
async def create_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue: IssueSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> IssueSchema:
    """ Create a new task related to the specified project """

    stmt = insert(Issue).values(**issue.model_dump())
    await session.execute(stmt)
    await session.commit()

    return issue


@app.get("/projects/{project_id}/issues/{issue_id}", tags=["Issues"])
async def get_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> IssueSchema:
    """ Return an issue related to the specified project """

    query = select(Issue).where(Issue.id == issue_id)
    result = await session.execute(query)

    return result.scalar()


@app.put("/projects/{project_id}/issues/{issue_id}", tags=["Issues"])
async def update_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        issue: IssueSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> IssueSchema:
    """ Update an issue related to the specified project """

    stmt = update(Issue).where(
        Issue.id == issue_id
        ).values(**issue.model_dump())
    await session.execute(stmt)
    await session.commit()

    return issue


@app.delete("/projects/{project_id}/issues/{issue_id}", tags=["Issues"])
async def delete_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ):
    """ Delete specified issue from specified project """

    stmt = delete(Issue).where(
        Issue.id == issue_id,
        Issue.project_id == project_id
        ).returning(Issue.id)
    result = await session.execute(stmt)

    if result.scalar() is None:
        await session.rollback()
        return {"result": "issue isn't exist"}
    else:
        await session.commit()
        return {"result": "success"}


# TODO: revert last changes for bugtracker (finally find more elegant solution)
# TODO: change structure (replace files, add dirs, add routing, etc...)
# TODO: add try/except blocks
# TODO: implement authentication
# TODO: add tests
