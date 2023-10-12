const express =  require('express');
const app = express();
const mysql = require('mysql2/promise')
const{sequelize,createDatabase,syncDatabase,User,Assignment} = require("./models/index")
const userCreation = require('./database/UserCreation');

const router = require('./database/AssignmentCreation');
const healthRouter = require('./database/DatabaseConnection');

(async () => {
  try {
    await createDatabase();
    await sequelize.sync({ alter: true });
    await userCreation();

    app.listen(3000, () => {
      console.log("Server running on port", 3000);
    });
  } catch (error) {
    console.error("Error:", error);
  }
})();

app.use(express.json())

app.get('/healthz', async (req, res) => {

  try {

      res.set('Cache-Control', 'no-cache');
      if(Object.keys(req.body).length > 0) {
          res.status(400).send();
      }
      if(Object.keys(req.query).length > 0) {
          res.status(400).send()
      }
      else {
          await sequelize.authenticate()
          res.status(200).send()
      }
    } catch (error) {
          res.status(503).send()
    }

});

app.all('/healthz', (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).send();
    console.log("Method Not Allowed");
  }
})


  User.hasMany(Assignment, {
    foreignKey: 'user_id',
  });
  
  Assignment.belongsTo(User, {
    foreignKey: 'user_id',
  });
  
app.use('/v1/assignments',router);

module.exports = app


  

