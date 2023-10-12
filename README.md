# webapp

## Prerequisites softwares and libraries
- MySQL DB
- NodeJS (Version 20.7.0)
- Sequelize (3rd party package for ORM in Node)
- bcryptjs
- express
- mocha
- sequelize
- supertest
## Steps to deploy it locally.
- clone fork repo:  `git clone git@github.com:SindhuraBandaru99/webapp.git`

- run  `npm install` to install packages

- Once  node_modules is installed. create a .env file and add db details and port details.
-   `DB_HOSTNAME = localhost`
-   `DB_PASSWORD = Vani@1972`
-   `DB_USER = root`
-   `DB_NAME = cloudAssignment`
-   `DB_DIALECT = mysql`
-   `APP_PORT = 3000`
-    Before running a application make sure there are node module
-  we can run the server by  `npm start`

## Application Testing
run `npm test` : this runs test on integration-test.js

