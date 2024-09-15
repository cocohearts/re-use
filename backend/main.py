from datetime import datetime
import os
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.auth_middleware import get_current_user
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Annotated, Optional, List
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from backend.mailer import utils as mailerutils

from backend.auth_middleware import AuthMiddleware

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

DIST_PATH = os.getenv("DIST_PATH")

# FastAPI app instance
app = FastAPI(title="app")
api = FastAPI(title="existing api")

app.mount('/api', api)

origins = [
    "*"
]

if DIST_PATH:
    app.mount('/', StaticFiles(directory=DIST_PATH, html=True), name="static")

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
    other_urls: List[str] = []
    photo_urls: List[str]
    location: str = ""
    can_self_pickup: bool = False
    price: Optional[float] = 0.0


class BidInput(BaseModel):
    pass


# Create user: given email, set karma to 0
@api.post("/create-user")
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
@api.post("/create-new-transaction")
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
@api.post("/create-item")
async def create_item(data: ItemInput, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=401, detail="Unauthenticated users cannot make listings.")

    seller_id = user["sub"]
    seller_email = user["email"]

    try:
        # Insert item data into the items table
        response = (
            supabase.table("items")
            .insert({
                "seller_id": seller_id,
                "photo_urls": data.photo_urls,
                "can_self_pickup": data.can_self_pickup,
                "other_urls": data.other_urls,
                "quality": data.quality,
                "name": data.name,
                "description": data.description,
                "location": data.location,
                "email": seller_email,
                "price": data.price,
            })
            .execute()
        )

        return {"message": "Item created successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api.post("/bid-for-item/{item_id}")
async def bid_for_item(item_id: str, request: Request):
    bidder = get_current_user(request)
    if bidder is None:
        raise HTTPException(
            status_code=403, detail="You can't bid for items without registering")
    bidder_id = bidder['sub']

    try:
        existing_bid = supabase.table("bids").select("id").eq(
            "bidder_id", bidder_id).eq("item_id", item_id).execute()

        if existing_bid.data:
            raise HTTPException(
                status_code=400, detail="Bidder has already placed a bid on this item.")
        # Insert bid data into the bids table
        supabase.table("bids")\
            .insert({
                "bidder_id": bidder_id,
                "created_at": datetime.now().isoformat(),
                "item_id": item_id,
            })\
            .execute()
        response = supabase.table("bids").select(
            "*").eq("item_id", item_id).execute()

        return {"message": "Bid created successfully", "data": response.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ api.post("/cancel-bid/{item_id}")
async def cancel_bid(item_id: str, request: Request):
    bidder = get_current_user(request)
    if bidder is None:
        raise HTTPException(
            status_code=403, detail="You can't bid for items without registering")
    bidder_id = bidder['sub']
    try:
        # Insert bid data into the bids table
        supabase.table("bids").delete().eq(
            "item_id", item_id).eq("bidder_id", bidder_id).execute()
        response = supabase.table("bids").select(
            "*").eq("item_id", item_id).execute()
        return {"message": "Bid deleted successfully", "data": response.data}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ api.get("/get-bids-for-item/{item_id}")
async def get_bids_for_item(item_id: str):
    try:
        response = supabase.table("bids").select(
            "*").eq("item_id", item_id).execute()
        return {"message": "Bids retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api.get("/get-multiple-users")
async def get_multiple_users(userids: Annotated[str, Query()]):
    result = []
    userids = userids.strip()
    if not len(userids):
        return {"message": "Multiple Users Found", "data": []}
    for userid in userids.split(","):
        query = supabase.table("users").select("*").eq("id", userid).execute()
        result.append(
            query.data[0] if query is not None and query.data
            else None
        )
    return {"message": "Multiple Users Found", "data": result}


@api.post("/accept-bid/{bid_id}")
async def accept_bid(bid_id: str):
    try:
        # Check the current state of the bid before updating
        existing_bid = supabase.table("bids").select(
            "bidder_id", "accepted").eq("id", bid_id).execute()

        if not existing_bid.data or existing_bid.data[0]['accepted']:
            raise HTTPException(
                status_code=400, detail="Bid has already been accepted or does not exist.")

        bidder_id = existing_bid.data[0]['bidder_id']

        # Update bid data in the bids table
        response = (
            supabase.table("bids")
            .update({
                "accepted": True,
            })
            .eq("id", bid_id)  # Assuming bid_id is the identifier for the bid
            .execute()
        )

        # Send an email to the user whose bid was accepted
        user_email = supabase.table("users").select("email").eq(
            "id", bidder_id).execute().data[0]['email']
        subject = "Your Bid Has Been Accepted"
        body = f"Congratulations! Your bid for bid ID {bid_id} has been accepted."
        mailerutils.send_email(user_email, subject, body)

        return {"message": "Bid updated successfully and email sent to the bidder", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api.post("/review-user/{bid_id}")
async def review_user(bid_id: str, review: int, reviewee_id: str):
    try:
        if review < 1 or review > 5:
            raise HTTPException(
                status_code=400, detail="Review must be between 1 and 5.")

        # Get the user associated with the bid
        existing_bid = supabase.table("bids").select(
            "bidder_id, item_id").eq("id", bid_id).execute()
        if not existing_bid.data:
            raise HTTPException(status_code=400, detail="Bid not found.")

        bidder_id = existing_bid.data[0]['bidder_id']
        item_id = existing_bid.data[0]['item_id']

        # Get the seller_id from the items table using the item_id
        existing_item = supabase.table("items").select(
            "seller_id").eq("id", item_id).execute()
        if not existing_item.data:
            raise HTTPException(status_code=400, detail="Item not found.")

        seller_id = existing_item.data[0]['seller_id']

        # Validate the reviewee ID
        if reviewee_id not in [bidder_id, seller_id]:
            raise HTTPException(
                status_code=400, detail="Reviewee ID must be either the bidder or the seller.")

        # Adjust karma based on the review
        karma_adjustment = 5 * (review - 3)  # Assuming 3 is neutral
        response = supabase.table("users").update({
            "karma": supabase.raw("karma + {}".format(karma_adjustment))
        }).eq("id", reviewee_id).execute()

        return {"message": "User karma adjusted successfully", "data": response}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ api.get("/get-accepted-bids-as-seller/{user_id}")
async def get_accepted_bids_as_seller(user_id: str):
    try:
        response = supabase.table("bids").select(
            "*").eq("seller_id", user_id).eq("accepted", True).execute()
        return {"message": "Accepted bids retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ api.get("/get-accepted-bids-as-buyer/{user_id}")
async def get_accepted_bids_as_buyer(user_id: str):
    try:
        response = supabase.table("bids").select(
            "*").eq("buyer_id", user_id).eq("accepted", True).execute()
        return {"message": "Accepted bids retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ api.put("/edit-item/{item_id}")
async def edit_item(item_id: str, data: ItemInput):
    try:
        # Update item data in the items table
        response = (
            supabase.table("items")
            .update({
                "photo_urls": data.photo_urls,
                "can_self_pickup": data.can_self_pickup,
                "other_urls": data.other_urls,
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


@ api.post("/get-user-karma/{user_id}")
async def get_user_karma(user_id: str):
    try:
        response = supabase.table("users").select(
            "karma").eq("id", user_id).execute()
        return {"message": "User karma retrieved successfully", "data": response.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@ api.get("/get-user/{user_id}")
async def get_user(user_id: str, request: Request):
    """
    Retrieve user data by user ID.

    Returns:
        - message (str): Result message.
        - data (dict): User information including id, username, email, karma, created_at, updated_at.
    """
    try:
        response = supabase.table("users").select(
            "*").eq("id", user_id).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # Assuming the response contains a list of users
        user_data = response.data[0]
        return {
            "message": "User retrieved successfully",
            "data": user_data  # Return the entire user_data dictionary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get all items ids


@ api.get("/get-all-items-ids")
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


@ api.get("/get-all-items")
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


@ api.get("/get-item/{item_id}")
async def get_item(item_id: str):
    """
    Retrieve item data by item ID.

    Returns:
        - message (str): Result message.
        - data (dict): Item information including id, seller_id, photo_urls, quality, name, description.
    """
    try:
        response = supabase.table("items").select(
            "*").eq("id", item_id).execute()
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


@ api.get("/search-items-by-name/")
async def search_items_by_name(name: str = "", page: int = 1, page_size: int = 10):
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
        response = query.order("created_at", desc=True).range(
            offset, offset + page_size - 1).execute()

        return {"message": "Items retrieved successfully", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Get number of pages for a given search query
@ api.get("/get-number-of-pages/")
async def get_number_of_pages(name: str = "", page_size: int = 10):
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
        # Calculate total number of pages
        total_pages = (total_items + page_size - 1) // page_size

        return {"message": "Total number of pages calculated successfully", "data": {"total_pages": total_pages}}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000)
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000)
