from datetime import datetime
from enum import Enum
from typing import Annotated

from fastapi import FastAPI, Path
from pydantic import BaseModel, Field

app = FastAPI()


class ProjectType(Enum):
    fullstack = "Fullstack"
    front_end = "Front-end"
    back_end = "Back-end"


class Project(BaseModel):
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


projects_d = {
    1: {
        "id": 1, "name": "Test", "key": "TEST", "type": "Fullstack",
        "author_id": 1, "starred": True, "created": datetime.now()
    },
    2: {
        "id": 2, "name": "Test2", "key": "TESTING", "type": "Back-end",
        "author_id": 1, "starred": False, "created": datetime.now()
    }
}

issues = {
    1: {
        "id": 1, "project_id": 1, "title": "Test", "key": "TEST",
        "type": "Feature", "priority": "Low", "status": "To do",
        "author_id": 1, "created": datetime.now(), "updated": datetime.now()
    },
    2: {
        "id": 2, "project_id": 1, "title": "Test", "key": "TESTING",
        "type": "Bug", "description": "blah-blah", "priority": "Highest",
        "status": "In progress", "author_id": 1,
        "created": datetime.now(), "updated": datetime.now()
    },
}


@app.get("/projects", tags=["Projects"])
async def projects() -> list[Project]:
    """ Return all user projects with pagination = 10 projects/page. """

    return [project for project in projects_d.values()]


@app.post("/projects", status_code=201, tags=["Projects"])
async def create_project(project: Project) -> Project:
    """ Create a new project. """

    return project


@app.get("/projects/{project_id}", tags=["Projects"])
async def get_project(project_id: Annotated[int, Path(ge=1)]) -> Project:
    """ Return specified project. """

    return [
        project for project in projects_d if project["id"] == project_id
        ][0]


@app.put("/projects/{project_id}", tags=["Projects"])
async def update_project_put(
        project_id: Annotated[int, Path(ge=1)],
        project: Project
        ):
    """ Update already exists project via PUT request. """

    projects_d[project_id] = project
    return projects_d[project_id]


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
