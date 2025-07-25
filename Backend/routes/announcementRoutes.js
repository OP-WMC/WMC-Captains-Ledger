// backend/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming this middleware is correct

// Get all announcements (users & admin)
router.get('/', authMiddleware, announcementController.getAnnouncements);

// Post new announcement (admin only)
router.post('/', authMiddleware, announcementController.postAnnouncement);

// NEW: Delete an announcement by ID (admin only)
// The authMiddleware will ensure the user is authenticated,
// and the controller will further check for the isAdmin role.
router.delete('/:id', authMiddleware, announcementController.deleteAnnouncement);

module.exports = router;