const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// Middleware auth
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// GET all posts
router.get('/', async (req, res) => {
  try {
    // find all posts and populate the author field with the username
    // this allows us to return the posts with the author's username. will be used in the frontend later  
    const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('author', 'username'); 
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//uses the authenticateToken middleware to check if the user is logged in
// POST create new post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.user.id,
    });
    // save the new post to the database
    // and populate the author field with the username
    const saved = await newPost.save();
    const populated = await saved.populate('author', 'username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update post - only by creator
// uses the authenticateToken middleware to check if the user edits the post is the creator of the post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // find the post by id
    // if the post is not found, return 404
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // check if the user is the author of the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // if the user is the author, update the post and save it to the database
    post.title = req.body.title;
    post.content = req.body.content;
    const updated = await post.save();
    const populated = await updated.populate('author', 'username');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE post - only by creator
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
     // find the post by id
    // if the post is not found, return 404
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

     // check if the user is the author of the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // if the user is the author, delete the post and return a success message
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
