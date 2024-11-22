from typing import AsyncGenerator, Annotated

from fastapi import HTTPException

from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker, create_async_engine
)

from config import DB_URI


intpk = Annotated[int, mapped_column(primary_key=True, index=True)]


class Base(DeclarativeBase):
    pass


engine = create_async_engine(url=DB_URI)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def handleDbUniqueError(session: AsyncSession, stmt):
    """
    Performs an operation that may result in a uniqueness error
    on the part of the database and processes it
    by calling the appropriate exception.

    Also helps to get rid of repeating the same try/except/else construction.
    """

    try:
        result = await session.scalar(stmt)
    except IntegrityError as e:
        await session.rollback()
        error = repr(e.orig.__cause__)

        errors_dict = {
            "issue_title_key": "Issue with this title already exist!",
            "project_key_key": "Project with this key already exist!",
            "project_name_key": "Project with this name already exist!"
        }

        for k, v in errors_dict.items():
            if k in error:
                raise HTTPException(400, v)
    else:
        await session.commit()
        return result
