from typing import Annotated

from fastapi import APIRouter, Query, Depends

from sqlalchemy.ext.asyncio import AsyncSession

from auth.manager import User, current_active_user
from utils.db import get_async_session
from .schemas import SearchResultsResponse, NoItemsResponse
from .crud import fulltext_search


router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("")
async def search(
    q: Annotated[str, Query(min_length=3, max_length=50)],
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> SearchResultsResponse | NoItemsResponse:
    """ Return fulltext search results for q. """
    return await fulltext_search(q=q, session=session, user_id=user.id)
