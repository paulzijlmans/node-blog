const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { throwError } = require('../util/error-handler');

module.exports = {
  createUser: async function ({ userInput }, _req) {
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throwError('USer exists already!', 500);
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  }
};