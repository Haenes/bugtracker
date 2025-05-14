from typing import AsyncGenerator
from uuid import UUID

import pytest

from httpx import AsyncClient, ASGITransport

from fastapi import Request

from sqlalchemy import NullPool, insert
from sqlalchemy.ext.asyncio import (
    AsyncSession, AsyncConnection,
    async_sessionmaker, create_async_engine
)

from redis.asyncio import ConnectionPool, Redis

from src.config import settings
from main import app
from src.auth.models import User, Role
from src.auth.manager import UserManager, current_active_user
from src.projects.models import Project, ProjectInvite
from src.tasks.models import TaskStatus, TaskPriority, TaskType
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


async def set_initial_data(conn: AsyncConnection):
    initial_user = {
        'id': UUID('12344321123456781234567812344321'),
        'email': 'user_default@test.com',
        'hashed_password': (
            '$argon2id$v=19$m=65536,t=3,p=4$2hKCWYGEvMXly'
            '0WLUjMW1w$yl051abAjNlZ4USVZwChgBma3mUZz447+1aaiIu1Kcs'
        ),
        'username': 'test_default_username',
        'first_name': 'test_default_fname'
    }
    initial_project = {
        'id': UUID('87654321123456788765432112345678'),
        'creator_id': UUID('12344321123456781234567812344321'),
        'name': 'Default',
        'key': 'DEF',
    }
    initial_project_invite = {
        'creator_id': UUID('12344321123456781234567812344321'),
        'project_id': UUID('87654321123456788765432112345678'),
        'role_id': 3,
        'invite_token': 't7qvFh8Fmqy0-d1eWNMdlw',
        'use_count': 0,
    }
    initial_task_types = [
        {'id': 1, 'name': 'Bug'},
        {'id': 2, 'name': 'Fix'},
        {'id': 3, 'name': 'Feature'},
        {'id': 4, 'name': 'Misc'},
    ]
    initial_task_priorities = [
        {'id': 1, 'name': 'Low', 'weight': 1},
        {'id': 2, 'name': 'Medium', 'weight': 2},
        {'id': 3, 'name': 'High', 'weight': 3},
        {'id': 4, 'name': 'Critical', 'weight': 4},
    ]
    initial_task_statuses = [
        {'id': 1, 'name': 'Not assign'},
        {'id': 2, 'name': 'To do'},
        {'id': 3, 'name': 'In progress'},
        {'id': 4, 'name': 'Done'},
    ]
    initial_roles = [
        {'id': 1, 'name': 'admin', 'description': 'Has all the rights'},
        {
            'id': 2,
            'name': 'priveleged',
            'description': 'Cannot change the project settings.'
        },
        {
            'id': 3,
            'name': 'default',
            'description': (
                'Can change the status of the task to '
                'which he is assigned and leave comments under it.'
            )
        },
    ]

    await conn.execute(insert(User).values(initial_user))
    await conn.execute(insert(Project).values(initial_project))
    await conn.execute(insert(Role).values(initial_roles))
    await conn.execute(insert(ProjectInvite).values(initial_project_invite))
    await conn.execute(insert(TaskStatus).values(initial_task_statuses))
    await conn.execute(insert(TaskPriority).values(initial_task_priorities))
    await conn.execute(insert(TaskType).values(initial_task_types))


@pytest.fixture(autouse=True, scope='session')
async def prepare_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await set_initial_data(conn)
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
