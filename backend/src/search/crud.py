from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from projects.models import Project
from issues.models import Issue
from models import to_tsvector
from .schemas import SearchResultsResponse, NoItemsResponse


async def fulltext_search(
    q: str,
    session: AsyncSession,
    user_id: int
) -> SearchResultsResponse | NoItemsResponse:

    projects_query = (
        select(Project.id, Project.name)
        .where(
            Project.author_id == user_id,
            to_tsvector("name", "key", regconfig="english").bool_op("@@")(
                func.plainto_tsquery("english", q)
            )
        )
    )
    projects_results = await session.execute(projects_query)

    issues_query = (
        select(Issue.project_id, Issue.id, Issue.title)
        .where(
            Issue.author_id == user_id,
            to_tsvector("title", "description", regconfig="english").bool_op("@@")(
                func.plainto_tsquery("english", q)
            )
        )
    )
    issues_results = await session.execute(issues_query)

    results = {
        "projects": projects_results.mappings().fetchall(),
        "issues": issues_results.mappings().fetchall()
    }

    if not results["projects"] and not results["issues"]:
        return NoItemsResponse(detail="No results")
    return results
