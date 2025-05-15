from uuid import UUID

from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User as UserModel
from src.auth.manager import User, current_active_user
from src.utils.db import get_async_session
from src.utils.cache import (
    Redis, get_redis_client,
    cache_get_or_set, cache_delete_all
)
from src.utils.tasks import celery_send_email
from src.utils.pagination import (
    PaginatedResponse, NoItemsResponse,
    pagination_params, ProjectsPagination
)
from .schemas import (
    CreateProjectSchema,
    ProjectSchema, CreatedProjectSchema,
    UpdateProjectSchema, DataForInviteSchema,
    CreateProjectInviteSchema, CreatedProjectInviteSchema,
    UpdateProjectInviteSchema, ProjectInviteSchema
)
from .models import Project, ProjectInvite
from .crud import (
    add_to_project, get_project_db, create_project_db,
    update_project_db, delete_project_db
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("")
async def projects(
    pagination_params: pagination_params,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> PaginatedResponse | NoItemsResponse:
    """ Return all user projects with pagination. """
    return await cache_get_or_set(
        cache,
        f"projects_{user.id}_{pagination_params}",
        ProjectsPagination.get_paginated,
        session, Project, pagination_params, user.id
    )


@router.post("", status_code=201)
async def create_project(
    project: CreateProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> CreatedProjectSchema:
    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await create_project_db(session, user.id, project)


@router.get("/{project_id}")
async def get_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
) -> ProjectSchema:
    return await get_project_db(session, user.id, project_id)


@router.patch("/{project_id}")
async def update_project(
    project_id: UUID,
    project: UpdateProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> ProjectSchema:
    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await update_project_db(session, user.id, project_id, project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> dict[str, str]:
    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await delete_project_db(session, user.id, project_id)


@router.post("/{project_id}/invite-links")
async def create_invite_link(
    project_id: UUID,
    project_invite: CreateProjectInviteSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> CreatedProjectInviteSchema:
    return await ProjectInvite.add(
        session=session,
        project_id=project_id,
        user_id=user.id,
        project_invite=project_invite
    )


@router.get("/{project_id}/invite-links")
async def invite_links(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> list[ProjectInviteSchema]:
    project_invites = await ProjectInvite.get_all(session, project_id)
    return project_invites


@router.patch("/{project_id}/invite-links/{invite_id}")
async def update_invite_link(
    project_id: UUID,
    invite_id: int,
    project_invite: UpdateProjectInviteSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> ProjectInviteSchema:
    return await ProjectInvite.update(
        session=session,
        invite_id=invite_id,
        invite=project_invite
    )


@router.delete("/{project_id}/invite-links/{invite_id}")
async def delete_invite_link(
    project_id: UUID,
    invite_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> dict[str, str]:
    return await ProjectInvite.delete(session=session, invite_id=invite_id)


@router.post("/invite-to/{project_id}")
async def invite_to_project(
    project_id: UUID,
    data_for_invite: DataForInviteSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> dict[str, str]:
    user_email = await UserModel.get_email(session, data_for_invite.user.id)

    celery_send_email.delay(
        "EmailInviteToProject",
        user=User(email=user_email, first_name=data_for_invite.user.first_name),
        token=data_for_invite.invite_token,
        params={'client': 'api', 'lang': 'en'}
    )
    return {'status': 'Success'}


@router.post("/join-to/{invite_token}")
async def join_to_project(
    invite_token: str,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> dict[str, str]:
    await cache_delete_all(cache, f"projects_{user.id}_*")
    return await add_to_project(session, invite_token, user.id)
