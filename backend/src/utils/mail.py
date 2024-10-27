import smtplib
from email.message import EmailMessage

from pydantic import EmailStr

from auth.models import User
from config import (
    SMTP_HOST, SMTP_PORT,
    SMTP_USER, SMTP_PASSWORD,
    VERIFY_URL, PASSWORD_RESET_URL
    )


class EmailInterface():

    @staticmethod
    def _smtp_helper(
        email: EmailMessage,
        SMTP_HOST: str = SMTP_HOST,
        SMTP_PORT: str = SMTP_PORT,
        SMTP_USER: str = SMTP_USER,
        SMTP_PASSWORD: str = SMTP_PASSWORD
    ):
        """ Helper function to send EmailMessage via SMTP. """

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as email_server:
            email_server.login(SMTP_USER, SMTP_PASSWORD)
            email_server.send_message(email)

    @classmethod
    def get_email_template(
        cls,
        subject: str,
        to_email: EmailStr,
        content: str
    ) -> EmailMessage:
        """ Returns an EmailMessage ready to be sent. """
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
        cls._smtp_helper(email)


class EmailVerification(EmailInterface):

    url = VERIFY_URL
    subject = "Email verification"

    @classmethod
    def send_email(cls, user: User, token: str) -> None:
        content = (
            "<div>"
            "<p>"
            f"Hello, {user.first_name}!"
            "<br>"
            "Please, click on the link below to verify your email "
            "if you're using UI (site): "
            "<br><br>"
            f"{cls.url}?{token}"
            "<br><br>"
            "If you're using the API make a POST request to "
            f"{cls.url} in json format with data:"
            "<br><br>"
            f'"token": "{token}"'
            "</p>"
            "</div>"
        )

        email = cls.get_email_template(
            subject=cls.subject,
            to_email=user.email,
            content=content
        )

        cls._smtp_helper(email)


class EmailResetPassword(EmailInterface):

    url = PASSWORD_RESET_URL
    subject = "Password reset"

    @classmethod
    def send_email(cls, user: User, token: str) -> None:
        content = (
            "<div>"
            "<p>"
            f"Hello, {user.first_name}!"
            "<br>"
            "You're receiving this email because you/someone else "
            "requested a password reset for your user account at "
            "BugTracker API."
            "<br><br>"
            "Please go to this page and enter a new password:"
            "<br><br>"
            f"{cls.url}?{token}"
            "<br><br>"
            "If you're using the API make a POST request to "
            f"{cls.url} in json format with data:"
            "<br><br>"
            f'"token": "{token}",'
            "<br>"
            f'"password": "YOUR NEW PASSWORD"'
            "</p>"
            "</div>"
        )

        email = cls.get_email_template(
            subject=cls.subject,
            to_email=user.email,
            content=content
            )
        cls._smtp_helper(email)
