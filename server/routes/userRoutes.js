const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');

// User registration route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate data (You can add more validation as per your requirement)
        if (!username || !email || !password) {
            return res.status(400).send("All fields are required");
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).send("User already exists");
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

module.exports = router;
