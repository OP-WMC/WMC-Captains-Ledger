const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { name, email, password, power, abilities, weapons, experience, profilePhoto, pastAchievements, pastSuccessRate, missionStyle, availability } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    // Set expiry to 10 minutes
    const otpExpires = Date.now() + 10 * 60 * 1000;


    const role = "user"; // Force role to user
    const startingBalance = role === "admin" ? 100000 : 40000;

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role,
      balance: startingBalance, // Set starting wallet balance
      codename: name, // Set codename to name for consistency
      power,
      abilities,
      weapons,
      pastAchievements: pastAchievements || experience,
      profilePhoto,
      pastSuccessRate,
      missionStyle,
      availability,
      otp: hashedOtp,
      otpExpires,
      isVerified: false,
    });

   
    // Send OTP to user's email address
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Avengers HQ" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Avengers Account",
      html: `
        <h2>Welcome to the Avengers Initiative, ${name}!</h2>
        <p>Your one-time verification code is:</p>
        <h1>${rawOtp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.status(201).json({
      message: "User registered. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Login attempt:", email);

    // Case-insensitive search
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      console.warn("Login failed: User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      console.warn("Login blocked: Email not verified");
      return res.status(401).json({ error: "Please verify your email before logging in" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("Login failed: Incorrect password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Use HTTPS in production
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send user response
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        codename: user.name, // frontend usage
        email: user.email,
        role: user.role,
        balance: user.balance,
        tempAdmin: user.tempAdmin,
        adminStart: user.adminStart,
        adminEnd: user.adminEnd,
        isAdmin:
          user.role === "admin" ||
          (user.tempAdmin &&
            user.adminStart &&
            user.adminEnd &&
            new Date() >= user.adminStart &&
            new Date() <= user.adminEnd),
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Return all fields except password
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

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateFields = {};
    const allowedFields = ["name", "codename", "power", "abilities", "weapons", "pastAchievements", "profilePhoto", "pastSuccessRate", "missionStyle", "availability"];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true }).select("-password");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Assign temporary admin rights
exports.assignTempAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can assign temporary admin rights.' });
    }
    const { userId, adminStart, adminEnd } = req.body;
    if (!userId || !adminStart || !adminEnd) {
      return res.status(400).json({ error: 'userId, adminStart, and adminEnd are required.' });
    }
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ error: 'You cannot assign yourself as a temporary admin.' });
    }
    const start = new Date(adminStart);
    const end = new Date(adminEnd);
    const now = new Date();
    if (isNaN(start) || isNaN(end) || end <= start || start < now) {
      return res.status(400).json({ error: 'Invalid date range.' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.tempAdmin = true;
    user.adminStart = start;
    user.adminEnd = end;
    await user.save();
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ message: 'Temporary admin assigned.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Raw User Data:", user);
    console.log("Current Time:", Date.now());
    console.log("OTP Expires At:", user.otpExpires);
    console.log("Entered OTP:", otp);
    console.log("Stored Hashed OTP:", user.otp);

    if (user.isVerified) {
      return res.status(400).json({ error: "User already verified" });
    }

    const isExpired = new Date(user.otpExpires).getTime() < Date.now();

    if (isExpired) {
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    console.log("OTP match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        message: "Email verified successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};



exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return res.status(400).json({ error: "Email is required" });
console.log("Email received for resend:", req.body.email);
const trimmedEmail = email.trim();
console.log("Email received for resend:", trimmedEmail);
const user = await User.findOne({ email: new RegExp(`^${trimmedEmail}$`, 'i') });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "User already verified" });

    // Respond immediately to frontend
    res.status(200).json({ message: "OTP is being resent. Please check your email shortly." });

    // Process OTP and email in background
    (async () => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.otp = hashedOtp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      const emailHtml = `
  <p style="font-family:sans-serif">
    <strong>Captain's Ledger</strong><br />
    <br />
    Dear Hero,<br /><br />
    Your new OTP is: <strong>${otp}</strong><br />
    <br />
    This OTP is valid for 10 minutes.<br />
    <br />
    Assemble,<br />
    The Captain's Ledger Team
  </p>
`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Captain Ledger OTP (Resend)",
          html: emailHtml,
        });
        console.log(`OTP email sent successfully to ${user.email}`);
      } catch (emailErr) {
        console.error("Email sending failed (resendOtp):", emailErr);
      }
    })();
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Set token & expiration
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // Email link
    const resetUrl = `http://localhost:5173/reset-password/${token}?email=${email}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Hello ${user.name || ""},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link will expire in 10 minutes.</p>
      `
    });

    res.json({ message: "Reset password email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { email } = req.query;
  const { newPassword } = req.body;

  try {
    if (!token || !email) {
      return res.status(400).json({ error: "Invalid reset request" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Reset link invalid or expired" });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};