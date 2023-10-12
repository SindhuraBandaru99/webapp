const Sequelize = require('sequelize')
const sequelize = require('./index')
const bcrypt = require('bcrypt');

const model = (sequelize) => {
const User = sequelize.define ('user', {
    user_id : {
        type:Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false,
        primaryKey:true
    
      },
    first_name :{
      type: Sequelize.STRING,
      allowNull:false,
    } ,
    last_name :{
      type: Sequelize.STRING,
      allowNull:false,
    },
    email :{
      type: Sequelize.STRING,
      allowNull:false,
    },
    password :{
      type: Sequelize.STRING,
      allowNull:false,
      writeOnly : true
    },
    account_created : {
      type : Sequelize.DATE,
      readonly : true,

  },
  account_updated : {
      type : Sequelize.DATE,
      readonly : true,

  }
}, 
{
    createdAt : 'account_created',
    updatedAt : 'account_updated',
    freezeTableName : true
});

User.beforeCreate(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });
  return User
}

module.exports = model
