const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { handleError, throwError } = require('../util/error-handler');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError('Validation failed.', 422, errors.array())
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email,
        password: hashedPassword,
        name
      });
      return user.save();
    })
    .then(result => res.status(201).json({ message: 'User created!', userId: result._id }))
    .catch(err => handleError(err, next));
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        throwError('A user with this email could not be found.', 401);
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        throwError('Wrong password!', 401);
      }
      const token = jwt.sign({ email: loadedUser.email, userId: loadedUser._id.toString() }, 'somesupersecretsecret', { expiresIn: '1h' });
      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch(err => handleError(err, next));
}