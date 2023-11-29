const Sequelize = require('sequelize')
const sequelize = require('./index')

const model = (sequelize) => {
const Submission = sequelize.define ('submission', {
    id : {
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        allowNull : false,
        primaryKey : true,
        readonly : true,
    },
    submission_url : {
        type : Sequelize.STRING,
        allowNull : false,
        
    },
    submission_date	 : {
        type : Sequelize.DATE,
        readonly : true,

    },
    submission_updated : {
        type : Sequelize.DATE,
        readonly : true,

    },
}, 
{
    createdAt : 'submission_date',
    updatedAt : 'submission_updated'
 }
);
return Submission;
}

module.exports = model
