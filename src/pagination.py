from fastapi import HTTPException

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel

from projects.shemas import ProjectSchema
from issues.shemas import IssueSchema


class PaginatedResponse(BaseModel):
    """ Response schema for endpoints with pagination """

    count: int | None
    page: int
    next_page: int | None
    prev_page: int | None
    total_pages: int | float
    results: list[ProjectSchema] | list[IssueSchema]


async def paginate(
        session: AsyncSession,
        model: ProjectSchema | IssueSchema,
        page: int,
        limit: int,
        project_id: int | None = None
        ) -> PaginatedResponse:
    """ Paginate the query """

    # Input validation.
    if page < 0 or limit < 0:
        raise HTTPException(400, "The page or limit cannot be less than zero!")

    # First quary to get count of all items.
    count_query = select(func.count()).select_from(model)

    # Variables for pagination.
    count = await session.scalar(count_query)
    offset = (page - 1) * limit
    total_pages = (
        count / limit
        if count % limit == 0
        else count // limit + 1
        )

    # Check that the page value isn't greater than total_pages.
    if total_pages < page:
        raise HTTPException(404, "This page does not exist!")

    # Stores number of the next page, if the current page not last.
    next_page = page + 1 if total_pages - page != 0 else None

    # Stores number of the previous page, if the current page not first.
    previous_page = (
        page - 1
        if page - 1 > 0 and page - 1 < total_pages
        else None
        )

    # Second quary to get items with specified limit and offset.
    # If project_id is not None - pagination for issues else - projects.
    if project_id is not None:
        query2 = select(model).where(
            model.project_id == project_id
            ).order_by(model.id).offset(offset).limit(limit)
    else:
        query2 = select(model).order_by(model.id).offset(offset).limit(limit)

    results = await session.scalars(query2)

    return {
        "count": count,
        "page": page,
        "next_page": next_page,
        "prev_page": previous_page,
        "total_pages": total_pages,
        "results": results.all()
    }
