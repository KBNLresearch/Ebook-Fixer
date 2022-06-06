FROM python:3.10-alpine3.14

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./

RUN apk add --no-cache --update \
    gcc g++ bash git make openjdk8-jre && \
    pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

COPY . ./

EXPOSE 8000