const express = require('express');
const router = express.Router();
const Tag = require('../models/tags');
const Question = require('../models/questions');
const User = require('../models/users')

// Route to GET all tags along with their associated question counts
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find();
        const tagsWithQuestionCounts = await Promise.all(tags.map(async (tag) => {
            const questionCount = await Question.countDocuments({ tags: tag._id });
            return {
                ...tag.toObject(),
                questionCount
            };
        }));
        res.json(tagsWithQuestionCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to GET all questions associated with a specific tag
router.get('/:tagId/questions', async (req, res) => {
    try {
        const tagId = req.params.tagId;
        const tag = await Tag.findOne({ tid: tagId });
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        const questions = await Question.find({ tags: tag._id })
            .populate('tags')
            .populate('asked_by', 'username') // Populate 'asked_by' with 'username'
            .populate('answers')
            .sort({ ask_date_time: -1 }) // Sorting questions by newest first
            .exec();

        res.json({ tag: tag, questions: questions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Route to POST a new tag
router.post('/', async (req, res) => {
    const { name, userId } = req.body;

    try {
        // Retrieve user based on userId
        const user = await User.findById(userId);
        if (!user || user.reputationPoints < 50) {
            return res.status(403).json({ message: 'Insufficient reputation to add new tags' });
        }

        const newTag = new Tag({ name });
        await newTag.save();
        res.status(201).json(newTag);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


module.exports = router;
