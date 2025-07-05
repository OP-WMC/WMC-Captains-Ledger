const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
dotenv.config();

app.use(cors());

// ✅ Stripe webhook must come BEFORE express.json()
app.use("/webhook", express.raw({ type: "application/json" }));
const stripeWebhookRoute = require("./routes/stripeWebhook");
app.use("/webhook", stripeWebhookRoute);



// ✅ Use JSON parser for all other API routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// // ROUTES
app.use("/api/auth", require("./routes/authRoutes"));

const transactionsRoute = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionsRoute);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));
