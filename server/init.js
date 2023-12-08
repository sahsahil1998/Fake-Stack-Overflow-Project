const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/users');
const Tag = require('./models/tags');
const Question = require('./models/questions');
const Answer = require('./models/answers');
const Comment = require('./models/comments');

// Update the MongoDB URL if needed
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const saltRounds = 10;

async function createInitialData() {
    try {
        // Hashing the passwords
        const hashedPassword1 = await bcrypt.hash('password1', saltRounds);
        const hashedPassword2 = await bcrypt.hash('password2', saltRounds);

        // Create initial users
        const user1 = new User({
            username: 'user1',
            email: 'user1@example.com',
            passwordHash: hashedPassword1,
            reputationPoints: 10
        });
        const user2 = new User({
            username: 'user2',
            email: 'user2@example.com',
            passwordHash: hashedPassword2,
            reputationPoints: 20
        });
        await user1.save();
        await user2.save();

        // Create initial tags
        const tag1 = new Tag({
            name: 'JavaScript',
            createdBy: user1._id
        });
        const tag2 = new Tag({
            name: 'MongoDB',
            createdBy: user2._id
        });
        await tag1.save();
        await tag2.save();

        // Create initial questions
        const question1 = new Question({
            title: 'How to use promises in JavaScript?',
            text: 'I am having trouble understanding promises in JavaScript. Can someone help?',
            tags: [tag1._id],
            asked_by: user1._id,
            summary: 'Understanding JavaScript promises',
            answerCount: 1,
            views: 5,
            last_answered_time: new Date()
        });
        const question2 = new Question({
            title: 'Best practices for MongoDB schema design?',
            text: 'What are some best practices for designing MongoDB schemas?',
            tags: [tag2._id],
            asked_by: user2._id,
            summary: 'MongoDB schema design best practices',
            answerCount: 1,
            views: 3,
            last_answered_time: new Date()
        });
        await question1.save();
        await question2.save();

        // Create initial answers
        const answer1 = new Answer({
            question: question1._id,
            text: 'Promises are used for asynchronous operations. Here is how you can use them...',
            ans_by: user2._id,
            ans_date_time: new Date()
        });
        const answer2 = new Answer({
            question: question2._id,
            text: 'In MongoDB, schema design depends on how you intend to query your data...',
            ans_by: user1._id,
            ans_date_time: new Date()
        });
        await answer1.save();
        await answer2.save();

        // Create initial comments
        const comment1 = new Comment({
            text: 'This is a great answer!',
            commented_by: user1._id,
            onQuestion: question1._id,
            comment_date_time: new Date()
        });
        const comment2 = new Comment({
            text: 'I have a follow-up question...',
            commented_by: user2._id,
            onAnswer: answer1._id,
            comment_date_time: new Date()
        });
        await comment1.save();
        await comment2.save();

        console.log('Initial data created successfully');
    } catch (error) {
        console.error('Error creating initial data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createInitialData();
