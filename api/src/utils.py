from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt

ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
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


def create_access_token(subject: Union[str, Any], expires_delta: int = None):
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: int = None):
    if expires_delta is not None:
        expires_delta = datetime.utcnow() + expires_delta
    else:
        expires_delta = datetime.utcnow() + timedelta(
            minutes=REFRESH_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expires_delta, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt
