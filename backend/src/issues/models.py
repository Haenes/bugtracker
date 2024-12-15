from sqlalchemy import (
    VARCHAR, ForeignKey,
    CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column

from models import BaseClass
from .schemas import IssueType, IssueStatus, IssuePriority


class Issue(BaseClass):
    __tablename__ = "issue"

    project_id: Mapped[int] = mapped_column(
        ForeignKey("project.id", ondelete="CASCADE")
    )
    title: Mapped[str] = mapped_column(VARCHAR(255))
    description: Mapped[str | None] = mapped_column(VARCHAR(255), default="")
    type: Mapped[str] = mapped_column(VARCHAR)
    priority: Mapped[str] = mapped_column(VARCHAR)
    status: Mapped[str] = mapped_column(VARCHAR)

    __table_args__ = (
        UniqueConstraint("project_id", "title", name="issue_unique_title"),
        CheckConstraint(
            sqltext=type.in_(
                [
                    IssueType.bug.value,
                    IssueType.feature.value
                ]
            ),
            name='issue_type_check'
        ),
        CheckConstraint(
            sqltext=priority.in_(
                [
                    IssuePriority.lowest.value,
                    IssuePriority.low.value,
                    IssuePriority.medium.value,
                    IssuePriority.high.value,
                    IssuePriority.highest.value
                ]
            ),
            name='issue_priority_check'
        ),
        CheckConstraint(
            sqltext=status.in_(
                [
                    IssueStatus.to_do.value,
                    IssueStatus.in_progress.value,
                    IssueStatus.done.value
                ]
            ),
            name='issue_status_check'
        )
    )
