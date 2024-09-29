from typing import AsyncGenerator

import pytest

from httpx import AsyncClient, ASGITransport

from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncSession, async_sessionmaker, create_async_engine
    )

from main import app
from auth.models import User
from auth.manager import current_active_user
from db import get_async_session, Base
from config import TEST_DB_URI


engine_test = create_async_engine(TEST_DB_URI, poolclass=NullPool)
async_session_maker = async_sessionmaker(engine_test, expire_on_commit=False)


async def override_get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

app.dependency_overrides[get_async_session] = override_get_async_session


user = User(
    id=1,
    email="user@test.com",
    hashed_password="test123#",
    username="test_username",
    first_name="test_fname",
    last_name="test_lname"
    )

app.dependency_overrides[current_active_user] = lambda: user


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
                "password": "test123#",
                "username": "test_username",
                "first_name": "test_fname",
                "last_name": "test_lname"
            }
        )
        assert r.status_code == 201

        yield test_client
