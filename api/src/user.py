from utils import Password, create_access_token
from db import connect, disconnect
from fastapi import HTTPException


class User:
    def __init__(
        self,
        userid: int = None,
        email: str = None,
        name: str = None,
        phone: str = None,
        password: str = None,
        imgUrl: str = None,
        houseids: list[int] | None = None,
        verified: int = 0,
        otp: int | None = None,
    ):
        self.userid = userid
        self.email = email
        self.name = name
        self.phone = phone
        self.password = Password(value=password) if password is not None else None
        self.imgUrl = imgUrl
        self.houseids = houseids
        self.verified = verified
        self.otp = Password(value=str(otp)) if otp is not None else None

    # * inline with new schema
    async def sync_details(self):
        connect()
        from db import con

        cursor = con.cursor()

        query = (
            f"SELECT * FROM users WHERE userid={self.userid}"
            if self.userid is not None
            else f"SELECT * FROM users WHERE email='{self.email}'"
        )

        cursor.execute(query)

        try:
            result = cursor.fetchall()
            row = result[0]
        except IndexError:
            disconnect()
            raise HTTPException(status_code=404, detail="User not found")

        disconnect()

        self.userid = row[0]
        self.name = row[1]
        self.email = row[2]
        self.phone = row[3]
        self.imgUrl = row[5]
        self.houseids = eval(row[6]) if row[6] is not None else None
        self.verified = bool(row[7])

    # * inline with new schema
    async def register(self):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(f"SELECT * FROM users WHERE email='{self.email}'")
        try:
            result = cursor.fetchall()
            row = result[0]
            raise HTTPException(
                status_code=400, detail="User with email already exists"
            )
        except IndexError:
            pass

        cursor.execute(f"SELECT * FROM users WHERE phone='{self.phone}'")
        try:
            result = cursor.fetchall()
            row = result[0]
            raise HTTPException(
                status_code=400, detail="User with phone already exists"
            )
        except IndexError:
            pass

        self.password.get_hash()
        query = (
            f"INSERT INTO users (name, email, phone, password, imgUrl, verified) VALUES ('{self.name}', '{self.email}', '{self.phone}', '{self.password.hashed}', '{self.imgUrl}', 0)"
            if self.imgUrl is not None
            else f"INSERT INTO users (name, email, phone, password, verified) VALUES ('{self.name}', '{self.email}', '{self.phone}', '{self.password.hashed}', 0)"
        )
        cursor.execute(query)
        con.commit()

        cursor.execute(f"SELECT * FROM users WHERE email='{self.email}'")
        result = cursor.fetchall()
        row = result[0]
        details = {
            "userid": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[3],
            "imgUrl": row[5],
            "houseids": eval(row[6]) if row[6] is not None else None,
            "verified": bool(row[7]),
        }

        disconnect()
        return details

    # * inline with new schema
    async def loginPassword(self):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(f"SELECT password FROM users WHERE userid='{self.userid}'")
        result = cursor.fetchall()
        req_pwd = result[0][0]

        self.password.hashed = req_pwd
        disconnect()
        if not self.password.verify_password():
            raise HTTPException(status_code=400, detail="Invalid password")

        return {
            "access_token": create_access_token(
                {"userid": self.userid, "login_type": "password"}
            ),
            "token_type": "bearer",
        }

    # * inline with new schema
    async def loginOtp(self):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(f"SELECT otp, otpGenTime FROM users WHERE userid={self.userid}")
        result = cursor.fetchall()
        try:
            row = result[0]
            req_otp, otpGenTime = row[0], row[1]
        except IndexError:
            disconnect()
            raise HTTPException(status_code=400, detail="Invalid OTP")

        cursor.execute(
            f"SELECT otp FROM users WHERE DATE_ADD(otpGenTime, INTERVAL 10 MINUTE) >= NOW()"
        )

        try:
            result = cursor.fetchall()
            row = result[0]
            req_otp = row[0]
            self.otp.hashed = req_otp
        except IndexError:
            disconnect()
            raise HTTPException(status_code=400, detail="Invalid OTP")

        if not self.otp.verify_password():
            disconnect()
            raise HTTPException(status_code=400, detail="Invalid OTP")

        cursor.execute(
            f"UPDATE users SET otp = NULL, otpGenTime = NULL WHERE userid={self.userid}"
        )
        con.commit()

        disconnect()
        return {
            "access_token": create_access_token(
                {"userid": self.userid, "login_type": "otp"}
            ),
            "token_type": "bearer",
        }

    # * inline with new schema
    async def verify_email(self):
        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(f"UPDATE users SET verified=1 WHERE userid={self.userid}")

        con.commit()
        disconnect()
