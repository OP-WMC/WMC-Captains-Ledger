const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
  balance: { type: Number, default: 0 },
  codename: String,
  power: { type: String },
  abilities: [{ type: String }],
  weapons: [{ type: String }],
  pastAchievements: { type: String },
  profilePhoto: { type: String }, // URL or base64
  pastSuccessRate: { type: Number },
  missionStyle: { type: String },
  availability: { type: String },
  tempAdmin: { type: Boolean, default: false },
  adminStart: { type: Date },
  adminEnd: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
