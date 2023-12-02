const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');

const authenticateUser = (req, res, next) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    next();
};

module.exports = authenticateUser;