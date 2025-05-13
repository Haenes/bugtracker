from pydantic import BaseModel

from src.projects.schemas import SearchProject
from src.tasks.schemas import SearchTask


class SearchResultsResponse(BaseModel):
    """ Response schema with search results. """

    projects: list[SearchProject] | list[None]
    tasks: list[SearchTask] | list[None]


class NoItemsResponse(BaseModel):
    """
    Response schema where search doesn't find any item
    for both projects and tasks.
    """
    detail: str
