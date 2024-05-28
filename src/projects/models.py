from sqlalchemy import (
    VARCHAR, CheckConstraint,
    )
from sqlalchemy.orm import Mapped, mapped_column

from models import BaseClass
from .shemas import ProjectType


class Project(BaseClass):
    __tablename__ = "project"

    name: Mapped[str] = mapped_column(VARCHAR(255), unique=True)
    key: Mapped[str] = mapped_column(VARCHAR(10), unique=True)
    type: Mapped[str] = mapped_column(VARCHAR)
    starred: Mapped[bool | None] = mapped_column(default=False)

    __table_args__ = (
        CheckConstraint(
            sqltext=type.in_(
                [
                    ProjectType.fullstack.value,
                    ProjectType.frontend.value,
                    ProjectType.backend.value
                    ]
                ),
            name='project_type_check'
            ),
        )
