const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  startAttendance,
  markAttendance,
  getAttendanceStats,
  hasMarkedToday,
  getAttendanceDates
} = require("../controllers/attendanceController");

// ADMIN ONLY
router.post("/start", auth, startAttendance);

// USER
router.post("/mark", auth, markAttendance);

// Optional stats
router.get("/stats", auth, getAttendanceStats);
router.get("/marked-today", auth, hasMarkedToday);
router.get("/dates", auth, getAttendanceDates);



module.exports = router;
