const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  location: String,
  startDate: String,
  endDate: String,
  assignedMembers: [String],
});

module.exports = mongoose.model('Mission', missionSchema);
