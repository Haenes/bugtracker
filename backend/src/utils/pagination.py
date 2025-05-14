from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from pydantic import BaseModel

from src.auth.models import UserProjectRole
from src.projects.crud import get_projects_db
from src.projects.models import Project
from src.projects.schemas import ProjectSchema
from src.tasks.crud import get_tasks_db
from src.tasks.models import Task
from src.tasks.schemas import TaskSchemaGet


async def pagination_query_params(page: int = 1, limit: int = 10):
    return {'page': page, 'limit': limit}


pagination_params = Annotated[dict, Depends(pagination_query_params)]


class PaginatedResponse(BaseModel):
    count: int
    page: int
    next_page: int | None
    prev_page: int | None
    total_pages: int | float
    results: list[ProjectSchema] | list[TaskSchemaGet]


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
            raise HTTPException(404, 'This page does not exist!')
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
        model: Project | Task,
        user_id: UUID,
        project_id: UUID | None = None,
    ): ...

    def _items_query(
        session: AsyncSession,
        model: Project | Task,
        user_id: UUID,
        offset: int,
        limit: int,
        project_id: UUID | None = None,
    ): ...

    @classmethod
    async def get_paginated(
        cls,
        session: AsyncSession,
        model: Project | Task,
        pagination_params: pagination_params,
        user_id: UUID,
        project_id: UUID | None = None
    ) -> PaginatedResponse | NoItemsResponse:
        page, limit = pagination_params['page'], pagination_params['limit']

        if page < 0 or limit < 0:
            raise HTTPException(
                status_code=400,
                detail='The page and/or limit cannot be less than zero!'
            )
        offset = (page - 1) * limit

        count = await cls._count_query(session, model, user_id, project_id)

        if not isinstance(count, int):
            return count

        total_pages, next_page, previous_page = cls._validate_params(count, limit, page)
        results = await cls._items_query(
            session=session,
            model=model,
            user_id=user_id,
            offset=offset,
            limit=limit,
            project_id=project_id
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
        model: Project,
        user_id: UUID,
        project_id: UUID | None = None,
    ):
        count_query = (
            select(func.count(model.id))
            .select_from(model)
            .join(UserProjectRole, UserProjectRole.user_id == user_id)
            .where(model.id == UserProjectRole.project_id,)
        )
        count = await session.scalar(count_query)

        if count == 0:
            return NoItemsResponse(results="You don't have any project!")
        return count

    @staticmethod
    async def _items_query(
        session: AsyncSession,
        model: Project,
        user_id: UUID,
        offset: int,
        limit: int,
        project_id: UUID | None = None,
    ):
        return await get_projects_db(session, model, user_id, offset, limit)


class TasksPagination(PaginationInterface):

    @staticmethod
    async def _is_project_exist_query(
        session: AsyncSession,
        model: Task,
        user_id: UUID,
        project_id: UUID,
    ):
        _is_project_exist_query = (
            select(Project)
            .where(Project.creator_id == user_id, Project.id == project_id)
        )
        is_project_exist = await session.scalar(_is_project_exist_query)

        if not is_project_exist:
            raise HTTPException(404, 'Project not found!')

    @staticmethod
    async def _count_query(
        session: AsyncSession,
        model: Task,
        user_id: UUID,
        project_id: UUID,
    ):
        await TasksPagination._is_project_exist_query(
            session=session,
            model=model,
            user_id=user_id,
            project_id=project_id
        )

        count_query = (
            select(func.count(model.id))
            .select_from(model)
            .where(model.creator_id == user_id, model.project_id == project_id)
        )
        count = await session.scalar(count_query)

        if count == 0:
            return NoItemsResponse(
                results="You don't have any tasks for this project!"
            )
        return count

    @staticmethod
    async def _items_query(
        session: AsyncSession,
        model: Task,
        user_id: UUID,
        offset: int,
        limit: int,
        project_id: UUID
    ):
        return await get_tasks_db(session, model, user_id, offset, limit, project_id)
