#!/bin/sh

echo "----------- Run migrations -----------"
alembic upgrade head

cd src

echo "----------- Run api -----------"

if test $ENV = "DEV"
then
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload --use-colors
else
    uvicorn main:app --host 0.0.0.0 --port 8000 --use-colors
fi
