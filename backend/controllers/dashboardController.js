const Income = require("../models/income.js");
const Expense = require("../models/expenses.js");
const { Types } = require("mongoose");

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getISOWeekRange(rawWeek) {
  const now = new Date();
  let isoYear = now.getFullYear();
  let isoWeek = 1;
  const match = String(rawWeek).match(/^(\d{4})-W(\d{1,2})$/i);
  if (match) {
    isoYear = Number(match[1]);
    isoWeek = Math.max(1, Math.min(53, Number(match[2])));
  } else {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    isoWeek = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    isoYear = d.getUTCFullYear();
  }

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

  const isoWeekEnd = new Date(isoWeekStart);
  isoWeekEnd.setDate(isoWeekStart.getDate() + 6);
  isoWeekEnd.setHours(23, 59, 59, 999);

  const startLabel = `${isoWeekStart.getDate()} ${SHORT_MONTHS[isoWeekStart.getMonth()]}`;
  const endLabel = `${isoWeekEnd.getDate()} ${SHORT_MONTHS[isoWeekEnd.getMonth()]}`;

  return {
    startDate: isoWeekStart,
    endDate: isoWeekEnd,
    label: `Week ${isoWeek}, ${isoYear} (${startLabel} – ${endLabel})`,
  };
}

function resolvePeriodRange(periodType = "month", rawKey = "") {
  const now = new Date();

  if (periodType === "day" || periodType === "date") {
    let y = now.getFullYear();
    let m = now.getMonth();
    let d = now.getDate();
    const match = String(rawKey).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match) {
      y = Number(match[1]);
      m = Math.max(0, Math.min(11, Number(match[2]) - 1));
      d = Math.max(1, Math.min(31, Number(match[3])));
    }
    const startDate = new Date(y, m, d, 0, 0, 0, 0);
    const endDate = new Date(y, m, d, 23, 59, 59, 999);
    return {
      startDate,
      endDate,
      label: `${d} ${SHORT_MONTHS[m]} ${y}`,
    };
  }

  if (periodType === "week") {
    return getISOWeekRange(rawKey);
  }

  if (periodType === "year") {
    let y = now.getFullYear();
    const match = String(rawKey).match(/^(\d{4})$/);
    if (match) {
      y = Number(match[1]);
    }
    const startDate = new Date(y, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(y, 11, 31, 23, 59, 59, 999);
    return {
      startDate,
      endDate,
      label: `Year ${y}`,
    };
  }

  // Default: month
  let y = now.getFullYear();
  let m = now.getMonth() + 1;
  const match = String(rawKey).match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    y = Number(match[1]);
    m = Math.max(1, Math.min(12, Number(match[2])));
  }
  const startDate = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(y, m, 0, 23, 59, 59, 999);
  return {
    startDate,
    endDate,
    label: `${FULL_MONTHS[m - 1]} ${y}`,
  };
}

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjId = new Types.ObjectId(String(userId));
    const { periodType = "month", periodKey, date, week, month, year } = req.query;

    const normalizedType = ["day", "date", "week", "month", "year"].includes(periodType)
      ? periodType
      : periodType === "all"
      ? "all"
      : "month"; // default to month

    if (normalizedType !== "all") {
      const rawKey = periodKey || date || week || month || year || "";
      const { startDate, endDate, label } = resolvePeriodRange(normalizedType, rawKey);

      const [incomeAgg, expenseAgg, periodIncomes, periodExpenses] = await Promise.all([
        Income.aggregate([
          { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Income.find({
          userId: userObjId,
          date: { $gte: startDate, $lte: endDate },
        }).sort({ date: -1 }),
        Expense.find({
          userId: userObjId,
          date: { $gte: startDate, $lte: endDate },
        }).sort({ date: -1 }),
      ]);

      const totalIncome = incomeAgg[0]?.total || 0;
      const totalExpense = expenseAgg[0]?.total || 0;
      const totalBalance = totalIncome - totalExpense;

      const recentTransactions = [
        ...periodIncomes.slice(0, 5).map((txn) => ({
          ...txn.toObject(),
          type: "income",
        })),
        ...periodExpenses.slice(0, 5).map((txn) => ({
          ...txn.toObject(),
          type: "expense",
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.status(200).json({
        filterInfo: {
          periodType: normalizedType,
          label,
          startDate,
          endDate,
        },
        totalBalance,
        totalIncome,
        totalExpense,
        last30daysExpense: {
          total: totalExpense,
          transactions: periodExpenses,
        },
        last60daysIncome: {
          total: totalIncome,
          transactions: periodIncomes,
        },
        recentTransactions,
      });
    }

    // "all" (All Time)
    const [totalIncome, totalExpense] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const allIncome = totalIncome[0]?.total || 0;
    const allExpense = totalExpense[0]?.total || 0;

    const last60daysIncomeTransactions = await Income.find({
      userId: userObjId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const incomeLast60days = last60daysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const last30daysExpenseTransactions = await Expense.find({
      userId: userObjId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const expenseLast30days = last30daysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const lastTransactions = [
      ...(await Income.find({ userId: userObjId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "income",
        })
      ),
      ...(await Expense.find({ userId: userObjId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "expense",
        })
      ),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      filterInfo: {
        periodType: "all",
        label: "All Time",
      },
      totalBalance: allIncome - allExpense,
      totalIncome: allIncome,
      totalExpense: allExpense,
      last30daysExpense: {
        total: expenseLast30days,
        transactions: last30daysExpenseTransactions,
      },
      last60daysIncome: {
        total: incomeLast60days,
        transactions: last60daysIncomeTransactions,
      },
      recentTransactions: lastTransactions,
    });
  } catch (err) {
    console.error("Error in getDashboardData:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
