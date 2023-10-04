const Sequelize = require('sequelize')
const sequelize = require('./index')
const bcrypt = require('bcrypt');
// const usermodel = (sequelize, DataTypes) => {
//     //First argument is the name of the table, columns of the table , and the object that  can be used anywhere to modify the objct later on
//     const User = sequelize.define ('user', {
//         id: {
//             type: DataTypes.INTEGER,
//             primaryKey: true, 
//             autoIncrement: true, 
//           },
//         first_name : DataTypes.STRING,
//         last_name : DataTypes.STRING,
//         email : DataTypes.STRING,
//         password : DataTypes.STRING
//     }, 
//     {
//         freezeTableName : true
//     });

//     return User;
// };

// module.exports = usermodel

const User = sequelize.define ('user', {
    user_id : {
        type:Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull:false,
        primaryKey:true
    
      },
    first_name : Sequelize.STRING,
    last_name : Sequelize.STRING,
    email : Sequelize.STRING,
    password : Sequelize.STRING
}, 
{
     freezeTableName : true
});

User.beforeCreate(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });

//User.hasMany(Assignment, { as: 'assignments', foreignKey: 'userId' });

module.exports = User
