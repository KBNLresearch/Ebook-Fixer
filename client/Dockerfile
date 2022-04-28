FROM node:12.22-alpine3.14

WORKDIR /client

COPY package.json package-lock.json ./
RUN npm install --silent && \
    npm install react-scripts@5.0.0 -g

COPY . ./

EXPOSE 3000