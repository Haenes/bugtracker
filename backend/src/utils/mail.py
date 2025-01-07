import smtplib
from typing import Literal
from email.message import EmailMessage

from pydantic import EmailStr
from starlette.datastructures import QueryParams

from auth.models import User
from config import (
    SMTP_HOST, SMTP_PORT,
    SMTP_USER, SMTP_PASSWORD,
)


class EmailInterface():

    @staticmethod
    def _smtp_server(email: EmailMessage):
        """ Set up SMTP server and send email. """

        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as email_server:
            email_server.login(SMTP_USER, SMTP_PASSWORD)
            email_server.send_message(email)

    @staticmethod
    def _validate_params_or_default(params: QueryParams) -> tuple[
        Literal["api"] | Literal["browser"],
        Literal["en"] | Literal["ru"]
    ]:
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
    def _get_email_subject(language: str) -> str: ...

    @staticmethod
    def _get_email_content(
        user: User,
        token: str,
        client: str,
        language: str
    ) -> str: ...

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
        user: User,
        token: str,
        params: QueryParams
    ) -> None:
        client, language = cls._validate_params_or_default(params)
        subject = cls._get_email_subject(language)
        content = cls._get_email_content(user, token, client, language)

        email = cls.get_email_template(
            subject=subject,
            to_email=user.email,
            content=content
        )
        cls._smtp_server(email)


class EmailVerification(EmailInterface):

    @classmethod
    def _get_email_subject(language: str) -> str:
        if language == "en":
            subject = "Email verification"
        else:
            subject = "Подтверждение почты"

        return subject

    @staticmethod
    def _get_email_content(
        user: User,
        token: str,
        client: str,
        language: str
    ) -> str:
        from .mail_contents import VERIFY_API, VERIFY_BROWSER_EN, VERIFY_BROWSER_RU

        if language == "en":
            if client == "api":
                return VERIFY_API.format(name=user.first_name, token=token)
            return VERIFY_BROWSER_EN.format(name=user.first_name, token=token)
        return VERIFY_BROWSER_RU.format(name=user.first_name, token=token)


class EmailResetPassword(EmailInterface):

    @staticmethod
    def _get_email_subject(language: str) -> str:
        if language == "en":
            subject = "Password reset"
        else:
            subject = "Сброс пароля"

        return subject

    @staticmethod
    def _get_email_content(
        user: User,
        token: str,
        client: str,
        language: str
    ) -> str:
        from .mail_contents import RESET_API, RESET_BROWSER_EN, RESET_BROWSER_RU

        if language == "en":
            if client == "api":
                return RESET_API.format(name=user.first_name, token=token)
            return RESET_BROWSER_EN.format(name=user.first_name, token=token)
        return RESET_BROWSER_RU.format(name=user.first_name, token=token)
