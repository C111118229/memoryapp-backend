const express = require("express");
const router = express.Router();
const QuizShare = require("../models/QuizShare");

// 避免 0/O、1/I 這些難辨識字元
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

function cleanText(x) {
  return String(x ?? "").trim();
}

function normalizeCards(cards) {
  if (!Array.isArray(cards)) return [];
  return cards
    .map((c) => ({
      prompt: cleanText(c?.prompt),
      answer: cleanText(c?.answer),
    }))
    .filter((c) => c.prompt && c.answer);
}

// POST /api/quizzes
// body: { title, cards, createdBy? }
// res: { code }
router.post("/", async (req, res) => {
  try {
    const title = cleanText(req.body?.title);
    const createdBy = cleanText(req.body?.createdBy);
    const cards = normalizeCards(req.body?.cards);

    if (!title) return res.status(400).json({ message: "title is required" });
    if (cards.length === 0) return res.status(400).json({ message: "cards is empty" });

    // 生成不重複邀請碼（最多試 30 次）
    let code = "";
    for (let i = 0; i < 30; i++) {
      const c = genCode(6);
      const exists = await QuizShare.exists({ code: c });
      if (!exists) {
        code = c;
        break;
      }
    }
    if (!code) return res.status(500).json({ message: "failed to generate code" });

    await QuizShare.create({ code, title, createdBy, cards });

    return res.json({ code });
  } catch (err) {
    console.error("POST /api/quizzes error:", err);
    return res.status(500).json({ message: "server error" });
  }
});

// GET /api/quizzes/:code
// res: { code, title, cards }
router.get("/:code", async (req, res) => {
  try {
    const code = cleanText(req.params.code).toUpperCase();
    if (!code) return res.status(400).json({ message: "code is required" });

    const doc = await QuizShare.findOne(
      { code },
      { _id: 0, code: 1, title: 1, cards: 1, createdBy: 1, createdAt: 1 }
    ).lean();

    if (!doc) return res.status(404).json({ message: "code not found" });

    return res.json(doc);
  } catch (err) {
    console.error("GET /api/quizzes/:code error:", err);
    return res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
