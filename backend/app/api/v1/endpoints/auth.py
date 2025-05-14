from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user_schemas import UserCreate, UserOut, TokenResponse
from app.services.user_service import UserService
from app.db.session import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token, verify_password, get_password_hash, get_current_user

router = APIRouter()

@router.post('/signup', response_model=TokenResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = UserService.get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(status_code=400, detail='Email already registered')
    hashed_password = get_password_hash(user_in.password)
    user = UserService.create_user(db, user_in, hashed_password=hashed_password)
    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})
    return {"user": user, "access_token": access_token, "refresh_token": refresh_token}

@router.post('/signin', response_model=TokenResponse)
def signin(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = UserService.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    access_token = create_access_token({"sub": user.email})
    refresh_token = create_refresh_token({"sub": user.email})
    return {"user": user, "access_token": access_token, "refresh_token": refresh_token}

@router.post('/refresh', response_model=TokenResponse)
def refresh_token_endpoint(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = UserService.get_user_by_email(db, payload["sub"])
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    access_token = create_access_token({"sub": user.email})
    new_refresh_token = create_refresh_token({"sub": user.email})
    return {"user": user, "access_token": access_token, "refresh_token": new_refresh_token}

@router.get('/me', response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user
