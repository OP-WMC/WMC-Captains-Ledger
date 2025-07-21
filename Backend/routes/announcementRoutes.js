const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all announcements (users & admin)
router.get('/', authMiddleware, announcementController.getAnnouncements);

// Post new announcement (admin only)
router.post('/', authMiddleware, announcementController.postAnnouncement);

module.exports = router; 