# syntax=docker/dockerfile:1

FROM python:3.12-alpine

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /api

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

RUN addgroup nonroot && \
    adduser --disabled-password --ingroup nonroot user

USER user

COPY . .
