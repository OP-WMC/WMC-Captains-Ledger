const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  startAttendance,
  markAttendance,
  getAttendanceStats,
  hasMarkedToday,
  getAttendanceDates,
  getCurrentCode,
  getAttendanceByDate,
  getAttendanceTrends
} = require("../controllers/attendanceController");

// ADMIN ONLY
router.post("/start", verifyToken, startAttendance);

// USER
router.post("/mark", verifyToken, markAttendance);
router.get("/current-code", verifyToken, getCurrentCode);

// Optional stats
router.get("/stats", verifyToken, getAttendanceStats);
router.get("/marked-today", verifyToken, hasMarkedToday);
router.get("/dates", verifyToken, getAttendanceDates);

// ADMIN ONLY - Get attendance by date
router.get("/date/:date", verifyToken, getAttendanceByDate);

// Get attendance statistics (admin only)
router.get("/stats", verifyToken, getAttendanceStats);

// Get attendance trends (admin only)
router.get("/trends", verifyToken, getAttendanceTrends);

module.exports = router;
