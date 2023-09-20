# CDDO Digital Marketplace

The purpose of this service is to make sharing of data across UK Government, and access to it, easier and more consistent.

This application is built using Express.js and Typescript.

This repository hosts the frontend UI, using the gov design system. It's primary responsibility is to provide the functionality for Find, Request and Manage share requests and Learn.

**Find** allows you to search and filter for data records and view the initial data information.

**Request and Manage Shares** allows users to ask for access to data and manage any requests for that data.

**Learn** is a set of guidance pages on how to use the Marketplace.

## Technology

This repository allows the user to interact with data, the data is surfaced in a different [api repository](https://github.com/co-cddo/data-marketplace-api). It consumes the data via various API's provided by the api repo.

The data consumed via API is:

- Data and datasets for suppliers - the data to be shared/requested.
- Users - Users local to this service, linked to SSO (see below)
- User permissions - ABAC user permissions
- Requests for data - Persisted requests for data. These are tied to a user and resumable.

You can see a high level solution [here](./docs/high-level-w.jpg)

### SSO

The project uses "Single Sign-On - UK Government Security" for authentication. The parameters can be grabbed from AWS parameter store if required locally. If you dont need to SSO locally, just put dummy strings into the ENV variables.

Authorisation is handled in the api repo and allows for users and granular control over access.

### Request templates

In `/requests` is a requests.http.template file which can be renamed to requests.http and used with the REST Client VSCode extension to test some of the new API endpoints. The ops-api-key, jwt and user variables need to be set to real values.

### Testing & linting

Tests are written using **Jest** and can be run using `npm run test`.

We use **Eslint** to enforce consistent code styles `npm run lint`

## Local development

While you can run this repo using local node, its recommended to use Docker & Docker compose to ensure you are running the same environment as production and the docker containers will be correctly networked.

To get started:

You will also need to run the [api repository](https://github.com/co-cddo/data-marketplace-api) locally.

To use docker:

- Run the backend following its README. It will be available on `API_ENDPOINT=http://api:8000`
- In the project root folder, create a .env file and copy the contents of the .env.example file. Replace the API_ENDPOINT variable values with a link to the live API endpoint.
- Run `docker-compose up`

Using local node:

- Run `npm install`
- Run `npm run start:dev`

## Deployment

The project currently uses Github actions to run tests and linting. The hosting is on AWS using containers, and this build is in progress.
The aim is to automate code delivery into the AWS environment.

For the time being there is a manual step to deploy:

- update package.json version number
- message Soydaner with new version number
