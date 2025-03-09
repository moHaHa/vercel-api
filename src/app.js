const dotenv = require("dotenv");
dotenv.config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const appConfig = require("./config/appConfig");
const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

const router = express.Router();

app.use(
  cors({
    // origin: "http://localhost:4869",

    origin: "http://192.168.1.103:4869",
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply the rate limiter to all requests
app.use(limiter);
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

mongoose
  .connect(appConfig.dbUri, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("MongoDB connected");
    app.use(express.json());

    app.use(
      router.get("/", (req, res) => {
        res.json({ data: "-> index " });
      })
    );
    
    app.listen(appConfig.port, () => {
      console.log(`Server is running on http://localhost:${appConfig.port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1); // Exit the process if the database connection fails
  });
