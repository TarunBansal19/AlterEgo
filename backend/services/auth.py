import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from config import SUPABASE_JWT_SECRET, SUPABASE_URL

security = HTTPBearer()

class CurrentUser(BaseModel):
    user_id: str
    tier: str

# Dynamically construct JWKS URL if SUPABASE_URL is provided
jwks_client = None
if SUPABASE_URL:
    jwks_url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
    jwks_client = PyJWKClient(jwks_url)

def decode_supabase_token(token: str) -> dict:
    try:
        hdr = jwt.get_unverified_header(token)
        alg = hdr.get("alg", "HS256")
    except Exception as ex:
        raise jwt.InvalidTokenError(f"Could not parse JWT Header: {ex}")

    if alg == "HS256":
        return jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
    elif alg in ["ES256", "RS256"]:
        if not jwks_client:
            raise jwt.InvalidTokenError("SUPABASE_URL is not configured for asymmetric signature verification")
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            audience="authenticated"
        )
    else:
        raise jwt.InvalidTokenError(f"Unsupported signing algorithm: {alg}")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> CurrentUser:
    token = credentials.credentials
    try:
        payload = decode_supabase_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Token is missing subject claim ('sub')"
            )
            
        # Supabase stores user-facing metadata under 'user_metadata' 
        # and admin-facing metadata under 'app_metadata'
        user_metadata = payload.get("user_metadata", {})
        app_metadata = payload.get("app_metadata", {})
    
        tier = app_metadata.get("tier") or user_metadata.get("tier", "free")
        
        return CurrentUser(user_id=user_id, tier=tier)

    except jwt.ExpiredSignatureError as e:
        print(f"JWT Verification Failed: Expired signature: {e}")
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"JWT Verification Failed: Invalid token: {e}")
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication token: {str(e)}"
        )