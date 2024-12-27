from pydantic import BaseModel

from projects.schemas import SearchProject
from issues.schemas import SearchIssue


class SearchResultsResponse(BaseModel):
    """ Response schema with search results. """

    projects: list[SearchProject] | list[None]
    issues: list[SearchIssue] | list[None]


class NoItemsResponse(BaseModel):
    """
    Response schema where search doesn't find any item
    for both projects and issues.
    """
    detail: str
