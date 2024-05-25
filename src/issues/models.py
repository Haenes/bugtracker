from sqlalchemy import (
    Column, INTEGER, VARCHAR, BIGINT,
    DateTime, ForeignKey
    )
from sqlalchemy import CheckConstraint

from models import BaseClass
from projects.models import Project
from issues.shemas import IssueType, IssueStatus, IssuePriority


class Issue(BaseClass):
    __tablename__ = "bugtracker_issue"

    key = Column(INTEGER, default=1, nullable=False)
    title = Column(VARCHAR(255), unique=True, nullable=False)
    type = Column(VARCHAR, nullable=False)
    priority = Column(VARCHAR, nullable=False)
    status = Column(VARCHAR, nullable=False)
    project_id = Column(BIGINT, ForeignKey(Project.id), nullable=False)
    updated = Column(DateTime(timezone=True), nullable=False)

    CheckConstraint(
        sqltext=type.in_(
            [
                IssueType.bug,
                IssueType.feature
                ]
            ),
        name='issue_type_check'
        )
    CheckConstraint(
        sqltext=priority.in_(
            [
                IssuePriority.lowest,
                IssuePriority.low,
                IssuePriority.medium,
                IssuePriority.high,
                IssuePriority.highest
                ]
            ),
        name='issue_priority_check'
        )
    CheckConstraint(
        sqltext=status.in_(
            [
                IssueStatus.to_do,
                IssueStatus.in_progress,
                IssueStatus.done
                ]
            ),
        name='issue_status_check'
        )
