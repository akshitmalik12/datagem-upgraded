from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
import requests
import re

router = APIRouter()

class ImportRequest(BaseModel):
    url: str

@router.post("/url")
async def import_from_url(req: ImportRequest):
    try:
        # Use pandas to find all tables on the page
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        response = requests.get(req.url, headers=headers)
        response.raise_for_status()
        tables = pd.read_html(response.text)
        if not tables:
            raise HTTPException(status_code=400, detail="No HTML tables found on this page.")
        
        # Get the largest table (most rows)
        largest_table = max(tables, key=lambda t: len(t))
        
        # Clean column names (convert to strings, handle multi-index)
        largest_table.columns = ['_'.join(str(c) for c in col).strip() if isinstance(col, tuple) else str(col) for col in largest_table.columns]
        
        # Fill NaNs with empty string
        largest_table = largest_table.fillna("")
        
        return {"data": largest_table.to_dict(orient="records"), "filename": req.url.split("/")[-1] or "web_data"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

@router.post("/gsheet")
async def import_from_gsheet(req: ImportRequest):
    try:
        # Extract the sheet ID from the URL
        match = re.search(r'/d/([a-zA-Z0-9-_]+)', req.url)
        if not match:
            raise HTTPException(status_code=400, detail="Invalid Google Sheets URL.")
        
        sheet_id = match.group(1)
        csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
        
        df = pd.read_csv(csv_url)
        df = df.fillna("")
        
        return {"data": df.to_dict(orient="records"), "filename": f"gsheet_{sheet_id}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load Google Sheet: {str(e)}")
