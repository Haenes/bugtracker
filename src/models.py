from datetime import datetime

from sqlalchemy import VARCHAR, DateTime, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column

from db import Base, intpk


class BaseClass(Base):
    __abstract__ = True

    id: Mapped[intpk]
    description: Mapped[str | None] = mapped_column(VARCHAR(255), default="")
    author_id: Mapped[int] = mapped_column(
        ForeignKey("auth_user.id", ondelete="CASCADE")
        )
    created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP")
        )
