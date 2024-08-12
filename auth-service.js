const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const SALT_ROUNDS = 10;

const userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }]
});

let User;

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection("connectionString");
    db.on('error', (err) => reject(err));
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
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
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .then(users => {
        if (users.length === 0) {
          return reject("Unable to find user: " + userData.userName);
        }
        bcrypt.compare(userData.password, users[0].password)
          .then(isMatch => {
            if (!isMatch) {
              return reject("Incorrect Password for user: " + userData.userName);
            }
            let user = users[0];
            user.loginHistory.push({ dateTime: new Date(), userAgent: userData.userAgent });
            return user.save();
          })
          .then(() => resolve(user))
          .catch(err => reject("There was an error verifying the user: " + err));
      })
      .catch(err => reject("Unable to find user: " + userData.userName));
  });
};