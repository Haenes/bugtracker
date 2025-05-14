from re import compile as re_compile
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import func, or_, select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import UserProjectRole
from src.utils.db import handleDbUniqueError
from .schemas import ProjectSchema, CreatedProjectSchema, UpdateProjectSchema
from .models import Project, ProjectInvite


async def is_correct_invite_token(session: AsyncSession, invite_token: str):
    invite_query = (
        select(ProjectInvite)
        .where(
            ProjectInvite.invite_token == invite_token,
            or_(
                ProjectInvite.max_uses.is_(None),
                ProjectInvite.use_count + 1 < ProjectInvite.max_uses
            ),
            or_(
                ProjectInvite.expires_at.is_(None),
                ProjectInvite.expires_at > func.now()
            )
        )
    )
    invite = await session.scalar(invite_query)

    if invite:
        return invite.project_id, invite.role_id
    raise HTTPException(400, "Incorrect invite token!")


async def add_to_project(session: AsyncSession, invite_token: str, user_id: UUID):
    project_id, role_id = await is_correct_invite_token(session, invite_token)
    is_added = await UserProjectRole.add(session, user_id, project_id, role_id)

    if is_added:
        return {'status': 'Success'}
    raise HTTPException(500, 'Unexpected error, try later')


async def create_project_invite_token(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    invite_token: str
):
    stmt = (
        insert(ProjectInvite)
        .values({
            'creator_id': user_id,
            'project_id': project_id,
            'role_id': 3,
            'invite_token': invite_token,
            # TODO: SET DEFAULT VALUE OF 0 FOR use_count in ProjectInvite model!
            'use_count': 0
        })
        .returning(ProjectInvite.id)
    )
    await session.scalar(stmt)
    await session.commit()


async def create_project_db(
    session: AsyncSession,
    user_id: UUID,
    project: ProjectSchema,
    invite_token: str,
) -> CreatedProjectSchema:
    is_valid_project_name(project.name)

    stmt = (
        insert(Project)
        .values(**project.model_dump(), creator_id=user_id)
        .returning(Project.id)
    )
    created_project = await handleDbUniqueError(session, stmt, is_create=True)

    await UserProjectRole.add(session, user_id, created_project['id'])
    await create_project_invite_token(
        session=session,
        user_id=user_id,
        project_id=created_project['id'],
        invite_token=invite_token
    )
    return created_project


async def get_projects_db(
    session: AsyncSession,
    model: Project,
    user_id: UUID,
    offset: int,
    limit: int,
) -> list[ProjectSchema]:
    projects_query = (
        select(model)
        .join(UserProjectRole, model.id == UserProjectRole.project_id)
        .where(user_id == UserProjectRole.user_id)
        .order_by(model.is_favorite.desc(), model.created_at)
        .offset(offset)
        .limit(limit)
    )
    return await session.scalars(projects_query)


async def get_project_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID
) -> ProjectSchema:

    project_query = (
        select(Project)
        .where(Project.creator_id == user_id, Project.id == project_id)
    )
    project = await session.scalar(project_query)

    if project is None:
        raise HTTPException(404, "Project not found!")
    else:
        return project


async def update_project_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID,
    project: UpdateProjectSchema
) -> ProjectSchema:

    if project.name is not None:
        is_valid_project_name(project.name)

    stmt = (
        update(Project)
        .where(Project.creator_id == user_id, Project.id == project_id)
        .values(**project.model_dump(exclude_none=True))
        .returning(Project)
    )

    updated_project = await handleDbUniqueError(session, stmt)

    if updated_project is None:
        await session.rollback()
        raise HTTPException(400, "The project for the update doesn't exist!")
    else:
        await session.commit()
        return updated_project


async def delete_project_db(
    session: AsyncSession,
    user_id: UUID,
    project_id: UUID
) -> dict[str, str]:

    stmt = (
        delete(Project)
        .where(Project.creator_id == user_id, Project.id == project_id)
        .returning(Project)
    )
    result = await session.scalar(stmt)

    if result is None:
        await session.rollback()
        raise HTTPException(400, "The project to delete doesn't exist!")
    else:
        await session.commit()
        return {"results": "Success"}


def is_valid_project_name(project_name):
    """
    Raises an error if one of these characters is in the project name:
    back/forward slash, :, ?
    """
    pattern = re_compile(r"[\/\\:?=]")

    if pattern.search(project_name):
        raise HTTPException(
            status_code=400,
            detail="Slashes, ':', '?' and '=' not allowed in project name!"
        )
    return True
