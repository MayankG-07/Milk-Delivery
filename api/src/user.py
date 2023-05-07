from password import Password
from db import connect, disconnect


class User:
    def __init__(
        self,
        wing: str,
        houseno: int,
        email: str = None,
        password: str = None,
        otp: int = None,
    ):
        self.wing = wing
        self.houseno = houseno
        self.email = email
        self.password = Password(password)
        self.otp = otp

    def register(self):
        connect()
        from db import con, cursor

        cursor.execute(f"SELECT * FROM users WHERE houseno={self.houseno}")
        result = cursor.fetchall()
        if result:
            disconnect()
            return {"error": "DUPLICATE_HOUSENO"}

        cursor.execute(f"SELECT * FROM users WHERE email='{self.email}'")
        result = cursor.fetchall()
        if result:
            disconnect()
            return {"error": "DUPLICATE_EMAIL"}

        try:
            cursor.execute(f"SELECT max(id) FROM users")
            prev_id = cursor.fetchall()[0][0]
            if not prev_id:
                current_id = 0
            else:
                current_id = int(prev_id) + 1
            self.password.encrypt()
            encrypted_pwd = self.password.value

            cursor.execute(
                f"INSERT INTO users (id, wing, houseno, email, password) VALUES ({current_id}, '{self.wing}', '{self.houseno}', '{self.email}', '{encrypted_pwd}')"
            )

            cursor.execute(
                f"CREATE TABLE {self.wing}{self.houseno} (subid INT, milkid INT, sub_start DATE, omit_days JSON, auto_renew TINYINT, pause_dates JSON, resume_dates JSON, milk_delivered JSON, could_not_deliver JSON, bills_due JSON, bills_paid JSON)"
            )

            con.commit()

            cursor.execute(f"SELECT * FROM users WHERE id={current_id}")
            result = cursor.fetchall()

            disconnect()
            if not result:
                return {"error": "SERVER_ERROR"}

            return {"success": "REGISTER_SUCCESS"}

        except Exception as e:
            return {"error": str(e)}

    def loginPassword(self):
        connect()
        from db import con, cursor

        cursor.execute(
            f"SELECT password FROM users WHERE wing='{self.wing}' AND houseno={self.houseno}"
        )

        try:
            result = cursor.fetchall()[0][0]
        except IndexError:
            disconnect()
            return {"error": "INVALID_CREDS"}
        except Exception as e:
            disconnect()
            return {"error": e}

        req_pwd = Password(result)
        req_pwd.decrypt()
        disconnect()
        return (
            {"success": "LOGIN_SUCCESS"}
            if self.password.value == req_pwd.value
            else {"error": "INVALID_CREDS"}
        )

    def loginOtp(self):
        connect()
        from db import con, cursor

        cursor.execute(
            f"SELECT otp, otpGenTime FROM users WHERE houseno={self.houseno}"
        )
        result = cursor.fetchall()[0]

        if not result:
            disconnect()
            return {"error": "INVALID_CREDS"}

        req_otp, otpGenTime = result

        cursor.execute(
            f"SELECT houseno FROM users WHERE DATE_ADD('{otpGenTime}', INTERVAL 10 MINUTE) >= NOW()"
        )

        try:
            result = cursor.fetchall()[0][0]
        except:
            disconnect()
            return {"error": "INVALID_OTP"}

        if (not result) or (not result == self.houseno):
            disconnect()
            return {"error": "INVALID_CREDS"}

        if not self.otp == req_otp:
            disconnect()
            return {"error": "INVALID_OTP"}

        cursor.execute(
            f"UPDATE users SET otp = NULL, otpGenTime = NULL WHERE houseno={self.houseno}"
        )
        con.commit()

        disconnect()
        return {"success": "LOGIN_SUCCESS"}

    def get_details(self):
        connect()
        from db import con, cursor

        cursor.execute(f"SELECT * FROM users WHERE houseno={self.houseno}")
        result = cursor.fetchall()[0]

        if not result:
            disconnect()
            return {"error": "INVALID_CREDS"}

        wing, houseno, email = result[1:4]

        cursor.execute(f"SELECT * FROM {wing}{self.houseno}")
        result = cursor.fetchall()

        subs = [
            {
                "id": result.index(row) + 1,
                "sub": {
                    "subid": row[0],
                    "milkid": row[1],
                    "sub_start": row[2],
                    "omit_days": row[3],
                    "auto_renew": row[4],
                    "pause_dates": eval(row[5]) if row[5] is not None else [],
                    "resume_dates": eval(row[6]) if row[6] is not None else [],
                    "milk_delivered": eval(row[7]) if row[7] is not None else [],
                    "could_not_deliver": eval(row[8]) if row[8] is not None else [],
                    "bills_due": eval(row[9]) if row[9] is not None else [],
                    "bills_paid": eval(row[10]) if row[10] is not None else [],
                },
            }
            for row in result
        ]

        details = {"wing": wing, "houseno": houseno, "email": email, "subs": subs}

        disconnect()
        return {"success": "DETAILS_FETCH_SUCCESS", "details": details}
