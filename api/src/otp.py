from random import randrange
from db import connect, disconnect
from email_config import Email
from utils import Password
from user import User


# * inline with new schema
class OTP:
    def __init__(self, user: User):
        self.user = user
        self.value = Password(value=str(randrange(1111, 9999)))
        self.value.get_hash()

        connect()
        from db import con

        cursor = con.cursor()

        cursor.execute(
            f"UPDATE users SET otp='{self.value.hashed}' WHERE userid={self.user.userid}"
        )
        cursor.execute(
            f"UPDATE users SET otpGenTime=NOW() WHERE userid={self.user.userid}"
        )

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
            email_body = body.format(self.value.value)

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
            email_html = html.format(self.value.value)

        new_otp_email = Email(
            to=self.user.email,
            subject="OTP Requested at Patel Kirana Store",
            body=email_body,
            html=email_html,
        )

        await new_otp_email.send()
