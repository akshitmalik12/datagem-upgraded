import os
import duckdb
import pandas as pd
from typing import Dict, Any, List, Optional
import psycopg2

class DataConnectorService:
    @staticmethod
    def query_file_stream(file_path: str, sql_query: str) -> List[Dict[str, Any]]:
        """Executes zero-copy vectorized SQL queries over CSV, Parquet, or JSON files using DuckDB."""
        con = duckdb.connect(database=':memory:')
        try:
            if file_path.endswith('.csv'):
                con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_csv_auto('{file_path}')")
            elif file_path.endswith('.parquet'):
                con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_parquet('{file_path}')")
            elif file_path.endswith('.json'):
                con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_json_auto('{file_path}')")
            else:
                raise ValueError("Unsupported file format for DuckDB streaming.")
            
            df = con.execute(sql_query).fetchdf()
            return df.to_dict(orient='records')
        finally:
            con.close()

    @staticmethod
    def profile_schema(file_path: str) -> Dict[str, Any]:
        """Rapidly profiles dataset columns, types, null counts, and row counts in DuckDB without loading full table into RAM."""
        con = duckdb.connect(database=':memory:')
        try:
            if file_path.endswith('.csv'):
                con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_csv_auto('{file_path}')")
            elif file_path.endswith('.parquet'):
                con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_parquet('{file_path}')")
            elif file_path.endswith('.json'):
                con.execute(f"CREATE VIEW dataset AS SELECT * FROM read_json_auto('{file_path}')")
            
            summary = con.execute("SUMMARIZE dataset").fetchdf()
            total_rows = con.execute("SELECT count(*) FROM dataset").fetchone()[0]
            columns = con.execute("DESCRIBE dataset").fetchdf()
            
            return {
                "total_rows": total_rows,
                "columns": columns.to_dict(orient='records'),
                "summary": summary.to_dict(orient='records')
            }
        finally:
            con.close()
