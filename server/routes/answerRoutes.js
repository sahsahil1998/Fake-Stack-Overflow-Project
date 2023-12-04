const express = require('express');
const router = express.Router();
const Answer = require('../models/answers');
const Question = require('../models/questions'); // Ensure you import the Question model

// GET all answers with populated user details
router.get('/', async (req, res) => {
    try {
        const answers = await Answer.find().populate('ans_by', 'username');
        res.json(answers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new answer
router.post('/', async (req, res) => {
    try {
        const { questionId, text, ans_by } = req.body;

        // Validate required fields
        if (!questionId || !text || !ans_by) {
            return res.status(400).json({ message: 'Please provide questionId, text, and ans_by for the answer.' });
        }

        const newAnswer = new Answer({
            question: questionId,
            text,
            ans_by,
            ans_date_time: new Date()
        });

        const savedAnswer = await newAnswer.save();

        // Update last_answered_time in the corresponding question
        await Question.findByIdAndUpdate(questionId, { last_answered_time: new Date() });

        res.status(201).json(savedAnswer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/:aid/:voteType', async (req, res) => {
    try {
       ;
        const { aid, voteType } = req.params; 
        const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
     

        // Use Mongoose to update the answer document in the database
        const updatedAnswer = await Answer.findOne(
            { aid: aid }
        );

        // Update the upvotes or downvotes field
        updatedAnswer[updateField] += 1;

        // Save the updated answer document
        await updatedAnswer.save();


     
        res.status(200).json(updatedAnswer);
    } catch (err) {
       
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
