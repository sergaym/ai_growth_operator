from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Response
from app.schemas.user_schemas import UserCreate, UserOut, TokenResponse
from app.services.user_service import UserService
from app.db.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password, get_password_hash, get_current_user

router = APIRouter()

@router.post('/signup', response_model=TokenResponse)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await UserService.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    hashed_password = get_password_hash(user_in.password)
    user = await UserService.create_user(db, user_in, hashed_password=hashed_password)
    # Load user with workspaces for response
    user_with_workspaces = await UserService.get_user_by_email(db, user.email, load_workspaces=True)
    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})
    return {"user": user_with_workspaces, "access_token": access_token, "refresh_token": refresh_token}

@router.post('/signin', response_model=TokenResponse)
async def signin(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await UserService.get_user_by_email(db, form_data.username, load_workspaces=True)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="auth-token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=30 * 24 * 60 * 60,  # 30 days
        expires=30 * 24 * 60 * 60,   # 30 days
        path="/",
        secure=False,  # Set to False in development, True in production with HTTPS
        samesite="lax"
    )
    
    return {"user": user, "access_token": access_token, "refresh_token": refresh_token}

@router.post('/refresh', response_model=TokenResponse)
async def refresh_token_endpoint(refresh_token: str, db: AsyncSession = Depends(get_db)):
    # decode_token returns a tuple (payload, error_type)
    payload, error = decode_token(refresh_token)
    
    # Check if token is valid
    if payload is None:
        if error == "expired":
            raise HTTPException(status_code=401, detail="Refresh token has expired")
        else:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Verify the payload has a subject
    if "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token content")
    
    # Get the user from the database with workspaces
    user = await UserService.get_user_by_email(db, payload["sub"], load_workspaces=True)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Generate new tokens
    access_token = create_access_token({"sub": user.email})
    new_refresh_token = create_refresh_token({"sub": user.email})
    
    return {"user": user, "access_token": access_token, "refresh_token": new_refresh_token}

@router.get('/me', response_model=UserOut)
async def get_me(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.workspaces = await UserService.get_user_workspaces(db, current_user.id)
    return current_user
