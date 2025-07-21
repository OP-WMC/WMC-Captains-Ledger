const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  startAttendance,
  markAttendance,
  getAttendanceStats,
  hasMarkedToday,
  getAttendanceDates,
  getCurrentCode,
  getAttendanceByDate,
  getAttendanceTrends,
  getAttendanceStatsForUser
} = require("../controllers/attendanceController");

// ADMIN ONLY
router.post("/start", authMiddleware, startAttendance);

// USER
router.post("/mark", authMiddleware, markAttendance);
router.get("/current-code", authMiddleware, getCurrentCode);

// Optional stats
router.get("/stats", authMiddleware, getAttendanceStats);
router.get("/marked-today", authMiddleware, hasMarkedToday);
router.get("/dates", authMiddleware, getAttendanceDates);

// ADMIN ONLY - Get attendance by date
router.get("/date/:date", authMiddleware, getAttendanceByDate);

// Get attendance statistics (admin only)
router.get("/stats", authMiddleware, getAttendanceStats);

// Get attendance trends (admin only)
router.get("/trends", authMiddleware, getAttendanceTrends);

// Add user-specific stats route
router.get("/stats/user", authMiddleware, getAttendanceStatsForUser);

module.exports = router;
