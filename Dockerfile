# Base stage
FROM node:18-alpine as base

USER node

WORKDIR /usr/src/app

COPY package.json ./

#install dependencies
RUN npm install

COPY . .

USER root
RUN chown -R node:node /usr/src/app
USER node

#compile sass
RUN npm run scss:build

# hosted stage
FROM node:18-alpine as hosted

USER node

WORKDIR /usr/src/app

# Copy the built application from the 'base' stage
COPY --from=base --chown=node:node /usr/src/app .

# Specify the command to run your application
CMD ["npm", "run", "start:hosted"]