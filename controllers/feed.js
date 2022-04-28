const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');
const { handleError, throwError } = require('../util/error-handler');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find().countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => res.status(200).json({ message: 'Fetched posts successfully.', posts, totalItems }))
    .catch(err => handleError(err, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError('Validation failed, entered data is incorrect.', 422);
  }
  if (!req.file) {
    throwError('No Image Provided.', 422);
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId
  });
  post.save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: 'Post created successfully!',
        post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => handleError(err, next));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        throwError('Could not find post.', 404);
      }
      res.status(200).json({ message: 'Post fetched.', post });
    })
    .catch(err => handleError(err, next));
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throwError('Validation failed, entered data is incorrect.', 422);
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    throwError('No image provided.', 422);
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        throwError('Could not find post.', 404);
      }
      if (post.creator.toString() !== req.userId) {
        throwError('Not authorized!', 403);
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => res.status(200).json({ message: 'Post updated.', post: result }))
    .catch(err => handleError(err, next));
}

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        throwError('Could not find post.', 404);
      }
      if (post.creator.toString() !== req.userId) {
        throwError('Not authorized!', 403);
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => User.findById(req.userId))
    .then(user => {
      user.posts.pull(postId);
      user.save();
    })
    .then(() => res.status(200).json({ message: 'Deleted Post.' }))
    .catch(err => handleError(err, next));

}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}