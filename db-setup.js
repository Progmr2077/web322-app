// db-setup.js
const mongoose = require('mongoose');

// Use environment variables for sensitive information
const dbUri = process.env.MONGODB_URI || 'mongodb+srv://jrivera17:9ALdUCokZjOP16uX@cluster0.feyf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with an error code
  });

module.exports = mongoose;