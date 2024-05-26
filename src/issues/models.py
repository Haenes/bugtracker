from fastapi import HTTPException

from sqlalchemy import (
    Column, INTEGER, VARCHAR, BIGINT,
    DateTime, ForeignKey, CheckConstraint,
    select, insert, update, delete
    )
from sqlalchemy.ext.asyncio import AsyncSession

from models import BaseClass
from projects.models import Project
from issues.shemas import IssueType, IssueStatus, IssuePriority, IssueSchema


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


async def create_issue_db(
        session: AsyncSession,
        project_id: int,
        issue: IssueSchema
        ) -> IssueSchema:

    # Query to check if there is a project with the received id
    query = select(Project.id).where(Project.id == project_id)
    project = await session.scalar(query)

    if project is None:
        await session.rollback()
        raise HTTPException(
            400,
            "You can't create an issue for a non-existent project!"
            )
    else:
        stmt = insert(Issue).values(**issue.model_dump()).returning(Issue)
        new_issue = await session.scalar(stmt)

        await session.commit()
        return new_issue


async def get_issue_db(
        session: AsyncSession,
        project_id: int,
        issue_id) -> IssueSchema:

    query = select(Issue).where(
        Issue.id == issue_id,
        Issue.project_id == project_id
        )

    issue = await session.scalar(query)

    if issue is None:
        raise HTTPException(
            404,
            ("Issue not found! Make sure that the correct data is passed.")
            )
    else:
        return issue


async def update_issue_db(
        session: AsyncSession,
        project_id: int,
        issue_id: int,
        issue: IssueSchema
        ) -> IssueSchema:

    stmt = update(Issue).where(
        Issue.id == issue_id,
        Issue.project_id == project_id
        ).values(**issue.model_dump()).returning(Issue)

    updated_issue = await session.scalar(stmt)

    if updated_issue is None:
        await session.rollback()
        raise HTTPException(400, "The issue for the update doesn't exist!")
    else:
        await session.commit()
        return updated_issue


async def delete_issue_db(
        session: AsyncSession,
        project_id: int,
        issue_id: int
        ) -> dict[str, str]:

    stmt = delete(Issue).where(
        Issue.id == issue_id,
        Issue.project_id == project_id
        ).returning(Issue)
    result = await session.scalar(stmt)

    if result is None:
        await session.rollback()
        raise HTTPException(
            400,
            "The issue to delete doesn't exist!"
            )
    else:
        await session.commit()
        return {"result": "Success"}
