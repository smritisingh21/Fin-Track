const Income = require("../models/income.js");
const Expense = require("../models/expenses.js");
const { Types } = require("mongoose");
const { resolvePeriodRange } = require("./analyticsController");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjId = new Types.ObjectId(String(userId));
    const { periodType = "all", periodKey, date, week, month, year } = req.query;

    if (["date", "week", "month", "year"].includes(periodType)) {
      const rawKey = periodKey || date || week || month || year || "";
      const periodInfo = resolvePeriodRange(periodType, rawKey);

      const [incomes, expenses] = await Promise.all([
        Income.find({
          userId: userObjId,
          date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
        }).sort({ date: -1 }),
        Expense.find({
          userId: userObjId,
          date: { $gte: periodInfo.startDate, $lte: periodInfo.endDate },
        }).sort({ date: -1 }),
      ]);

      const totalIncome = incomes.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      const totalExpense = expenses.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      );
      const totalBalance = totalIncome - totalExpense;

      const recentTransactions = [
        ...incomes.slice(0, 10).map((txn) => ({
          ...txn.toObject(),
          type: "income",
        })),
        ...expenses.slice(0, 10).map((txn) => ({
          ...txn.toObject(),
          type: "expense",
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.status(200).json({
        filterInfo: {
          periodType: periodInfo.periodType,
          periodKey: periodInfo.periodKey,
          label: periodInfo.label,
          startDate: periodInfo.startDate,
          endDate: periodInfo.endDate,
        },
        totalBalance,
        totalIncome,
        totalExpense,
        last30daysExpense: {
          total: totalExpense,
          transactions: expenses,
        },
        last60daysIncome: {
          total: totalIncome,
          transactions: incomes,
        },
        recentTransactions,
      });
    }

    // Default: "all" (All Time)
    const [totalIncomeAgg, totalExpenseAgg] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const allIncome = totalIncomeAgg[0]?.total || 0;
    const allExpense = totalExpenseAgg[0]?.total || 0;

    // income transactions in the last 60 days
    const last60daysIncomeTransactions = await Income.find({
      userId: userObjId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const incomeLast60days = last60daysIncomeTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // expense transactions for the last 30 days
    const last30daysExpenseTransactions = await Expense.find({
      userId: userObjId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const expenseLast30days = last30daysExpenseTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // last 5 transactions (income + expense)
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
