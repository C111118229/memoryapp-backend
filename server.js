require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// debug
console.log("server.js loaded from:", __filename);
console.log("MONGODB_URI present:", !!process.env.MONGODB_URI);

// health
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/__whoami", (req, res) => {
  res.json({
    file: __filename,
    time: new Date().toISOString(),
  });
});

// routes
const quizzesRouter = require("./routes/quizzes");
app.use("/api/quizzes", quizzesRouter);
console.log("quizzes route mounted");

// Port
const PORT = process.env.PORT || 3000;

// DB connect → 成功後才 listen（✅ Render 正確姿勢）
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Mongo connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on", PORT);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
