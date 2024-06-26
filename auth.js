const basicAuth = require('basic-auth');
const {User} = require('./models/index');
const bcrypt = require('bcrypt');
const client = require('./metrics')

async function authenticate(req, res, next) {
  if(req.method == 'POST'){
    client.increment('post');
  }
  else if (req.method === 'GET') {
    if (req.originalUrl.startsWith('/v3/assignments/')) {
      const assignmentId = req.params.assign_id;
      if (assignmentId) {
        client.increment('getByID');
      } else {
        client.increment('getAll');
      }
    }
  }
  else if(req.method == 'PUT'){
    client.increment('put');
  }
  else if(req.method == 'DELETE'){
    client.increment('delete');
  }
  else if(req.method == 'PATCH') {
    client.increment('Patch');
  }
  const authorizationHeader = req.get('Authorization');
  if(!authorizationHeader){
      res.status(401).send('Unauthorized');
      return;
  }
    const credentials = basicAuth(req);
    console.log(credentials.name);
    console.log(credentials.pass);
    const email = credentials.name
    const password = credentials.pass
    try {
        // Query the database to find the user by username
        const user = await User.findOne({ where: { email } });
    
        if (!user) {
          return res.status(401).send('User Not Found');
        }
    
        // Compare the provided password with the hashed password from the database
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (passwordMatch) {
          // Passwords match, grant access to the secure route
          next()
          //return res.status(201).send('Authorized User');
         // res.send('You have access to this secured route.');
        } else {
          // Passwords do not match, deny access
          res.status(401).send('Unauthorized');
          //res.send('Unauthorized');
        }
      } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
      }
    
    };
    
    const getBasicAuthCredentials = (req) => {
            const credentials = basicAuth(req);
            return  credentials
      };

module.exports = {
    authenticate,
    getBasicAuthCredentials
};
