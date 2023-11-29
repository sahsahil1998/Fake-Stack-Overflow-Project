// Importing Mongoose for schema definition and model creation
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Importing the custom ID schema for generating unique IDs
const idSchema = require("./idSchema");

// Defining the schema for the 'Tag' model
const TagSchema = new Schema({
    tid: {
        type: String,
        unique: true // Ensures that each tag has a unique identifier
    },
    name: String // Name of the tag
});

// Pre-save hook for the Tag schema
TagSchema.pre('save', async function (next) {
    const doc = this;

    // Check and generate a unique ID (tid) if not already present
    if (!doc.tid) {
        try {
            const idSchemaCounter = await idSchema.findByIdAndUpdate(
                { _id: 'tagId' },
                { $inc: { sequence_value: 1 } }, // Increment the sequence value
                { new: true, upsert: true } // Create a new document if it doesn't exist
            );
            doc.tid = `t${idSchemaCounter.sequence_value}`; // Setting the tid
            next(); // Proceed to save the document
        } catch (err) {
            next(err); // Pass any errors to the next middleware
        }
    } else {
        next(); // If tid already exists, proceed to save the document
    }
});

// Creating the Tag model from the schema
const Tag = mongoose.model('Tag', TagSchema);

// Exporting the Tag model for use in other parts of the application
module.exports = Tag;
