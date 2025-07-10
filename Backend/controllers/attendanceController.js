const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");

// Admin starts a new session
exports.startAttendance = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const expiresAt = new Date(Date.now() + 120 * 1000); // 2 minute later

  const session = await AttendanceSession.create({
    code,
    expiresAt,
    createdBy: req.user._id,
  });

  res.json({ code, expiresAt });
};

// Get current active attendance code (for users)
exports.getCurrentCode = async (req, res) => {
  try {
    const currentSession = await AttendanceSession.findOne({
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!currentSession) {
      return res.json({ code: null, expiresAt: null });
    }

    res.json({ 
      code: currentSession.code, 
      expiresAt: currentSession.expiresAt 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// User marks attendance
exports.markAttendance = async (req, res) => {
  const { code } = req.body;

  const session = await AttendanceSession.findOne({ code });
  if (!session) return res.status(400).json({ msg: "Invalid code" });

  if (new Date() > session.expiresAt) {
    return res.status(400).json({ msg: "Code expired" });
  }

  // Check if already marked
  const existing = await AttendanceRecord.findOne({
    user: req.user._id,
    session: session._id,
  });

  if (existing) return res.status(400).json({ msg: "Already marked" });

  await AttendanceRecord.create({
    user: req.user._id,
    session: session._id,
  });

  res.json({ msg: "Attendance marked ✅" });
};

// Optional: Admin sees stats
exports.getAttendanceStats = async (req, res) => {
  const records = await AttendanceRecord.find({}).populate("user", "name email");
  res.json(records);
};

exports.hasMarkedToday = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA"); // ✅ local "YYYY-MM-DD"

    const records = await AttendanceRecord.find({ user: req.user._id });

    const markedToday = records.some(record => {
      const markedDate = new Date(record.markedAt).toLocaleDateString("en-CA");
      return markedDate === today;
    });

    res.json({ marked: markedToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAttendanceDates = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ user: req.user._id });

    const dates = records.map(r =>
  new Date(r.markedAt).toLocaleDateString("en-CA") // ✅ "YYYY-MM-DD" in local timezone
); // "YYYY-MM-DD"
    res.json(dates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get attendance data for a specific date (admin only)
exports.getAttendanceByDate = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { date } = req.params; // Format: YYYY-MM-DD
    
    // Get all users
    const User = require("../models/User");
    const allUsers = await User.find({ role: "user" }).select("name email codename");
    
    // Get all attendance records for the specific date
    const startOfDay = new Date(date + "T00:00:00.000Z");
    const endOfDay = new Date(date + "T23:59:59.999Z");
    
    const attendanceRecords = await AttendanceRecord.find({
      markedAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate("user", "name email codename");
    
    // Create a map of users who marked attendance
    const presentUserIds = new Set(attendanceRecords.map(record => record.user._id.toString()));
    
    // Separate users into present and absent
    const presentUsers = allUsers.filter(user => presentUserIds.has(user._id.toString()));
    const absentUsers = allUsers.filter(user => !presentUserIds.has(user._id.toString()));
    
    res.json({
      date,
      present: presentUsers,
      absent: absentUsers,
      totalUsers: allUsers.length,
      presentCount: presentUsers.length,
      absentCount: absentUsers.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


