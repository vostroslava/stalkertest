from .base import BaseRepository
from models.test_result import TestResult, FormulaResult
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import json
import logging

logger = logging.getLogger(__name__)

class TestRepository(BaseRepository):
    
    async def ensure_schema(self) -> None:
        """Ensure test_sessions table exists and has legacy columns"""
        try:
            await self.execute("""
                CREATE TABLE IF NOT EXISTS test_sessions (
                    id SERIAL PRIMARY KEY,
                    user_id BIGINT,
                    product TEXT,
                    channel TEXT,
                    source TEXT,
                    status TEXT,
                    answers_json TEXT,
                    result_json TEXT,
                    meta_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    legacy_source TEXT,
                    legacy_id BIGINT
                );
            """)
            
            # Add columns if missing (migrations styled)
            try:
                await self.execute("ALTER TABLE test_sessions ADD COLUMN IF NOT EXISTS legacy_source TEXT")
                await self.execute("ALTER TABLE test_sessions ADD COLUMN IF NOT EXISTS legacy_id BIGINT")
            except Exception as e:
                pass

            # Unique index for idempotency
            await self.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_test_sessions_legacy 
                ON test_sessions (legacy_source, legacy_id);
            """)

        except Exception as e:
            logger.warning(f"Test schema update warning: {e}")

    async def backfill_unified_sessions(self) -> dict:
        """Import legacy data into unified table"""
        stats = {"teremok": 0, "formula": 0}

        # 1. Backfill Teremok (test_results)
        teremok_rows = await self.fetch_all("""
            SELECT t.id, t.user_id, t.answers, t.scores, t.result_type, t.created_at, t.product,
                   c.source, c.preferred_channel
            FROM test_results t
            LEFT JOIN user_contacts c ON t.user_id = c.user_id
        """)
        
        for row in teremok_rows:
            try:
                # Prepare data
                res_obj = {
                    "type": row['result_type'],
                    "scores": json.loads(row['scores']) if isinstance(row['scores'], str) else row['scores']
                }
                
                # Insert
                await self.execute("""
                   INSERT INTO test_sessions 
                   (user_id, product, source, channel, status, answers_json, result_json, meta_json, created_at, legacy_source, legacy_id)
                   VALUES ($1, $2, $3, $4, 'finished', $5, $6, $7, $8, 'teremok_test_results', $9)
                   ON CONFLICT (legacy_source, legacy_id) DO NOTHING
                """, 
                row['user_id'], 
                'teremok',
                row['source'] or 'unknown',
                row['preferred_channel'] or 'unknown',
                row['answers'] if isinstance(row['answers'], str) else json.dumps(row['answers']),
                json.dumps(res_obj),
                json.dumps({"type": row['result_type']}),
                row['created_at'],
                row['id']
                )
                stats["teremok"] += 1 # Note: This counts attempts, checking if inserted requires checking result (TODO: strict count?)
                # Actually execute returns None or string command tag. 
                # For strict count we'd need RETURNING id but ON CONFLICT ... DO NOTHING returns nothing if conflict.
                # Let's count processed rows. 
            except Exception as e:
                logger.error(f"Failed to backfill teremok test {row['id']}: {e}")

        # 2. Backfill Formula (formula_rsp_results)
        formula_rows = await self.fetch_all("""
            SELECT f.id, f.user_id, f.answers, f.scores, f.primary_type_code, f.primary_type_name, f.created_at,
                   c.source, c.preferred_channel
            FROM formula_rsp_results f
            LEFT JOIN user_contacts c ON f.user_id = c.user_id
        """)

        for row in formula_rows:
            try:
                # Prepare data
                res_obj = {
                    "type": row['primary_type_code'],
                    "primary_name": row['primary_type_name'],
                    "scores": json.loads(row['scores']) if isinstance(row['scores'], str) else row['scores']
                }

                await self.execute("""
                   INSERT INTO test_sessions 
                   (user_id, product, source, channel, status, answers_json, result_json, meta_json, created_at, legacy_source, legacy_id)
                   VALUES ($1, $2, $3, $4, 'finished', $5, $6, $7, $8, 'formula_rsp_results', $9)
                   ON CONFLICT (legacy_source, legacy_id) DO NOTHING
                """,
                row['user_id'],
                'formula',
                row['source'] or 'unknown',
                row['preferred_channel'] or 'unknown',
                row['answers'] if isinstance(row['answers'], str) else json.dumps(row['answers']),
                json.dumps(res_obj),
                json.dumps({"type": row['primary_type_name']}),
                row['created_at'],
                row['id']
                )
                stats["formula"] += 1
            except Exception as e:
                logger.error(f"Failed to backfill formula test {row['id']}: {e}")

        return stats

    async def save_test_session(self, 
                                user_id: int, 
                                product: str, 
                                source: str, 
                                answers: dict, 
                                result: dict, 
                                channel: str = None, 
                                meta: dict = None) -> int:
        """Save to unified test_sessions table"""
        answers_json = json.dumps(answers) if isinstance(answers, (dict, list)) else str(answers)
        result_json = json.dumps(result) if isinstance(result, (dict, list)) else str(result)
        meta_json = json.dumps(meta) if meta else None
        
        val = await self.fetch_val(
            """INSERT INTO test_sessions 
               (user_id, product, source, channel, status, answers_json, result_json, meta_json)
               VALUES ($1, $2, $3, $4, 'finished', $5, $6, $7) RETURNING id""",
            user_id, product, source, channel, answers_json, result_json, meta_json
        )
        return val

    async def get_unified_tests(self, limit: int = 200, product: str = None, days: int = None) -> list:
        """Get tests with lead info from unified table"""
        query = """
            SELECT ts.*, 
                   c.name as lead_name, c.phone as lead_phone, c.role as lead_role,
                   c.company as lead_company, c.team_size as lead_team_size,
                   c.preferred_channel as lead_preferred_channel,
                   c.utm_source, c.utm_medium, c.utm_campaign
            FROM test_sessions ts
            LEFT JOIN user_contacts c ON ts.user_id = c.user_id
        """
        conditions = []
        params = []
        
        if product and product != 'all':
            conditions.append(f"ts.product = ${len(params) + 1}")
            params.append(product)
            
        if days:
            date_from = datetime.now() - timedelta(days=days)
            conditions.append(f"ts.created_at >= ${len(params) + 1}")
            params.append(date_from)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += f" ORDER BY ts.created_at DESC LIMIT ${len(params) + 1}"
        params.append(limit)
        
        rows = await self.fetch_all(query, *params)
        return [dict(row) for row in rows]

    async def save_test_result(self, result: TestResult) -> int:
        scores_json = json.dumps(result.scores) if isinstance(result.scores, dict) else result.scores
        answers_json = json.dumps(result.answers) if isinstance(result.answers, dict) else result.answers
        
        # Postgres requires RETURNING id
        val = await self.fetch_val(
            """INSERT INTO test_results (user_id, result_type, answers, scores, product)
               VALUES ($1, $2, $3, $4, $5) RETURNING id""",
            result.user_id, result.result_type, answers_json, scores_json, result.product
        )
        return val

    async def save_formula_result(self, result: FormulaResult) -> int:
        scores_json = json.dumps(result.scores) if isinstance(result.scores, dict) else result.scores
        answers_json = json.dumps(result.answers) if isinstance(result.answers, (dict, list)) else result.answers
        
        val = await self.fetch_val(
            """INSERT INTO formula_rsp_results 
               (user_id, primary_type_code, primary_type_name, scores, answers)
               VALUES ($1, $2, $3, $4, $5) RETURNING id""",
            result.user_id, result.primary_type_code, result.primary_type_name, scores_json, answers_json
        )
        return val

    async def get_all_tests_full(self, limit: int = 100, product: str = None,
                                  result_type: str = None, days: int = None,
                                  sort_by: str = "created_at", sort_order: str = "desc") -> list:
        """Get test results with contact info and sorting"""
        
        query = """
            SELECT t.*, 
                   c.name, c.role, c.company, c.team_size, c.phone, c.telegram_username
            FROM test_results t
            LEFT JOIN user_contacts c ON t.user_id = c.user_id
        """
        conditions = []
        params = []
        
        if product and product != 'all':
            conditions.append(f"t.product = ${len(params) + 1}")
            params.append(product)
        
        if result_type and result_type != 'all':
            conditions.append(f"t.result_type = ${len(params) + 1}")
            params.append(result_type)
        
        if days:
            date_from = datetime.now() - timedelta(days=days)
            conditions.append(f"t.created_at >= ${len(params) + 1}")
            params.append(date_from)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        # Sorting whitelist
        sort_columns = {
            "created_at": "t.created_at",
            "result_type": "t.result_type",
            "product": "t.product",
            "name": "c.name",
            "company": "c.company",
            "role": "c.role"
        }
        
        sort_col = sort_columns.get(sort_by, "t.created_at")
        order = "ASC" if sort_order and sort_order.lower() == "asc" else "DESC"
        
        query += f" ORDER BY {sort_col} {order} LIMIT ${len(params) + 1}"
        params.append(limit)
        
        rows = await self.fetch_all(query, *params)
        return [dict(row) for row in rows]

    async def get_recent_tests_full(self, limit: int = 10) -> list:
        """Get recent tests for dashboard"""
        return await self.get_all_tests_full(limit=limit)

    async def get_user_results(self, user_id: int) -> List[TestResult]:
        rows = await self.fetch_all(
            "SELECT * FROM test_results WHERE user_id = $1 ORDER BY created_at DESC",
            user_id
        )
        return [TestResult(**dict(row)) for row in rows]
    
    async def get_test_result_by_id(self, result_id: int) -> Optional[TestResult]:
        row = await self.fetch_one("SELECT * FROM test_results WHERE id = $1", result_id)
        return TestResult(**dict(row)) if row else None
        
    async def get_formula_result_by_id(self, result_id: int) -> Optional[FormulaResult]:
        row = await self.fetch_one("SELECT * FROM formula_rsp_results WHERE id = $1", result_id)
        return FormulaResult(**dict(row)) if row else None
