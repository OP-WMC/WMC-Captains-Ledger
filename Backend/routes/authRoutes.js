const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", verifyToken, getAllUsers);

module.exports = router;
