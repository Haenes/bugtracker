from typing import AsyncGenerator
from uuid import UUID

import pytest

from httpx import AsyncClient, ASGITransport

from fastapi import Request

from sqlalchemy import NullPool, insert
from sqlalchemy.ext.asyncio import (
    AsyncSession, async_sessionmaker, create_async_engine
)

from redis.asyncio import ConnectionPool, Redis

from src.config import settings
from main import app
from src.auth.models import User
from src.auth.manager import UserManager, current_active_user
from src.tasks .models import TaskStatus, TaskPriority, TaskType
from src.utils.db import get_async_session, Base
from src.utils.cache import get_redis_client


engine_test = create_async_engine(settings.get_db_url(is_test=True), poolclass=NullPool)
async_session_maker = async_sessionmaker(engine_test, expire_on_commit=False)

pool = ConnectionPool.from_url(
    url=settings.get_redis_url(),
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
    id=UUID('12345678123456781234567812345678'),
    email='user@test.com',
    hashed_password=(
        '$argon2id$v=19$m=65536,t=3,p=4$2hKCWYGEvMXly'
        '0WLUjMW1w$yl051abAjNlZ4USVZwChgBma3mUZz447+1aaiIu1Kcs'
    ),
    username='test_username',
    first_name='test_fname'
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


@pytest.fixture(autouse=True, scope='session')
async def prepare_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        default_task_types = [
            {'id': 1, 'name': 'Bug'},
            {'id': 2, 'name': 'Fix'},
            {'id': 3, 'name': 'Feature'},
            {'id': 4, 'name': 'Misc'},
        ]
        default_task_priorities = [
            {'id': 1, 'name': 'Low', 'weight': 1},
            {'id': 2, 'name': 'Medium', 'weight': 2},
            {'id': 3, 'name': 'High', 'weight': 3},
            {'id': 4, 'name': 'Critical', 'weight': 4},
        ]
        default_task_statuses = [
            {'id': 1, 'name': 'Not assign'},
            {'id': 2, 'name': 'To do'},
            {'id': 3, 'name': 'In progress'},
            {'id': 4, 'name': 'Done'},
        ]
        await conn.execute(insert(TaskStatus).values(default_task_statuses))
        await conn.execute(insert(TaskPriority).values(default_task_priorities))
        await conn.execute(insert(TaskType).values(default_task_types))

    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope='session')
async def user_client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url='http://test'
    ) as test_client:
        r = await test_client.post(
            url='auth/register',
            json={
                'email': 'user@test.com',
                'password': 'Test123#',
                'username': 'test_username',
                'first_name': 'test_fname'
            }
        )
        assert r.status_code == 201
        user.id = r.json()["id"]
        yield test_client
