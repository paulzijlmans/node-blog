const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

require('dotenv').config();
const { PORT, MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DATABASE } = process.env;

const app = express();

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'images');
  },
  filename: (_req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((error, _req, res, _next) => {
  console.log('error', error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.tbgkr.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`)
  .then(() => {
    const port = PORT || 8080;
    console.log(`Listening on Port ${port}`);
    app.listen(port);
  })
  .catch(err => console.log(err));