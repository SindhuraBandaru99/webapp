const express = require('express');
const router = express.Router();
const Assignment = require('../models/assignments');
const User = require('../models/user');
const {authenticate,getBasicAuthCredentials} = require('../auth')

 

router.post('/', authenticate, async (req, res) => {
    const credentials = getBasicAuthCredentials(req)
    const email = credentials.name
    const user = await User.findOne({ where: { email } });
    const userid = user.user_id
    try {
      const {
        name,
        points,
        num_of_attempts,
        deadline,
      } = req.body;
  
      const assignment = await Assignment.create({
        name,
        points,
        num_of_attempts,
        deadline,
        user_id : userid,
    }).then((assignment) => {
        return res.status(201).json({ assignment });
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
    const { name, points, num_of_attempts, deadline } = req.body;
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
            return res.status(401).json({ error: 'Unauthorized - You do not have permission to update this assignment' });
        }
        // Update assignment attributes
        assignment.name = name;
        assignment.points = points;
        assignment.num_of_attempts = num_of_attempts;
        assignment.deadline = deadline;
    
        await assignment.save().then();
    
        return res.status(200).json(assignment);
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
                return res.status(401).json({ error: 'Unauthorized - You do not have permission to update this assignment' });
            }
        
            // Update assignment attributes
            await assignment.destroy();
            return res.status(204).json(assignment);
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
    
  
module.exports = router;