import os
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
import shutil

def get_s3_client():
    if not os.getenv('AWS_ACCESS_KEY_ID'):
        return None
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        endpoint_url=os.getenv('AWS_ENDPOINT_URL'),
        region_name='us-east-1' # Default for Supabase
    )

def upload_dataset(file: UploadFile, user_id: int):
    s3_client = get_s3_client()
    
    # LOCAL FALLBACK (Enterprise Grade Fallback)
    if not s3_client:
        local_dir = f"uploads/users/{user_id}/datasets"
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, file.filename)
        
        # Reset file pointer just in case
        file.file.seek(0)
        with open(local_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        absolute_path = os.path.abspath(local_path)
        return {"success": True, "path": absolute_path, "url": f"file://{absolute_path}"}
        
    # S3 FLOW
    bucket_name = os.getenv('AWS_BUCKET_NAME')
    object_name = f"users/{user_id}/datasets/{file.filename}"
    try:
        s3_client.upload_fileobj(file.file, bucket_name, object_name)
        url = s3_client.generate_presigned_url(
            'get_object', Params={'Bucket': bucket_name, 'Key': object_name}, ExpiresIn=3600
        )
        return {"success": True, "path": object_name, "url": url}
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        return {"success": False, "error": str(e)}