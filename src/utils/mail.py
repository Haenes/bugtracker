import smtplib
from email.message import EmailMessage

from pydantic import EmailStr

from auth.models import User
from config import (
    SMTP_HOST, SMTP_PORT,
    SMTP_USER, SMTP_PASSWORD, VERIFY_URL
    )


class EmailInterface():

    @classmethod
    def get_email_template(
        cls,
        subject: str,
        to_email: EmailStr,
        content: str
    ) -> EmailMessage:
        email = EmailMessage()
        email["Subject"] = subject
        email["From"] = SMTP_USER
        email["To"] = to_email

        email.set_content(content, subtype="html")
        return email

    @classmethod
    def send_email(
        cls,
        subject: str,
        to_email: EmailStr,
        content: str
    ) -> None:
        email = cls.get_email_template(subject, to_email, content)

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as email_server:
            email_server.login(SMTP_USER, SMTP_PASSWORD)
            email_server.send_message(email)


class EmailVerification(EmailInterface):

    url = VERIFY_URL
    subject = "Email verification"

    @classmethod
    def send_email(cls, user: User, token: str) -> None:
        content = (
            "<div>"
            "<h3>"
            f"Hello, {user.first_name}!"
            "<br>"
            "Please, click on the link below to verify your email "
            "if you're using UI (site):"
            "</h3><br>"
            f"{cls.url}?{token}"
            "<h3>"
            "If you're using the API make a POST request to "
            f"{cls.url} in json format with data:"
            "</h3><br>"
            f'"token": "{token}"'
            "</div>"
        )

        email = cls.get_email_template(
            subject=cls.subject,
            to_email=user.email,
            content=content
        )

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as email_server:
            email_server.login(SMTP_USER, SMTP_PASSWORD)
            email_server.send_message(email)
