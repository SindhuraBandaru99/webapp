const fs = require('fs');
const {User} = require('../models/index');
const csv = require('csv-parser');
const bcrypt = require('bcrypt');



const csvFilePath = '/opt/users.csv';

const checkEmail = async(emailId) => {
    const userEmail = await User.findOne({
      where: {email: emailId}
    })
    if(userEmail){
      return true
    }else{
      return false
    }
  }
  const userCreation = async () =>{
    
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (data) => {
        const userEmailExists = await checkEmail(data.email)
        if(userEmailExists){
          console.log('Data not inserted');
        }else{
          try {
            // Insert each row into the database using Sequelize
             User.create({
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              password: data.password,
            });
            console.log('Data inserted successfully');
          } catch (error) {
            console.error('Error inserting data:', error);
          }
        }
        
    })

  }

  module.exports = userCreation;
  
