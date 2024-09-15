import time
import jwt
import os
from dotenv import load_dotenv

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.supabase import supabase

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

app = FastAPI()


def get_current_user(request: Request) -> dict:
    user = request.state.user
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def verify_access_token(request):
    authorization = request.headers.get("Authorization")

    if not authorization:
        return None

    access_token = authorization.split(" ")[1]

    if access_token:
        payload = jwt.decode(
            access_token,
            key=SUPABASE_JWT_SECRET,
            do_verify=True,
            algorithms=["HS256"],
            audience="authenticated",
        )["user_metadata"]
        return payload

    return None


# https://medium.com/@chandanp20k/leveraging-custom-middleware-in-python-fastapi-for-enhanced-web-development-09ba72b5ddc6
class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            # Call the verify_access_token function to validate the token
            user = verify_access_token(request)

            # If token validation succeeds, continue to the next middleware or route handler
            print("verified", user)
            request.state.user = user

            response = await call_next(request)
            return response

        except Exception as e:
            # If token validation fails due to other exceptions, return a generic error response
            return JSONResponse(content={"detail": f"Error: {str(e)}"}, status_code=500)
