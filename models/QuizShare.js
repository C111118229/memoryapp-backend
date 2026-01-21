const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const QuizShareSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true }, // 邀請碼
    title: { type: String, required: true },                            // 題庫名稱
    createdBy: { type: String, default: "" },                            // 可留空（之後可放作者）
    cards: { type: [CardSchema], default: [] },                          // 題目
  },
  { timestamps: true } // createdAt / updatedAt
);

module.exports = mongoose.model("QuizShare", QuizShareSchema);
