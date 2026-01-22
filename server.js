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
// server.js
const PORT = process.env.PORT || 3000;

// 先讓伺服器啟動，這樣 Render 才會判定部署成功
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

// 再進行資料庫連線
console.log("嘗試連線 MongoDB...");
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // 5秒連不上就跳錯誤，不要死等
})
.then(() => console.log("✅ MongoDB 連線成功"))
.catch(err => {
    console.error("❌ MongoDB 連線失敗!!");
    console.error("錯誤訊息:", err.message);
});
