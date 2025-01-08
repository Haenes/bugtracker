from celery import Celery

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import REDIS_USER, REDIS_PASSWORD, CeleryConfig
from auth.manager import (
    jwt_auth_router, bearer_auth_router,
    auth_verify_router, register_router,
    users_router, reset_password_router
)
from projects.router import router as projects_router
from issues.router import router as issues_router
from search.router import router as search_router

app = FastAPI(
    title="BugTracker",
    contact={
        "name": "Kirill",
        "email": "Physeex@gmail.com"
    },
    license_info={
        "name": "MIT",
        "url": "https://github.com/Haenes/api/blob/main/LICENSE"
    }
)

origins = [
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

celery = Celery("tasks", broker=f"redis://{REDIS_USER}:{REDIS_PASSWORD}@redis")
celery.config_from_object(CeleryConfig)
celery.autodiscover_tasks()

app.include_router(projects_router)
app.include_router(issues_router)
app.include_router(search_router)


app.include_router(
    router=jwt_auth_router,
    prefix="/auth/jwt",
    tags=["auth"]
)

app.include_router(
    router=bearer_auth_router,
    prefix="/auth/bearer",
    tags=["auth"]
)

app.include_router(
    router=register_router,
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    router=users_router,
    prefix="/users",
    tags=["users"],
)

app.include_router(
    router=auth_verify_router,
    prefix="/auth",
    tags=["auth"]
)

app.include_router(
    router=reset_password_router,
    prefix="/auth",
    tags=["auth"]
)
