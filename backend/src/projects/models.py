from datetime import datetime
from secrets import token_urlsafe
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import (
    TEXT, Index, VARCHAR, UniqueConstraint,
    DateTime, ForeignKey, delete, insert, select, text, update
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from src.utils.db import Base, INT_PK, UUID_PK
from src.models import BaseClass, to_tsvector
from .schemas import (
    CreateProjectInviteSchema,
    UpdateProjectInviteSchema,
    ProjectInviteSchema
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


class ProjectInvite(Base):
    __tablename__ = 'project_invite'

    id: Mapped[INT_PK]
    creator_id: Mapped[UUID] = mapped_column(ForeignKey('user.id', ondelete='CASCADE'))
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey('project.id', ondelete='CASCADE')
    )
    role_id: Mapped[int] = mapped_column(ForeignKey('role.id', ondelete='CASCADE'))
    invite_token: Mapped[str] = mapped_column(VARCHAR(255))
    max_uses: Mapped[int | None] = mapped_column(nullable=True)
    use_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text('CURRENT_TIMESTAMP')
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    async def add(
        session: AsyncSession,
        project_id: UUID,
        user_id: UUID,
        project_invite: CreateProjectInviteSchema | None = None
    ) -> dict[str, int]:
        if project_invite is None:
            # For case, when project invite is creating inside create_project_db().
            project_invite_dict = {'role_id': 3}
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

    async def get_all(
        session: AsyncSession,
        project_id: UUID
    ) -> list[ProjectInviteSchema]:
        project_invites_query = (
            select(ProjectInvite)
            .where(ProjectInvite.project_id == project_id)
        )
        project_invites = await session.scalars(project_invites_query)
        return project_invites.all()

    async def update(
        session: AsyncSession,
        invite_id: UUID,
        invite: UpdateProjectInviteSchema
    ) -> ProjectInviteSchema:
        update_invite_stmt = (
            update(ProjectInvite)
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

    async def delete(
        session: AsyncSession,
        invite_id: int
    ) -> dict[str, str]:
        stmt = (
            delete(ProjectInvite)
            .where(ProjectInvite.id == invite_id)
            .returning(ProjectInvite.id)
        )
        is_deleted = await session.scalar(stmt)

        if is_deleted:
            await session.commit()
            return {'status': 'Success'}
        await session.rollback()
        raise HTTPException(400, "The invite to delete doesn't exist!")
