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
    return;
  } catch (err) {
    handleError(err, next);
    return err;
  }
}

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    handleError(err, next);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err) {
    handleError(err, next);
  }
};