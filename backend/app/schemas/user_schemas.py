from typing import List, Optional
from pydantic import BaseModel, EmailStr

class WorkspaceBase(BaseModel):
    name: str
    type: str

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceOut(WorkspaceBase):
    id: str

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: str
    workspaces: List[WorkspaceOut] = []

class TokenResponse(BaseModel):
    user: UserOut
    access_token: str
    refresh_token: str
