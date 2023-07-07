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
    con = connect()
    userid: int = token_data.get("userid")
    user = User(userid=userid)
    await user.sync_details(con=con)

    await user.verify_email(con=con)
    disconnect(con)


# * inline with new schema
@app.post("/user/send-otp", summary="Send OTP to user", status_code=204)
async def get_otp(token_data=Depends(get_current_user)):
    con = connect()
    cursor = con.cursor()
    userid: int = token_data.get("userid")
    cursor.execute(f"SELECT * FROM users WHERE userid={userid}")

    result = cursor.fetchall()
    try:
        row = result[0]
        email = row[0]
    except IndexError:
        disconnect(con)
        raise HTTPException(status_code=400, detail="Invalid userid")

    user = User(userid=userid)
    await user.sync_details(con=con)
    otp = OTP(user, con=con)
    await otp.send()
    disconnect(con)


# * inline with new schema
@app.post("/user/login", summary="Login", status_code=200)
async def login(params: OAuth2PasswordRequestForm = Depends()):
    con = connect()
    email = params.username
    data = eval(params.password)
    login_type = data.get("type")
    if login_type == "password":
        password = data.get("password")
        user = User(email=email, password=password)
        await user.sync_details(con=con)
        details = await user.loginPassword(con=con)
    elif login_type == "otp":
        otp = data.get("otp")
        user = User(email=email, otp=otp)
        await user.sync_details(con=con)
        details = await user.loginOtp(con=con)
    else:
        disconnect(con)
        raise HTTPException(status_code=400, detail="Invalid data")

    disconnect(con)
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
    con = connect()
    name = params.name
    email = params.email
    phone = params.phone
    password = params.password
    imgUrl = params.imgUrl

    user = User(name=name, email=email, phone=phone, password=password, imgUrl=imgUrl)
    details = await user.register(con=con)

    disconnect(con)
    return details


@app.get("/user/details", summary="Get details of a user", status_code=200)
async def get_user_details(
    userid: int | None = None, email: str | None = None, phone: str | None = None
):
    con = connect()
    user = User(userid=userid, email=email, phone=phone)
    await user.sync_details(con=con)
    details = {
        "userid": user.userid,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "imgUrl": user.imgUrl,
        "houseids": user.houseids,
        "verified": user.verified,
    }
    disconnect(con)
    return details
