from random import randrange
from src.db import connect, disconnect
from src.email_config import Email


class OTP:
    def __init__(self, email: str):
        self.email = email
        self.value = randrange(1111, 9999)

        connect()
        from src.db import con

        cursor = con.cursor()

        while True:
            try:
                cursor.execute(f"SELECT houseno FROM users WHERE otp={self.value}")
                temp_otp = cursor.fetchall()[0][0]
                self.value = randrange(1111, 9999)
            except:
                break

        # cursor.execute(f"SELECT otp FROM users WHERE email='{self.email}'")
        # prev_otp = cursor.fetchall()[0][0]
        # if prev_otp:
        #     prev_otp = int(prev_otp)
        #     while self.value == prev_otp:
        #         self.value = randrange(1111, 9999)

        cursor.execute(f"UPDATE users SET otp={self.value} WHERE email='{self.email}'")
        cursor.execute(f"UPDATE users SET otpGenTime=NOW() WHERE email='{self.email}'")

        con.commit()
        disconnect()

    async def send(self):
        # email_body = """Dear Customer

        #                 You requested a one time password at Patel Kirana Store

        #                 Your one time password (OTP) at Patel Kirana Store is - {} - valid for 10 minutes only.

        #                 Please enter this OTP on the app to proceed.

        #                 Thanks
        #                 Patel Kirana Store""".format(
        #     self.value
        # )

        with open(r"./../assets/otp.txt", "r") as f:
            body = f.read()
            email_body = body.format(self.value)

        # email_html = """<!DOCTYPE html>
        #                 <html lang="en">
        #                 <body>
        #                     <div
        #                     style="
        #                         margin: 20px;
        #                         font-family: Verdana, Geneva, Tahoma, sans-serif;
        #                         font-size: 20px;
        #                     "
        #                     >
        #                     Dear Customer

        #                     <br /><br />

        #                     You requested a one time password at Patel Kirana Store.

        #                     <br /><br />

        #                     Your One Time Password (OTP) at Patel Kirana store is -
        #                     <b><div style="display: inline-block">{}</div></b> - valid for 10 minutes
        #                     only

        #                     <br /><br />

        #                     Please enter this OTP on the app to proceed.

        #                     <br /><br />

        #                     Thanks
        #                     <br />
        #                     Patel Kirana Store
        #                     </div>
        #                 </body>
        #                 </html>""".format(
        #     self.value
        # )

        with open(r"./../assets/otp.html", "r") as f:
            html = f.read()
            email_html = html.format(self.value)

        new_otp_email = Email(
            to=self.email,
            subject="OTP Requested at Patel Kirana Store",
            body=email_body,
            html=email_html,
        )

        try:
            await new_otp_email.send()
            return {"success": "OTP_SENT_SUCCESS", "data": {"otp": self.value}}
        except Exception as e:
            return {"error": e}
