from fastapi import HTTPException

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from projects.models import Project
from .models import Issue
from .schemas import IssueSchema


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
