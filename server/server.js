// Application server
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();
const port = 8000;
const cors = require("cors");

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/fake_so', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Session configuration
app.use(session({
    secret: 'my_default_secret_key', // Default secret key for development/testing
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false } // Set secure: true if using https
}));

// Use JSON middleware for parsing requests
app.use(express.json());

// Define your models and schema (Question, Answer, Tag) using Mongoose

// Define routes for Questions, Answers, and Tags
const questionRoutes = require('./routes/routes');
const answerRoutes = require('./routes/answerRoutes');
const tagRoutes = require('./routes/tagsRoutes');
const userRoutes = require('./routes/userRoutes');

// Connect routes to the application
app.use('/questions', questionRoutes);
app.use('/answers', answerRoutes);
app.use('/tags', tagRoutes);
console.log("Connecting userRoutes");
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
