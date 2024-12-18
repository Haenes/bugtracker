from typing import AsyncGenerator

import pytest

from httpx import AsyncClient, ASGITransport

from fastapi import Request

from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncSession, async_sessionmaker, create_async_engine
)

from redis.asyncio import ConnectionPool, Redis

from config import TEST_DB_URI, REDIS_USER, REDIS_PASSWORD
from main import app
from auth.models import User
from auth.manager import UserManager, current_active_user
from utils.db import get_async_session, Base
from utils.cache import get_redis_client


engine_test = create_async_engine(TEST_DB_URI, poolclass=NullPool)
async_session_maker = async_sessionmaker(engine_test, expire_on_commit=False)

pool = ConnectionPool.from_url(
    f"redis://{REDIS_USER}:{REDIS_PASSWORD}@redis/2",
    decode_responses=True,
    max_connections=10
)


async def override_get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def override_get_redis_client() -> AsyncGenerator[Redis, None]:
    async with Redis.from_pool(pool) as client:
        yield client

user = User(
    id=1,
    email="user@test.com",
    hashed_password="Test123#",
    username="test_username",
    first_name="test_fname"
)

app.dependency_overrides[get_async_session] = override_get_async_session
app.dependency_overrides[get_redis_client] = override_get_redis_client
app.dependency_overrides[current_active_user] = lambda: user


async def override_on_after_request_verify(
    self,
    user: User,
    token: str,
    request: Request | None = None
):
    """
    Override function, that send email to verify after successful register.
    """
    return True

UserManager.on_after_request_verify = override_on_after_request_verify


@pytest.fixture(autouse=True, scope="session")
async def prepare_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="session")
async def user_client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as test_client:

        r = await test_client.post(
            "auth/register",
            json={
                "email": "user@test.com",
                "password": "Test123#",
                "username": "test_username",
                "first_name": "test_fname"
            }
        )
        assert r.status_code == 201

        yield test_client
