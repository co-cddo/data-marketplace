# Base stage
FROM node:18 as base

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .


