from app import app
from otp import OTP
from db import connect, disconnect
from pydantic import BaseModel


class GetOtpParams(BaseModel):
    wing: str
    houseno: int


@app.patch("/api/get_otp")
def get_otp(getOtpParams: GetOtpParams):
    connect()
    params_dict = getOtpParams.dict()
    wing = params_dict["wing"]
    houseno = params_dict["houseno"]

    from db import con, cursor

    cursor.execute(f"SELECT email FROM users WHERE wing='{wing}' AND houseno={houseno}")

    try:
        email = cursor.fetchall()[0][0]
    except IndexError:
        disconnect()
        return {"error": "INVALID_CREDS"}

    # if not email:
    #     disconnect()
    #     return {"error": "INVALID_CREDS"}

    new_otp = OTP(email)
    message = new_otp.send()
    disconnect()
    return message
