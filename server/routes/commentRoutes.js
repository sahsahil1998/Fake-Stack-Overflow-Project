const express = require('express');
const router = express.Router();
const Comment = require('../models/comments');
const User = require('../models/users');

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

// POST a new comment
router.post('/', async (req, res) => {
    console.log(req.body);
    try {
        const { text, commented_by, onQuestion, onAnswer } = req.body;
        
        // Validate the incoming data
        if (!text || !commented_by) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (text.length > 140) {
            return res.status(400).json({ message: "Comment exceeds character limit" });
        }

        // Fetch the user's reputation
        const user = await User.findById(commented_by);
        if (!user || user.reputationPoints < 50) {
            return res.status(400).json({ message: "Insufficient reputation to comment" });
        }

        // Create and save the new comment
        const newComment = new Comment({ text, commented_by, onQuestion, onAnswer });
        await newComment.save();

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to upvote a comment
router.put('/upvote/:commentId', async (req, res) => {
    console.log("Upvote route hit for comment:", req.params.commentId);
    try {
        const { commentId } = req.params;

        // Find the comment and increment the upvotes
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $inc: { upvotes: 1 } }, // Increment upvotes by 1
            { new: true } // Return the updated document
        );

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.json(updatedComment);
    } catch (error) {
        console.error("Error in upvoting:", error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
