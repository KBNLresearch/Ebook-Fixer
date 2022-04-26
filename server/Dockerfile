
FROM python:3.10-alpine

ENV PYTHONUNBUFFERED 1

WORKDIR /app/api

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . ./

EXPOSE 8000