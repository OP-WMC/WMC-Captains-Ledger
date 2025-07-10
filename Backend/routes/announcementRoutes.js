const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const verifyToken = require('../middleware/verifyToken');

// Get all announcements (users & admin)
router.get('/', verifyToken, announcementController.getAnnouncements);

// Post new announcement (admin only)
router.post('/', verifyToken, announcementController.postAnnouncement);

module.exports = router; 