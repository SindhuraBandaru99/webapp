const express = require('express');
const router = express.Router();
const {Assignment} = require('../models/index');
const {User} = require('../models/index');
const {authenticate,getBasicAuthCredentials} = require('../auth')

 

router.post('/', authenticate, async (req, res) => {
    const credentials = getBasicAuthCredentials(req)
    const email = credentials.name
    const user = await User.findOne({ where: { email } });
    const userid = user.user_id
    if(credentials == null){
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
        return res.status(400).json({ message: 'Invalid request body' });
      }
      if(!Number.isInteger(num_of_attempts) || !Number.isInteger(points) ){
        return res.status(400).json({message: 'Number of attempts and points should be integer'})
    }
      if (assignment_created || assignment_updated) {
        return res.status(403).json({ error: 'You donot have permissions to provide assignment created or updated' });
      }
      const assignment = await Assignment.create({
        name,
        points,
        num_of_attempts,
        deadline,
        user_id : userid,
    }).then((assignment) => {
        return res.status(201).json(assignment);
      })
      .catch((error) => {
        return res.status(400).json({ message: "Validation error for points and attempts" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/:assign_id', authenticate, async (req, res) => {
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
          return res.status(404).json({ error: 'Assignment not found' });
        }
        else if (assignment.user_id !== userid) {
            return res.status(403).json({ error: 'Unauthorized - You do not have permission to update this assignment' });
        }
        // Update assignment attributes
        if (!name || !points || !num_of_attempts || !deadline) {
          return res.status(400).json({ message: 'Invalid request body' });
        }
        if(!Number.isInteger(num_of_attempts) ||!Number.isInteger(points) ){
        return res.status(400).json({message: 'Number of attempts and Points should be integer'})
    }
        if (assignment_created || assignment_updated) {
          return res.status(403).json({ error: 'You donot have permissions to update assignment created or updated' });
        }

          assignment.name = name;
          assignment.points = points;
          assignment.num_of_attempts = num_of_attempts;
          assignment.deadline = deadline;

        const updateAssignment = await assignment.save().then((assignment) => {
          return res.status(201).json(assignment);
        })
        .catch((error) => {
          return res.status(400).json({ message: "Validation error for points and attempts" });
        });
      } catch (error) {
        console.error('Error updating assignment:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    router.delete('/:assign_id', authenticate, async (req, res) => {
        const credentials = getBasicAuthCredentials(req)
        const email = credentials.name
        const user = await User.findOne({ where: { email } });
        const userid = user.user_id
        const assignment_id = req.params.assign_id
        //const { name, points, num_of_attempts, deadline } = req.body;
        try {
            // Check if the assignment exists and belongs to the specified user
            const assignment = await Assignment.findOne({
              where: {
                assign_id : assignment_id,
              },
            });
        
            if (!assignment) {
              return res.status(404).json({ error: 'Assignment not found' });
            }
            else if (assignment.user_id !== userid) {
                return res.status(403).json({ error: 'Unauthorized - You do not have permission to Delete this assignment' });
            }
        
            // Update assignment attributes
            await assignment.destroy();
            return res.status(204).send();
          } catch (error) {
            console.error('Error updating assignment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
        });

        router.get('/:assign_id', authenticate, async (req, res) => {
            try {
                // Retrieve all assignments from the database
                const assignment_id = req.params.assign_id
                const assignment = await Assignment.findOne({
                    where: {
                      assign_id : assignment_id,
                    }})
                    if (!assignment) {
                      return res.status(404).json({ error: 'Assignment not found' });
                    }
            
                return res.status(200).json(assignment);
              } catch (error) {
                console.error('Error retrieving assignments:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
        });

        router.get('/', authenticate, async (req, res) => {
            try {
                // Retrieve all assignments from the database
                const assignments = await Assignment.findAll();
            
                return res.status(200).json(assignments);
              } catch (error) {
                console.error('Error retrieving assignments:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
        });

        router.patch('/*', authenticate, async (req, res) => {
          return res.status(405).json({ error: 'Method Not Allowed' });
        });



    
  
module.exports = router;