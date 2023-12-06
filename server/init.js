const mongoose = require('mongoose');
const User = require('./models/User');
const Tag = require('./models/Tag');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Comment = require('./models/Comment');

mongoose.connect('mongodb://localhost:27017/fake_so', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

async function createInitialData() {
    try {
        // Create initial users
        const user1 = new User({
            username: 'user1',
            email: 'user1@example.com',
            passwordHash: 'password1',
            reputationPoints: 10
        });
        const user2 = new User({
            username: 'user2',
            email: 'user2@example.com',
            passwordHash: 'password2',
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
