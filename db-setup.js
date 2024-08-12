// db-setup.js
const mongoose = require('mongoose');

// Use environment variables for sensitive information
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database';

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