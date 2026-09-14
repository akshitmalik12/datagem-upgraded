from sqlalchemy import create_engine, text
import pandas as pd
import logging

logger = logging.getLogger(__name__)

def execute_sql_query(connection_string: str, query: str) -> str:
    """Executes a SQL query against the database and returns the result as a string."""
    try:
        # Basic safety check (restrict to SELECT)
        upper_query = query.upper()
        if any(keyword in upper_query for keyword in ['DROP ', 'DELETE ', 'UPDATE ', 'INSERT ', 'TRUNCATE ', 'ALTER ', 'GRANT ', 'REVOKE ']):
            return "Error: Security restriction. Only SELECT queries are allowed."
            
        engine = create_engine(connection_string)
        with engine.connect() as conn:
            df = pd.read_sql(text(query), conn)
            if len(df) > 100:
                return f"Result truncated to 100 rows (total {len(df)}):\n" + df.head(100).to_string()
            return df.to_string()
    except Exception as e:
        logger.error(f"SQL Error: {e}")
        return f"Database Error: {str(e)}"

def get_database_schema(connection_string: str) -> str:
    """Retrieves the schema (tables and columns) of the database."""
    try:
        engine = create_engine(connection_string)
        from sqlalchemy import inspect
        insp = inspect(engine)
        schema_info = []
        for table_name in insp.get_table_names():
            columns = [f"{col['name']} ({col['type']})" for col in insp.get_columns(table_name)]
            schema_info.append(f"Table: {table_name}\nColumns: {', '.join(columns)}")
        return "\n\n".join(schema_info)
    except Exception as e:
        logger.error(f"Schema Error: {e}")
        return f"Failed to retrieve schema: {str(e)}"
