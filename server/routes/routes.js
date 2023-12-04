const express = require('express');
const router = express.Router();
const Question = require('../models/questions');
const Tag = require('../models/tags');
const Answer = require('../models/answers');
const User = require('../models/users')

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sortOption = req.query.sort || 'newest';

    let sortCriteria;
    let filterCriteria = {};
    switch (sortOption) {
        case 'newest':
            sortCriteria = { ask_date_time: -1 };
            break;
        case 'active':
            sortCriteria = { last_answered_time: -1 };
            break;
        case 'unanswered':
            // Assuming that answers are stored as an array in questions
            sortCriteria = { ask_date_time: -1 };
            filterCriteria = { answers: { $size: 0 } }; // Filter for questions with no answers
            break;
        default:
            sortCriteria = { ask_date_time: -1 };
    }

    try {
        // Count the documents based on the filter criteria for accurate pagination
        const totalQuestions = await Question.countDocuments(filterCriteria);

        // Fetch the questions based on the page, limit, and filter criteria
        const questions = await Question.find(filterCriteria)
            .populate('tags')
            .populate('asked_by', 'username')
            .populate('answers')
            .sort(sortCriteria)
            .limit(limit)
            .skip((page - 1) * limit);

        res.json({
            questions,
            totalCount: totalQuestions // Send back the total count for accurate pagination on the frontend
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Enhanced search functionality
router.get('/search', async (req, res) => {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sortOption = req.query.sort || 'newest';
    if (!query) {
        return res.status(400).json({ message: "No search query provided" });
    }

    let sortCriteria;
    switch (sortOption) {
        case 'newest':
            sortCriteria = { ask_date_time: -1 };
            break;
        case 'active':
            sortCriteria = { last_answered_time: -1 };
            break;
        case 'unanswered':
            sortCriteria = { ask_date_time: -1 };
            break;
        default:
            sortCriteria = { ask_date_time: -1 };
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

       // Count total matched questions
       const totalQuestions = await Question.countDocuments({ $or: queryConditions });

       // Fetch questions with sort and pagination
       const questions = await Question.find({ $or: queryConditions })
           .populate('tags')
           .populate('answers')
           .sort(sortCriteria)
           .limit(limit)
           .skip((page - 1) * limit);

       res.json({
           questions: questions,
           totalCount: totalQuestions
       });
   } catch (err) {
       res.status(500).json({ message: err.message });
   }
});


// GET a specific question by qid
router.get("/:qid", async (req, res) => {
    try {
        const question = await Question.findOne({ qid: req.params.qid })
            .populate('tags')
            .populate('asked_by', 'username') // Populating the user who asked the question
            .populate({ 
                path: 'answers',
                populate: {
                    path: 'ans_by',
                    select: 'username' // Populating the user who answered the question
                }
            });
        
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


//Might need to create a create tags function in middleware to send less http requests
// POST a new question
router.post('/', async (req, res) => {
    try {
        const { title, text, tags, askedBy } = req.body;

        const user = await User.findById(askedBy);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tagIds = await Promise.all(tags.map(async (tagName) => {
            let tag = await Tag.findOne({ name: tagName.toLowerCase() });
            if (!tag) {
                // Check if user has enough reputation to add a new tag
                if (user.reputationPoints >= 50) {
                    // Create tag via the tag creation route
                    // This is a simplified representation; you might need to use axios or another HTTP client to make this request
                    const response = await axios.post('/tags', { name: tagName.toLowerCase(), userId: askedBy });
                    tag = response.data;
                } else {
                    throw new Error('Insufficient reputation to add new tags');
                }
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


// Assuming you have a User model for accessing user information


// POST a new answer to a specific question
router.post('/:qid/answers', async (req, res) => {
    const { qid } = req.params;
    const { text, username } = req.body;

    try {
        // Find the user object based on the provided username
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const foundQuestion = await Question.findOne({ qid: qid });

        if (foundQuestion) {
            const newAnswer = new Answer({ 
                text: text,
                ans_by: user, // Use the user object here
                ans_date_time: new Date()
            });

            await newAnswer.save();

            await Question.findByIdAndUpdate(
                foundQuestion._id,
                { $push: { answers: newAnswer._id }, $set: { last_answered_time: new Date() } }
            );

            res.status(201).json(newAnswer);
        } else {
            res.status(404).json({ message: "Question not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Repost a question with updated title and text
router.post('/repost/:questionId', async (req, res) => {
    const { questionId } = req.params; // Update this line
    console.log(questionId);
    try {
      const originalQuestion = await Question.findOne({ qid: questionId }); // Update this line
  
      if (!originalQuestion) {
        console.log("in here");
        return res.status(404).json({ message: 'Question not found' });
      }
      console.log("in here");
      const { newTitle, newText } = req.body;
    
      console.log(req.data);
      console.log(req.body);

      // Create a new instance of the question with the updated content
      const result = await Question.updateOne(
        { qid: originalQuestion.qid },
        {
          $set: {
            title: newTitle || originalQuestion.title,
            text: newText || originalQuestion.text,
            tags: originalQuestion.tags,
            answers: originalQuestion.answers,
            comments: originalQuestion.comments,
            upvotes: originalQuestion.upvotes,
            downvotes: originalQuestion.downvotes,
            asked_by: originalQuestion.asked_by,
            views: originalQuestion.views,
            ask_date_time: originalQuestion.ask_date_time,
            last_answered_time: new Date(),
          },
        }
      );
      
    } catch (error) {
      console.error('Error reposting question:', error);
      res.status(500).json({ message: 'Error reposting question' });
    }
  });
  

module.exports = router;
