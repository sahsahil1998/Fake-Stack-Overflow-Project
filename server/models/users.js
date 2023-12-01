const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    passwordHash: { type: String, required: true }
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.passwordHash = await bcrypt.hash(this.password, 10);
    }
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
