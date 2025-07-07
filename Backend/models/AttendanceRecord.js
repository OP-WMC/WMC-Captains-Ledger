const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "AttendanceSession" },
  markedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
