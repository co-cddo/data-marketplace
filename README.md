# CDDO Digital Marketplace

This application is built using Express.js and Typescript.

## Local development

Local development requires Docker & Docker compose.

To get started:

- In the project root folder, create a .env file and copy the contents of the .env.example file. Replace the API_ENDPOINT variable value with a link to the live API endpoint.
- Run `npm install`
- Run `npm run start:dev`

To use dcoker:

- Run `docker-compose up`

## SSO

The project uses single sign on for authentication. The parameters can be grabbed from AWS parameter store if required locally. If you dont need to SSO locally, just put dummy strings into the ENV variales.

### Request templates

In `/requests` is a requests.http.template file which can be renamed to requests.http and used with the REST Client VSCode extension to test some of the new API endpoints. The ops-api-key, jwt and user variables need to be set to real values.
