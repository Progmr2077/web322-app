const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const SALT_ROUNDS = 10;

const userSchema = new Schema({
  userName: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  loginHistory: [{
    dateTime: { type: Date, default: Date.now },
    userAgent: { type: String, default: '' }
  }]
});

// Pre-save hook for hashing the password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const hashedPassword = await bcrypt.hash(this.password, SALT_ROUNDS);
      this.password = hashedPassword;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Indexes
userSchema.index({ userName: 1 }, { unique: true });

let User;

module.exports.initialize = async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    User = mongoose.model('User', userSchema);
  } catch (err) {
    throw new Error("Unable to connect to the database: " + err.message);
  }
};

module.exports.registerUser = async function (userData) {
  if (userData.password !== userData.password2) {
    throw new Error("Passwords do not match");
  }
  try {
    const newUser = new User(userData);
    await newUser.save();
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("User Name already taken");
    }
    throw new Error("There was an error creating the user: " + err.message);
  }
};

module.exports.checkUser = async function (userData) {
  try {
    const user = await User.findOne({ userName: userData.userName });
    if (!user) {
      throw new Error("Unable to find user: " + userData.userName);
    }

    const isMatch = await bcrypt.compare(userData.password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect Password for user: " + userData.userName);
    }

    user.loginHistory.push({ dateTime: new Date(), userAgent: userData.userAgent || '' });
    await user.save();

    return user;
  } catch (err) {
    throw new Error("There was an error verifying the user: " + err.message);
  }
};