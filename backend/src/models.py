from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func, text, literal
from sqlalchemy.orm import Mapped, mapped_column

from utils.db import Base, intpk


class BaseClass(Base):
    __abstract__ = True

    id: Mapped[intpk]
    author_id: Mapped[int] = mapped_column(
        ForeignKey("auth_user.id", ondelete="CASCADE")
    )
    created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
    )
    updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        onupdate=text("CURRENT_TIMESTAMP"),
        server_default=text("CURRENT_TIMESTAMP")
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
