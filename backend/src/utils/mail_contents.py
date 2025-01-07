from config import (
    VERIFY_URL_BACKEND,
    VERIFY_URL_FRONTEND,
    PASSWORD_RESET_URL_BACKEND,
    PASSWORD_RESET_URL_FRONTEND
)


RESET_BROWSER_EN = (
    "<div>"
    "<p>"
    "Hello, {name}!"
    "<br>"
    "You're receiving this email because you or someone else "
    "requested a password reset for your user account at "
    "BugTracker."
    "<br><br>"
    "Please go to this page and enter a new password:"
    "<br><br>"
    f"{PASSWORD_RESET_URL_FRONTEND}"
    "/{token}"
    "</p>"
    "</div>"
)

RESET_BROWSER_RU = (
    "<div>"
    "<p>"
    "Привет, {name}!"
    "<br>"
    "Вы получили это письмо потому, что вы или кто-то ещё "
    "запросили восстановление пароля от аккаунта в приложении "
    "BugTracker."
    "<br><br>"
    "Пожалуйста, перейдите по этой ссылке и введите новый пароль:"
    "<br><br>"
    f"{PASSWORD_RESET_URL_FRONTEND}"
    "/{token}"
    "</p>"
    "</div>"
)

RESET_API = (
    "<div>"
    "<p>"
    "Hello, {name}!"
    "<br>"
    "You're receiving this email because you or someone else "
    "requested a password reset for your user account at "
    "BugTracker."
    "<br><br>"
    "Make a POST request to "
    f"{PASSWORD_RESET_URL_BACKEND} in json format with data:"
    "<br><br>"
    '"token": "{token}",'
    "<br>"
    '"password": "YOUR NEW PASSWORD"'
    "</p>"
    "</div>"
)

VERIFY_BROWSER_EN = (
    "<div>"
    "<p>"
    "Hello, {name}!"
    "<br>"
    "Please, click on the link below to verify your email: "
    "<br><br>"
    f"{VERIFY_URL_FRONTEND}"
    "/{token}"
    "</p>"
    "</div>"
)

VERIFY_BROWSER_RU = (
    "<div>"
    "<p>"
    "Привет, {name}!"
    "<br>"
    "Пожалуйста, перейдите по ссылке ниже, чтобы "
    "подтвердить вашу почту: "
    "<br><br>"
    f"{VERIFY_URL_FRONTEND}"
    "/{token}"
    "</p>"
    "</div>"
)

VERIFY_API = (
    "<div>"
    "<p>"
    "Hello, {name}!"
    "<br>"
    "Please, make a POST request to verify your email to: "
    f"{VERIFY_URL_BACKEND} in json format with data:"
    "<br><br>"
    '"token": "{token}"'
    "</p>"
    "</div>"
)
