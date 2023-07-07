from random import randrange
from email_config import Email
from utils import Password
from user import User


# * inline with new schema
class OTP:
    def __init__(self, user: User, con):
        self.user = user
        self.value = Password(value=str(randrange(1111, 9999)))
        self.value.get_hash()

        cursor = con.cursor()

        cursor.execute(
            f"UPDATE users SET otp='{self.value.hashed}' WHERE userid={self.user.userid}"
        )
        cursor.execute(
            f"UPDATE users SET otpGenTime=NOW() WHERE userid={self.user.userid}"
        )

        con.commit()

    async def send(self):
        with open(r"./../assets/otp.txt", "r") as f:
            body = f.read()
            email_body = body.format(self.value.value)

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
