# syntax=docker/dockerfile:1

FROM redis:7.4.0-alpine

COPY redis.conf /usr/local/etc/redis/redis.conf

# USER redis

CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
