const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();
const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DATABASE } = process.env;
const feedRoutes = require('./routes/feed');

const app = express();

app.use(bodyParser.json());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Allow-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.tbgkr.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`)
  .then(app.listen(8080))
  .catch(err => console.log(err));