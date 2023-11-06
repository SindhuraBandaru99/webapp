const express = require('express');
const router = express.Router();
const {Assignment} = require('../models/index');
const { User } = require('../models/index');
const {authenticate,getBasicAuthCredentials} = require('../auth')
const logger = require('../logger');
const client = require('../metrics');

router.post('/', authenticate, async (req, res) => {
    client.increment('post');
    const credentials = getBasicAuthCredentials(req)
    const email = credentials.name
    const user = await User.findOne({ where: { email } });
    const userid = user.user_id
    if(credentials == null){
      logger.error('Authorization Headers are empty');
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
        logger.error('Invalid Request Body');
        return res.status(400).json({ message: 'Invalid request body' });
      }
      if(!Number.isInteger(num_of_attempts) || !Number.isInteger(points) ){
        logger.error('Type should be integer for Number of attempts and points');
        return res.status(400).json({message: 'Type should be integer for Number of attempts and points'})
    }
      if (assignment_created || assignment_updated) {
        logger.error('You donot have permissions to provide assignment created or updated');
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
    client.increment('put');
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
          logger.error('Bad Request : Assignment not found');
          return res.status(400).json({ error: 'Bad Request : Assignment not found' });
        }
        else if (assignment.user_id !== userid) {
            logger.error('Unauthorized - You do not have permission to update this assignment');
            return res.status(403).json({ error: 'Unauthorized - You do not have permission to update this assignment' });
        }
        // Update assignment attributes
        if (!name || !points || !num_of_attempts || !deadline) {
          logger.error('Invalid request body');
          return res.status(400).json({ message: 'Invalid request body' });
        }
        if(!Number.isInteger(num_of_attempts) ||!Number.isInteger(points) ){
          logger.error('Type should be integer for Number of attempts and points');
        return res.status(400).json({message: 'Type should be integer for Number of attempts and points'})
    }
        if (assignment_created || assignment_updated) {
          logger.error('You donot have permissions to update assignment created or updated');
          return res.status(403).json({ error: 'You donot have permissions to update assignment created or updated' });
        }

          assignment.name = name;
          assignment.points = points;
          assignment.num_of_attempts = num_of_attempts;
          assignment.deadline = deadline;

        const updateAssignment = await assignment.save().then((assignment) => {
          logger.error('Assignment Updated Successfully');
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
        client.increment('delete');
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
              logger.error('Bad Request: Assignment not found');
              return res.status(404).json({ error: 'Bad Request: Assignment not found' });
            }
            else if (assignment.user_id !== userid) {
              logger.error('Unauthorized - You do not have permission to Delete this assignment');
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
          client.increment('getByID');
            try {
                // Retrieve all assignments from the database
                const assignment_id = req.params.assign_id
                const assignment = await Assignment.findOne({
                    where: {
                      assign_id : assignment_id,
                    }})
                    if (!assignment) {
                      logger.error('Assignment not found');
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
          client.increment('getAll');
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
          client.increment('Patch');
          logger.info('Method Not Allowed');
          return res.status(405).json({ error: 'Method Not Allowed' });
        });



    
  
module.exports = router;