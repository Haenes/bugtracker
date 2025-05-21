from datetime import datetime
from re import compile as re_compile
from secrets import token_urlsafe
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import (
    TEXT, Index, VARCHAR, UniqueConstraint,
    DateTime, ForeignKey, or_, func, insert, select, text,
    update as sa_update, delete as sa_delete
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from src.models import UserProjectRole
from src.utils.db import Base, INT_PK, UUID_PK, handleDbUniqueError
from src.models import BaseClass, to_tsvector
from .schemas import (
    ProjectSchema, ProjectsSchema,
    CreatedProjectSchema, UpdateProjectSchema,
    CreateProjectInviteSchema, ProjectInviteSchema, UpdateProjectInviteSchema
)


class Project(BaseClass):
    __tablename__ = 'project'

    id: Mapped[UUID_PK]
    name: Mapped[str] = mapped_column(VARCHAR(100))
    key: Mapped[str] = mapped_column(VARCHAR(10))
    description: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    is_favorite: Mapped[bool | None] = mapped_column(default=False)

    __table_args__ = (
        UniqueConstraint('key', 'creator_id'),
        Index('ix_project_fts', to_tsvector('name', 'key'), postgresql_using='gin'),
    )

    async def create(
        session: AsyncSession,
        user_id: UUID,
        project: ProjectSchema,
    ) -> CreatedProjectSchema:
        Project.is_valid_name(project.name)

        stmt = (
            insert(Project)
            .values(**project.model_dump(), creator_id=user_id)
            .returning(Project.id)
        )
        created_project = await handleDbUniqueError(session, stmt, is_create=True)

        await UserProjectRole.create(session, user_id, created_project['id'])
        await ProjectInvite.create(session, created_project['id'], user_id)
        return created_project

    async def read_all(
        session: AsyncSession,
        user_id: UUID,
        offset: int,
        limit: int,
    ) -> list[ProjectsSchema]:
        projects_query = (
            select(Project, UserProjectRole.role_id)
            .join(UserProjectRole, Project.id == UserProjectRole.project_id)
            .where(UserProjectRole.user_id == user_id)
            .order_by(Project.is_favorite.desc(), Project.created_at)
            .offset(offset)
            .limit(limit)
        )
        res = await session.execute(projects_query)
        projects = res.all()

        return [
            dict(role_id=project[1], **project[0].columns_to_dict())
            for project in projects
        ]

    async def read(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID
    ) -> ProjectSchema:
        # await UserProjectRole.is_permitted(session, user_id, project_id, (1, 2, 3))

        project_query = select(Project).where(Project.id == project_id)
        project = await session.scalar(project_query)

        if not project:
            raise HTTPException(404, "Project not found!")
        else:
            return project

    async def update(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        project: UpdateProjectSchema
    ) -> ProjectSchema:
        await UserProjectRole.is_permitted(
            session=session,
            user_id=user_id,
            project_id=project_id,
            permitted_roles=(1,),
        )

        if project.name is not None:
            Project.is_valid_name(project.name)

        stmt = (
            sa_update(Project)
            .where(Project.creator_id == user_id, Project.id == project_id)
            .values(**project.model_dump(exclude_none=True))
            .returning(Project)
        )

        updated_project = await handleDbUniqueError(session, stmt)

        if not updated_project:
            await session.rollback()
            raise HTTPException(400, "The project for the update doesn't exist!")
        else:
            await session.commit()
            return updated_project

    async def delete(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID
    ) -> dict[str, str]:
        await UserProjectRole.is_permitted(
            session=session,
            user_id=user_id,
            project_id=project_id,
            permitted_roles=(1,),
        )

        stmt = (
            sa_delete(Project)
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

    async def join_to_project(session: AsyncSession, invite_token: str, user_id: UUID):
        project_id, role_id = await ProjectInvite.is_correct_invite_token(
            session=session,
            invite_token=invite_token
        )
        is_added = await UserProjectRole.create(session, user_id, project_id, role_id)

        if is_added:
            await ProjectInvite.increment_use_count(session, invite_token)
            return {'status': 'Success'}
        raise HTTPException(500, 'Unexpected error, try again later')

    def is_valid_name(project_name):
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


class ProjectInvite(Base):
    __tablename__ = 'project_invite'

    id: Mapped[INT_PK]
    creator_id: Mapped[UUID] = mapped_column(ForeignKey('user.id', ondelete='CASCADE'))
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey('project.id', ondelete='CASCADE')
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey('role.id', ondelete='CASCADE'),
        server_default='3'
    )
    invite_token: Mapped[str] = mapped_column(VARCHAR(255))
    max_uses: Mapped[int | None] = mapped_column(nullable=True)
    use_count: Mapped[int] = mapped_column(server_default='0')
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text('CURRENT_TIMESTAMP')
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    async def create(
        session: AsyncSession,
        project_id: UUID,
        user_id: UUID,
        project_invite: CreateProjectInviteSchema | None = None
    ) -> dict[str, int]:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        if not project_invite:
            # For case, when project invite is creating inside projects.crud.create
            project_invite_dict = {}
        else:
            project_invite_dict = dict(project_invite)
        project_invite_dict['creator_id'] = user_id
        project_invite_dict['project_id'] = project_id
        project_invite_dict['invite_token'] = token_urlsafe(16)

        stmt = (
            insert(ProjectInvite)
            .values(**project_invite_dict)
            .returning(ProjectInvite.id)
        )
        created_invite_id = await session.scalar(stmt)
        await session.commit()
        return {'id': created_invite_id}

    async def read_all(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID
    ) -> list[ProjectInviteSchema]:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        project_invites_query = (
            select(ProjectInvite)
            .where(ProjectInvite.project_id == project_id)
        )
        project_invites = await session.scalars(project_invites_query)
        return project_invites.all()

    async def update(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        invite_id: int,
        invite: UpdateProjectInviteSchema
    ) -> ProjectInviteSchema:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        update_invite_stmt = (
            sa_update(ProjectInvite)
            .values(**invite.model_dump(exclude_none=True))
            .where(ProjectInvite.id == invite_id)
            .returning(ProjectInvite)
        )
        updated_invite = await session.scalar(update_invite_stmt)

        if updated_invite:
            await session.commit()
            return updated_invite
        await session.rollback()
        raise HTTPException(400, "The invite for the update doesn't exist!")

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

    async def increment_use_count(session: AsyncSession, invite_token: str):
        update_use_count_stmt = (
            sa_update(ProjectInvite)
            .values(use_count=ProjectInvite.use_count + 1)
            .where(ProjectInvite.invite_token == invite_token)
            .returning(ProjectInvite.use_count)
        )
        invite_use_count = await session.scalar(update_use_count_stmt)

        if invite_use_count:
            await session.commit()
            return True
        await session.rollback()
        raise HTTPException(500, 'Unexpected error, try again later')

    async def delete(
        session: AsyncSession,
        user_id: UUID,
        project_id: UUID,
        invite_id: int
    ) -> dict[str, str]:
        await UserProjectRole.is_permitted(session, user_id, project_id)

        stmt = (
            sa_delete(ProjectInvite)
            .where(ProjectInvite.id == invite_id)
            .returning(ProjectInvite.id)
        )
        is_deleted = await session.scalar(stmt)

        if is_deleted:
            await session.commit()
            return {'status': 'Success'}
        await session.rollback()
        raise HTTPException(400, "The invite to delete doesn't exist!")
