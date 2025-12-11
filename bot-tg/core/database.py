import asyncpg
import logging
import secrets
import hashlib
from core.config import settings
from infrastructure.db import db

logger = logging.getLogger(__name__)

async def ensure_db_exists():
    """
    Initialize database tables and default admin.
    """
    try:
        # Use a direct connection for simplicity in initialization scripts, 
        # or use the pool if already initialized.
        # Here we prefer a direct connection to be safe if pool isn't ready,
        # but since we want to move to pool, let's assume main.py inits it.
        # However, to be robust against standalone script usage, we check.
        
        try:
            pool = db.get_pool()
            conn = await pool.acquire()
            logger.info("Using existing pool for DB init.")
            use_pool = True
        except:
             # Pool not initialized, connect directly
            logger.info("Connecting directly for DB init.")
            conn = await asyncpg.connect(settings.DATABASE_URL)
            use_pool = False

        try:
            # Users table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id BIGINT PRIMARY KEY,
                    username TEXT,
                    first_name TEXT,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Leads table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS leads (
                    id SERIAL PRIMARY KEY,
                    user_id BIGINT,
                    contact_info TEXT,
                    message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # User contacts table with status and notes
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_contacts (
                    user_id BIGINT PRIMARY KEY,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    company TEXT,
                    team_size TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    telegram_username TEXT,
                    product TEXT DEFAULT 'teremok',
                    status TEXT DEFAULT 'new',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Test results table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS test_results (
                    id SERIAL PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    result_type TEXT NOT NULL,
                    scores TEXT,
                    answers TEXT,
                    product TEXT DEFAULT 'teremok',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user_contacts(user_id)
                )
            """)
            
            # Admins table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS admins (
                    user_id BIGINT PRIMARY KEY,
                    username TEXT,
                    role TEXT DEFAULT 'admin',
                    added_by BIGINT,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Formula RSP results table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS formula_rsp_results (
                    id SERIAL PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    primary_type_code TEXT NOT NULL,
                    primary_type_name TEXT NOT NULL,
                    scores TEXT,
                    answers TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user_contacts(user_id)
                )
            """)

            # Web Admins table (Login/Password)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS web_admins (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    session_token TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create default admin if not exists
            exists = await conn.fetchval("SELECT 1 FROM web_admins LIMIT 1")
            if not exists:
                salt = secrets.token_hex(16)
                pwd_hash = hashlib.sha256(("admin" + salt).encode()).hexdigest()
                await conn.execute(
                    "INSERT INTO web_admins (username, password_hash, salt) VALUES ($1, $2, $3)",
                    "admin", pwd_hash, salt
                )
            
            # Indexes
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_contacts_created ON user_contacts(created_at)")
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_contacts_status ON user_contacts(status)")
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON user_contacts(user_id)")
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_tests_created ON test_results(created_at)")
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_tests_user_id ON test_results(user_id)")
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_tests_product ON test_results(product)")
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_formula_rsp_user ON formula_rsp_results(user_id)")
            
            logger.info("Database initialized successfully.")

        finally:
            if use_pool:
                await pool.release(conn)
            else:
                await conn.close()
                
    except Exception as e:
        logger.error(f"DB Init Error: {e}")
