FROM python:3.10.4-alpine3.15

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt && \
    apk add --no-cache bash && \
    apk add git

COPY . ./

EXPOSE 8000