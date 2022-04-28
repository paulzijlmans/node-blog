exports.handleError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  return next(err);
};

exports.throwError = (msg, statusCode, data = undefined) => {
  const error = new Error(msg);
  error.statusCode = statusCode;
  if (data) {
    error.data = data;
  }
  throw error;
}