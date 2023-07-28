# Base stage
FROM node:18 as base

WORKDIR /usr/src/app

COPY package.json ./

#install dependencies
RUN npm install

COPY . .

#compile sass
RUN npm run scss:build

# hosted stage
FROM node:18 as hosted

WORKDIR /usr/src/app

# Copy the built application from the 'base' stage
COPY --from=base /usr/src/app .

# Specify the command to run your application
CMD ["npm", "run", "start:hosted"]