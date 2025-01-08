from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    RedisStrategy
)
from redis.asyncio import Redis

from utils.cache import pool


bearer_transport = BearerTransport("auth/bearer/login")


def get_redis_strategy() -> RedisStrategy:
    return RedisStrategy(Redis.from_pool(pool))


auth_backend = AuthenticationBackend(
    name="bearer",
    transport=bearer_transport,
    get_strategy=get_redis_strategy
)
