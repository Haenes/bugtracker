from datetime import datetime

from sqlalchemy import VARCHAR, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db import Base


class User(Base):
    __tablename__ = "auth_user"

    id: Mapped[int] = mapped_column(primary_key=True)
    password: Mapped[str] = mapped_column(VARCHAR(128))
    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_superuser: Mapped[bool] = mapped_column(default=False)
    username: Mapped[str] = mapped_column(VARCHAR(150), unique=True)
    first_name: Mapped[str] = mapped_column(VARCHAR(length=150))
    last_name: Mapped[str] = mapped_column(VARCHAR(length=150))
    email: Mapped[str] = mapped_column(VARCHAR(254), unique=True)
    is_staff: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=False)
    date_joined: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class BaseClass(Base):
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str | None] = mapped_column(VARCHAR(255), default="")
    author_id: Mapped[int] = mapped_column(
        ForeignKey("auth_user.id", ondelete="CASCADE")
        )
    created: Mapped[datetime] = mapped_column(DateTime(timezone=True))
