// db-setup.js
const mongoose = require('mongoose');

const dbUri = 'mongodb://username:password@host:port/your_database';

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;