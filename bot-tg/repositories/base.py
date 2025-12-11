import asyncpg
from core.config import settings
from core.exceptions import RepositoryError
from typing import Optional, List, Any, Dict
import logging
from infrastructure.db import db

logger = logging.getLogger(__name__)

class BaseRepository:
    def __init__(self):
        # We don't hold the pool here directly to allow lazy init, 
        # but we use the singleton helper
        pass

    async def get_connection(self):
        # Allow usage as context manager: async with self.get_connection() as conn:
        return db.get_pool().acquire()

    async def execute(self, query: str, *params) -> str:
        """Execute a query (INSERT, UPDATE, DELETE)"""
        try:
            pool = db.get_pool()
            async with pool.acquire() as conn:
                return await conn.execute(query, *params)
        except Exception as e:
            logger.error(f"DB Execute Error: {e} | Query: {query}")
            raise RepositoryError(f"Database error: {str(e)}")

    async def fetch_one(self, query: str, *params) -> Optional[asyncpg.Record]:
        try:
            pool = db.get_pool()
            async with pool.acquire() as conn:
                return await conn.fetchrow(query, *params)
        except Exception as e:
            logger.error(f"DB Fetch One Error: {e} | Query: {query}")
            raise RepositoryError(f"Database error: {str(e)}")

    async def fetch_all(self, query: str, *params) -> List[asyncpg.Record]:
        try:
            pool = db.get_pool()
            async with pool.acquire() as conn:
                return await conn.fetch(query, *params)
        except Exception as e:
            logger.error(f"DB Fetch All Error: {e} | Query: {query}")
            raise RepositoryError(f"Database error: {str(e)}")
            
    async def fetch_val(self, query: str, *params) -> Any:
        try:
            pool = db.get_pool()
            async with pool.acquire() as conn:
                return await conn.fetchval(query, *params)
        except Exception as e:
            logger.error(f"DB Fetch Val Error: {e} | Query: {query}")
            raise RepositoryError(f"Database error: {str(e)}")
