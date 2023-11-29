// Importing Mongoose library and Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Importing a custom schema for generating unique IDs
const idSchema = require("./idSchema");

// Defining the Answer schema
const AnswerSchema = new Schema({
    aid: { type: String, unique: true }, // Unique identifier for each answer
    question: { type: Schema.Types.ObjectId, ref: 'Question' }, // Reference to the associated question document
    text: String, // Text content of the answer
    ans_by: String, // The author of the answer
    ans_date_time: Date // Date and time when the answer was provided
});

// Pre-save hook for AnswerSchema
AnswerSchema.pre('save', async function (next) {
    const doc = this;

    // Generating a unique ID for the answer if not already present
    if (!doc.aid) {
        try {
            const idSchemaCounter = await idSchema.findByIdAndUpdate(
                { _id: 'answerId' },
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );
            doc.aid = `a${idSchemaCounter.sequence_value}`; // Setting the unique aid
        } catch (err) {
            next(err); // Passing the error to the next middleware
        }
    }

    // Updating the 'last_answered_time' field of the associated question
    if (this.isNew || this.isModified('text')) { // Triggered only if the answer is new or its text is modified
        try {
            await mongoose.model('Question').findByIdAndUpdate(
                doc.question, // ID of the associated question
                { last_answered_time: new Date() } // Setting the current date and time
            );
        } catch (err) {
            next(err); // Passing the error to the next middleware
        }
    }

    next(); // Proceeding to the next middleware
});

// Creating the Answer model from the schema
const Answer = mongoose.model('Answer', AnswerSchema);

// Exporting the Answer model
module.exports = Answer;
