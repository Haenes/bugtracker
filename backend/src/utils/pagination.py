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
    count: int
    page: int
    next_page: int | None
    prev_page: int | None
    total_pages: int | float
    results: list[PaginationProject] | list[PaginationIssue]


class NoItemsResponse(BaseModel):
    results: str


class PaginationInterface:

    @staticmethod
    def _validate_params(
        count: int,
        limit: int,
        page: int,
    ) -> tuple[int, int, int]:

        total_pages = (
            count / limit
            if count % limit == 0
            else count // limit + 1
        )

        if total_pages < page:
            raise HTTPException(404, "This page does not exist!")
        else:
            next_page = page + 1 if total_pages - page != 0 else None
            previous_page = (
                page - 1
                if page - 1 > 0 and page - 1 < total_pages
                else None
            )

        return total_pages, next_page, previous_page

    @staticmethod
    def _count_query(
        session: AsyncSession,
        model: ProjectSchema | IssueSchema,
        user_id: int,
        project_id: int | None = None,
    ): ...

    def _items_query(
        session: AsyncSession,
        model: ProjectSchema | IssueSchema,
        user_id: int,
        offset: int,
        limit: int,
        project_id: int | None = None,
    ): ...

    @classmethod
    async def get_paginated(
        cls,
        session: AsyncSession,
        model: ProjectSchema | IssueSchema,
        pagination_params: pagination_params,
        user_id: int,
        project_id: int | None = None
    ) -> PaginatedResponse | NoItemsResponse:

        page, limit = pagination_params["page"], pagination_params["limit"]

        if page < 0 or limit < 0:
            raise HTTPException(
                400,
                "The page and/or limit cannot be less than zero!"
            )
        offset = (page - 1) * limit

        count = await cls._count_query(session, model, user_id, project_id)

        if not isinstance(count, int):
            return count

        total_pages, next_page, previous_page = cls._validate_params(count, limit, page)
        results = await cls._items_query(
            session,
            model,
            user_id,
            offset,
            limit,
            project_id
        )

        return PaginatedResponse(
            count=count,
            page=page,
            next_page=next_page,
            prev_page=previous_page,
            total_pages=total_pages,
            results=results.all()
        )


class ProjectsPagination(PaginationInterface):

    @staticmethod
    async def _count_query(
        session: AsyncSession,
        model: ProjectSchema,
        user_id: int,
        project_id: int | None = None,
    ):
        count_query = (
            select(func.count())
            .select_from(model)
            .where(model.author_id == user_id)
        )
        count = await session.scalar(count_query)

        if count == 0:
            return NoItemsResponse(results="You don't have any project!")
        return count

    @staticmethod
    async def _items_query(
        session: AsyncSession,
        model: ProjectSchema,
        user_id: int,
        offset: int,
        limit: int,
        project_id: int | None = None,
    ):
        results_query = (
            select(model)
            .where(model.author_id == user_id)
            .order_by(model.starred.desc(), model.created)
            .offset(offset)
            .limit(limit)
        )
        return await session.scalars(results_query)


class IssuesPagination(PaginationInterface):

    @staticmethod
    async def _is_project_exist_query(
        session: AsyncSession,
        model: IssueSchema,
        user_id: int,
        project_id: int,
    ):
        _is_project_exist_query = (
            select(Project)
            .where(Project.author_id == user_id, Project.id == project_id)
        )
        is_project_exist = await session.scalar(_is_project_exist_query)

        if not is_project_exist:
            raise HTTPException(404, "Project not found!")

    @staticmethod
    async def _count_query(
        session: AsyncSession,
        model: IssueSchema,
        user_id: int,
        project_id: int,
    ):
        await IssuesPagination._is_project_exist_query(
            session,
            model,
            user_id,
            project_id
        )

        count_query = (
            select(func.count())
            .select_from(model)
            .where(model.author_id == user_id, model.project_id == project_id)
        )
        count = await session.scalar(count_query)

        if count == 0 and project_id:
            return NoItemsResponse(
                results="You don't have any issues for this project!"
            )
        return count

    @staticmethod
    async def _items_query(
        session: AsyncSession,
        model: IssueSchema,
        user_id: int,
        offset: int,
        limit: int,
        project_id: int
    ):
        results_query = (
            select(model)
            .where(model.author_id == user_id, model.project_id == project_id)
            .order_by(model.type, model.created)
            .offset(offset)
            .limit(limit)
        )
        return await session.scalars(results_query)
