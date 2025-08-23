import os
from datetime import datetime
from typing import Optional

import httpx
from chat import gen_goal, gen_milestones, gen_missions, gen_schedules, gen_status
from client import SupabaseClient
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from httpx import RequestError
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://goalreacher.me",
        "http://localhost:3000",
        "http://172.25.1.253:3000",
        f"{os.getenv('DOMAIN_URL')}",
    ],  # Add your frontend URLs
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


class GoalRequest(BaseModel):
    goal: str


class StatusRequest(BaseModel):
    goal: str
    previous_status: Optional[str] = "None"
    user_description: Optional[str] = "None"


class MilestoneRequest(BaseModel):
    goal: str
    status: str


class MissionRequest(BaseModel):
    goal: str
    status: str
    milestones: dict


class DateTime(BaseModel):
    dateTime: str
    timeZone: str


class ScheduleRequest(BaseModel):
    missions: list
    today: Optional[str] = None


class SaveDataRequest(BaseModel):
    goal: str
    status: str
    milestones: dict
    missions: dict
    schedules: dict
    userid: str


class UpdateTaskProgressRequest(BaseModel):
    task_id: int
    recurrence_done: int


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
    except RequestError as e:
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
    try:
        # Check if user already exists
        existing_user = (
            supabase_client.get_client()
            .from_("users")
            .select("*")
            .eq("user_id", user.user_id)
            .execute()
        )

        if existing_user.data:
            return {
                "message": "User already exists",
                "user_id": user.user_id,
                "status": "existing",
            }

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

        # Check for errors in the Supabase response
        # Supabase Python client stores errors in result.error, not result["error"]
        if hasattr(result, "error") and result.error:
            print(f"Supabase error: {result.error}")
            raise HTTPException(
                status_code=500, detail=f"Database error: {result.error}"
            )

        # Also check if data was actually inserted
        if not result.data:
            print(f"No data returned from insert operation")
            raise HTTPException(
                status_code=500, detail="Failed to create user: No data returned"
            )

        print(f"User created successfully: {user.user_id}")
        return {
            "message": "User created successfully",
            "user_id": user.user_id,
            "status": "created",
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Unexpected error in create_user: {str(e)}")
        print(f"Error type: {type(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating user: {result['error']['message']}"
        )


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


@app.post("/api/generate-goal")
async def generate_goal(request: GoalRequest):
    try:
        result = gen_goal(request.goal)
        return {"goal": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating goal: {str(e)}")


@app.post("/api/generate-status")
async def generate_status(request: StatusRequest):
    try:
        result = gen_status(
            request.goal, request.previous_status, request.user_description
        )
        return {"status": result}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating status: {str(e)}"
        )


@app.post("/api/generate-milestones")
async def generate_milestones(request: MilestoneRequest):
    try:
        result = gen_milestones(request.goal, request.status)
        # Convert the Pydantic model to dict
        return result.dict() if hasattr(result, "dict") else result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating milestones: {str(e)}"
        )


@app.post("/api/generate-missions")
async def generate_missions(request: MissionRequest):
    try:
        result = gen_missions(request.goal, request.status, request.milestones)
        # Convert the Pydantic model to dict
        return result.dict() if hasattr(result, "dict") else result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating missions: {str(e)}"
        )


@app.post("/api/generate-schedules")
async def generate_schedules(request: ScheduleRequest):
    try:
        today = request.today or datetime.now().strftime("%Y-%m-%d")
        result = gen_schedules(request.missions, today)
        # Convert the Pydantic model to dict
        return result.dict() if hasattr(result, "dict") else result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating schedules: {str(e)}"
        )


