from src.config import settings


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
    f"{settings.PASSWORD_RESET_URL_FRONTEND}"
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
    f"{settings.PASSWORD_RESET_URL_FRONTEND}"
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
    f"{settings.PASSWORD_RESET_URL_BACKEND} in json format with data:"
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
    f"{settings.VERIFY_URL_FRONTEND}"
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
    f"{settings.VERIFY_URL_FRONTEND}"
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
    f"{settings.VERIFY_URL_BACKEND} in json format with data:"
    "<br><br>"
    '"token": "{token}"'
    "</p>"
    "</div>"
)

PROJECT_INVITE_BROWSER_EN = (
    "<div>"
    "<p>"
    "Hello, {name}!"
    "<br>"
    "You're receiving this email because you have been invited to join the project."
    "<br><br>"
    "Please go to this page if you want to join:"
    "<br><br>"
    f"{settings.PROJECT_INVITE_URL_FRONTEND}""/{token}"
    "<br><br>"
    "Otherwise, ignore this email."
    "</p>"
    "</div>"
)

PROJECT_INVITE_BROWSER_RU = (
    "<div>"
    "<p>"
    "Привет, {name}!"
    "<br>"
    "Вы получили это письмо потому, что вы были приглашены присоединиться к проекту."
    "<br><br>"
    "Пожалуйста, перейдите по этой ссылке, если вы хотите присоединиться:"
    "<br><br>"
    f"{settings.PROJECT_INVITE_URL_FRONTEND}""/{token}"
    "<br><br>"
    "Иначе проигнорируйте это письмо."
    "</p>"
    "</div>"
)

PROJECT_INVITE_API = (
    "<div>"
    "<p>"
    "Hello, {name}!"
    "<br>"
    "You're receiving this email because you have been invited to join the project."
    "<br><br>"
    "Make a POST request to "
    f"{settings.PROJECT_INVITE_URL_BACKEND} if you want to join "
    "in json format with data:"
    "<br><br>"
    '"token": "{token}"'
    "<br><br>"
    "Otherwise, ignore this email."
    "</p>"
    "</div>"
)
