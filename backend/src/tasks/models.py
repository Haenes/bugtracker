from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    TEXT, SMALLINT, VARCHAR, DateTime,
    ForeignKey, Index, UniqueConstraint,
    text as sa_text,
)
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.associationproxy import AssociationProxy
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.utils.db import Base, SMALLINT_PK, BIGINT_PK
from src.models import BaseClass, to_tsvector


class Task(BaseClass):
    __tablename__ = 'task'

    project_id: Mapped[UUID] = mapped_column(
        ForeignKey('project.id', ondelete='CASCADE')
    )
    assignee_id: Mapped[UUID | None] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE'),
        nullable=True
    )
    name: Mapped[str] = mapped_column(VARCHAR(100))
    description: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    type_id: Mapped[int] = mapped_column(ForeignKey('task_type.id', ondelete='CASCADE'))
    priority_id: Mapped[int] = mapped_column(
        ForeignKey('task_priority.id', ondelete='CASCADE')
    )
    status_id: Mapped[int] = mapped_column(
        ForeignKey('task_status.id', ondelete='CASCADE')
    )
    deadline_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    type_rel: Mapped['TaskType'] = relationship(innerjoin=True)
    priority_rel: Mapped['TaskPriority'] = relationship(innerjoin=True)
    status_rel: Mapped['TaskStatus'] = relationship(innerjoin=True)

    type: AssociationProxy[str] = association_proxy('type_rel', 'name')
    priority: AssociationProxy[str] = association_proxy('priority_rel', 'name')
    status: AssociationProxy[str] = association_proxy('status_rel', 'name')

    __table_args__ = (
        UniqueConstraint('name', 'project_id'),
        Index(
            'ix_task_fts',
            to_tsvector('name', 'description'),
            postgresql_using='gin'
        ),
    )


class TaskPriority(Base):
    __tablename__ = 'task_priority'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))
    weight: Mapped[int] = mapped_column(SMALLINT)


class TaskType(Base):
    __tablename__ = 'task_type'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))


class TaskStatus(Base):
    __tablename__ = 'task_status'

    id: Mapped[SMALLINT_PK]
    name: Mapped[str] = mapped_column(VARCHAR(20))


class TaskHistory(Base):
    __tablename__ = 'task_history'

    id: Mapped[BIGINT_PK]
    changed_by: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    task_id: Mapped[UUID] = mapped_column(
        ForeignKey('task.id', ondelete='CASCADE')
    )
    changed_field: Mapped[str] = mapped_column(VARCHAR(255))
    old_value: Mapped[str] = mapped_column(VARCHAR(255))
    new_value: Mapped[str] = mapped_column(VARCHAR(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=sa_text('CURRENT_TIMESTAMP')
    )


class TaskComment(Base):
    __tablename__ = 'task_comment'

    id: Mapped[BIGINT_PK]
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    task_id: Mapped[UUID] = mapped_column(
        ForeignKey('task.id', ondelete='CASCADE')
    )
    text: Mapped[str] = mapped_column(TEXT)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=sa_text('CURRENT_TIMESTAMP')
    )
