const Sequelize = require('sequelize')
const sequelize = require('./index')

const Assignment = sequelize.define ('assignment', {
    assign_id : {
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull : false,
        primaryKey : true
    },
    name : {
        type : Sequelize.STRING,
        allowNull : false,
        
    },
    points : {
       type:  Sequelize.INTEGER,
       allowNull : false,
       validate : {
        min : 1,
        max: 100,
       },
    },
    num_of_attempts : {
        type:  Sequelize.INTEGER,
        allowNull : false,
        validate : {
         min : 1,
         max: 10,
        },
     },
     deadline : {
        type : Sequelize.STRING,
        allowNull : false,
        
    },
    assignment_created : Sequelize.DATE,
    assignment_updated : Sequelize.DATE,
}, 
{
   createdAt : 'assignment_created',
   updatedAt : 'assignment_updated'
})


module.exports = Assignment
