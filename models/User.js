const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for user data
const userSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    loginHistory: [{
        dateTime: { type: Date, default: Date.now },
        userAgent: String
    }]
});

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
