# Base stage
FROM node:18-alpine as base

WORKDIR /docker-src

COPY . .

# Install dependencies
RUN npm install

ENV NODE_ENV=development

# RUN npm run build

CMD ["npm", "run", "start:dev"]
