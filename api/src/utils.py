from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status
from app import app
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 60 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ALGORITHM = "HS256"
with open(r"../assets/key", "r") as f:
    keys = f.readlines()
    JWT_SECRET_KEY = keys[0].strip()
    JWT_REFRESH_SECRET_KEY = keys[1].strip()

# print(JWT_SECRET_KEY)
# print(JWT_REFRESH_SECRET_KEY)
# JWT_SECRET_KEY = "TJU7BR5gWzwBQUTWoqHvZS0H0Vc00rPN"
# JWT_REFRESH_SECRET_KEY = "KIWBo4I1e8dyLkDfjKMtF0iiCiOyGbu7"

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Password:
    def __init__(self, value: str | None = None, hashed: str | None = None):
        self.value = value
        self.hashed = hashed

    def get_hash(self):
        self.hashed = password_context.hash(self.value)

    def verify_password(self):
        return password_context.verify(self.value, self.hashed)


def create_access_token(payload: dict):
    to_encode = payload.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str, e):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        userid: int = payload.get("userid")
        login_type: str = payload.get("login_type")
        if userid is None or login_type is None:
            raise e

        # from user import User

        # user = User(userid=userid)
        # await user.sync_details()

        token_data = {"userid": userid, "login_type": login_type}
        return token_data
    except:
        raise e


def get_current_user(token: str = Depends(oauth2_scheme)):
    e = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not authorize credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_access_token(token, e)
    userid = token_data.get("userid")
    return userid


@app.get("/test/verify-token")
async def verify_token(token: str):
    userid = await get_current_user(token)
    return {"userid": userid}


# def create_refresh_token(subject: Union[str, Any], expires_delta: int = None):
#     if expires_delta is not None:
#         expires_delta = datetime.utcnow() + expires_delta
#     else:
#         expires_delta = datetime.utcnow() + timedelta(
#             minutes=REFRESH_TOKEN_EXPIRE_MINUTES
#         )

#     to_encode = {"exp": expires_delta, "sub": str(subject)}
#     encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
#     return encoded_jwt
