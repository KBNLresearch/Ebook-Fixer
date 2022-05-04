FROM python:3.10-alpine

ENV PYTHONUNBUFFERED 1

WORKDIR /app

ADD test-books/ ./test-books/

COPY requirements.txt ./

RUN pip install -r requirements.txt && \
    apk add --no-cache bash

COPY . ./

EXPOSE 8000