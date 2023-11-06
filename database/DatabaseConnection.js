const express = require('express');
const healthRouter = express.Router();
const sequelize = require('../models/index')
const logger = require('../logger');
const client = require('../metrics');


  healthRouter.get('/', async(req, res) => {
    client.increment('healthz');
    if (Object.keys(req.body).length > 0) {
      logger.error('Bad Request: Request Body is present');
        return res.status(400).send();
      } 
    else if (Object.keys(req.query).length > 0){
      logger.error('Bad Request: Query Parameters are Present');
        return res.status(400).send();
      }
      res.setHeader('cache-control', 'no-cache');
    try{
        await sequelize.authenticate()
        logger.info('Database Connection Successfull');
        return res.status(200).send()
    }
    catch(err){
        console.log("Unable to connect to MySQL", err)
        logger.error('Database Service Unavailable');
        return res.status(503).send()
    }   
    
  });

  healthRouter.all('/', async(req, res) => {
    client.increment('healthz');
    logger.info('Method Not Allowed');
    return res.status(405).send();
  });

module.exports = healthRouter;