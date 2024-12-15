import re

from fastapi import Depends, Request
from fastapi_users import (
    BaseUserManager,
    InvalidPasswordException,
    IntegerIDMixin
)

from utils.tasks import celery_send_email
from .config import MANAGER_SECRET, MAX_AGE
from .cookie_jwt import auth_backend
from .custom import CustomFastAPIUsers, PASSWORD_VALIDATION_ERROR
from .models import User, get_user_db
from .schemas import UserCreate, UserRead, UserUpdate


class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = MANAGER_SECRET
    verification_token_secret = MANAGER_SECRET

    reset_password_token_lifetime_seconds = MAX_AGE
    verification_token_lifetime_seconds = MAX_AGE

    async def validate_password(
        self,
        password: str,
        user: UserCreate | User,
    ) -> None:
        """
        Returns None if the password is:
        1) a 8+ characters {8,};
        2) at least one uppercase letter (?=.*?[A-Z]);
        3) at least one lowercase letter (?=.*?[a-z]);
        4) at least one digit (?=.*?[0-9]);
        5) at least one special character (?=.*?[#?!@$%^&*-_+=])
        """
        pattern = re.compile(
            "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_+=]).{8,}$"
        )

        if not pattern.match(password):
            raise InvalidPasswordException(
                reason=PASSWORD_VALIDATION_ERROR
            )

        return None

    async def on_after_register(
        self,
        user: User,
        request: Request | None = None
    ):
        await BaseUserManager.request_verify(self, user=user, request=request)

    async def on_after_request_verify(
        self,
        user: User,
        token: str,
        request: Request | None = None
    ):
        celery_send_email.delay(
            "EmailVerification",
            user=user,
            token=token,
            params=request.query_params
        )

    async def on_after_forgot_password(
        self,
        user: User,
        token: str,
        request: Request | None = None
    ):
        celery_send_email.delay(
            "EmailResetPassword",
            user=user,
            token=token,
            params=request.query_params
        )


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


fastapi_users = CustomFastAPIUsers[User, int](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)

auth_router = fastapi_users.get_auth_router(auth_backend, requires_verification=True)
register_router = fastapi_users.get_register_router(UserRead, UserCreate)
users_router = fastapi_users.get_users_router(UserRead, UserUpdate)
auth_verify_router = fastapi_users.get_verify_router(UserRead)
reset_password_router = fastapi_users.get_reset_password_router()
