FROM redis:latest
COPY ./redis/redis.conf /usr/local/etc/redis/redis.conf
EXPOSE 6379
VOLUME ./config/redis.conf:/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
