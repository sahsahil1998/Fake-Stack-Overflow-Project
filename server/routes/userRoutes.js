const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');

// Function to validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// User registration route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate data
        if (!username || !email || !password) {
            return res.status(400).send("All fields are required");
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).send("Invalid email format");
        }

        // Check if password contains username or email
        if (password.includes(username) || password.includes(email)) {
            return res.status(400).send("Password should not contain username or email");
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).send("User already exists with the same username or email");
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({ username, email, passwordHash });
        await user.save();

        // Send a success response
        res.status(201).send("User created successfully");
    } catch (error) {
        res.status(500).send("Error in registration: " + error.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        // Here you might want to create a session or token
        // For example, using JWT or similar

        res.send({ message: 'Login successful' });
    } catch (error) {
        res.status(500).send({ message: 'Error during login' });
    }
});

module.exports = router;
