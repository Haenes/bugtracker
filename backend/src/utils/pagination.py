from typing import Annotated

from fastapi import Depends, HTTPException

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel

from projects.schemas import ProjectSchema, PaginationProject
from projects.models import Project
from issues.schemas import IssueSchema, PaginationIssue


async def pagination_query_params(page: int = 1, limit: int = 10):
    return {"page": page, "limit": limit}


pagination_params = Annotated[dict, Depends(pagination_query_params)]


class PaginatedResponse(BaseModel):
    """ Response schema for endpoints with pagination. """

    count: int
    page: int
    next_page: int | None
    prev_page: int | None
    total_pages: int | float
    results: list[PaginationProject] | list[PaginationIssue]


class NoItemsResponse(BaseModel):
    """
    Response schema for endpoints with pagination
    that don't have any items to paginate.
    """
    results: str


class Pagination:

    @staticmethod
    def _params_helper(count: int, limit: int, page: int) -> tuple[int, int, int]:
        """ A function for validating and processing params. """

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

    @classmethod
    async def get_paginated(
        cls,
        session: AsyncSession,
        model: ProjectSchema | IssueSchema,
        pagination_params: pagination_params,
        user_id: int,
        project_id: int | None = None
    ) -> PaginatedResponse | NoItemsResponse:
        """ Return paginated response for projects and issues. """

        page, limit = pagination_params["page"], pagination_params["limit"]

        if page < 0 or limit < 0:
            raise HTTPException(
                400,
                "The page and/or limit cannot be less than zero!"
            )
        offset = (page - 1) * limit

        if project_id:
            is_project_exist = (
                select(Project)
                .where(Project.author_id == user_id, Project.id == project_id)
            )
            result = await session.scalar(is_project_exist)

            if not result:
                raise HTTPException(404, "Project not found!")

        # First quary to get count of all items.
        count_query = (
            select(func.count())
            .select_from(model)
            .where(
                model.author_id == user_id, model.project_id == project_id
                if project_id
                else model.author_id == user_id
            )
        )
        count = await session.scalar(count_query)

        if count == 0 and project_id:
            return NoItemsResponse(
                results="You don't have any issues for this project!"
            )
        elif count == 0:
            return NoItemsResponse(results="You don't have any project!")

        total_pages, next_page, previous_page = cls._params_helper(count, limit, page)

        # Second quary to get items with specified limit and offset.
        results_query = (
            select(model)
            .where(
                model.author_id == user_id, model.project_id == project_id
                if project_id
                else model.author_id == user_id
            )
            .order_by(model.id)
            .offset(offset)
            .limit(limit)
        )
        results = await session.scalars(results_query)

        return PaginatedResponse(
            count=count,
            page=page,
            next_page=next_page,
            prev_page=previous_page,
            total_pages=total_pages,
            results=results.all()
        )
