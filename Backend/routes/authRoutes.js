const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const { register, verifyOtp,resendOtp, login } = require("../controllers/authController");
const { getMyProfile, updateProfile } = require("../controllers/authController");
const { logout } = require("../controllers/authController");
const { assignTempAdmin } = require("../controllers/authController");
const {
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

router.post("/logout", logout);
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/users", verifyToken, getAllUsers);
router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateProfile);
router.post("/make-temp-admin", verifyToken, assignTempAdmin);

// 🔁 Password Reset routes
router.post("/forgot-password", forgotPassword);            // /api/auth/forgot-password
router.post("/reset-password/:token", resetPassword);       // /api/auth/reset-password/:token?email=



module.exports = router;
