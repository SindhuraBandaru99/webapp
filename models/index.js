const Sequelize  = require('sequelize');
const dbconfig = require('../config/db-config');
//const Sequelize = require('sequelize');


const sequelize = new Sequelize(dbconfig.DATABASE, dbconfig.USER, dbconfig.PASSWORD, {
    host : dbconfig.HOST,
    dialect : dbconfig.DIALECT 
});

// const db = {};
// db.sequelize = sequelize;

// db.models = {};
// //db.models.User = require('./user')(sequelize, Sequelize.DataTypes);
// db.models.User = require('./user')
module.exports = sequelize;