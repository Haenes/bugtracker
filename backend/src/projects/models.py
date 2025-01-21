from sqlalchemy import Index, VARCHAR, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models import BaseClass, to_tsvector


class Project(BaseClass):
    __tablename__ = "project"

    name: Mapped[str] = mapped_column(VARCHAR(255))
    key: Mapped[str] = mapped_column(VARCHAR(10))
    favorite: Mapped[bool | None] = mapped_column(default=False)

    __table_args__ = (
        UniqueConstraint("author_id", "key", name="project_unique_key"),
        Index("project_fts_idx", to_tsvector("name", "key"), postgresql_using="gin")
    )
