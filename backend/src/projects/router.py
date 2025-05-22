from uuid import UUID

from fastapi import APIRouter, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User as UserModel
from src.models import UserProjectRole
from src.auth.manager import User, current_active_user
from src.auth.schemas import (
    UsersInProjectSchema,
    NoUsersInProjectSchema,
    UpdateUserInProjectSchema
)
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
        f"{user.id}_projects_{pagination_params}",
        ProjectsPagination.get_paginated,
        session, pagination_params, user.id
    )


@router.post("", status_code=201)
async def create_project(
    project: CreateProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> CreatedProjectSchema:
    await cache_delete_all(cache, f"{user.id}_projects_*")
    return await Project.create(session, user.id, project)


@router.get("/{project_id}")
async def get_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
) -> ProjectSchema:
    return await Project.read(session, user.id, project_id)


@router.patch("/{project_id}")
async def update_project(
    project_id: UUID,
    project: UpdateProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> ProjectSchema:
    await cache_delete_all(cache, f"{user.id}_projects_*")
    return await Project.update(session, user.id, project_id, project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client)
) -> dict[str, str]:
    await cache_delete_all(cache, f"{user.id}_projects_*")
    return await Project.delete(session, user.id, project_id)


@router.post("/{project_id}/invite-links")
async def create_invite_link(
    project_id: UUID,
    project_invite: CreateProjectInviteSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> CreatedProjectInviteSchema:
    return await ProjectInvite.create(
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
    return await ProjectInvite.read_all(session, user.id, project_id)


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
        user_id=user.id,
        project_id=project_id,
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
    return await ProjectInvite.delete(session, user.id, project_id, invite_id)


@router.post("/invite-to/{project_id}")
async def invite_to_project(
    project_id: UUID,
    data_for_invite: DataForInviteSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> dict[str, str]:
    await Project.is_exist(session, user.id, project_id)
    user_email = await UserModel.get_email(session, data_for_invite.user.id)

    # TODO: Remove strict params here after refactor of email stuff.
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
    await cache_delete_all(cache, f"{user.id}_projects_*")
    return await Project.join_to_project(session, invite_token, user.id)


@router.get("/{project_id}/users")
async def get_users_in_project(
    project_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
) -> list[UsersInProjectSchema] | NoUsersInProjectSchema:
    return await UserProjectRole.read_all_users(session, user.id, project_id)


@router.patch("/{project_id}/users/{user_id}")
async def edit_user_role_in_project(
    project_id: UUID,
    user_id: UUID,
    data: UpdateUserInProjectSchema,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client),
) -> dict[str, str]:
    updated = await UserProjectRole.update(
        session=session,
        user_id=user.id,
        project_id=project_id,
        user_to_update=user_id,
        role_id=data.role_id
    )
    await cache_delete_all(cache, f"{user.id}_projects_*")
    return updated


@router.delete("/{project_id}/users/{user_id}")
async def remove_user_from_project(
    project_id: UUID,
    user_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    cache: Redis = Depends(get_redis_client),
) -> dict[str, str]:
    deleted = await UserProjectRole.delete(session, user_id, project_id)
    await cache_delete_all(cache, f"{user.id}_projects_*")
    return deleted
