from typing import Annotated

from fastapi import Depends, HTTPException

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel

from projects.schemas import ProjectSchema
from issues.schemas import IssueSchema


async def pagination_query_params(page: int = 1, limit: int = 10):
    return {"page": page, "limit": limit}


pagination_params = Annotated[dict, Depends(pagination_query_params)]


class PaginatedResponse(BaseModel):
    """ Response schema for endpoints with pagination """

    count: int
    page: int
    next_page: int | None
    prev_page: int | None
    total_pages: int | float
    results: list[ProjectSchema] | list[IssueSchema]


class NoItemsResponse(BaseModel):
    """ Response schema for endpoints with pagination

    that don't have any items to paginate.
    """
    results: str


def _helper(count: int, limit: int, page: int, project_id: int | None = None):
    """ A function for validating and removing repetitions. """

    total_pages = (
        count / limit
        if count % limit == 0
        else count // limit + 1
        )

    # Check that the page value isn't greater than total_pages.
    if total_pages < page:
        raise HTTPException(404, "This page does not exist!")
    else:
        # Stores number of the next page, if the current page not last.
        next_page = page + 1 if total_pages - page != 0 else None

        # Stores number of the previous page, if the current page not first.
        previous_page = (
            page - 1
            if page - 1 > 0 and page - 1 < total_pages
            else None
            )

        return total_pages, next_page, previous_page


async def paginate(
        session: AsyncSession,
        model: ProjectSchema | IssueSchema,
        pagination_params: pagination_params,
        project_id: int | None = None
        ) -> PaginatedResponse | NoItemsResponse:

    page, limit = pagination_params["page"], pagination_params["limit"]

    if page < 0 or limit < 0:
        raise HTTPException(
            400,
            "The page and/or limit cannot be less than zero!"
            )

    offset = (page - 1) * limit

    # Block for issues pagination
    if project_id is not None:
        # First quary to get count of all issues.
        count_query = (
            select(func.count()).
            select_from(model).
            where(model.project_id == project_id)
            )
        count = await session.scalar(count_query)

        if count == 0:
            return NoItemsResponse(
                results="You don't have any issues for this project!"
                )

        total_pages, next_page, previous_page = _helper(
            count, limit, page, project_id
            )

        # Second quary to get issues with specified limit and offset.
        query2 = (
            select(model).
            where(model.project_id == project_id).
            order_by(model.id).
            offset(offset).limit(limit)
            )

    # Block for projects pagination
    else:
        # First quary to get count of all projects.
        count_query = select(func.count()).select_from(model)
        count = await session.scalar(count_query)

        if count == 0:
            return NoItemsResponse(results="You don't have any project!")

        total_pages, next_page, previous_page = _helper(count, limit, page)

        # Second quary to get projects with specified limit and offset.
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
