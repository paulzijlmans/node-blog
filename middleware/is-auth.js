const jwt = require('jsonwebtoken');

const { throwError } = require('../util/error-handler');

module.exports = (req, _res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throwError('Not Authenticated.', 401);
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret')
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    throwError('Not authenticated.', 401);
  }
  req.userId = decodedToken.userId;
  next();
}