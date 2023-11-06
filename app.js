const express =  require('express');
const app = express();
const mysql = require('mysql2/promise')
const{sequelize,createDatabase,syncDatabase,User,Assignment} = require("./models/index")
const userCreation = require('./database/UserCreation');

const router = require('./database/AssignmentCreation');
const healthRouter = require('./database/DatabaseConnection');
require('dotenv').config();
const logger = require('./logger');

(async () => {
  try {
    await createDatabase();
    await sequelize.sync({ alter: true });
    await userCreation();

    app.listen(process.env.PORT, () => {
      console.log("Server running on port", process.env.PORT);
      logger.info('Server running on port', process.env.PORT);
      
    });
  } catch (error) {
    logger.info('Error',error);
    console.error("Error:", error);
  }
})();

app.use(express.json())

app.get('/healthz', async (req, res) => {

  client.increment('healthz');
  try {

      res.set('Cache-Control', 'no-cache');
      if(Object.keys(req.body).length > 0) {
        logger.error('Bad Request: Request Body is present');
          res.status(400).send();
      }
      if(Object.keys(req.query).length > 0) {
        logger.error('Bad Request: Query Parameters are Present');
          res.status(400).send()
      }
      else {
          await sequelize.authenticate()
          logger.info('Database Connection Successfull');
          res.status(200).send()
      }
    } catch (error) {
      logger.error('Database Service Unavailable');
          res.status(503).send()
    }

});

app.all('/healthz', (req, res) => {
  client.increment('healthz');
  if (req.method !== 'GET') {
    res.status(405).send();
    console.log("Method Not Allowed");
  }
})


//app.use('/healthz',healthRouter);

  User.hasMany(Assignment, {
    foreignKey: 'user_id',
  });
  
  Assignment.belongsTo(User, {
    foreignKey: 'user_id',
  });
  
app.use('/v1/assignments',router);

module.exports = app


  

