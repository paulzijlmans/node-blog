const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { handleError, throwError } = require('../util/error-handler');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError('Validation failed.', 422, errors.array())
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    const savedUser = await user.save();
    res.status(201).json({ message: 'User created!', userId: savedUser._id });
  } catch (err) {
    handleError(err, next);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const loadedUser = await User.findOne({ email: email });
    if (!loadedUser) {
      throwError('A user with this email could not be found.', 401);
    }
    const isEqual = await bcrypt.compare(password, loadedUser.password);
    if (!isEqual) {
      throwError('Wrong password!', 401);
    }
    const token = jwt.sign({ email: loadedUser.email, userId: loadedUser._id.toString() }, 'somesupersecretsecret', { expiresIn: '1h' });
    res.status(200).json({ token, userId: loadedUser._id.toString() });
  } catch (err) {
    handleError(err, next);
  }
}