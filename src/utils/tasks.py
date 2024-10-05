from celery import shared_task

from .mail import EmailVerification
from auth.models import User


@shared_task
def celery_send_email(user: User, token: str):
    EmailVerification.send_email(user=user, token=token)
