const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  location: String,
  startDate: String,
  endDate: String,
  assignedMembers: [
    {
      name: String,
      salary: { type: Number, default: 0 }
    }
  ],
  martyrs: [String],
  statusHistory: [
    {
      status: String,
      date: String, // ISO datetime string
      updatedBy: String // admin or user id/name
    }
  ],
  salariesPaid: { type: Boolean, default: false },
});

module.exports = mongoose.model('Mission', missionSchema);
