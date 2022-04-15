exports.getPosts = (_req, res, _next) => {
  res.status(200).json({
    posts: [
      {
        _id: '1',
        title: 'First Post',
        content: 'This is the first post!',
        imageUrl: 'images/duck.jpg',
        creator: {
          name: 'Max'
        },
        createdAt: new Date()
      }
    ]
  });
};

exports.createPost = (req, res, _next) => {
  const title = req.body.title;
  const content = req.body.content;
  res.status(201).json({
    message: 'Post created successfully!',
    post: {
      id: new Date().toISOString(),
      title,
      content
    }
  });
};