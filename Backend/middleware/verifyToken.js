const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    console.error("❌ Invalid or expired token:", err.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
