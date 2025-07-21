const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");

// Admin starts a new session
exports.startAttendance = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute later

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
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const User = require("../models/User");
    const allUsers = await User.find({ role: "user" }).select("name email codename");
    
    // Get all attendance sessions
    const allSessions = await AttendanceSession.find({}).sort({ createdAt: 1 });
    
    // Get all attendance records
    const allRecords = await AttendanceRecord.find({})
      .populate("user", "name email codename");
    
    // Get all unique days where any user attended (this represents all available attendance days)
    const allAttendanceDays = new Set();
    allRecords.forEach(record => {
      const dayKey = new Date(record.markedAt).toLocaleDateString("en-CA");
      allAttendanceDays.add(dayKey);
    });
    const totalAvailableDays = allAttendanceDays.size;
    
    // Map user attendance by days
    const userStats = allUsers.map(user => {
      const userRecords = allRecords.filter(record => 
        record.user && record.user._id.toString() === user._id.toString()
      );
      
      // Get unique days where this user attended (using markedAt field)
      const userAttendedDays = new Set();
      userRecords.forEach(record => {
        const dayKey = new Date(record.markedAt).toLocaleDateString("en-CA");
        userAttendedDays.add(dayKey);
      });
      
      const attendedDays = userAttendedDays.size;
      
      // Calculate attendance percentage based on total available days
      const attendancePercentage = totalAvailableDays > 0 ? Math.round((attendedDays / totalAvailableDays) * 100) : 0;
      
      return {
        userId: user._id,
        name: user.name || user.codename || user.email,
        email: user.email,
        codename: user.codename,
        totalDays: totalAvailableDays,
        attendedDays,
        totalSessions: allSessions.length, // Keep for reference
        attendedSessions: userRecords.length, // Keep for reference
        attendancePercentage,
        lastAttendance: userRecords.length > 0 ? 
          new Date(Math.max(...userRecords.map(r => new Date(r.markedAt)))) : null
      };
    });
    
    // Sort by attendance percentage (highest first)
    userStats.sort((a, b) => b.attendancePercentage - a.attendancePercentage);
    
    res.json({
      totalDays: totalAvailableDays,
      totalSessions: allSessions.length,
      totalUsers: allUsers.length,
      userStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
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
    if (!req.user.isAdmin) {
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
    const presentUserIds = new Set(
  attendanceRecords
    .filter(record => record.user) // Skip if user is null
    .map(record => record.user._id.toString())
);
    
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

// Get attendance trends over time (admin only)
exports.getAttendanceTrends = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get all users for total count
    const User = require("../models/User");
    const allUsers = await User.find({ role: "user" });
    const totalUsers = allUsers.length;
    console.log('DEBUG: Total users for attendance trends:', totalUsers);
    console.log('DEBUG: User IDs:', allUsers.map(u => u._id.toString()), allUsers.map(u => u.name));
    
    // Get records within date range
    const records = await AttendanceRecord.find({
      markedAt: { $gte: startDate, $lte: endDate }
    }).populate("user", "name email codename");
    
    // Initialize daily stats for ALL 30 days
    const dailyStats = {};
    
    // Create entries for all 30 days (even if no attendance)
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString("en-CA");
      dailyStats[dateKey] = { 
        date: dateKey, 
        attendedUsers: new Set(),
        totalUsers: totalUsers,
        attendedCount: 0,
        attendancePercentage: 0
      };
    }
    
    // Count unique users per day (using markedAt field)
    records.forEach(record => {
      if (!record.user) return; // Skip if user is null
      const recordDate = new Date(record.markedAt).toLocaleDateString("en-CA");
      if (dailyStats[recordDate]) {
        dailyStats[recordDate].attendedUsers.add(record.user._id.toString());
      }
    });
    
    // Calculate attendance percentage for each day
    Object.values(dailyStats).forEach(stat => {
      stat.attendedCount = stat.attendedUsers.size;
      stat.attendancePercentage = totalUsers > 0 ? Math.round((stat.attendedCount / totalUsers) * 100) : 0;
    });
    
    // Convert to array and sort by date (oldest first)
    const trends = Object.values(dailyStats)
      .map(stat => ({
        date: stat.date,
        attendedCount: stat.attendedCount,
        totalUsers: stat.totalUsers,
        attendancePercentage: stat.attendancePercentage
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(trends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get attendance stats for the current user (user dashboard)
exports.getAttendanceStatsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = require("../models/User");
    const user = await User.findById(userId).select("name email codename");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Get all attendance sessions
    const allSessions = await AttendanceSession.find({}).sort({ createdAt: 1 });
    // Get all attendance records for this user
    const userRecords = await AttendanceRecord.find({ user: userId });
    
    // Get all unique days where any user attended (this represents all available attendance days)
    const allRecords = await AttendanceRecord.find({});
    const allAttendanceDays = new Set();
    allRecords.forEach(record => {
      const dayKey = new Date(record.markedAt).toLocaleDateString("en-CA");
      allAttendanceDays.add(dayKey);
    });
    const totalAvailableDays = allAttendanceDays.size;
    
    // Get unique days where this user attended (using markedAt field)
    const userAttendedDays = new Set();
    userRecords.forEach(record => {
      userAttendedDays.add(new Date(record.markedAt).toLocaleDateString("en-CA"));
    });
    
    const attendedDays = userAttendedDays.size;
    
    // Calculate attendance percentage based on total available days
    const attendancePercentage = totalAvailableDays > 0 ? Math.round((attendedDays / totalAvailableDays) * 100) : 0;
    
    res.json({
      userId: user._id,
      name: user.name || user.codename || user.email,
      email: user.email,
      codename: user.codename,
      totalDays: totalAvailableDays,
      attendedDays,
      totalSessions: allSessions.length, // Keep for reference
      attendedSessions: userRecords.length, // Keep for reference
      attendancePercentage,
      lastAttendance: userRecords.length > 0 ? new Date(Math.max(...userRecords.map(r => new Date(r.markedAt)))) : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


