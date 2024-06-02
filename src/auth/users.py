from fastapi import Depends, Request
from fastapi_users import FastAPIUsers, BaseUserManager, IntegerIDMixin

from .config import MANAGER_SECRET, MAX_AGE
from .cookie_jwt import auth_backend
from .models import User, get_user_db
from .schemas import UserCreate, UserRead


class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = MANAGER_SECRET
    verification_token_secret = MANAGER_SECRET

    reset_password_token_lifetime_seconds = MAX_AGE
    verification_token_lifetime_seconds = MAX_AGE

    async def on_after_register(
            self, user: User, request: Request | None = None
    ):
        print(f"User {user.id} has registered.")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


fastapi_users = FastAPIUsers[User, int](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)

auth_router = fastapi_users.get_auth_router(auth_backend)
register_router = fastapi_users.get_register_router(UserRead, UserCreate)
