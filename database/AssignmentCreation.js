const express = require('express');
const router = express.Router();
const {Assignment, Submission} = require('../models/index');
const { User } = require('../models/index');
const {authenticate,getBasicAuthCredentials} = require('../auth')
const logger = require('../logger');
const client = require('../metrics');
const AWS = require('aws-sdk');

// AWS.config.update({
//   accessKeyId: 'AKIAYAOPQVYPVHVCVJFS',
//   secretAccessKey: '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',
//   region: 'us-east-1',
// });
const sns = new AWS.SNS();


router.post('/', authenticate, async (req, res) => {
    // client.increment('post');
    const credentials = getBasicAuthCredentials(req)
    const email = credentials.name
    const user = await User.findOne({ where: { email } });
    const userid = user.user_id
    if(credentials == null){
      logger.info('Authorization Headers are empty');
      return res.status(401).json({ message: "Authorization Headers are empty" });
    }
    try {
      const {
        name,
        points,
        num_of_attempts,
        deadline,
        assignment_created,
        assignment_updated
      } = req.body;
      if (!name || !points || !num_of_attempts || !deadline) {
        logger.info('Invalid Request Body');
        return res.status(400).json({ message: 'Invalid request body' });
      }
      if(!Number.isInteger(num_of_attempts) || !Number.isInteger(points) ){
        logger.info('Type should be integer for Number of attempts and points');
        return res.status(400).json({message: 'Type should be integer for Number of attempts and points'})
    }
      if (assignment_created || assignment_updated) {
        logger.info('You donot have permissions to provide assignment created or updated');
        return res.status(403).json({ error: 'You donot have permissions to provide assignment created or updated' });
      }
      const assignment = await Assignment.create({
        name,
        points,
        num_of_attempts,
        deadline,
        user_id : userid,
    }).then((assignment) => {
      const output = { ...assignment.toJSON() };
      delete output.user_id;
      logger.info('Assignments Created Succesfully');
        return res.status(201).json(output);
      })
      .catch((error) => {
        logger.error('Validation error for points and attempts');
        return res.status(400).json({ message: "Validation error for points and attempts" });
      });
    } catch (error) {
      console.error(error);
      logger.fatal('Internal Server Error- Error Creating an Assignment', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/:assign_id', authenticate, async (req, res) => {
    // client.increment('put');
    const credentials = getBasicAuthCredentials(req)
    const email = credentials.name
    const user = await User.findOne({ where: { email } });
    const userid = user.user_id
    const assignment_id = req.params.assign_id
    const { name, points, num_of_attempts, deadline,assignment_created, assignment_updated} = req.body;
    try {
        // Check if the assignment exists and belongs to the specified user
        const assignment = await Assignment.findOne({
          where: {
            assign_id : assignment_id,
          },
        });

        
        if (!assignment) {
          logger.info('Bad Request : Assignment not found');
          return res.status(400).json({ error: 'Bad Request : Assignment not found' });
        }
        else if (assignment.user_id !== userid) {
            logger.info('Unauthorized - You do not have permission to update this assignment');
            return res.status(403).json({ error: 'Unauthorized - You do not have permission to update this assignment' });
        }
        // Update assignment attributes
        if (!name || !points || !num_of_attempts || !deadline) {
          logger.info('Invalid request body');
          return res.status(400).json({ message: 'Invalid request body' });
        }
        if(!Number.isInteger(num_of_attempts) ||!Number.isInteger(points) ){
          logger.info('Type should be integer for Number of attempts and points');
        return res.status(400).json({message: 'Type should be integer for Number of attempts and points'})
    }
        if (assignment_created || assignment_updated) {
          logger.info('You donot have permissions to update assignment created or updated');
          return res.status(403).json({ error: 'You donot have permissions to update assignment created or updated' });
        }

          assignment.name = name;
          assignment.points = points;
          assignment.num_of_attempts = num_of_attempts;
          assignment.deadline = deadline;

        const updateAssignment = await assignment.save().then((assignment) => {
          logger.info('Assignment Updated Successfully');
          return res.status(204).json(assignment);
        })
        .catch((error) => {
          logger.error('Validation error for points and attempts');
          return res.status(400).json({ message: "Validation error for points and attempts" });
        });
      } catch (error) {
        console.error('Error updating assignment:', error);
        logger.fatal('Internal Server Error - Error updating assignment:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    router.delete('/:assign_id', authenticate, async (req, res) => {
        // client.increment('delete');
        const credentials = getBasicAuthCredentials(req)
        const email = credentials.name
        const user = await User.findOne({ where: { email } });
        const userid = user.user_id
        const assignment_id = req.params.assign_id

        try {
            const assignment = await Assignment.findOne({
              where: {
                assign_id : assignment_id,
              },
            });
        
            if (!assignment) {
              logger.info('Bad Request: Assignment not found');
              return res.status(404).json({ error: 'Bad Request: Assignment not found' });
            }
            else if (assignment.user_id !== userid) {
              logger.info('Unauthorized - You do not have permission to Delete this assignment');
                return res.status(403).json({ error: 'Unauthorized - You do not have permission to Delete this assignment' });
            }
        
            // Update assignment attributes
            await assignment.destroy();
            logger.info('Assignment Deleted Successfully');
            return res.status(204).send();
          } catch (error) {
            console.error('Error Deleting assignment:', error);
            logger.fatal('Error Deleting assignment:Internal Server Error', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
        });

        router.get('/:assign_id', authenticate, async (req, res) => {
          // client.increment('getByID');
            try {
                // Retrieve all assignments from the database
                const assignment_id = req.params.assign_id
                const assignment = await Assignment.findOne({
                    where: {
                      assign_id : assignment_id,
                    }})
                    if (!assignment) {
                      logger.info('Assignment not found');
                      return res.status(404).json({ error: 'Assignment not found' });
                    }
                const output = { ...assignment.toJSON() };
                delete output.user_id;
                logger.info('Assignment Search Successfull');
                return res.status(200).json(output);
              } catch (error) {
                console.error('Error retrieving assignments:', error);
                logger.fatal('Error retrieving assignments:Internal Server Error', error);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
        });

        router.get('/', authenticate, async (req, res) => {
          // client.increment('getAll');
            try {
                // Retrieve all assignments from the database
                const assignments = await Assignment.findAll({
                  attributes:{
                    exclude: ['user_id']
                  }
                });
                logger.info('All Assignments Search Successfull');
                return res.status(200).json(assignments);
              } catch (error) {
                console.error('Error retrieving assignments:', error);
                logger.fatal('Error retrieving assignments:Internal Server Error', error);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
        });

        router.patch('/*', authenticate, async (req, res) => {
          // client.increment('Patch');
          logger.info('Method Not Allowed');
          return res.status(405).json({ error: 'Method Not Allowed' });
        });

        router.post('/:assign_id/submission', authenticate, async (req, res) => {
          const credentials = getBasicAuthCredentials(req)
          const email = credentials.name
          const user = await User.findOne({ where: { email } });
          const emailID = user.email
          const assignment_id = req.params.assign_id
          const assignment = await Assignment.findByPk(assignment_id);
          try{
            const submissionCount = await Submission.count({
              where: {
                assign_id: assignment_id,
              },
            });
            const retries_remaining = assignment.num_of_attempts - submissionCount;
            console.log(submissionCount);
          if(credentials == null){
            logger.info('Authorization Headers are empty');
            return res.status(401).json({ message: "Authorization Headers are empty" });
          }
          try {
            const {
              submission_url,
              submission_date,
              submission_updated
            } = req.body;
            if (!submission_url) {
              logger.info('Invalid Request Body');
              return res.status(400).json({ message: 'Invalid request body' });
            }
            if(retries_remaining == 0){
              logger.info('Number of attempts Exceeded');
              return res.status(400).json({ error: 'Bad Request: Number of attempts Exceeded' });
            }
            if (!assignment) {
              logger.info('Bad Request: Assignment not found');
              return res.status(404).json({ error: 'Bad Request: Assignment not found' });
            }
            const currentDate = new Date();
            const formattedDateTime = currentDate.toISOString();
            if (formattedDateTime > assignment.deadline) {
              return res.status(400).json({ error: 'Submission deadline has passed.' });
            }
            if (submission_date || submission_updated) {
              logger.info('You donot have permissions to provide submission created or updated');
              return res.status(403).json({ error: 'You donot have permissions to provide submission created or updated' });
            }
            const submission = await Submission.create({
              submission_url,
              assign_id : assignment_id,
          }).then((submission) => {
            logger.info('Submission Accepted');
            const params = {
              Message: JSON.stringify({
                submission_url,
                emailID,
              }),
              TopicArn: process.env.TOPIC_ARN,
            };
            try{
              sns.publish(params, (err, data) => {
                console.log("Entered block")
                if (err) {
                  console.error('Error publishing to SNS:', err);
                  return res.status(500).json({ error: 'Internal Server Error' });
                } else {
                  console.log('Message published to SNS:', data);
                  //return res.status(200).json({ message: 'URL posted to SNS successfully' });
                }
              });
            }catch(error){
              console.error(error);
            }
            return res.status(201).end();
            })
          } catch (error) {
            console.error(error);
            logger.fatal('Internal Server Error- Error Creating an Assignment', error);
            return res.status(500).json({ error: 'Internal server error' });
          }
        }catch(error){
          console.log("Error retrieving submission count");
        }
        });
      

    
  
module.exports = router;