const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const startKeepAlive = require("./utils/keepAlive");

const app = express();
dotenv.config();

// Middleware configuration
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true,
}));

// Stripe webhook endpoint must be registered before the global express.json parser
app.use("/webhook", express.raw({ type: "application/json" }));
const stripeWebhookRoute = require("./routes/stripeWebhook");
app.use("/webhook", stripeWebhookRoute);

// Global body parsers for all other routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/users', require("./routes/authRoutes"));
app.use("/api/missions", require("./routes/mission")); 
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoute"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use('/api', require("./routes/chatRoutes"));

const transactionsRoute = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionsRoute);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Start keep-alive helper after successful database connection
    startKeepAlive();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));

