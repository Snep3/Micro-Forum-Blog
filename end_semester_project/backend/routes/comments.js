const express = require('express');
const router = express.Router();
const Comment = require('../models/Comments');
const jwt = require('jsonwebtoken');

// Middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// POST create comments
router.post('/', authenticateToken, async (req, res) => {
  const { content, postId } = req.body;

  //if there is no content or postId, return error
  if (!content || !postId) {
    return res.status(400).json({ error: 'חובה תוכן ומזהה פוסט' });
  }


  //create a new comment
  try {
    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId,
    });

    const saved = await comment.save();
  
    // populate takes the username and puts it in the author field
    // so we can return the comment with the author's username
    const populated = await saved.populate('author', 'username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// gets all comments for a specific post, includes each author's username and sorts them by newest first
// returns them as JSON so we can display them in the frontend later
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//delete comments
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // check if the user is the author of the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'no permission' });
    }
// delete the comment
    await comment.remove();
    res.json({ message: 'Comment deleted'});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
