from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# ----------------
# Workspace Schemas
# ----------------

class UserWorkspace(BaseModel):
    user_id: int
    workspace_id: str
    role: str
    active: bool
    joined_at: datetime

class Workspace(BaseModel):
    id: str
    name: str
    type: str
    owner_id: int
    created_at: datetime
    updated_at: datetime
    stripe_customer_id: Optional[str] = None

class User(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: Optional[str]
    created_at: datetime
    updated_at: datetime

# ----------------
# Response Models
# ----------------

class UserWorkspaceResponse(UserWorkspace):
    model_config = ConfigDict(from_attributes=True)

class WorkspaceResponse(Workspace):
    model_config = ConfigDict(from_attributes=True)

class UserResponse(User):
    model_config = ConfigDict(from_attributes=True) 