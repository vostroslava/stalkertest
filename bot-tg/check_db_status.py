
import asyncio
import os
import traceback
from dotenv import load_dotenv

async def check():
    # Force reload of env vars
    load_dotenv(override=True)
    
    from infrastructure.db import db
    from core.config import settings
    from repositories.test_repository import TestRepository
    
    # Print masked host
    dsn = str(settings.DATABASE_URL)
    print(f"Settings DSN Start: {dsn[:25]}...")
    if "render.com" in dsn:
        print("Detected Render.com URL")
    elif "localhost" in dsn or "127.0.0.1" in dsn:
        print("Detected Localhost URL")
    else:
        print("Detected External URL (Generic)")

    print("Connecting to DB...")
    await db.connect()
    print("Connected!")
    
    repo = TestRepository()
    
    # Check tables
    try:
        # Check if tables exist first to avoid crashing on missing schema
        # but fetch_val on count implies table exists
        sessions = await repo.fetch_val("SELECT COUNT(*) FROM test_sessions")
        results = await repo.fetch_val("SELECT COUNT(*) FROM test_results")
        print(f"Test Sessions (Unified): {sessions}")
        print(f"Test Results (Legacy): {results}")
    except Exception as e:
        print(f"Error querying tables (Schema might be missing?): {e}")
        
    await db.disconnect()

if __name__ == "__main__":
    try:
        asyncio.run(check())
    except Exception:
        traceback.print_exc()
