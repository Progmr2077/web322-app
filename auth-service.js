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
    userAgent: String
  }]
});

// Indexes
userSchema.index({ userName: 1 }, { unique: true });

let User;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        User = mongoose.model('User', userSchema);
        resolve();
      })
      .catch(err => reject(err));
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      return reject("Passwords do not match");
    }
    bcrypt.hash(userData.password, SALT_ROUNDS)
      .then(hashedPassword => {
        userData.password = hashedPassword;
        let newUser = new User(userData);
        return newUser.save();
      })
      .then(() => resolve())
      .catch(err => {
        if (err.code === 11000) {
          reject("User Name already taken");
        } else {
          reject("There was an error creating the user: " + err);
        }
      });
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .then(user => {
        if (!user) {
          return reject("Unable to find user: " + userData.userName);
        }
        return bcrypt.compare(userData.password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              return reject("Incorrect Password for user: " + userData.userName);
            }
            user.loginHistory.push({ dateTime: new Date(), userAgent: userData.userAgent });
            return user.save();
          })
          .then(() => resolve(user))
          .catch(err => reject("There was an error verifying the user: " + err));
      })
      .catch(err => reject("Unable to find user: " + userData.userName));
  });
};