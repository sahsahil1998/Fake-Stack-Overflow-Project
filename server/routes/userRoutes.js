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

        if (!username || !email || !password) {
            return res.status(400).send("All fields are required");
        }

        if (!validateEmail(email)) {
            return res.status(400).send("Invalid email format");
        }

        if (password.includes(username) || password.includes(email)) {
            return res.status(400).send("Password should not contain username or email");
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).send("User already exists with the same username or email");
        }

        const user = new User({ username, email, password });
        await user.save();

        res.status(201).send("User created successfully");
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send("Error in registration: " + error.message);
    }
});

// User login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt for user:", username); // Log the username attempting to log in

        const user = await User.findOne({ username });
        console.log("User found:", user); // Log the found user

        if (!user) {
            console.log("User not found for username:", username); // Log if user not found
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log("Password match:", isMatch); // Log password match result

        if (isMatch) {
            // Store user information in the session
            req.session.user = { id: user._id, username: user.username };
            console.log("Login successful for user:", username, "Session:", req.session);
            res.send({ message: 'Login successful' });
        }

        console.log("Login successful for user:", username); // Log successful login
        res.send({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error); // Log the error details
        res.status(500).send({ message: 'Error during login' });
    }
});

// User logout route
router.get('/logout', (req, res) => {
    console.log("Logout route hit");
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send({ message: 'Error during logout' });
        }
        res.send({ message: 'Logout successful' });
    });
});



module.exports = router;
