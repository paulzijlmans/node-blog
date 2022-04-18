exports.handleError = (err, next) => {
  if(!err.statusCode) {
    err.statusCode = 500;
  }
  return next(err);
}