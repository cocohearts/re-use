import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, List

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# FastAPI app instance
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    photo_urls: List[str]



# Create user: given email, set karma to 0
@app.post("/create-user")
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
@app.post("/create-new-transaction")
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
@app.post("/create-item")
async def create_item(data: ItemInput):
    try:
        # Insert item data into the items table
        response = (
            supabase.table("items")
            .insert({
                "seller_id": data.seller_id,
                "photo_urls": data.photo_urls,
                "quality": data.quality,
                "name": data.name,
                "description": data.description,
                "location": data.location,
                "email": data.email
            })
            .execute()
        )

        return {"message": "Item created successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/edit-item/{item_id}")
async def edit_item(item_id: str, data: ItemInput):
    try:
        # Update item data in the items table
        response = (
            supabase.table("items")
            .update({
                "photo_urls": data.photo_urls,
                "quality": data.quality,
                "name": data.name,
                "description": data.description,
                "location": data.location,
                "email": data.email
            })
            .eq("id", item_id)  # Assuming item_id is the identifier for the item
            .execute()
        )

        return {"message": "Item updated successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/get-user-karma/{user_id}")
async def get_user_karma(user_id: str):
    try:
        response = supabase.table("users").select("karma").eq("id", user_id).execute()
        return {"message": "User karma retrieved successfully", "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/get-user/{user_id}")
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
@app.get("/get-all-items-ids")
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

@app.get("/get-all-items")
async def get_all_items():
    """
    Get all items from the database.

    Returns a message and a list of all items.

    Raises:
        HTTPException: If there is an error, a 400 status code is returned.
    """
    try:
        response = supabase.table("items").select("*").execute()
        return {"message": "Items retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get data given item id
@app.get("/get-item/{item_id}")
async def get_item(item_id: str):
    """
    Retrieve item data by item ID.

    Returns:
        - message (str): Result message.
        - data (dict): Item information including id, seller_id, photo_urls, quality, name, description.
    """
    try:
        response = supabase.table("items").select("*").eq("id", item_id).execute()
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"message": "Item retrieved successfully", "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# @app.get("/get-items/")
# async def get_items(item_ids: List[str] = Query(...)):
#     """
#     Retrieve multiple items by their IDs.

#     Args:
#         item_ids (List[str]): List of item IDs to retrieve.

#     Returns:
#         - message (str): Result message.
#         - data (list): List of item information including id, seller_id, photo_urls, quality, name, description.
#     """
#     try:
#         response = supabase.table("items").select("*").in_("id", item_ids).execute()
#         return {"message": "Items retrieved successfully", "data": response.data}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# Returns paginated items with a similar name
@app.get("/search-items-by-name/{name}")
async def search_items_by_name(name: str, page: int = 1, page_size: int = 10):
    """
    Search for items by name with pagination, sorted by recency.

    Args:
        name (str): The search term.
        page (int): The page number (default: 1).
        page_size (int): The number of items per page (default: 10, max: 10).

    Returns:
        A message and the paginated list of items.
    """
    try:
        # Validate page_size (max 10)
        page_size = min(page_size, 10)
        
        # Calculate the offset for pagination
        offset = (page - 1) * page_size

        # Adjust query based on whether the search term is empty
        query = supabase.table("items").select("*")
        if name:
            query = query.ilike("name", f"%{name}%")
        
        # Sort by recency using the `created_at` column
        response = query.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()

        return {"message": "Items retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# Get number of pages for a given search query
@app.get("/get-number-of-pages/{name}")
async def get_number_of_pages(name: str, page_size: int = 10):
    """
    Calculate the total number of pages required for a given search query, sorted by recency.

    Args:
        name (str): The search term.
        page_size (int): The number of items per page (default: 10, max: 10).

    Returns:
        A message and the total number of pages.
    """
    try:
        # Validate page_size (max 10)
        page_size = min(page_size, 10)

        # Adjust query based on whether the search term is empty
        query = supabase.table("items").select("id", count="exact")
        if name:
            query = query.ilike("name", f"%{name}%")

        response = query.execute()

        total_items = response.count  # Supabase includes the total count in the response
        total_pages = (total_items + page_size - 1) // page_size  # Calculate total number of pages

        return {"message": "Total number of pages calculated successfully", "data": {"total_pages": total_pages}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
