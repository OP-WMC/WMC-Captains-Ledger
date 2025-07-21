const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const verifyToken = require('../middleware/verifyToken');
const { handleChat } = require('../controllers/chatController');

// Rate limiter: 10 requests per minute per user
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many chat requests, please slow down.' },
});

router.post('/chat', verifyToken, chatLimiter, handleChat);

module.exports = router; 