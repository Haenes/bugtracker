import smtplib
from typing import Literal
from email.message import EmailMessage

from pydantic import EmailStr

from auth.models import User
from config import (
    SMTP_HOST, SMTP_PORT,
    SMTP_USER, SMTP_PASSWORD,
    VERIFY_URL_BACKEND, VERIFY_URL_FRONTEND,
    PASSWORD_RESET_URL_BACKEND, PASSWORD_RESET_URL_FRONTEND
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

    @staticmethod
    def _validate_params(params) -> tuple[
        Literal["api"] | Literal["browser"],
        Literal["en"] | Literal["ru"]
    ]:
        """ Helper function to validate query params. """

        client = "api"
        lang = "en"

        try:
            client = params["client"]
        except KeyError:
            pass

        try:
            lang = params["lang"]
        except KeyError:
            pass

        return client, lang

    @staticmethod
    def _email_subject_helper(intent, language) -> str:
        """
        Helper function that return
        correct subject in correct language.
        """

        if intent == "verify":
            if language == "en":
                subject = "Email verification"
            else:
                subject = "Подтверждение почты"

        elif intent == "reset":
            if language == "en":
                subject = "Password reset"
            else:
                subject = "Сброс пароля"

        return subject

    @staticmethod
    def _email_content_helper(intent, user, token, params) -> str:
        """
        Helper function that return
        correct content in correct language.
        """

        client, lang = params

        if intent == "reset":

            if client == "browser":
                if lang == "en":
                    content = (
                        "<div>"
                        "<p>"
                        f"Hello, {user.first_name}!"
                        "<br>"
                        "You're receiving this email because you or someone else "
                        "requested a password reset for your user account at "
                        "BugTracker."
                        "<br><br>"
                        "Please go to this page and enter a new password:"
                        "<br><br>"
                        f"{PASSWORD_RESET_URL_FRONTEND}/{token}"
                        "</p>"
                        "</div>"
                    )
                else:
                    content = (
                        "<div>"
                        "<p>"
                        f"Привет, {user.first_name}!"
                        "<br>"
                        "Вы получили это письмо потому, что вы или кто-то ещё "
                        "запросили восстановление пароля от аккаунта в приложении "
                        "BugTracker."
                        "<br><br>"
                        "Пожалуйста, перейдите по этой ссылке и введите новый пароль:"
                        "<br><br>"
                        f"{PASSWORD_RESET_URL_FRONTEND}/{token}"
                        "</p>"
                        "</div>"
                    )
            else:
                content = (
                    "<div>"
                    "<p>"
                    f"Hello, {user.first_name}!"
                    "<br>"
                    "You're receiving this email because you or someone else "
                    "requested a password reset for your user account at "
                    "BugTracker."
                    "<br><br>"
                    "Make a POST request to "
                    f"{PASSWORD_RESET_URL_BACKEND} in json format with data:"
                    "<br><br>"
                    f'"token": "{token}",'
                    "<br>"
                    f'"password": "YOUR NEW PASSWORD"'
                    "</p>"
                    "</div>"
                )

        elif intent == "verify":

            if client == "browser":
                if lang == "en":
                    content = (
                        "<div>"
                        "<p>"
                        f"Hello, {user.first_name}!"
                        "<br>"
                        "Please, click on the link below to verify your email: "
                        "<br><br>"
                        f"{VERIFY_URL_FRONTEND}/{token}"
                        "</p>"
                        "</div>"
                    )
                else:
                    content = (
                        "<div>"
                        "<p>"
                        f"Привет, {user.first_name}!"
                        "<br>"
                        "Пожалуйста, перейдите по ссылке ниже, чтобы "
                        "подтвердить вашу почту: "
                        "<br><br>"
                        f"{VERIFY_URL_FRONTEND}/{token}"
                        "</p>"
                        "</div>"
                    )
            else:
                content = (
                    "<div>"
                    "<p>"
                    f"Hello, {user.first_name}!"
                    "<br>"
                    "Please, make a POST request to verify your email to: "
                    f"{VERIFY_URL_BACKEND} in json format with data:"
                    "<br><br>"
                    f'"token": "{token}"'
                    "</p>"
                    "</div>"
                )

        return content

    @classmethod
    def get_email_subject_content(cls, intent, user, token, params):
        client, language = cls._validate_params(params)

        subject = cls._email_subject_helper(intent, language)
        content = cls._email_content_helper(intent, user, token, [client, language])

        return subject, content

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

    @classmethod
    def send_email(cls, user: User, token: str, params: dict) -> None:
        subject, content = cls.get_email_subject_content("verify", user, token, params)

        email = cls.get_email_template(
            subject=subject,
            to_email=user.email,
            content=content
        )

        cls._smtp_helper(email)


class EmailResetPassword(EmailInterface):

    @classmethod
    def send_email(cls, user: User, token: str, params: dict) -> None:
        subject, content = cls.get_email_subject_content("reset", user, token, params)

        email = cls.get_email_template(
            subject=subject,
            to_email=user.email,
            content=content
            )
        cls._smtp_helper(email)
