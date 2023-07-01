import smtplib
from email.message import EmailMessage


class Email:
    def __init__(self, to, subject, body, html):
        self.to = to
        self.subject = subject
        self.body = body
        self.html = html

    async def send(self):
        msg = EmailMessage()
        msg["From"] = "mg.lbms07@gmail.com"
        msg["To"] = self.to
        msg["Subject"] = self.subject
        msg.set_content(self.body)
        msg.add_alternative(self.html, subtype="html")

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("mg.lbms07@gmail.com", "moifxxxtdflslfbj")
            smtp.send_message(msg)
