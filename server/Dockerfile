
FROM python:3
ENV PYTHONUNBUFFERED 1
WORKDIR /app/api
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . ./
RUN echo "hello world"
EXPOSE 8000