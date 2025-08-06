from typing import Optional

import httpx
from client import SupabaseClient
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],  # Add your frontend URLs
    allow_credentials=True,  # Important for cookies
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

supabase_client = SupabaseClient()


class User(BaseModel):
    user_id: str
    email: str
    goal: str = None
    status: str = None


class TokenData(BaseModel):
    user_id: str
    email: str


async def verify_token(
    request: Request, authorization: str = Header(None)
) -> TokenData:
    """Verify OAuth token from either cookies or Authorization header"""
    token = None

    # Try to get token from Authorization header first (for API clients)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    # If no header, try to get from cookies (for web browsers)
    elif "access_token" in request.cookies:
        token = request.cookies["access_token"]

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Missing token. Provide either Authorization header or access_token cookie",
        )

    try:
        # Verify token with NYCU OAuth provider
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://id.nycu.edu.tw/api/profile",
                headers={"Authorization": f"Bearer {token}"},
            )

        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        user_data = response.json()
        return TokenData(user_id=user_data["username"], email=user_data["email"])

    except httpx.RequestException as e:
        raise HTTPException(
            status_code=401, detail=f"Token verification failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get("/")
async def read_root():
    return {"message": "Helloooo World"}


@app.post("/create-user")
async def create_user(user: User):
    """Create user without storing OAuth tokens"""
    # Check if user already exists
    existing_user = (
        supabase_client.get_client()
        .from_("users")
        .select("*")
        .eq("user_id", user.user_id)
        .execute()
    )

    if existing_user.data:
        return {"message": "User already exists", "user_id": user.user_id}

    # Insert user without storing OAuth token
    result = (
        supabase_client.get_client()
        .from_("users")
        .insert(
            {
                "user_id": user.user_id,
                "email": user.email,
                "goal": user.goal,
                "status": user.status or "active",
            }
        )
        .execute()
    )

    if result.get("error"):
        raise HTTPException(
            status_code=500, detail=f"Error creating user: {result['error']['message']}"
        )

    return {"message": "User created successfully", "user_id": user.user_id}


@app.get("/profile")
async def get_profile(token_data: TokenData = Depends(verify_token)):
    """Protected route that requires valid OAuth token"""
    # Get user data from database
    user_result = (
        supabase_client.get_client()
        .from_("users")
        .select("*")
        .eq("user_id", token_data.user_id)
        .execute()
    )

    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": token_data.user_id,
        "email": token_data.email,
        "profile": user_result.data[0],
    }


@app.get("/debug/cookies")
async def debug_cookies(request: Request):
    """Debug endpoint to inspect all cookies and headers"""
    return {
        "cookies": dict(request.cookies),
        "headers": dict(request.headers),
        "authorization_header": request.headers.get("authorization"),
        "access_token_cookie": request.cookies.get("access_token"),
        "cookie_count": len(request.cookies),
    }


@app.get("/debug/token-info")
async def debug_token_info(request: Request):
    """Debug endpoint to check token validation without full auth"""
    token = None
    source = "none"

    if request.headers.get("authorization", "").startswith("Bearer "):
        token = request.headers.get("authorization", "").split(" ")[1]
        source = "header"
    elif "access_token" in request.cookies:
        token = request.cookies["access_token"]
        source = "cookie"

    if not token:
        return {"error": "No token found", "source": source}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://id.nycu.edu.tw/api/profile",
                headers={"Authorization": f"Bearer {token}"},
            )

        return {
            "token_source": source,
            "token_length": len(token),
            "token_preview": f"{token[:10]}...{token[-10:]}",
            "nycu_response_status": response.status_code,
            "nycu_response_valid": response.status_code == 200,
            "user_data": response.json() if response.status_code == 200 else None,
        }

    except Exception as e:
        return {"token_source": source, "token_length": len(token), "error": str(e)}


@app.post("/logout")
async def logout(request: Request):
    """Logout endpoint that clears the access token cookie"""
    from fastapi.responses import JSONResponse

    # Check if user had a token before logout
    had_token = "access_token" in request.cookies
    token_preview = ""

    if had_token:
        token = request.cookies["access_token"]
        token_preview = f"{token[:10]}...{token[-10:]}" if len(token) > 20 else token

    response = JSONResponse(
        content={
            "message": "Logged out successfully",
            "had_token": had_token,
            "token_preview": token_preview if had_token else None,
            "timestamp": str(__import__("datetime").datetime.now()),
        }
    )

    # Clear the access token cookie
    response.delete_cookie(
        "access_token",
        path="/",
        domain=None,  # Use default domain
        secure=False,  # Set to True in production with HTTPS
        httponly=True,
        samesite="lax",
    )

    return response
