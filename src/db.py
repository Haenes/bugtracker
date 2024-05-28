from typing import AsyncGenerator, Annotated

from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker, create_async_engine
)

from config import DB_URI


intpk = Annotated[int, mapped_column(primary_key=True)]


class Base(DeclarativeBase):
    pass


engine = create_async_engine(url=DB_URI)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
