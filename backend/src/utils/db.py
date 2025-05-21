from typing import AsyncGenerator, Annotated
from uuid import UUID

from fastapi import HTTPException

from sqlalchemy import SMALLINT, BIGINT, MetaData, text
from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine
)

from src.config import settings


SMALLINT_PK = Annotated[int, mapped_column(SMALLINT, primary_key=True, index=True)]
INT_PK = Annotated[int, mapped_column(primary_key=True, index=True)]
BIGINT_PK = Annotated[int, mapped_column(BIGINT, primary_key=True, index=True)]
UUID_PK = Annotated[
    UUID,
    mapped_column(
        primary_key=True,
        index=True,
        server_default=text("gen_random_uuid()")
    )
]


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention={
        'ix': 'ix_%(column_0_label)s',
        'uq': 'uq_%(table_name)s_%(column_0_name)s',
        'ck': 'ck_%(table_name)s_`%(constraint_name)s`',
        'fk': 'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s',
        'pk': 'pk_%(table_name)s'
    })

    def __repr__(self):
        cols = [f'{col}={getattr(self, col)}' for col in self.__table__.columns.keys()]
        return f'{self.__class__.__name__}({', '.join(cols)})'

    def columns_to_dict(self):
        '''Convert Row to dict when using execute()
        with field(s) from other models (tables).
        '''
        columns_dict = {}

        for key in self.__mapper__.c.keys():
            columns_dict[key] = getattr(self, key)
        return columns_dict


engine = create_async_engine(url=settings.get_db_url(), echo=True)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def handleDbUniqueError(
    session: AsyncSession,
    stmt,
    is_create: bool = False,
    is_task_update: bool = False,
):
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
            'uq_task_name': 'Task with this name already exist!',
            'uq_project_key': 'Project with this key already exist!',
            'pk_user_project_role': 'This user has already joined the project!'
        }

        for k, v in errors_dict.items():
            if k in error:
                raise HTTPException(400, v)
    else:
        if is_task_update:
            # Prevent commit, because it's just a part of one big transaction.
            # Check tasks.crud.update
            return result

        await session.commit()

        if is_create:
            return {"id": result}
        return result
