import os
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# FastAPI app instance
app = FastAPI()

# Sample data schema for POST requests


class DataInput(BaseModel):
    id: int
    name: str
    value: str


@app.post("/new_item")
async def new_item(data: DataInput):
    try:
        response = supabase.table('your_table_name').insert({
            'id': data.id,
            'name': data.name,
            'value': data.value
        }).execute()

        return {"message": "Data inserted successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/get_page")
async def get_page():
    try:
        response = supabase.table('your_table_name').select(
            "*").eq("id", id).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Data not found")

        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/request_item/{id}")
async def request_item(id: int):
    try:
        response = supabase.table('your_table_name').select(
            "*").eq("id", id).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Data not found")

        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/automated_new_item")
async def automated_write():
    try:
        # Example: Automatically generate data (e.g., adding a timestamp)
        response = supabase.table('your_table_name').insert({
            'name': "auto_generated_name",
            'value': "auto_generated_value"
        }).execute()

        return {"message": "Automated data inserted", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
