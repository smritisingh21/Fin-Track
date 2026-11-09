const mongoose = require("mongoose");

const PeriodSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    periodType: {
      type: String,
      enum: ["week", "month", "year"],
      required: true,
    },
    periodKey: {
      type: String,
      required: true, // e.g. "2026-11", "2026-W45", "2026"
    },
    label: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpense: {
      type: Number,
      default: 0,
    },
    netSavings: {
      type: Number,
      default: 0,
    },
    savingsRate: {
      type: Number,
      default: 0,
    },
    transactionCount: {
      type: Number,
      default: 0,
    },
    categoryBreakdown: [
      {
        category: String,
        amount: Number,
        percentage: Number,
        count: Number,
      },
    ],
    incomeBreakdown: [
      {
        source: String,
        amount: Number,
        percentage: Number,
        count: Number,
      },
    ],
    aiSummary: {
      executiveSummary: String,
      spendingStatus: {
        type: String,
        enum: ["healthy", "moderate", "overspending"],
      },
      keyInsights: [String],
      categoryAnalysis: [
        {
          category: String,
          observation: String,
          recommendation: String,
        },
      ],
      savingTips: [String],
      nextPeriodForecast: String,
      interactionId: String,
      generatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

PeriodSummarySchema.index(
  { userId: 1, periodType: 1, periodKey: 1 },
  { unique: true }
);

module.exports = mongoose.model("PeriodSummary", PeriodSummarySchema);

