import os
from google.cloud import storage
from fastapi import UploadFile
import tempfile
import shutil

def get_gcs_client():
    # Looks for GOOGLE_APPLICATION_CREDENTIALS in env automatically
    try:
        return storage.Client()
    except Exception as e:
        print(f"GCP Auth Error: {e}")
        return None

def upload_to_gcp(file: UploadFile, user_id: int):
    client = get_gcs_client()
    if not client:
        return {"success": False, "error": "GCP Client not initialized. Check credentials."}
        
    bucket_name = os.getenv('GCP_BUCKET_NAME', 'datagem-datasets')
    
    try:
        bucket = client.bucket(bucket_name)
        object_name = f"users/{user_id}/datasets/{file.filename}"
        blob = bucket.blob(object_name)
        
        # Upload the file directly from memory/temp
        blob.upload_from_file(file.file, content_type=file.content_type)
        
        # We can either make it public or return a signed URL. 
        # For security, let's return a signed URL valid for 1 hour
        import datetime
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(hours=1),
            method="GET",
        )
        
        return {"success": True, "path": f"gs://{bucket_name}/{object_name}", "url": url}
    except Exception as e:
        print(f"GCS Upload Error: {e}")
        return {"success": False, "error": str(e)}

