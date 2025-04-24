import os

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_USER: str = Field(validation_alias='POSTGRES_USER')
    DB_PASSWORD: str = Field(validation_alias='POSTGRES_PASSWORD')
    DB_HOST: str = Field(validation_alias='POSTGRES_HOST')
    DB_PORT: int = Field(validation_alias='POSTGRES_PORT')
    DB_NAME: str = Field(validation_alias='POSTGRES_DB')
    TEST_DB_NAME: str = Field(validation_alias='POSTGRES_TEST_DB')

    REDIS_USER: str
    REDIS_PASSWORD: str
    REDIS_EXPIRE_TIME: int = 600

    JWT_SECRET: str
    MANAGER_SECRET: str

    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str

    VERIFY_URL_BACKEND: str
    VERIFY_URL_FRONTEND: str

    PASSWORD_RESET_URL_FRONTEND: str
    PASSWORD_RESET_URL_BACKEND: str

    model_config = SettingsConfigDict(
        extra='ignore',
        env_file=os.path.join(os.path.abspath(os.pardir + '/..'), ".env"),
        env_file_encoding='utf-8'
    )

    def get_db_url(self, is_test: bool = False):
        return (
            f'postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@'
            f'{self.DB_HOST}:{self.DB_PORT}/'
            f'{self.TEST_DB_NAME if is_test else self.DB_NAME}'
        )

    def get_redis_url(self):
        return f'redis://{self.REDIS_USER}:{self.REDIS_PASSWORD}@redis'


class CeleryConfig:
    task_serializer = "pickle"
    accept_content = ["application/json", "application/x-python-serialize"]
    broker_connection_retry_on_startup = False


settings = Settings()
