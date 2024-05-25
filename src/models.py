from sqlalchemy.orm import declarative_base
from sqlalchemy import (
    Column, INTEGER, VARCHAR,
    BOOLEAN, DateTime, BIGINT, ForeignKey
    )


Base = declarative_base()


class User(Base):
    __tablename__ = "auth_user"

    id = Column(
        INTEGER, autoincrement=True, unique=True,
        nullable=False, primary_key=True
        )
    password = Column(VARCHAR(128), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=False)
    is_superuser = Column(BOOLEAN, default=False, nullable=False)
    username = Column(VARCHAR(150), nullable=False, unique=True)
    first_name = Column(VARCHAR(length=150), nullable=False)
    last_name = Column(VARCHAR(length=150), nullable=False)
    email = Column(VARCHAR(254), nullable=False, unique=True)
    is_staff = Column(BOOLEAN, default=False, nullable=False)
    is_active = Column(BOOLEAN, default=False, nullable=False)
    date_joined = Column(DateTime(timezone=True), nullable=False)


class BaseClass(Base):
    __abstract__ = True

    id = Column(
        BIGINT, autoincrement=True,
        unique=True, nullable=False, primary_key=True
        )
    description = Column(VARCHAR(255), default="")
    author_id = Column(INTEGER, ForeignKey(User.id), nullable=False)
    created = Column(DateTime(timezone="UTC"), nullable=False)
