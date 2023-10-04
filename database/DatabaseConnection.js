const express = require('express');
const healthRouter = express.Router();
const sequelize = require('../models/index')


function successMessage(req, res) {
    console.log('Connected to the database successfully');
    //Sends the 200 status code
    res.status(200);
    res.end()
  }

  function errorMessage(err, res) {
    console.error('Error connecting to the database:', err);
    //Sends the 503 status code 
    res.status(503);
    res.end()
  }
  
  healthRouter.get('/', async(req, res) => {
    if (Object.keys(req.body).length > 0) {
        return res.status(400).send();
      } 
      else if (Object.keys(req.query).length > 0){
        return res.status(400).send();
      }
      res.setHeader('cache-control', 'no-cache');
      sequelize.authenticate()
         .then(() => {
            //connection.release();
            successMessage(req, res);
            console.log('Connection has been established successfully.');
        })
        .catch((err) => {
            errorMessage(err, res);
            console.error('Unable to connect to the database:', err);
        });
  });

  healthRouter.all('/', async(req, res) => {
    return res.status(405).send();
  });

module.exports = healthRouter;