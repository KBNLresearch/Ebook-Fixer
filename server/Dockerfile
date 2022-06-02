FROM python:3.10-alpine3.14

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt ./

RUN apk add --no-cache --update \
    python3 python3-dev gcc \
    # gfortran musl-dev \
    g++ zlib-dev jpeg-dev

RUN pip install --upgrade pip setuptools && \
    pip install -r requirements.txt --quiet && \
    apk add --no-cache bash && \
    apk add git && \
    apk add make && \
    apk add --no-cache openjdk8-jre

RUN pip install "git+https://github.com/LIAAD/yake"

COPY . ./

EXPOSE 8000