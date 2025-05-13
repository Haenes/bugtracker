from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, func, text, literal
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.db import Base, UUID_PK


class BaseClass(Base):
    __abstract__ = True

    id: Mapped[UUID_PK]
    creator_id: Mapped[UUID] = mapped_column(
        ForeignKey('user.id', ondelete='CASCADE')
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text('CURRENT_TIMESTAMP')
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        onupdate=text('CURRENT_TIMESTAMP'),
        server_default=text('CURRENT_TIMESTAMP')
    )


def to_tsvector(*columns: str, regconfig: str = None):
    """
    Return to_tsvector postgresql function for specified columns.

    For some reason, asyncpg doesn't want to create an index
    if you pass REGCONFIG strings without literal().
    But if you use literal() for both index creation and search,
    the search will no longer work.

    Therefore, when creating an index (for example, for a test db),
    literal('english') is used, otherwise without literal().
    """
    string = " || ' ' || ".join(columns)

    return func.to_tsvector(
        regconfig if regconfig else literal('english'),
        text(string)
    )
