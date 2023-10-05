const express =  require('express');
const app = express();
const mysql = require('mysql2')
const sequelize = require('./models/index');
const User = require('./models/user');
const Assignment = require('./models/assignments');
const userCreation = require('./database/UserCreation');

const router = require('./database/AssignmentCreation');
const healthRouter = require('./database/DatabaseConnection');



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


sequelize.sync({alter: true}).then(()=> {

  userCreation() 

})

  User.hasMany(Assignment, {
    foreignKey: 'user_id',
  });
  
  Assignment.belongsTo(User, {
    foreignKey: 'user_id',
  });
  
app.use('/assignments',router);

//app.use('/healthz',healthRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


module.exports = app


  

