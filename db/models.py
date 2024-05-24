from sqlalchemy import (
    Column, INTEGER, VARCHAR, BIGINT,
    BOOLEAN, Enum, DateTime, ForeignKey
    )
from sqlalchemy import CheckConstraint
from enum import Enum as enum

from .engine import Base


class ProjectType(Enum):
    FULLSTACK = "Fullstack"
    FRONTEND = "Front-end"
    BACKEND = "Back-end"


class IssueType(enum):
    bug = "Bug"
    feature = "Feature"


class IssuePriority(enum):
    lowest = "Lowest"
    low = "Low"
    medium = "Medium"
    high = "High"
    highest = "Highest"


class IssueStatus(enum):
    TO_DO = "To do"
    IN_PROGRESS = "In progress"
    DONE = "Done"


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


class Project(Base):
    __tablename__ = "bugtracker_project"

    id = Column(
        BIGINT, autoincrement=True,
        unique=True, nullable=False, primary_key=True
        )
    name = Column(VARCHAR(255), unique=True, nullable=False)
    description = Column(VARCHAR(255), default="", nullable=False)
    key = Column(VARCHAR(10), unique=True, nullable=False)
    type = Column(VARCHAR, nullable=False)
    author_id = Column(INTEGER, ForeignKey(User.id), nullable=False)
    starred = Column(BOOLEAN, default=False, nullable=False)
    created = Column(DateTime(timezone="UTC"), nullable=False)

    # __table_args__ = (
    #     CheckConstraint(
    #         sqltext=type.in_(
    #             [
    #                 ProjectType.FULLSTACK,
    #                 ProjectType.FRONTEND,
    #                 ProjectType.BACKEND
    #                 ]
    #             ),
    #         name='type_check'
    #         ),
    #     )
    CheckConstraint(
        sqltext=type.in_(
            [
                ProjectType.FULLSTACK,
                ProjectType.FRONTEND,
                ProjectType.BACKEND
                ]
            ),
        name='type_check'
        )


class Issue(Base):
    __tablename__ = "bugtracker_issue"

    id = Column(
        BIGINT, autoincrement=True, unique=True,
        nullable=False, primary_key=True
        )
    key = Column(INTEGER, default=1, nullable=False)
    title = Column(VARCHAR(255), unique=True, nullable=False)
    description = Column(VARCHAR(255), default="")
    type = Column(Enum(IssueType), nullable=False)
    priority = Column(Enum(IssuePriority), nullable=False)
    status = Column(Enum(IssueStatus), nullable=False)
    author_id = Column(INTEGER, ForeignKey(User.id), nullable=False)
    project_id = Column(BIGINT, ForeignKey(Project.id), nullable=False)
    starred = Column(BOOLEAN, default=False, nullable=False)
    created = Column(DateTime(timezone=True), nullable=False)
    updated = Column(DateTime(timezone=True), nullable=False)
