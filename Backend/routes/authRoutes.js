const express = require("express");
const router = express.Router();

const { getAllUsers } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");
const { register, login } = require("../controllers/authController");
const { getMyProfile } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", verifyToken, getAllUsers);
router.get("/me", verifyToken, getMyProfile);

module.exports = router;
