from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    TEXT, Index, VARCHAR, UniqueConstraint,
    DateTime, ForeignKey, text
)
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.db import Base, INT_PK, UUID_PK
from src.models import BaseClass, to_tsvector


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
    creator_id: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    project_id: Mapped[UUID] = mapped_column(
        ForeignKey('project.id', ondelete='CASCADE')
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey('role.id', ondelete='CASCADE')
    )
    invite_token: Mapped[str] = mapped_column(VARCHAR(255))
    max_uses: Mapped[int | None] = mapped_column(nullable=True)
    use_count: Mapped[int] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text('CURRENT_TIMESTAMP')
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
