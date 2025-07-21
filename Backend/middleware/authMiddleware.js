const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ msg: "No token, auth denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).json({ msg: "User not found" });

    // Determine admin status (permanent or temporary)
    let isAdmin = false;
    if (user.role === 'admin') {
      isAdmin = true;
    } else if (user.tempAdmin && user.adminStart && user.adminEnd) {
      const now = new Date();
      if (now >= user.adminStart && now <= user.adminEnd) {
        isAdmin = true;
      } else if (now > user.adminEnd) {
        // Auto-expire temp admin
        user.tempAdmin = false;
        user.adminStart = null;
        user.adminEnd = null;
        await user.save();
      }
    }
    req.user = user;
    req.user.isAdmin = isAdmin;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
