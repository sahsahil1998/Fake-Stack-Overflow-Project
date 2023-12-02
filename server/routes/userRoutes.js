const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Question = require('../models/questions');
const Answer = require('../models/answers');
const bcrypt = require('bcrypt');
const { authenticateUser } = require('../middleware/helper');

// Function to validate email format
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};


router.get('/', async (req, res) => {
    try {
      const users = await User.find({}, { passwordHash: 0 }); // Exclude passwordHash from the result
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  

// User registration route
router.post('/register', async (req, res) => {
    console.log("in here")
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


// User profile route
router.get('/profile', authenticateUser, async (req, res) => {
    console.log("hitting here")
    console.log(req.session.user.id);
    try {
        if (!req.session && !req.session.user.username) {
            return res.status(401).send({ message: 'Unauthorized' });
        }
        const user = await User.findById(req.session.user.id);
        console.log(user);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Return user profile information (excluding sensitive data like passwordHash)
        res.send({
            id: user._id,
            username: user.username,
            email: user.email,
            reputationPoints: user.reputationPoints // Include any other profile information
        });
    } catch (error) {
        console.error('User profile error:', error);
        res.status(500).send({ message: 'Error fetching user profile' });
    }
});



router.get('/questions', authenticateUser, async (req, res) => {
    try {
      if (!req.session.user || !req.session.user.username) {
        return res.status(401).send({ message: 'Unauthorized' });
      }
  
      const username = req.session.user.username;
  
      // Find questions by the username
      const questions = await Question.find({ asked_by: username });
  
      res.json(questions);
    } catch (error) {
      console.error('Error fetching user questions:', error);
      res.status(500).json({ message: 'Error fetching user questions' });
    }
  });


  router.get('/answers', authenticateUser, async (req, res) => {
    try {
        console.log(req.session.user.username)
      if (!req.session.user || !req.session.user.username) {
        return res.status(401).send({ message: 'Unauthorized' });
      }
  
      const username = req.session.user.username;
  
      // Find answers by the username
      const answers = await Answer.find({ answered_by: username });
  
      res.json(answers);
    } catch (error) {
      console.error('Error fetching user answers:', error);
      res.status(500).json({ message: 'Error fetching user answers' });
    }
  });



module.exports = router;

