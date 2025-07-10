const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const role = "user"; // Force role to user
    const startingBalance = role === "admin" ? 100000 : 40000;

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role,
      balance: startingBalance, // 💰 Set balance
      codename: name, // Set codename to name for consistency
    });

    // ✅ Create token with plain user data
    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Create token with plain user data
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
const isProduction = process.env.NODE_ENV === "production";
    res
  .cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // ✅ false on localhost
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  .status(200)
  .json({
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      codename: user.name, // Add codename for frontend compatibility
      email: user.email,
      role: user.role,
      balance: user.balance,
    },
  });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email role"); // Select only needed fields
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
};
exports.logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
};