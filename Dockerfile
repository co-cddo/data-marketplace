# Base stage
FROM node:18-alpine as base

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
