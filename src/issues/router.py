from typing import Annotated

from fastapi import APIRouter, Depends, Path

from sqlalchemy import select, insert, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_async_session
from issues.shemas import IssueSchema
from issues.models import Issue


router = APIRouter(
    prefix="/projects/{project_id}/issues",
    tags=["Issues"]
)


@router.get("/")
async def get_issues(
        project_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> list[IssueSchema]:
    """ Return all issues related with specified project. """

    query = select(Issue).where(Issue.project_id == project_id)
    results = await session.execute(query)

    return results.scalars().all()


@router.post("/", status_code=201)
async def create_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue: IssueSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> IssueSchema:
    """ Create a new task related to the specified project """

    stmt = insert(Issue).values(**issue.model_dump())
    await session.execute(stmt)
    await session.commit()

    return issue


@router.get("/{issue_id}")
async def get_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ) -> IssueSchema:
    """ Return an issue related to the specified project """

    query = select(Issue).where(Issue.id == issue_id)
    result = await session.execute(query)

    return result.scalar()


@router.put("/{issue_id}")
async def update_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        issue: IssueSchema,
        session: AsyncSession = Depends(get_async_session)
        ) -> IssueSchema:
    """ Update an issue related to the specified project """

    stmt = update(Issue).where(
        Issue.id == issue_id
        ).values(**issue.model_dump())
    await session.execute(stmt)
    await session.commit()

    return issue


@router.delete("/{issue_id}")
async def delete_issue(
        project_id: Annotated[int, Path(ge=1)],
        issue_id: Annotated[int, Path(ge=1)],
        session: AsyncSession = Depends(get_async_session)
        ):
    """ Delete specified issue from specified project """

    stmt = delete(Issue).where(
        Issue.id == issue_id,
        Issue.project_id == project_id
        ).returning(Issue.id)
    result = await session.execute(stmt)

    if result.scalar() is None:
        await session.rollback()
        return {"result": "issue isn't exist"}
    else:
        await session.commit()
        return {"result": "success"}
