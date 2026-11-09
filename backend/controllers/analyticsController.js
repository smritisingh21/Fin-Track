const Expense = require("../models/expenses");
const Income = require("../models/income");
const PeriodSummary = require("../models/periodSummary");

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getISOWeekInfo(dateInput = new Date()) {
  const date = new Date(dateInput);
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  const isoYear = d.getUTCFullYear();
  return {
    year: isoYear,
    week: weekNo,
    weekKey: `${isoYear}-W${String(weekNo).padStart(2, "0")}`,
  };
}

function getStartOfISOWeek(isoYear, isoWeek) {
  const simple = new Date(isoYear, 0, 1 + (isoWeek - 1) * 7);
  const dow = simple.getDay();
  const isoWeekStart = new Date(simple);
  if (dow <= 4 && dow > 0) {
    isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else if (dow === 0) {
    isoWeekStart.setDate(simple.getDate() + 1);
  } else {
    isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  isoWeekStart.setHours(0, 0, 0, 0);
  return isoWeekStart;
}

function formatShortDate(d) {
  return `${d.getDate()} ${SHORT_MONTH_NAMES[d.getMonth()]}`;
}

function resolvePeriodRange(periodType = "month", rawPeriodKey = "") {
  const now = new Date();
  const normalizedType = ["week", "month", "year"].includes(periodType)
    ? periodType
    : "month";

  if (normalizedType === "year") {
    const year =
      /^\d{4}$/.test(String(rawPeriodKey).trim())
        ? Number(rawPeriodKey)
        : now.getFullYear();
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    const prevStartDate = new Date(year - 1, 0, 1, 0, 0, 0, 0);
    const prevEndDate = new Date(year - 1, 11, 31, 23, 59, 59, 999);
    return {
      periodType: "year",
      periodKey: String(year),
      label: `Year ${year}`,
      startDate,
      endDate,
      prevPeriodKey: String(year - 1),
      prevStartDate,
      prevEndDate,
    };
  }

  if (normalizedType === "week") {
    let isoYear = now.getFullYear();
    let isoWeek = getISOWeekInfo(now).week;
    const match = String(rawPeriodKey)
      .trim()
      .match(/^(\d{4})-W(\d{1,2})$/i);
    if (match) {
      isoYear = Number(match[1]);
      isoWeek = Math.max(1, Math.min(53, Number(match[2])));
    } else {
      const currentIso = getISOWeekInfo(now);
      isoYear = currentIso.year;
      isoWeek = currentIso.week;
    }

    const startDate = getStartOfISOWeek(isoYear, isoWeek);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - 7);
    const prevEndDate = new Date(prevStartDate);
    prevEndDate.setDate(prevStartDate.getDate() + 6);
    prevEndDate.setHours(23, 59, 59, 999);
    const prevIso = getISOWeekInfo(prevStartDate);

    const periodKey = `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
    return {
      periodType: "week",
      periodKey,
      label: `Week ${isoWeek}, ${isoYear} (${formatShortDate(
        startDate
      )} – ${formatShortDate(endDate)})`,
      startDate,
      endDate,
      prevPeriodKey: prevIso.weekKey,
      prevStartDate,
      prevEndDate,
    };
  }

  // Default: "month"
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  const match = String(rawPeriodKey)
    .trim()
    .match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    year = Number(match[1]);
    month = Math.max(1, Math.min(12, Number(match[2])));
  }

  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const prevDate = new Date(year, month - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth() + 1;
  const prevStartDate = new Date(prevYear, prevMonth - 1, 1, 0, 0, 0, 0);
  const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

  const periodKey = `${year}-${String(month).padStart(2, "0")}`;
  const prevPeriodKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

  return {
    periodType: "month",
    periodKey,
    label: `${MONTH_NAMES[month - 1]} ${year}`,
    startDate,
    endDate,
    prevPeriodKey,
    prevStartDate,
    prevEndDate,
  };
}

function computeBreakdowns(incomes = [], expenses = []) {
  const totalIncome = incomes.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const totalExpense = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Number((((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1))
      : 0;

  const catMap = {};
  for (const exp of expenses) {
    const cat = (exp.category || "Uncategorized").trim();
    if (!catMap[cat]) {
      catMap[cat] = { category: cat, amount: 0, count: 0 };
    }
    catMap[cat].amount += Number(exp.amount) || 0;
    catMap[cat].count += 1;
  }

  const categoryBreakdown = Object.values(catMap)
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      percentage:
        totalExpense > 0
          ? Number(((item.amount / totalExpense) * 100).toFixed(1))
          : 0,
    }));

  const incMap = {};
  for (const inc of incomes) {
    const src = (inc.source || "Other").trim();
    if (!incMap[src]) {
      incMap[src] = { source: src, amount: 0, count: 0 };
    }
    incMap[src].amount += Number(inc.amount) || 0;
    incMap[src].count += 1;
  }

  const incomeBreakdown = Object.values(incMap)
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      percentage:
        totalIncome > 0
          ? Number(((item.amount / totalIncome) * 100).toFixed(1))
          : 0,
    }));

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    categoryBreakdown,
    incomeBreakdown,
  };
}

function buildTimeSeries(periodInfo, incomes = [], expenses = []) {
  const { periodType, startDate, endDate } = periodInfo;

  if (periodType === "year") {
    const year = startDate.getFullYear();
    const buckets = SHORT_MONTH_NAMES.map((mName, idx) => ({
      label: mName,
      fullLabel: `${MONTH_NAMES[idx]} ${year}`,
      monthKey: `${year}-${String(idx + 1).padStart(2, "0")}`,
      income: 0,
      expense: 0,
      net: 0,
    }));

    for (const inc of incomes) {
      const d = new Date(inc.date);
      if (d.getFullYear() === year) {
        buckets[d.getMonth()].income += Number(inc.amount) || 0;
      }
    }
    for (const exp of expenses) {
      const d = new Date(exp.date);
      if (d.getFullYear() === year) {
        buckets[d.getMonth()].expense += Number(exp.amount) || 0;
      }
    }
    for (const b of buckets) {
      b.net = b.income - b.expense;
    }
    return buckets;
  }

  if (periodType === "week") {
    const buckets = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      buckets.push({
        label: DAY_NAMES[i],
        fullLabel: `${DAY_NAMES[i]}, ${formatShortDate(dayDate)}`,
        dateKey: dayDate.toISOString().slice(0, 10),
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    for (const inc of incomes) {
      const d = new Date(inc.date);
      const diff = Math.floor((d - startDate) / 86400000);
      if (diff >= 0 && diff < 7) {
        buckets[diff].income += Number(inc.amount) || 0;
      }
    }
    for (const exp of expenses) {
      const d = new Date(exp.date);
      const diff = Math.floor((d - startDate) / 86400000);
      if (diff >= 0 && diff < 7) {
        buckets[diff].expense += Number(exp.amount) || 0;
      }
    }
    for (const b of buckets) {
      b.net = b.income - b.expense;
    }
    return buckets;
  }

  // "month" -> daily buckets
  const daysInMonth = endDate.getDate();
  const monthShort = SHORT_MONTH_NAMES[startDate.getMonth()];
  const buckets = [];
  for (let day = 1; day <= daysInMonth; day++) {
    buckets.push({
      label: `${day} ${monthShort}`,
      fullLabel: `${day} ${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear()}`,
      day,
      income: 0,
      expense: 0,
      net: 0,
    });
  }

  for (const inc of incomes) {
    const d = new Date(inc.date);
    const dayIdx = d.getDate() - 1;
    if (buckets[dayIdx]) {
      buckets[dayIdx].income += Number(inc.amount) || 0;
    }
  }
  for (const exp of expenses) {
    const d = new Date(exp.date);
    const dayIdx = d.getDate() - 1;
    if (buckets[dayIdx]) {
      buckets[dayIdx].expense += Number(exp.amount) || 0;
    }
  }
  for (const b of buckets) {
    b.net = b.income - b.expense;
  }
  return buckets;
}

async function upsertPeriodSnapshot(userId, periodInfo, incomes, expenses) {
  const {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    categoryBreakdown,
    incomeBreakdown,
  } = computeBreakdowns(incomes, expenses);

  const updated = await PeriodSummary.findOneAndUpdate(
    {
      userId,
      periodType: periodInfo.periodType,
      periodKey: periodInfo.periodKey,
    },
    {
      $set: {
        label: periodInfo.label,
        startDate: periodInfo.startDate,
        endDate: periodInfo.endDate,
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        transactionCount: incomes.length + expenses.length,
        categoryBreakdown,
        incomeBreakdown,
      },
    },
    { new: true, upsert: true }
  );

  return {
    summaryDoc: updated,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    categoryBreakdown,
    incomeBreakdown,
  };
}

exports.syncMonthlySummaryForDate = async (userId, dateInput) => {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const periodInfo = resolvePeriodRange("month", monthKey);
    const [incomes, expenses] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
      Expense.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
    ]);
    await upsertPeriodSnapshot(userId, periodInfo, incomes, expenses);
  } catch (err) {
    console.error("Failed to sync monthly summary:", err.message);
  }
};

exports.getPeriodAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodType = "month", periodKey = "" } = req.query;
    const periodInfo = resolvePeriodRange(periodType, periodKey);

    const [incomes, expenses, prevIncomes, prevExpenses] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
      Expense.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
      Income.find({
        userId,
        date: { $gte: periodInfo.prevStartDate, $lte: periodInfo.prevEndDate },
      }),
      Expense.find({
        userId,
        date: { $gte: periodInfo.prevStartDate, $lte: periodInfo.prevEndDate },
      }),
    ]);

    const {
      summaryDoc,
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      categoryBreakdown,
      incomeBreakdown,
    } = await upsertPeriodSnapshot(userId, periodInfo, incomes, expenses);

    const prevStats = computeBreakdowns(prevIncomes, prevExpenses);

    const expenseChangePercent =
      prevStats.totalExpense > 0
        ? Number(
            (
              ((totalExpense - prevStats.totalExpense) /
                prevStats.totalExpense) *
              100
            ).toFixed(1)
          )
        : null;

    const incomeChangePercent =
      prevStats.totalIncome > 0
        ? Number(
            (
              ((totalIncome - prevStats.totalIncome) / prevStats.totalIncome) *
              100
            ).toFixed(1)
          )
        : null;

    const timeSeriesData = buildTimeSeries(periodInfo, incomes, expenses);

    const combinedTransactions = [
      ...incomes.map((i) => ({ ...i.toObject(), type: "income" })),
      ...expenses.map((e) => ({ ...e.toObject(), type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      periodInfo: {
        periodType: periodInfo.periodType,
        periodKey: periodInfo.periodKey,
        label: periodInfo.label,
        startDate: periodInfo.startDate,
        endDate: periodInfo.endDate,
        prevPeriodKey: periodInfo.prevPeriodKey,
      },
      metrics: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        prevTotalIncome: prevStats.totalIncome,
        prevTotalExpense: prevStats.totalExpense,
        expenseChangePercent,
        incomeChangePercent,
        transactionCount: combinedTransactions.length,
        expenseCount: expenses.length,
        incomeCount: incomes.length,
        topExpenseCategory: categoryBreakdown[0] || null,
      },
      timeSeriesData,
      categoryBreakdown,
      incomeBreakdown,
      transactions: combinedTransactions,
      savedAiSummary:
        summaryDoc?.aiSummary?.executiveSummary ? summaryDoc.aiSummary : null,
    });
  } catch (err) {
    console.error("Error in getPeriodAnalytics:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch period analytics", error: err.message });
  }
};

exports.getMonthlyHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Discover all distinct YYYY-MM buckets across user's expenses and incomes
    const [allExpenses, allIncomes] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }),
      Income.find({ userId }).sort({ date: -1 }),
    ]);

    const monthBucketMap = new Map();
    const ensureBucket = (dateVal) => {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!monthBucketMap.has(mKey)) {
        monthBucketMap.set(mKey, { incomes: [], expenses: [] });
      }
      return monthBucketMap.get(mKey);
    };

    // Always include current month even if empty
    ensureBucket(new Date());

    for (const exp of allExpenses) {
      const bucket = ensureBucket(exp.date);
      if (bucket) bucket.expenses.push(exp);
    }
    for (const inc of allIncomes) {
      const bucket = ensureBucket(inc.date);
      if (bucket) bucket.incomes.push(inc);
    }

    // Materialize/sync each monthly bucket in PeriodSummary
    const syncPromises = [];
    for (const [mKey, data] of monthBucketMap.entries()) {
      const pInfo = resolvePeriodRange("month", mKey);
      syncPromises.push(
        upsertPeriodSnapshot(userId, pInfo, data.incomes, data.expenses)
      );
    }
    await Promise.all(syncPromises);

    const monthlyRecords = await PeriodSummary.find({
      userId,
      periodType: "month",
    }).sort({ periodKey: -1 });

    res.status(200).json({
      months: monthlyRecords.map((doc) => ({
        _id: doc._id,
        periodKey: doc.periodKey,
        label: doc.label,
        totalIncome: doc.totalIncome,
        totalExpense: doc.totalExpense,
        netSavings: doc.netSavings,
        savingsRate: doc.savingsRate,
        transactionCount: doc.transactionCount,
        topCategory: doc.categoryBreakdown?.[0] || null,
        hasAiSummary: Boolean(doc.aiSummary?.executiveSummary),
        aiSpendingStatus: doc.aiSummary?.spendingStatus || null,
        updatedAt: doc.updatedAt,
      })),
    });
  } catch (err) {
    console.error("Error in getMonthlyHistory:", err);
    res
      .status(500)
      .json({ message: "Failed to load monthly history", error: err.message });
  }
};

exports.generateAiSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { periodType = "month", periodKey = "" } = req.body;

    const apiKey =
      req.headers["x-gemini-api-key"] ||
      req.body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        message:
          "Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env or set your key in the AI Insights settings modal.",
        missingApiKey: true,
      });
    }

    const periodInfo = resolvePeriodRange(periodType, periodKey);

    const [incomes, expenses, prevIncomes, prevExpenses] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
      Expense.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
      Income.find({
        userId,
        date: { $gte: periodInfo.prevStartDate, $lte: periodInfo.prevEndDate },
      }),
      Expense.find({
        userId,
        date: { $gte: periodInfo.prevStartDate, $lte: periodInfo.prevEndDate },
      }),
    ]);

    const {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      categoryBreakdown,
      incomeBreakdown,
    } = await upsertPeriodSnapshot(userId, periodInfo, incomes, expenses);

    const prevStats = computeBreakdowns(prevIncomes, prevExpenses);

    const promptData = {
      period: {
        type: periodInfo.periodType,
        key: periodInfo.periodKey,
        label: periodInfo.label,
      },
      currentPeriodMetrics: {
        totalIncomeINR: totalIncome,
        totalExpenseINR: totalExpense,
        netSavingsINR: netSavings,
        savingsRatePercent: savingsRate,
        expenseTransactionCount: expenses.length,
        incomeTransactionCount: incomes.length,
      },
      previousPeriodComparison: {
        previousPeriodKey: periodInfo.prevPeriodKey,
        previousIncomeINR: prevStats.totalIncome,
        previousExpenseINR: prevStats.totalExpense,
        previousNetSavingsINR: prevStats.netSavings,
      },
      expenseCategories: categoryBreakdown,
      incomeSources: incomeBreakdown,
      recentExpensesSample: expenses.slice(0, 25).map((e) => ({
        category: e.category,
        amountINR: e.amount,
        date: new Date(e.date).toISOString().slice(0, 10),
      })),
    };

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction:
        "You are FinTrack AI, an expert personal finance analyst. Analyze the user's financial data for the specified period (week, month, or year) and return a deeply insightful, practical, and encouraging financial summary in Indian Rupees (₹). If there are zero transactions in the period, note that no transactions were recorded yet and provide helpful guidance on getting started.",
      input: `Analyze this financial dataset for ${periodInfo.label} (${periodInfo.periodType} view) and generate a structured summary:\n\n${JSON.stringify(
        promptData,
        null,
        2
      )}`,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            executiveSummary: {
              type: "string",
              description:
                "A concise 2-3 sentence executive summary of the user's income, spending, and net savings for this period.",
            },
            spendingStatus: {
              type: "string",
              enum: ["healthy", "moderate", "overspending"],
              description:
                "Overall spending health assessment based on savings rate and expense trends.",
            },
            keyInsights: {
              type: "array",
              items: { type: "string" },
              description:
                "3 to 5 specific, data-backed bullet points highlighting trends, period-over-period changes, or notable patterns.",
            },
            categoryAnalysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  observation: { type: "string" },
                  recommendation: { type: "string" },
                },
                required: ["category", "observation", "recommendation"],
              },
              description:
                "Breakdown of top spending categories with observations and actionable recommendations.",
            },
            savingTips: {
              type: "array",
              items: { type: "string" },
              description:
                "3 concrete, actionable tips tailored to the user's categories to optimize savings.",
            },
            nextPeriodForecast: {
              type: "string",
              description:
                "A forward-looking projection or target budget recommendation for the next week/month/year.",
            },
          },
          required: [
            "executiveSummary",
            "spendingStatus",
            "keyInsights",
            "categoryAnalysis",
            "savingTips",
            "nextPeriodForecast",
          ],
        },
      },
    });

    const parsedSummary = JSON.parse(interaction.output_text);

    const aiSummaryPayload = {
      ...parsedSummary,
      interactionId: interaction.id || null,
      generatedAt: new Date(),
    };

    await PeriodSummary.findOneAndUpdate(
      {
        userId,
        periodType: periodInfo.periodType,
        periodKey: periodInfo.periodKey,
      },
      {
        $set: {
          aiSummary: aiSummaryPayload,
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      aiSummary: aiSummaryPayload,
      periodInfo: {
        periodType: periodInfo.periodType,
        periodKey: periodInfo.periodKey,
        label: periodInfo.label,
      },
    });
  } catch (err) {
    console.error("Error generating Gemini AI summary:", err);
    res.status(500).json({
      message:
        err.message || "Failed to generate AI summary with Gemini API.",
    });
  }
};

exports.askAiAssistant = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      periodType = "month",
      periodKey = "",
      question,
      previousInteractionId,
    } = req.body;

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: "Question is required." });
    }

    const apiKey =
      req.headers["x-gemini-api-key"] ||
      req.body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        message:
          "Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env or set your key in the AI Insights settings modal.",
        missingApiKey: true,
      });
    }

    const periodInfo = resolvePeriodRange(periodType, periodKey);
    const [incomes, expenses] = await Promise.all([
      Income.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
      Expense.find({
        userId,
        date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
      }).sort({ date: -1 }),
    ]);

    const stats = computeBreakdowns(incomes, expenses);
    const contextSummary = {
      period: periodInfo.label,
      totalIncomeINR: stats.totalIncome,
      totalExpenseINR: stats.totalExpense,
      netSavingsINR: stats.netSavings,
      savingsRatePercent: stats.savingsRate,
      topCategories: stats.categoryBreakdown.slice(0, 8),
      incomeSources: stats.incomeBreakdown.slice(0, 5),
      transactionsSample: expenses.slice(0, 15).map((e) => ({
        category: e.category,
        amountINR: e.amount,
        date: new Date(e.date).toISOString().slice(0, 10),
      })),
    };

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction =
      "You are FinTrack AI, a helpful personal finance assistant. Answer the user's question concisely (under 150 words) using their actual period financial data in Indian Rupees (₹). Use clear bullet points where helpful.";

    const inputPrompt = `User's financial context for ${periodInfo.label}:\n${JSON.stringify(
      contextSummary
    )}\n\nUser Question: ${question}`;

    let interaction;
    try {
      const requestParams = {
        model: "gemini-3.8-flash",
        system_instruction: systemInstruction,
        input: inputPrompt,
      };
      if (previousInteractionId) {
        requestParams.previous_interaction_id = previousInteractionId;
      }
      interaction = await ai.interactions.create(requestParams);
    } catch (firstErr) {
      // Fallback without previous_interaction_id if the prior interaction expired
      if (previousInteractionId) {
        interaction = await ai.interactions.create({
          model: "gemini-3.8-flash",
          system_instruction: systemInstruction,
          input: inputPrompt,
        });
      } else {
        throw firstErr;
      }
    }

    res.status(200).json({
      answer: interaction.output_text,
      interactionId: interaction.id || null,
    });
  } catch (err) {
    console.error("Error in askAiAssistant:", err);
    res.status(500).json({
      message: err.message || "Failed to get response from Gemini AI.",
    });
  }
};

