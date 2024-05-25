from sqlalchemy import Column, VARCHAR, BOOLEAN
from sqlalchemy import CheckConstraint

from models import BaseClass
from projects.shemas import ProjectType


class Project(BaseClass):
    __tablename__ = "bugtracker_project"

    name = Column(VARCHAR(255), unique=True, nullable=False)
    key = Column(VARCHAR(10), unique=True, nullable=False)
    type = Column(VARCHAR, nullable=False)
    starred = Column(BOOLEAN, default=False, nullable=False)

    CheckConstraint(
        sqltext=type.in_(
            [
                ProjectType.fullstack,
                ProjectType.frontend,
                ProjectType.backend
                ]
            ),
        name='project_type_check'
        )
