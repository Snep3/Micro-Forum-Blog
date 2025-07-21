const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware auth
function authenticateToken(req, res, next) {
     //checks if the token exists
    // split changes the token to an array. [1] takes the second element which is the token
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// POST /register
router.post('/register', async (req, res) => {
  try {
    //encrypts the password using bcrypt and saves the user to the database
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashed });

    //saves the user to the database
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  // looks for the user in the database by username
  const user = await User.findOne({ username: req.body.username });
  // if the user is not found, returns an error
  if (!user) return res.status(400).json({ error: 'User not found' });

  // compares the password and the hashed (encrypted) password in the database
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });

  // generates a JWT token with the user ID and a secret key that can be used to verify the token later
  // the token expires in 1 hour
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// GET /users
//uses the authenticateToken middleware to check if the user is authenticated
router.get('/', authenticateToken, async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// PUT /users/:id
// updates the username if the user is authenticated
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { username: req.body.username });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /users/:id
// deletes the user if the user is authenticated
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
