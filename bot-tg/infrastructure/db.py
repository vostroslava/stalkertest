import asyncpg
import logging
from core.config import settings

logger = logging.getLogger(__name__)

class DatabasePool:
    _pool: asyncpg.Pool = None

    @classmethod
    async def connect(cls):
        if cls._pool is None:
            try:
                cls._pool = await asyncpg.create_pool(
                    settings.DATABASE_URL,
                    min_size=1,
                    max_size=20
                )
                logger.info("Database connection pool created")
            except Exception as e:
                logger.error(f"Failed to create database pool: {e}")
                raise

    @classmethod
    async def disconnect(cls):
        if cls._pool:
            await cls._pool.close()
            cls._pool = None
            logger.info("Database connection pool closed")

    @classmethod
    def get_pool(cls) -> asyncpg.Pool:
        if cls._pool is None:
            raise RuntimeError("Database pool is not initialized. Call connect() first.")
        return cls._pool

db = DatabasePool()
