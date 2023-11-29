const express = require('express');
const router = express.Router();
const Question = require('../models/questions');
const Tag = require('../models/tags');
const Answer = require('../models/answers');

// GET all questions
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find().populate('tags').populate('answers');
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Enhanced search functionality
router.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: "No search query provided" });
    }

    try {
        // Extract complete tags from the query
        const tagMatches = query.match(/\[([^\]]+)\]/g) || [];
        const tagsToSearch = tagMatches.map(match => match.slice(1, -1).trim());

        // Removing tag syntax from query for text search
        const nonTagQuery = query.replace(/\[([^\]]+)\]/g, '').trim();

        // Build query conditions
        const queryConditions = [];
        if (nonTagQuery) {
            const regex = new RegExp(nonTagQuery, 'i');
            queryConditions.push({ title: { $regex: regex } }, { text: { $regex: regex } });
        }

        // Search for exact tag matches
        if (tagsToSearch.length > 0) {
            const tagIds = (await Tag.find({ name: { $in: tagsToSearch } })).map(tag => tag._id);
            if (tagIds.length > 0) {
                queryConditions.push({ tags: { $in: tagIds } });
            }
        }

        // If no conditions match, return no questions found
        if (queryConditions.length === 0) {
            return res.status(404).json({ message: 'No questions found' });
        }

        const questions = await Question.find({ $or: queryConditions }).populate('tags').populate('answers');
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET a specific question by qid
router.get("/:qid", async (req, res) => {
    try {
        const question = await Question.findOne({ qid: req.params.qid }).populate('tags').populate('answers');
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Increment view count
router.put("/increaseviewcount/:qid", async (req, res) => {
    try {
        const update = await Question.findOneAndUpdate({ qid: req.params.qid }, {$inc: { views: 1 }}, { new: true });
        res.json(update);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new question
router.post('/', async (req, res) => {
    try {
        const { title, text, tags, askedBy } = req.body;

        const tagIds = await Promise.all(tags.map(async (tagName) => {
            let tag = await Tag.findOne({ name: tagName.toLowerCase() });
            if (!tag) {
                tag = new Tag({ name: tagName.toLowerCase() });
                await tag.save();
            }
            return tag._id;
        }));

        const newQuestion = new Question({ 
            title, 
            text, 
            tags: tagIds, 
            asked_by: askedBy, 
            ask_date_time: new Date(),
            views: 0
        });

        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new answer to a specific question
router.post('/:qid/answers', async (req, res) => {
    const { qid } = req.params;
    const { text, ans_by } = req.body;

    const foundQuestion = await Question.findOne({ qid: qid });
    
    if (foundQuestion) {
        const newAnswer = new Answer({ 
            question: foundQuestion._id,
            text: text,
            ans_by: ans_by,
            ans_date_time: new Date()
        });

        try {
            await newAnswer.save();
            await Question.findByIdAndUpdate(
                foundQuestion._id,
                { $push: { answers: newAnswer._id }, $set: { last_answered_time: new Date() } }
            );

            res.status(201).json(newAnswer);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(404).json({ message: "Question not found" });
    }
});

module.exports = router;

