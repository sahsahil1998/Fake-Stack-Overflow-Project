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

        // Hash the password before saving the user
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({ username, email, passwordHash }); // Use passwordHash
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
        console.log("Login attempt for user:", username);

        const user = await User.findOne({ username });
        console.log("User found:", user);

        if (!user) {
            console.log("User not found for username:", username);
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log("Password match:", isMatch);

        if (isMatch) {
            req.session.user = { id: user._id, username: user.username };
            req.session.save(err => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send({ message: 'Error during login' });
                }
                return res.send({ message: 'Login successful' });
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ message: 'Error during login' });
    }
});

router.get('/check-session', (req, res) => {
    if (req.session && req.session.user) {
        // User is logged in
        res.json({ isLoggedIn: true, user: req.session.user });
    } else {
        // User is not logged in
        res.json({ isLoggedIn: false });
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
