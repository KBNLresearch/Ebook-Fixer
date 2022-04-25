FROM node:13.12.0-alpine
WORKDIR /client

COPY package.json package-lock.json ./
RUN npm install
RUN npm install react-scripts@3.4.1 -g
RUN echo "hello world"
COPY . ./
EXPOSE 3000