@app.post("/api/save-data")
async def save_data(data: SaveDataRequest):
    """Save milestones and tasks to database"""
    try:
        user_status = (
            supabase_client.get_client()
            .from_("users")
            .select("status")
            .eq("user_id", data.userid)
            .single()
            .execute()
        )
        if user_status == "working":
            # User is already working on a task. Don't duplicate tasks
            return {"message": "Data already exists", "user_id": data.userid}
        if user_status == "finished":
            # clear previous data in milestones and tasks first
            supabase_client.get_client().from_("milestones").delete().eq(
                "user_id", data.userid
            ).execute()
            supabase_client.get_client().from_("tasks").delete().eq(
                "user_id", data.userid
            ).execute()

        # Update user's goal and status
        user_update = (
            supabase_client.get_client()
            .from_("users")
            .update({"goal": data.goal, "status": "working"})
            .eq("user_id", data.userid)
            .execute()
        )

        if hasattr(user_update, "error") and user_update.error:
            raise HTTPException(
                status_code=501, detail=f"Error updating user: {user_update.error}"
            )

        # Save new milestones
        milestone_data = []
        for milestone in data.milestones.get("milestones", []):
            milestone_data.append(
                {
                    "user_id": data.userid,
                    "name": milestone.get("title", ""),
                    "description": milestone.get("description", ""),
                }
            )

        if milestone_data:
            milestones_result = (
                supabase_client.get_client()
                .from_("milestones")
                .insert(milestone_data)
                .execute()
            )

            if hasattr(milestones_result, "error") and milestones_result.error:
                raise HTTPException(
                    status_code=502,
                    detail=f"Error saving milestones: {milestones_result.error}",
                )

            # Create a mapping of milestone titles to IDs
            milestone_map = {}
            for milestone in milestones_result.data:
                milestone_map[milestone["name"]] = milestone["id"]

            # Save tasks (missions as tasks)
            task_data = []

            # Find corresponding milestone for each event in schedules
            for event in data.schedules.get("events", []):
                # For simplicity, assign to first milestone or create a general one
                milestone_id = (
                    list(milestone_map.values())[0] if milestone_map else None
                )

                if milestone_id:
                    recurrence_time_required = (
                        int(event.get("recurrence", "").strip("=")[-1])
                        if event.get("recurrence")
                        else 1
                    )
                    start_time = event.get("start", {}).get("dateTime", "")
                    end_time = event.get("end", {}).get("dateTime", "")
                    task_data.append(
                        {
                            "user_id": data.userid,
                            "name": event.get("summary", ""),
                            "recurrence": event.get("recurrence", ""),
                            "recurrence_time_required": recurrence_time_required,
                            "recurrence_time_done": 0,
                            "start_timestamptz": start_time,
                            "end_timestamptz": end_time,
                        }
                    )

            print("len task_data:", len(task_data))

            if task_data:
                tasks_result = (
                    supabase_client.get_client()
                    .from_("tasks")
                    .insert(task_data)
                    .execute()
                )

                if hasattr(tasks_result, "error") and tasks_result.error:
                    raise HTTPException(
                        status_code=503,
                        detail=f"Error saving tasks: {tasks_result.error}",
                    )

        return {"message": "Data saved successfully", "user_id": data.userid}

    except Exception as e:
        raise HTTPException(status_code=504, detail=f"Error saving data: {str(e)}")


@app.post("/api/back-get-status")
async def get_status(userData: User):
    try:
        user_status = (
            supabase_client.get_client()
            .from_("users")
            .select("status")
            .eq(
                "user_id", userData.user_id
            )  # Changed from userData.username to userData.user_id
            .single()
            .execute()
        )
        print("user status:", user_status)

        if not user_status.data:
            raise HTTPException(status_code=404, detail="User not found")

        return {"status": user_status.data["status"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")


@app.post("/api/load-data")
async def load_data(userData: User):
    try:
        milestone_ids = (
            supabase_client.get_client()
            .from_("milestones")
            .select("id")
            .eq("user_id", userData.user_id)
            .eq("email", userData.email)
            .execute()
        )

        tasks = []
        for milestone in milestone_ids.data:
            tasks.append(
                supabase_client.get_client()
                .from_("tasks")
                .select("*")
                .eq("milestone_id", milestone.id)
                .execute()
            )

        return {"user_id": userData.user_id, "tasks": tasks}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")
