const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin
});

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
