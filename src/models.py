from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column

from db import Base, intpk


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
