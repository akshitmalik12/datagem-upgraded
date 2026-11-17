import os
import shutil
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import duckdb

logger = logging.getLogger(__name__)

# Base local vault directory
VAULT_DIR = Path("uploads/parquet_vault")
VAULT_DIR.mkdir(parents=True, exist_ok=True)

def get_s3_client():
    if not os.getenv('AWS_ACCESS_KEY_ID'):
        return None
    try:
        import boto3
        return boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            endpoint_url=os.getenv('AWS_ENDPOINT_URL'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
    except Exception as e:
        logger.warning(f"Could not initialize S3/R2 client: {e}")
        return None

def save_dataset_as_parquet(df: pd.DataFrame, user_id: int, dataset_name: str) -> Dict[str, Any]:
    """
    Persists a DataFrame to an ultra-fast, snappy-compressed Parquet file.
    1. Writes to Local Parquet Vault for instant DuckDB in-memory querying.
    2. Hooks to S3 / Cloudflare R2 when credentials exist.
    """
    safe_name = Path(dataset_name).stem.replace(" ", "_")
    user_vault = VAULT_DIR / f"user_{user_id}"
    user_vault.mkdir(parents=True, exist_ok=True)
    parquet_path = user_vault / f"{safe_name}.parquet"

    # 1. Save locally with snappy compression
    try:
        df.to_parquet(parquet_path, engine="pyarrow", compression="snappy", index=False)
        abs_path = str(parquet_path.resolve())
        file_size_kb = round(os.path.getsize(abs_path) / 1024, 2)
        logger.info(f"Saved local parquet dataset for user {user_id}: {abs_path} ({file_size_kb} KB)")
    except Exception as e:
        logger.error(f"Error writing local parquet file: {e}")
        return {"success": False, "error": str(e)}

    # 2. Cloud Sync if AWS/R2 is configured
    cloud_url = None
    s3_client = get_s3_client()
    if s3_client:
        bucket_name = os.getenv('AWS_BUCKET_NAME')
        object_key = f"datasets/user_{user_id}/{safe_name}.parquet"
        try:
            with open(abs_path, "rb") as f:
                s3_client.upload_fileobj(f, bucket_name, object_key)
            cloud_url = s3_client.generate_presigned_url(
                'get_object', Params={'Bucket': bucket_name, 'Key': object_key}, ExpiresIn=86400
            )
            logger.info(f"Synced parquet file to cloud: {object_key}")
        except Exception as e:
            logger.warning(f"Failed to sync parquet to S3/R2: {e}")

    return {
        "success": True,
        "filename": f"{safe_name}.parquet",
        "local_path": abs_path,
        "cloud_url": cloud_url,
        "size_kb": file_size_kb,
        "rows": len(df),
        "columns": list(df.columns)
    }

def read_parquet_dataset(user_id: int, dataset_name: str) -> Optional[pd.DataFrame]:
    """Reads a saved Parquet dataset directly into Pandas / DuckDB."""
    safe_name = Path(dataset_name).stem.replace(" ", "_")
    parquet_path = VAULT_DIR / f"user_{user_id}" / f"{safe_name}.parquet"
    if parquet_path.exists():
        return pd.read_parquet(parquet_path)
    return None
