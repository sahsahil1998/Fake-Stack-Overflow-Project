const express = require('express');
const router = express.Router();
const Comment = require('../models/comments');

// Route to post a new comment
router.post('/', async (req, res) => {
    try {
        const { text, commented_by, onQuestion, onAnswer } = req.body;
        if (!text || !commented_by) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newComment = new Comment({ text, commented_by, onQuestion, onAnswer });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get comments for a question
router.get('/question/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const { page = 1, limit = 3 } = req.query;

    try {
        const comments = await Comment.find({ onQuestion: questionId })
            .populate('commented_by', 'username') // Populating the 'commented_by' field with 'username' from User model
            .sort({ comment_date_time: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        res.json({ comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get comments for an answer
router.get('/answer/:answerId', async (req, res) => {
    const { answerId } = req.params;
    const { page = 1, limit = 3 } = req.query;

    try {
        const comments = await Comment.find({ onAnswer: answerId })
            .populate('commented_by', 'username') // Populating the 'commented_by' field with 'username' from User model
            .sort({ comment_date_time: -1 })
            .limit(limit)
            .skip((page - 1) * limit);

        res.json({ comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
