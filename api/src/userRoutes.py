from app import app
from user import User
from db import connect, disconnect
from fastapi import HTTPException, Depends
from otp import OTP
from fastapi.security import OAuth2PasswordRequestForm
from schemas import RegisterUserParams
from utils import get_current_user


# * inline with new schema
@app.post("/user/verify-email", summary="Verify email of user", status_code=204)
async def verify_email(token_data=Depends(get_current_user)):
    userid = token_data.get("userid")
    user = User(userid=userid)
    await user.sync_details()

    await user.verify_email()


# * inline with new schema
@app.post("/user/send-otp", summary="Send OTP to user", status_code=204)
async def get_otp(token_data=Depends(get_current_user)):
    connect()
    from db import con

    cursor = con.cursor()
    userid = token_data.get("userid")
    cursor.execute(f"SELECT * FROM users WHERE userid={userid}")

    result = cursor.fetchall()
    try:
        row = result[0]
        email = row[0]
    except IndexError:
        disconnect()
        raise HTTPException(status_code=400, detail="Invalid userid")

    disconnect()

    user = User(userid=userid)
    await user.sync_details()
    otp = OTP(user)
    await otp.send()


# * inline with new schema
@app.post("/user/login", summary="Login by password", status_code=200)
async def login_with_password(params: OAuth2PasswordRequestForm = Depends()):
    email = params.username
    data = eval(params.password)
    login_type = data.get("type")
    if login_type == "password":
        password = data.get("password")
        user = User(email=email, password=password)
        await user.sync_details()
        details = await user.loginPassword()
    elif login_type == "otp":
        otp = data.get("otp")
        user = User(email=email, otp=otp)
        await user.sync_details()
        details = await user.loginOtp()
    else:
        raise HTTPException(status_code=400, detail="Invalid data")

    return details


# @app.post("/user/login/otp", summary="Login", status_code=200)
# async def login_with_otp(params: OAuth2PasswordRequestForm = Depends()):
#     email = params.username
#     otp = params.password

#     user = User(email=email, otp=otp)
#     await user.sync_details()
#     details = await user.loginOtp()
#     return details


# * inline with new schema
@app.post("/user/register", summary="Create a new user", status_code=201)
async def register(params: RegisterUserParams):
    name = params.name
    email = params.email
    phone = params.phone
    password = params.password
    imgUrl = params.imgUrl

    user = User(name=name, email=email, phone=phone, password=password, imgUrl=imgUrl)
    details = await user.register()

    return details


@app.get("/user/{userid}/details", summary="Get details of a user", status_code=200)
async def get_user_details(userid: int):
    user = User(userid=userid)
    await user.sync_details()
    details = {
        "userid": user.userid,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "imgUrl": user.imgUrl,
        "houseids": user.houseids,
        "verified": user.verified,
    }
    return details
