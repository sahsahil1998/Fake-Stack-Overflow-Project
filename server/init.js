const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/users');
const Tag = require('./models/tags');
const Question = require('./models/questions');
const Answer = require('./models/answers');
const Comment = require('./models/comments');

const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const saltRounds = 10;

async function createInitialData() {
    try {
        // Hashing the passwords
        const hashedPasswords = await Promise.all([
            bcrypt.hash('password1', saltRounds),
            bcrypt.hash('password2', saltRounds),
            bcrypt.hash('password3', saltRounds),
            bcrypt.hash('password4', saltRounds),
            bcrypt.hash('password5', saltRounds)
        ]);

        // Create initial users
        const users = [
            new User({ username: 'user1', email: 'user1@gmail.com', passwordHash: hashedPasswords[0], reputationPoints: 50 }),
            new User({ username: 'user2', email: 'user2@gmail.com', passwordHash: hashedPasswords[1], reputationPoints: 20 }),
            new User({ username: 'user3', email: 'user3@gmail.com', passwordHash: hashedPasswords[2], reputationPoints: 70 }),
            new User({ username: 'user4', email: 'user4@gmail.com', passwordHash: hashedPasswords[3], reputationPoints: 30 }),
            new User({ username: 'user5', email: 'user5@gmail.com', passwordHash: hashedPasswords[4], reputationPoints: 10 })
        ];

        await Promise.all(users.map(user => user.save()));

        // Create initial tags
        const tags = [
            new Tag({ name: 'JavaScript', createdBy: users[0]._id }),
            new Tag({ name: 'MongoDB', createdBy: users[1]._id }),
            new Tag({ name: 'React', createdBy: users[2]._id }),
            new Tag({ name: 'Node.js', createdBy: users[3]._id }),
            new Tag({ name: 'CSS', createdBy: users[4]._id }),
            new Tag({ name: 'Git', createdBy: users[0]._id })
        ];

        await Promise.all(tags.map(tag => tag.save()));

        // Create initial questions
        const questions = [
            new Question({
                title: 'How to use promises in JavaScript?',
                text: 'I am having trouble understanding promises in JavaScript. Can someone help?',
                tags: [tags[0]._id],
                asked_by: users[0]._id,
                summary: 'Understanding JavaScript promises',
                answerCount: 1,
                views: 5,
                upvotes: 10,
                downvotes: 2,
                ask_date_time: new Date('2023-01-01T08:00:00Z'),
                last_answered_time: new Date('2023-01-02T08:00:00Z')
            }),
            new Question({
                title: 'Best practices for MongoDB schema design?',
                text: 'What are some best practices for designing MongoDB schemas?',
                tags: [tags[1]._id],
                asked_by: users[1]._id,
                summary: 'MongoDB schema design best practices',
                answerCount: 1,
                views: 3,
                upvotes: 11,
                downvotes: 1,
                ask_date_time: new Date('2023-01-03T08:00:00Z'),
                last_answered_time: new Date('2023-01-04T08:00:00Z')
            }),
            new Question({
                title: 'React State Management',
                text: 'How do you effectively manage state in a large React application?',
                tags: [tags[2]._id],
                asked_by: users[2]._id,
                summary: 'State management in React',
                answerCount: 0, 
                views: 10,
                upvotes: 15,
                downvotes: 0,
                ask_date_time: new Date('2023-01-05T08:00:00Z'),
                last_answered_time: null
            }),
            new Question({
                title: 'Node.js Best Practices',
                text: 'What are some best practices for developing robust Node.js applications?',
                tags: [tags[3]._id],
                asked_by: users[3]._id,
                summary: 'Best practices in Node.js',
                answerCount: 0,
                views: 7,
                upvotes: 9,
                downvotes: 3,
                ask_date_time: new Date('2023-01-06T08:00:00Z'),
                last_answered_time: null
            }),
            new Question({
                title: 'CSS Grid vs Flexbox',
                text: 'When should I use CSS Grid and when should I use Flexbox?',
                tags: [tags[4]._id],
                asked_by: users[4]._id,
                summary: 'Understanding CSS layout tools',
                answerCount: 2,
                views: 15,
                upvotes: 8,
                downvotes: 1,
                ask_date_time: new Date('2023-01-07T08:00:00Z'),
                last_answered_time: new Date('2023-01-08T08:00:00Z')
            }),
            new Question({
                title: 'Handling Async Operations in Redux',
                text: 'What is the best way to handle asynchronous operations in Redux?',
                tags: [tags[2]._id, tags[3]._id],
                asked_by: users[2]._id,
                summary: 'Async operations in Redux',
                answerCount: 0,
                views: 4,
                upvotes: 5,
                downvotes: 0,
                ask_date_time: new Date('2023-01-09T08:00:00Z'),
                last_answered_time: null
            }),
            new Question({
                title: 'Introduction to Git and GitHub',
                text: 'I am new to version control and would like to understand Git and GitHub. Can someone provide resources? Here is a useful link: [GitHub](https://github.com)',
                tags: [tags[5]._id],
                asked_by: users[0]._id,
                summary: 'Understanding Git and GitHub',
                answerCount: 0,
                views: 6,
                upvotes: 5,
                downvotes: 0,
                ask_date_time: new Date('2023-01-10T08:00:00Z'),
                last_answered_time: null
            }),
            // ... potentially more questions ...
        ];

        await Promise.all(questions.map(question => question.save()));

        // Create initial answers
        const answers = [
            new Answer({
                question: questions[0]._id,
                text: 'Promises are used for asynchronous operations. Here is how you can use them.',
                ans_by: users[1]._id,
                ans_date_time: new Date('2023-01-02T08:00:00Z'),
                upvotes: 5,
                downvotes: 1,
                isAccepted: true
            }),
            new Answer({
                question: questions[1]._id,
                text: 'In MongoDB, schema design depends on how you intend to query your data.',
                ans_by: users[0]._id,
                ans_date_time: new Date('2023-01-04T08:00:00Z'),
                upvotes: 3,
                downvotes: 0,
                isAccepted: false
            }),
            new Answer({
                question: questions[4]._id,
                text: 'CSS Grid is great for two-dimensional layouts.',
                ans_by: users[2]._id,
                ans_date_time: new Date('2023-01-08T08:00:00Z'),
                upvotes: 3,
                downvotes: 1,
                isAccepted: false
            }),
            new Answer({
                question: questions[4]._id,
                text: 'Flexbox is perfect for one-dimensional layouts.',
                ans_by: users[3]._id,
                ans_date_time: new Date('2023-01-08T09:00:00Z'),
                upvotes: 4,
                downvotes: 0,
                isAccepted: true
            }),
            new Answer({
                question: questions[0]._id,
                text: 'Another perspective on using promises.',
                ans_by: users[2]._id,
                ans_date_time: new Date('2023-01-02T09:00:00Z'),
                upvotes: 2,
                downvotes: 0,
                isAccepted: false
            }),
            new Answer({
                question: questions[0]._id,
                text: 'Here is an example of using promises in async functions.',
                ans_by: users[3]._id,
                ans_date_time: new Date('2023-01-02T10:00:00Z'),
                upvotes: 3,
                downvotes: 0,
                isAccepted: false
            }),
            new Answer({
                question: questions[0]._id,
                text: 'Promises can also be used with .then() and .catch() methods.',
                ans_by: users[4]._id,
                ans_date_time: new Date('2023-01-02T11:00:00Z'),
                upvotes: 4,
                downvotes: 1,
                isAccepted: false
            }),
            new Answer({
                question: questions[0]._id,
                text: 'Understanding promise chaining is crucial for complex async tasks.',
                ans_by: users[0]._id,
                ans_date_time: new Date('2023-01-02T12:00:00Z'),
                upvotes: 6,
                downvotes: 2,
                isAccepted: false
            }),
            new Answer({
                question: questions[0]._id,
                text: 'Exploring error handling in promises.',
                ans_by: users[1]._id,
                ans_date_time: new Date('2023-01-02T13:00:00Z'),
                upvotes: 7,
                downvotes: 3,
                isAccepted: false
            }),
            // ... potentially more answers ...
        ];

        await Promise.all(answers.map(answer => answer.save()));

        // Update questions with answer count and last answered time
        for (const answer of answers) {
            const savedAnswer = await answer.save();
            await Question.findByIdAndUpdate(savedAnswer.question, {
                $inc: { answerCount: 1 },
                $push: { answers: savedAnswer._id },
                $set: { last_answered_time: savedAnswer.ans_date_time }
            }, { new: true });
        }

        // Create initial comments
        const comments = [
            new Comment({
                text: 'This is a great answer!',
                commented_by: users[0]._id,
                onQuestion: questions[0]._id,
                comment_date_time: new Date()
            }),
            new Comment({
                text: 'I have a follow-up question.',
                commented_by: users[1]._id,
                onAnswer: answers[0]._id,
                comment_date_time: new Date()
            }),
            // Add more comments here...
        ];

        await Promise.all(comments.map(comment => comment.save()));

        console.log('Initial data created successfully');
    } catch (error) {
        console.error('Error creating initial data:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createInitialData();
