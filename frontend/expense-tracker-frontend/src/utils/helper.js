import moment from "moment";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }
  return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
  if (num == null || isNaN(num)) return "0";

  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    label: item?.category || "Other",
    amount: Number(item?.amount) || 0,
  }));
};

export const prepareIncomeBarChartData = (data = []) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = sortedData.map((item) => ({
    month: moment(item.date).format("Do MMM "),
    amount: item?.amount,
    source: item?.source,
  }));
  return chartData;
};

export const prepareExpenseLineChartData = (data = []) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sortedData.map((item) => ({
    month: moment(item.date).format("Do MMM "),
    amount: item?.amount,
    category: item?.category,
  }));
  return chartData;
};

export const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

export const getCurrentWeekString = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

export const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getCurrentYearString = () => {
  return String(new Date().getFullYear());
};

export const getIsoWeekString = (dateInput = new Date()) => {
  return getCurrentWeekString(dateInput);
};

export const shiftPeriod = (periodType, currentVal, delta) => {
  if (periodType === "day" || periodType === "date") {
    const parts = (currentVal || getTodayString()).split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }
  if (periodType === "week") {
    const match = String(currentVal || getCurrentWeekString()).match(/^(\d{4})-W(\d{1,2})$/i);
    let y = match ? Number(match[1]) : new Date().getFullYear();
    let w = match ? Number(match[2]) : 1;
    w += delta;
    if (w < 1) {
      y -= 1;
      w = 52;
    } else if (w > 52) {
      y += 1;
      w = 1;
    }
    return `${y}-W${String(w).padStart(2, "0")}`;
  }
  if (periodType === "month") {
    const match = String(currentVal || getCurrentMonthString()).match(/^(\d{4})-(\d{1,2})$/);
    const y = match ? Number(match[1]) : new Date().getFullYear();
    const m = match ? Number(match[2]) : new Date().getMonth() + 1;
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (periodType === "year") {
    const y = Number(currentVal || getCurrentYearString()) || new Date().getFullYear();
    return String(y + delta);
  }
  return currentVal;
};

export const filterTransactionsByPeriod = (transactions = [], periodType = "month", periodValue = "") => {
  if (!Array.isArray(transactions)) return [];
  if (periodType === "all") return transactions;

  return transactions.filter((item) => {
    const d = new Date(item.date);
    if (isNaN(d.getTime())) return false;

    if (periodType === "day" || periodType === "date") {
      const targetDate = periodValue || getTodayString();
      const itemDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      return itemDateStr === targetDate;
    }

    if (periodType === "week") {
      const targetWeek = periodValue || getCurrentWeekString();
      return getIsoWeekString(d) === targetWeek;
    }

    if (periodType === "month") {
      const targetMonth = periodValue || getCurrentMonthString();
      const itemMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return itemMonthStr === targetMonth;
    }

    if (periodType === "year") {
      const targetYear = String(periodValue || getCurrentYearString());
      return String(d.getFullYear()) === targetYear;
    }

    return true;
  });
};

export const formatPeriodLabel = (periodType = "month", periodValue = "") => {
  if (periodType === "all") return "All Time";

  if (periodType === "day" || periodType === "date") {
    const val = periodValue || getTodayString();
    return moment(val).format("Do MMMM YYYY");
  }

  if (periodType === "week") {
    const val = periodValue || getCurrentWeekString();
    const match = String(val).match(/^(\d{4})-W(\d{1,2})$/i);
    if (match) {
      return `Week ${match[2]}, ${match[1]}`;
    }
    return val;
  }

  if (periodType === "month") {
    const val = periodValue || getCurrentMonthString();
    return moment(val, "YYYY-MM").format("MMMM YYYY");
  }

  if (periodType === "year") {
    return `Year ${periodValue || getCurrentYearString()}`;
  }

  return periodValue;
};
