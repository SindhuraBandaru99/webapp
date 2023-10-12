const Sequelize  = require('sequelize');
const dbconfig = require('../config/db-config');
const UserModel = require("./user");
const AssignmentModel = require("./assignments");
//const Sequelize = require('sequelize');
const mysql = require('mysql2/promise')


const sequelize = new Sequelize(dbconfig.DATABASE, dbconfig.USER, dbconfig.PASSWORD, {
    host : dbconfig.HOST,
    dialect : dbconfig.DIALECT 
});

const User = UserModel(sequelize);
const Assignment = AssignmentModel(sequelize);

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
    console.log("Models synchronized successfully.");
  };

  const createDatabase = async () => {
    const connection = await mysql.createConnection({
      host: dbconfig.HOST,
      user: dbconfig.USER,
      password: dbconfig.PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbconfig.DATABASE}\`;`);
  };

module.exports = {
    sequelize,
    createDatabase,
    syncDatabase,
    User,
    Assignment,
  };