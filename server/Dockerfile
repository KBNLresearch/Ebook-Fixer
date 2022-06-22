FROM publysher/alpine-numpy:1.14.0-python3.6-alpine3.7

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./

RUN apk add --no-cache --update \
    bash git make openjdk8-jre && \
    pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

COPY . ./

EXPOSE 8000