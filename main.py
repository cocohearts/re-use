import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
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
    name: str
    pfp_url: str


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
    photo_url: str



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
async def create_item(data: ItemInput):
    try:
        # Insert item data into the items table
        response = (
            supabase.table("items")
            .insert({
                "seller_id": data.seller_id,
                "photo_url": data.photo_url,
                "quality": data.quality,
                "name": data.name,
                "description": data.description,
            })
            .execute()
        )

        return {"message": "Item created successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Edit item: update only the photo URL in the database
@app.put("/edit_item/{item_id}")
async def edit_item(item_id: str, data: ItemInput):
    try:
        # Update item data in the items table
        response = (
            supabase.table("items")
            .update({
                "photo_url": data.photo_url,
                "quality": data.quality,
                "name": data.name,
                "description": data.description,
            })
            .eq("id", item_id)  # Assuming item_id is the identifier for the item
            .execute()
        )

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

@app.get("/get_user/{user_id}")
async def get_user(user_id: str):
    """
    Retrieve user data by user ID.

    Returns:
        - message (str): Result message.
        - data (dict): User information including id, username, email, karma, created_at, updated_at.
    """
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = response.data[0]  # Assuming the response contains a list of users
        return {
            "message": "User retrieved successfully",
            "data": user_data  # Return the entire user_data dictionary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get all items ids
@app.get("/get_all_items_ids")
async def get_all_items_ids():
    """
    Get all item IDs from the database.

    Returns a message and a list of item IDs.

    Raises:
        HTTPException: If there is an error, a 400 status code is returned.
    """
    try:
        response = supabase.table("items").select("id").execute()
        return {"message": "Items retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get data given item id
@app.get("/get_item/{item_id}")
async def get_item(item_id: str):
    """
    Retrieve item data by item ID.

    Returns:
        - message (str): Result message.
        - data (dict): Item information including id, seller_id, photo_url, quality, name, description.
    """
    try:
        response = supabase.table("items").select("*").eq("id", item_id).execute()
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"message": "Item retrieved successfully", "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
