from typing import Annotated

from fastapi import APIRouter, Depends, Path

from sqlalchemy.ext.asyncio import AsyncSession

from db import get_async_session
from auth.manager import User, current_active_user
from pagination import (
    PaginatedResponse, NoItemsResponse, paginate, pagination_params
    )
from .schemas import (
    CreateIssueSchema,  UpdateIssueSchema,
    CreatedIssueSchema, IssueSchema
    )
from .models import Issue
from .crud import (
    create_issue_db, get_issue_db,
    update_issue_db, delete_issue_db
    )


router = APIRouter(
    prefix="/projects/{project_id}/issues",
    tags=["Issues"]
)


@router.get("/")
async def get_issues(
        project_id: Annotated[int, Path(ge=1)],
        pagination_params: pagination_params,
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> PaginatedResponse | NoItemsResponse:
    """ Return all issues related with specified project with pagination. """

    return await paginate(
        session, Issue,
        pagination_params, user.id, project_id
        )


@router.post("/", status_code=201)
async def create_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue: CreateIssueSchema,
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> CreatedIssueSchema:
    """ Create a new issue related to the specified project """

    return await create_issue_db(session, user.id, project_id, issue)


@router.get("/{issue_id}")
async def get_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> IssueSchema:
    """ Return an issue related to the specified project """

    return await get_issue_db(session, user.id, project_id, issue_id)


@router.patch("/{issue_id}")
async def update_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        issue: UpdateIssueSchema,
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ) -> IssueSchema:
    """ Update an issue related to the specified project """

    return await update_issue_db(session, user.id, project_id, issue_id, issue)


@router.delete("/{issue_id}")
async def delete_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session),
        user: User = Depends(current_active_user)
        ):
    """ Delete specified issue from specified project """

    return await delete_issue_db(session, user.id, project_id, issue_id)
