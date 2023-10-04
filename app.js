const express =  require('express');
const app = express();
const sequelize = require('./models/index');
const User = require('./models/user');
const Assignment = require('./models/assignments');
const userCreation = require('./database/UserCreation');

const router = require('./database/AssignmentCreation');



app.use(express.json())


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


sequelize.sync({alter : true}).then(() =>{
    userCreation()
  }) 

  User.hasMany(Assignment, {

    foreignKey: 'user_id',
  
  });
  
  Assignment.belongsTo(User, {
  
    foreignKey: 'user_id',
  
  });
  
app.use('/assignments',router);



  

