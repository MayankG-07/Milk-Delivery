from pydantic import BaseModel
from src.app import app
from src.user import User


class LoginPasswordParams(BaseModel):
    wing: str
    houseno: int
    password: str


class LoginOtpParams(BaseModel):
    wing: str
    houseno: int
    otp: int


@app.patch("/api/login/password")
async def login_with_password(loginPasswordParams: LoginPasswordParams):
    params_dict = loginPasswordParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]
    password = params_dict["password"]

    new_user = User(wing=wing, houseno=houseno, password=password)
    message = await new_user.loginPassword()
    return message


@app.patch("/api/login/otp")
async def login_with_otp(loginOtpParams: LoginOtpParams):
    params_dict = loginOtpParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]
    otp = params_dict["otp"]

    new_user = User(wing=wing, houseno=houseno, otp=otp)
    message = await new_user.loginOtp()
    return message
