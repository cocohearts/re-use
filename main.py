import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# FastAPI app instance
app = FastAPI()


# Schema for creating a user
class CreateUserInput(BaseModel):
    email: str


# Schema for creating a transaction
class CreateTransactionInput(BaseModel):
    buyer_id: str
    seller_id: str
    item_id: str


# Schema for creating or editing an item
class ItemInput(BaseModel):
    seller_id: str
    quality: str
    name: str
    description: str


# Create user: given email, set karma to 0
@app.post("/create_user")
async def create_user(data: CreateUserInput):
    try:
        response = (
            supabase.table("users")
            .insert({"email": data.email, "karma": 0.0})
            .execute()
        )

        return {"message": "User created successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Create transaction: given buyer_id, seller_id, item_id
@app.post("/create_new_transaction")
async def create_new_transaction(data: CreateTransactionInput):
    try:
        response = (
            supabase.table("transactions")
            .insert(
                {
                    "buyer_id": data.buyer_id,
                    "seller_id": data.seller_id,
                    "item_id": data.item_id,
                }
            )
            .execute()
        )

        return {
            "message": "Transaction created successfully",
            "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Create item: upload photo to item_photos bucket, save item in DB
@app.post("/create_item")
async def create_item(
        photo: UploadFile = File(...),
        data: ItemInput = File(...)):
    try:
        # Upload photo to Supabase storage bucket
        photo_path = f"item_photos/{photo.filename}"
        upload_response = (
            supabase.storage().from_("item_photos").upload(
                photo_path, photo.file))

        if upload_response.get("error"):
            raise HTTPException(status_code=400, detail="Photo upload failed")

        # Insert item data into the items table
        response = (
            supabase.table("items")
            .insert(
                {
                    "seller_id": data.seller_id,
                    "photo_url": photo_path,
                    "quality": data.quality,
                    "name": data.name,
                    "description": data.description,
                }
            )
            .execute()
        )

        return {"message": "Item created successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Edit item: given item id and same fields as create_item, edit the item
@app.put("/edit_item/{item_id}")
async def edit_item(
        item_id: str,
        data: ItemInput,
        photo: Optional[UploadFile] = None):
    try:
        update_data = {
            "seller_id": data.seller_id,
            "quality": data.quality,
            "name": data.name,
            "description": data.description,
        }

        # If a new photo is uploaded, handle the photo update
        if photo:
            photo_path = f"item_photos/{item_id}_{photo.filename}"
            upload_response = (
                supabase.storage().from_("item_photos").upload(
                    photo_path, photo.file))

            if upload_response.get("error"):
                raise HTTPException(
                    status_code=400, detail="Photo upload failed")

            update_data["photo_url"] = photo_path

        # Update the item in the database
        response = (supabase.table("items").update(
            update_data).eq("id", item_id).execute())

        return {"message": "Item updated successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Set user karma: given user id, set karma
@app.post("/set_user_karma/{user_id}")
async def set_user_karma(user_id: str, karma: float):
    try:
        response = (supabase.table("users").update(
            {"karma": karma}).eq("id", user_id).execute())

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "User karma updated successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
