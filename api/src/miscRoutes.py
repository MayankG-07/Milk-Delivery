from app import app
from db import connect, disconnect
from user import User
from pydantic import BaseModel


class MilkOnlyNextDayParams(BaseModel):
    houseno: int


class VerifyEmailParams(BaseModel):
    wing: str
    houseno: int


@app.put("/api/milk_only_next_day")
async def milk_only_next_day(milkOnlyNextDayParams: MilkOnlyNextDayParams):
    connect()
    params_dict = milkOnlyNextDayParams.dict()
    houseno = params_dict["houseno"]

    from db import con

    cursor = con.cursor()

    cursor.execute(f"UPDATE users SET milk_next_day=1 WHERE houseno={houseno}")
    con.commit()

    cursor.execute(f"SELECT milk_next_day FROM users WHERE houseno={houseno}")
    result = cursor.fetchall()[0][0]

    if not result:
        disconnect()
        return {"error": "An error occurred"}
    disconnect()
    return {"success": "MILK_NEXT_DAY"}


@app.patch("/api/verify_email")
async def verify_email(verifyEmailParams: VerifyEmailParams):
    params_dict = verifyEmailParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    user = User(wing, houseno)
    message = user.verify_email()
    return message
