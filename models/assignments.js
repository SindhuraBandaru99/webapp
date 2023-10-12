const Sequelize = require('sequelize')
const sequelize = require('./index')

const model = (sequelize) => {
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
    assignment_created : {
        type : Sequelize.DATE,
        readonly : true,

    },assignment_updated : {
        type : Sequelize.DATE,
        readonly : true,

    },
}, 
{
   createdAt : 'assignment_created',
   updatedAt : 'assignment_updated'
});
return Assignment;
}

module.exports = model
