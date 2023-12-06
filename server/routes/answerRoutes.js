const { authenticateUser } = require('../middleware/helper');
const express = require('express');
const router = express.Router();
const Answer = require('../models/answers');
const Question = require('../models/questions');

// GET paginated answers for a specific question
router.get('/question/:qid', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skipIndex = (page - 1) * limit;

        const answers = await Answer.find({ question: req.params.qid })
                                .populate('ans_by', 'username')
                                .sort({ isAccepted: -1, ans_date_time: -1 }) // Accepted answers first, then newest
                                .skip(skipIndex)
                                .limit(limit);

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

// Route to ACCEPT a specific answer
router.put('/accept/:aid', authenticateUser, async (req, res) => {
    console.log("Fetching answer with ID:", req.params.aid);
    
    try {
        const { aid } = req.params;

        // Find the answer
        const answer = await Answer.findOne({ aid: aid });
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Fetch the associated question using the questionId from the answer
        const question = await Question.findById(answer.question);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        console.log("Answer:", answer);
        console.log("Question:", question);
        console.log("Session User ID:", req.session.user.username);
        console.log("Question Asked By ID:", question.asked_by.toString());

        // Verify that the current user is the one who asked the question
        if (req.session.user.userId !== question.asked_by.toString()) {
            return res.status(403).json({ message: 'Unauthorized: Only the question asker can accept an answer' });
        }

        // Mark the answer as accepted
        answer.isAccepted = true;
        await answer.save();

        // Optionally, reset 'isAccepted' for other answers to the same question
        await Answer.updateMany({ question: question._id, _id: { $ne: answer._id } }, { $set: { isAccepted: false } });

        res.json(answer);
    } catch (error) {
        console.error('Error accepting answer:', error);
        res.status(500).json({ message: 'Error accepting answer' });
    }
});



// Route to GET a specific answer by ID for editing
router.get('/:aid', authenticateUser, async (req, res) => {
    console.log("Fetching answer with ID:", req.params.aid);
    console.log("User id: ");
    try {
        // Check if the user is authenticated
        if (!req.session.user || !req.session.user.username) {
            console.log("in here not authenticated");
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const answer = await Answer.findOne({aid:req.params.aid});
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        res.json(answer);
    } catch (error) {
        console.error('Error fetching answer:', error);
        res.status(500).json({ message: 'Error fetching answer' });
    }
});

// Route to UPDATE a specific answer
router.put('/update/:aid', authenticateUser, async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.session.user || !req.session.user.username) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const updatedAnswer = await Answer.findOneAndUpdate(
            { aid: req.params.aid },
            { text: req.body.text },
            { new: true }
        );
        if (!updatedAnswer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        res.json(updatedAnswer);
    } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ message: 'Error updating answer' });
    }
});

// Route to DELETE a specific answer
router.delete('/delete/:aid', authenticateUser, async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.session.user || !req.session.user.username) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const deletedAnswer = await Answer.findOneAndDelete({ aid: req.params.aid });
        if (!deletedAnswer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        res.json({ message: 'Answer deleted successfully' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ message: 'Error deleting answer' });
    }
});



module.exports = router;
