const express = require('express');
const healthRouter = express.Router();
const sequelize = require('../models/index')


  healthRouter.get('/', async(req, res) => {
    if (Object.keys(req.body).length > 0) {
        return res.status(400).send();
      } 
    else if (Object.keys(req.query).length > 0){
        return res.status(400).send();
      }
      res.setHeader('cache-control', 'no-cache');
    try{
        await sequelize.authenticate()
        return res.status(200).send()
    }
    catch(err){
        console.log("Unable to connect to MySQL", err)
        return res.status(503).send()
    }   
    
  });

  healthRouter.all('/', async(req, res) => {
    return res.status(405).send();
  });

module.exports = healthRouter;