from fastapi import FastAPI

from auth.manager import (
    auth_router, auth_verify_router,
    register_router, users_router
    )
from projects.router import router as projects_router
from issues.router import router as issues_router

app = FastAPI()

app.include_router(projects_router)
app.include_router(issues_router)


app.include_router(
    router=auth_router,
    prefix="/auth/jwt",
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
