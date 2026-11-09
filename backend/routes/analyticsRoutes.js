const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getPeriodAnalytics,
  getMonthlyHistory,
  generateAiSummary,
  askAiAssistant,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/period", protect, getPeriodAnalytics);
router.get("/monthly-history", protect, getMonthlyHistory);
router.post("/ai-summary", protect, generateAiSummary);
router.post("/ai-chat", protect, askAiAssistant);

module.exports = router;

