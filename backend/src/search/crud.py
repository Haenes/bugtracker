from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.projects.models import Project
from src.tasks.models import Task
from src.models import to_tsvector
from .schemas import SearchResultsResponse, NoItemsResponse


async def fulltext_search(
    q: str,
    session: AsyncSession,
    user_id: UUID
) -> SearchResultsResponse | NoItemsResponse:

    projects_query = (
        select(Project.id, Project.name, Project.key)
        .where(
            Project.creator_id == user_id,
            to_tsvector("name", "key", regconfig="english").bool_op("@@")(
                func.plainto_tsquery("english", q)
            )
        )
    )
    projects_results = await session.execute(projects_query)

    tasks_query = (
        select(Task.project_id, Task.id, Task.name)
        .where(
            Task.creator_id == user_id,
            to_tsvector("name", "description", regconfig="english").bool_op("@@")(
                func.plainto_tsquery("english", q)
            )
        )
    )
    tasks_results = await session.execute(tasks_query)

    results = {
        "projects": projects_results.mappings().fetchall(),
        "tasks": tasks_results.mappings().fetchall()
    }

    if not results["projects"] and not results["tasks"]:
        return NoItemsResponse(detail="No results")
    return results
