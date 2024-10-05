from importlib import import_module

from celery import shared_task


@shared_task
def celery_send_email(func: str, *func_args, **func_kwargs):
    try:
        email_module = import_module(".mail", "utils")
        email_class = getattr(email_module, func)
    except AttributeError:
        raise
    else:
        email_class.send_email(*func_args, **func_kwargs)
