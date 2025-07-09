const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token =  authHeader && authHeader.split(" ")[1];

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract _id, email, role from decoded payload
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    };

    // console.log("✅ Decoded token user:", req.user); 

    next();
  } catch (err) {
    console.error("❌ Invalid or expired token:", err.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
