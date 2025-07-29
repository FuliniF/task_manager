from fastapi import FastAPI
from pydantic import BaseModel
from client import SupabaseClient

app = FastAPI()
supabase_client = SupabaseClient()

class User(BaseModel):
    user_id: int
    token: str
    email: str
    goal: str = None
    status: str = None

@app.get("/")
async def read_root():
    return {"message": "Helloooo World"}

@app.post("/create-user")
def create_user(user: User):
    isExist = supabase_client.get_client().from_("users").select("*").eq("token", user.token).execute()
    
    if isExist.data:
        return {"message": "User already exists"}
    
    result = supabase_client.get_client().from_("users").insert({
        "user_id": user.user_id,
        "token": user.token,
        "email": user.email,
    }).execute()

    if result.get("error"):
        return {"message": "Error creating user", "error": result["error"]["message"]}
    
    return {"message": "User created successfully", "user_id": user.user_id}