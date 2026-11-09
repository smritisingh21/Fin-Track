import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  LuSparkles,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuKeyRound,
  LuRefreshCw,
  LuTrendingUp,
  LuTrendingDown,
  LuWalletMinimal,
  LuHandCoins,
  LuPiggyBank,
  LuSend,
  LuCheck,
  LuTriangleAlert,
  LuLightbulb,
  LuFolderArchive,
} from "react-icons/lu";
import { RiLoader2Fill } from "react-icons/ri";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/layouts/Modal";
import { CustomPieChart } from "../../components/charts/CustomPieChart";
import ThemeContext from "../../context/ThemeContext";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { addThousandsSeparator } from "../../utils/helper";

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentYearKey() {
  return String(new Date().getFullYear());
}

function getCurrentWeekKey(dateInput = new Date()) {
  const date = new Date(dateInput);
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function shiftPeriodKey(periodType, periodKey, delta) {
  if (periodType === "year") {
    const y = Number(periodKey) || new Date().getFullYear();
    return String(y + delta);
  }
  if (periodType === "month") {
    const match = String(periodKey).match(/^(\d{4})-(\d{1,2})$/);
    const y = match ? Number(match[1]) : new Date().getFullYear();
    const m = match ? Number(match[2]) : new Date().getMonth() + 1;
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (periodType === "week") {
    const match = String(periodKey).match(/^(\d{4})-W(\d{1,2})$/i);
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
  return periodKey;
}

const PIE_COLORS = [
  "#875cf5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

export default function Insights() {
  useUserAuth();
  const { isDark } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = searchParams.get("periodType") || "month";
  const initialKey =
    searchParams.get("periodKey") ||
    (initialType === "year"
      ? getCurrentYearKey()
      : initialType === "week"
      ? getCurrentWeekKey()
      : getCurrentMonthKey());

  const [periodType, setPeriodType] = useState(initialType);
  const [periodKey, setPeriodKey] = useState(initialKey);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Follow-up Q&A state
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [askingChat, setAskingChat] = useState(false);
  const [lastInteractionId, setLastInteractionId] = useState(null);

  // API Key Modal state
  const [openKeyModal, setOpenKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(
    () => localStorage.getItem("gemini_api_key") || ""
  );
  const [hasCustomKey, setHasCustomKey] = useState(() =>
    Boolean(localStorage.getItem("gemini_api_key"))
  );

  const handlePeriodTypeChange = (newType) => {
    setPeriodType(newType);
    let defaultKey = getCurrentMonthKey();
    if (newType === "year") defaultKey = getCurrentYearKey();
    if (newType === "week") defaultKey = getCurrentWeekKey();
    setPeriodKey(defaultKey);
    setSearchParams({ periodType: newType, periodKey: defaultKey });
  };

  const handlePeriodKeyChange = (newKey) => {
    if (!newKey) return;
    setPeriodKey(newKey);
    setSearchParams({ periodType, periodKey: newKey });
  };

  const fetchPeriodAnalytics = async (type = periodType, key = periodKey) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ANALYTICS.GET_PERIOD}?periodType=${encodeURIComponent(
          type
        )}&periodKey=${encodeURIComponent(key)}`
      );
      if (response.data) {
        setAnalyticsData(response.data);
        setLastInteractionId(
          response.data.savedAiSummary?.interactionId || null
        );
      }
    } catch (err) {
      console.error("Failed to fetch period analytics:", err);
      toast.error("Could not load analytics for the selected period.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyHistory = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ANALYTICS.GET_MONTHLY_HISTORY
      );
      if (response.data?.months) {
        setMonthlyHistory(response.data.months);
      }
    } catch (err) {
      console.error("Failed to load monthly history:", err);
    }
  };

  useEffect(() => {
    fetchPeriodAnalytics(periodType, periodKey);
    setChatHistory([]);
  }, [periodType, periodKey]);

  useEffect(() => {
    fetchMonthlyHistory();
  }, []);

  const handleGenerateAiSummary = async () => {
    if (generatingAi) return;
    setGeneratingAi(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.ANALYTICS.GENERATE_AI_SUMMARY,
        {
          periodType,
          periodKey,
        }
      );
      if (response.data?.aiSummary) {
        setAnalyticsData((prev) =>
          prev
            ? {
                ...prev,
                savedAiSummary: response.data.aiSummary,
              }
            : prev
        );
        setLastInteractionId(response.data.aiSummary.interactionId || null);
        toast.success("Gemini AI summary generated & saved!");
        fetchMonthlyHistory();
      }
    } catch (err) {
      if (err.response?.data?.missingApiKey) {
        setOpenKeyModal(true);
        toast.error("Please configure your Gemini API key to generate insights.");
      } else {
        toast.error(
          err.response?.data?.message ||
            "Failed to generate Gemini AI summary."
        );
      }
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleAskGemini = async (customPrompt) => {
    const q = (customPrompt ?? chatQuestion).trim();
    if (!q || askingChat) return;

    setAskingChat(true);
    if (!customPrompt) setChatQuestion("");

    const userMsg = { role: "user", text: q };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const response = await axiosInstance.post(
        API_PATHS.ANALYTICS.ASK_AI_CHAT,
        {
          periodType,
          periodKey,
          question: q,
          previousInteractionId: lastInteractionId,
        }
      );

      if (response.data?.answer) {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", text: response.data.answer },
        ]);
        if (response.data.interactionId) {
          setLastInteractionId(response.data.interactionId);
        }
      }
    } catch (err) {
      if (err.response?.data?.missingApiKey) {
        setOpenKeyModal(true);
        toast.error("Please configure your Gemini API key first.");
      } else {
        toast.error(
          err.response?.data?.message || "Failed to get answer from Gemini AI."
        );
      }
    } finally {
      setAskingChat(false);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem("gemini_api_key", trimmed);
      setHasCustomKey(true);
      toast.success("Gemini API Key saved to browser storage.");
    } else {
      localStorage.removeItem("gemini_api_key");
      setHasCustomKey(false);
      toast.success("Removed custom API key (using backend .env key if set).");
    }
    setOpenKeyModal(false);
  };

  const pieChartData = useMemo(() => {
    if (!analyticsData?.categoryBreakdown) return [];
    return analyticsData.categoryBreakdown.map((item) => ({
      name: item.category,
      amount: item.amount,
    }));
  }, [analyticsData]);

  const metrics = analyticsData?.metrics || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    expenseChangePercent: null,
    incomeChangePercent: null,
    transactionCount: 0,
    topExpenseCategory: null,
  };

  const aiSummary = analyticsData?.savedAiSummary || null;

  const statusBadgeStyle = (status) => {
    if (status === "healthy") {
      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    }
    if (status === "overspending") {
      return "bg-rose-500/15 text-rose-500 border-rose-500/30";
    }
    return "bg-amber-500/15 text-amber-500 border-amber-500/30";
  };

  return (
    <DashboardLayout activeMenu="AI Insights">
      <div className="my-5 mx-auto space-y-6 pb-10">
        {/* Top Control Bar: Period Mode & Picker */}
        <div
          className={`${
            isDark ? "card-dark" : "card"
          } flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-purple-600/15 text-purple-500">
                <LuSparkles size={20} />
              </span>
              <h4
                className={`text-xl font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                AI Financial Insights & Period Analytics
              </h4>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Explore stored monthly records, weekly/monthly/yearly charts, and
              Gemini AI-powered expense summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Week / Month / Year Switcher */}
            <div
              className={`inline-flex rounded-xl p-1 border ${
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              {[
                { id: "week", label: "Week" },
                { id: "month", label: "Month" },
                { id: "year", label: "Year" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handlePeriodTypeChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    periodType === tab.id
                      ? "bg-purple-600 text-white shadow-sm"
                      : isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Period Navigator */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  handlePeriodKeyChange(
                    shiftPeriodKey(periodType, periodKey, -1)
                  )
                }
                title="Previous Period"
                className={`p-2 rounded-lg border cursor-pointer ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LuChevronLeft size={16} />
              </button>

              {periodType === "month" && (
                <input
                  type="month"
                  value={periodKey}
                  onChange={(e) => handlePeriodKeyChange(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${
                    isDark
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
              )}

              {periodType === "week" && (
                <input
                  type="week"
                  value={periodKey}
                  onChange={(e) => handlePeriodKeyChange(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${
                    isDark
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                />
              )}

              {periodType === "year" && (
                <select
                  value={periodKey}
                  onChange={(e) => handlePeriodKeyChange(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${
                    isDark
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                  }`}
                >
                  {Array.from({ length: 7 }, (_, i) => {
                    const y = new Date().getFullYear() - 4 + i;
                    return (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              )}

              <button
                onClick={() =>
                  handlePeriodKeyChange(
                    shiftPeriodKey(periodType, periodKey, 1)
                  )
                }
                title="Next Period"
                className={`p-2 rounded-lg border cursor-pointer ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LuChevronRight size={16} />
              </button>
            </div>

            {/* Gemini API Key Settings Button */}
            <button
              onClick={() => setOpenKeyModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition ${
                isDark
                  ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                  : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <LuKeyRound size={14} className="text-purple-500" />
              <span>API Key</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  hasCustomKey ? "bg-emerald-500" : "bg-gray-400"
                }`}
                title={
                  hasCustomKey
                    ? "Custom Gemini key active"
                    : "Using server .env key"
                }
              />
            </button>
          </div>
        </div>

        {/* Stored Months Quick Bar */}
        {monthlyHistory.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-medium text-gray-400 flex items-center gap-1 shrink-0">
              <LuCalendar size={13} /> Stored Months:
            </span>
            {monthlyHistory.slice(0, 8).map((m) => {
              const isSelected =
                periodType === "month" && periodKey === m.periodKey;
              return (
                <button
                  key={m.periodKey}
                  onClick={() => {
                    setPeriodType("month");
                    setPeriodKey(m.periodKey);
                    setSearchParams({
                      periodType: "month",
                      periodKey: m.periodKey,
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 flex items-center gap-1.5 cursor-pointer transition ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600"
                      : isDark
                      ? "bg-gray-900 text-gray-300 border-gray-800 hover:border-gray-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span>{m.label}</span>
                  {m.hasAiSummary && (
                    <LuSparkles
                      size={11}
                      className={
                        isSelected ? "text-yellow-200" : "text-purple-500"
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {loading || !analyticsData ? (
          <div className="flex justify-center items-center gap-3 py-24">
            <div
              className={`animate-spin ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              <RiLoader2Fill size={36} />
            </div>
            <span className={isDark ? "text-white" : "text-black"}>
              Loading {periodType} insights...
            </span>
          </div>
        ) : (
          <>
            {/* Active Period Banner & KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Period Income */}
              <div className={isDark ? "card-dark" : "card"}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    {analyticsData.periodInfo?.label} Income
                  </span>
                  <span className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500">
                    <LuWalletMinimal size={18} />
                  </span>
                </div>
                <h3
                  className={`text-2xl font-bold mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  ₹{addThousandsSeparator(metrics.totalIncome)}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {metrics.incomeChangePercent !== null ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        metrics.incomeChangePercent >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {metrics.incomeChangePercent >= 0 ? (
                        <LuTrendingUp size={13} />
                      ) : (
                        <LuTrendingDown size={13} />
                      )}
                      {Math.abs(metrics.incomeChangePercent)}% vs prev{" "}
                      {periodType}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {metrics.incomeCount} income entries
                    </span>
                  )}
                </div>
              </div>

              {/* Period Expense */}
              <div className={isDark ? "card-dark" : "card"}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    {analyticsData.periodInfo?.label} Expenses
                  </span>
                  <span className="p-2 rounded-lg bg-rose-500/15 text-rose-500">
                    <LuHandCoins size={18} />
                  </span>
                </div>
                <h3
                  className={`text-2xl font-bold mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  ₹{addThousandsSeparator(metrics.totalExpense)}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {metrics.expenseChangePercent !== null ? (
                    <span
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        metrics.expenseChangePercent <= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {metrics.expenseChangePercent > 0 ? (
                        <LuTrendingUp size={13} />
                      ) : (
                        <LuTrendingDown size={13} />
                      )}
                      {Math.abs(metrics.expenseChangePercent)}% vs prev{" "}
                      {periodType}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {metrics.expenseCount} expense entries
                    </span>
                  )}
                </div>
              </div>

              {/* Net Savings */}
              <div className={isDark ? "card-dark" : "card"}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    Net Savings ({periodType})
                  </span>
                  <span className="p-2 rounded-lg bg-cyan-500/15 text-cyan-500">
                    <LuPiggyBank size={18} />
                  </span>
                </div>
                <h3
                  className={`text-2xl font-bold mt-2 ${
                    metrics.netSavings >= 0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {metrics.netSavings < 0 ? "-" : ""}₹
                  {addThousandsSeparator(Math.abs(metrics.netSavings))}
                </h3>
                <p className="mt-2 text-xs text-gray-400">
                  {metrics.transactionCount} total transactions in period
                </p>
              </div>

              {/* Savings Rate & Top Category */}
              <div className={isDark ? "card-dark" : "card"}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">
                    Savings Rate & Top Spend
                  </span>
                  <span className="p-2 rounded-lg bg-purple-500/15 text-purple-500">
                    <LuSparkles size={18} />
                  </span>
                </div>
                <h3
                  className={`text-2xl font-bold mt-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {metrics.savingsRate}%
                </h3>
                <p className="mt-2 text-xs text-gray-400 truncate">
                  {metrics.topExpenseCategory
                    ? `Top: ${metrics.topExpenseCategory.category} (₹${addThousandsSeparator(
                        metrics.topExpenseCategory.amount
                      )})`
                    : "No expenses in this period"}
                </p>
              </div>
            </div>

            {/* Gemini AI Summary & Insights Section */}
            <div
              className={`${
                isDark ? "card-dark" : "card"
              } border-l-4 border-l-purple-600`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200/40 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600/15 text-purple-500 flex items-center gap-1">
                      <LuSparkles size={13} /> Gemini AI Summary
                    </span>
                    <h5
                      className={`text-lg font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {analyticsData.periodInfo?.label} Financial Intelligence
                    </h5>
                    {aiSummary?.spendingStatus && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusBadgeStyle(
                          aiSummary.spendingStatus
                        )}`}
                      >
                        {aiSummary.spendingStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Powered by Google Gemini (gemini-3.8-flash) — analyzes your{" "}
                    {periodType} income, category distribution, and period-over-period trends.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAiSummary}
                  disabled={generatingAi}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer transition shrink-0"
                >
                  {generatingAi ? (
                    <>
                      <RiLoader2Fill className="animate-spin" size={16} />
                      <span>Analyzing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <LuRefreshCw size={14} />
                      <span>
                        {aiSummary
                          ? `Regenerate ${periodType} Summary`
                          : `Generate ${periodType} AI Summary`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {!aiSummary ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-500 flex items-center justify-center mx-auto">
                    <LuSparkles size={24} />
                  </div>
                  <h6
                    className={`text-sm font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    No AI Summary Generated for{" "}
                    {analyticsData.periodInfo?.label} Yet
                  </h6>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Click &ldquo;Generate {periodType} AI Summary&rdquo; above
                    to let Gemini analyze your expenses, highlight spending
                    patterns, and save the report to your monthly vault.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-6">
                  {/* Executive Summary */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark
                        ? "bg-gray-900/70 border-gray-800 text-gray-200"
                        : "bg-purple-50/50 border-purple-100 text-gray-800"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-500 mb-1">
                      Executive Summary
                    </p>
                    <p className="text-sm leading-relaxed">
                      {aiSummary.executiveSummary}
                    </p>
                  </div>

                  {/* Key Insights & Saving Tips */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div
                      className={`p-4 rounded-xl border ${
                        isDark
                          ? "bg-gray-900/40 border-gray-800"
                          : "bg-gray-50/70 border-gray-200/70"
                      }`}
                    >
                      <h6
                        className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <LuTrendingUp className="text-cyan-500" size={16} />
                        Key Spending Insights
                      </h6>
                      <ul className="space-y-2">
                        {(aiSummary.keyInsights || []).map((insight, idx) => (
                          <li
                            key={idx}
                            className={`text-xs flex items-start gap-2 leading-relaxed ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <LuCheck
                              size={14}
                              className="text-cyan-500 shrink-0 mt-0.5"
                            />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={`p-4 rounded-xl border ${
                        isDark
                          ? "bg-gray-900/40 border-gray-800"
                          : "bg-gray-50/70 border-gray-200/70"
                      }`}
                    >
                      <h6
                        className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <LuLightbulb className="text-amber-500" size={16} />
                        Actionable Saving Tips
                      </h6>
                      <ul className="space-y-2">
                        {(aiSummary.savingTips || []).map((tip, idx) => (
                          <li
                            key={idx}
                            className={`text-xs flex items-start gap-2 leading-relaxed ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Category Analysis Grid */}
                  {aiSummary.categoryAnalysis?.length > 0 && (
                    <div>
                      <h6
                        className={`text-sm font-semibold mb-3 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Category-by-Category AI Breakdown
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {aiSummary.categoryAnalysis.map((cat, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border ${
                              isDark
                                ? "bg-gray-900/50 border-gray-800"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <span className="text-xs font-bold text-purple-500">
                              {cat.category}
                            </span>
                            <p
                              className={`text-xs mt-1 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {cat.observation}
                            </p>
                            <p className="text-[11px] text-emerald-500 mt-2 font-medium">
                              Tip: {cat.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Forecast Banner */}
                  {aiSummary.nextPeriodForecast && (
                    <div
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        isDark
                          ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}
                    >
                      <LuTriangleAlert
                        size={16}
                        className="text-emerald-500 shrink-0 mt-0.5"
                      />
                      <div className="text-xs">
                        <span className="font-semibold">
                          Next {periodType} Forecast & Target:{" "}
                        </span>
                        <span>{aiSummary.nextPeriodForecast}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ask Gemini Follow-Up Q&A */}
              <div className="mt-6 pt-5 border-t border-gray-200/40 dark:border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-xs font-semibold flex items-center gap-1.5 ${
                      isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    <LuSparkles className="text-purple-500" size={14} />
                    Ask Gemini about {analyticsData.periodInfo?.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "How can I cut 15% of my expenses?",
                      "Which category needs attention?",
                      "Suggest a budget for next month",
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => handleAskGemini(chip)}
                        disabled={askingChat}
                        className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition ${
                          isDark
                            ? "bg-gray-900 border-gray-700 text-gray-300 hover:border-purple-500"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-500"
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {chatHistory.length > 0 && (
                  <div
                    className={`mb-3 max-h-60 overflow-y-auto space-y-2.5 p-3 rounded-xl border ${
                      isDark
                        ? "bg-gray-950/60 border-gray-800"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2.5 rounded-lg whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-purple-600 text-white ml-auto max-w-[80%]"
                            : isDark
                            ? "bg-gray-900 text-gray-200 border border-gray-800 max-w-[90%]"
                            : "bg-white text-gray-800 border border-gray-200 max-w-[90%]"
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskGemini();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder={`Ask anything about your ${analyticsData.periodInfo?.label} expenses...`}
                    className={`flex-1 px-3.5 py-2 rounded-xl border text-xs outline-none ${
                      isDark
                        ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={askingChat || !chatQuestion.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    {askingChat ? (
                      <RiLoader2Fill className="animate-spin" size={14} />
                    ) : (
                      <LuSend size={14} />
                    )}
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Charts Grid: Income vs Expense Trend & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time-Series Bar Chart */}
              <div className={isDark ? "card-dark" : "card"}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h5
                      className={`text-base font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Income vs. Expense Trend ({analyticsData.periodInfo?.label})
                    </h5>
                    <p className="text-xs text-gray-400">
                      {periodType === "year"
                        ? "Monthly breakdown across the year"
                        : periodType === "week"
                        ? "Daily breakdown (Mon – Sun)"
                        : "Daily breakdown across the selected month"}
                    </p>
                  </div>
                </div>

                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.timeSeriesData || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#1f2937" : "#f3f4f6"}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{
                          fontSize: 11,
                          fill: isDark ? "#9ca3af" : "#4b5563",
                        }}
                        stroke="none"
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: isDark ? "#9ca3af" : "#4b5563",
                        }}
                        stroke="none"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#111827" : "#ffffff",
                          borderColor: isDark ? "#374151" : "#e5e7eb",
                          borderRadius: "0.75rem",
                          fontSize: "12px",
                          color: isDark ? "#f9fafb" : "#111827",
                        }}
                        formatter={(value) => [
                          `₹${addThousandsSeparator(value)}`,
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="income"
                        name="Income"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="expense"
                        name="Expense"
                        fill="#ef4444"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie + Progress List */}
              <div className={isDark ? "card-dark" : "card"}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5
                      className={`text-base font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Expense Category Distribution
                    </h5>
                    <p className="text-xs text-gray-400">
                      Where your money went during{" "}
                      {analyticsData.periodInfo?.label}
                    </p>
                  </div>
                </div>

                {pieChartData.length === 0 ? (
                  <div className="py-20 text-center text-xs text-gray-400">
                    No expenses recorded for {analyticsData.periodInfo?.label}.
                  </div>
                ) : (
                  <>
                    <CustomPieChart
                      data={pieChartData}
                      label="Total Spent"
                      totalAmount={addThousandsSeparator(metrics.totalExpense)}
                      colors={PIE_COLORS}
                      showTextAnchor
                    />
                    <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {analyticsData.categoryBreakdown.map((cat, idx) => (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span
                              className={`font-medium flex items-center gap-2 ${
                                isDark ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    PIE_COLORS[idx % PIE_COLORS.length],
                                }}
                              />
                              {cat.category}
                              <span className="text-gray-400 text-[11px]">
                                ({cat.count})
                              </span>
                            </span>
                            <span
                              className={`font-semibold ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              ₹{addThousandsSeparator(cat.amount)}{" "}
                              <span className="text-gray-400 font-normal">
                                ({cat.percentage}%)
                              </span>
                            </span>
                          </div>
                          <div
                            className={`w-full h-1.5 rounded-full overflow-hidden ${
                              isDark ? "bg-gray-800" : "bg-gray-100"
                            }`}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, cat.percentage)}%`,
                                backgroundColor:
                                  PIE_COLORS[idx % PIE_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stored Monthly Data Vault */}
            <div className={isDark ? "card-dark" : "card"}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LuFolderArchive className="text-purple-500" size={18} />
                  <div>
                    <h5
                      className={`text-base font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Stored Monthly Financial Records
                    </h5>
                    <p className="text-xs text-gray-400">
                      Automatically organized & persisted monthly summaries in
                      MongoDB. Click any month to inspect its charts and AI
                      report.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-xs ${
                        isDark
                          ? "border-gray-800 text-gray-400"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      <th className="py-3 px-3">Month</th>
                      <th className="py-3 px-3">Transactions</th>
                      <th className="py-3 px-3">Income</th>
                      <th className="py-3 px-3">Expense</th>
                      <th className="py-3 px-3">Net Savings</th>
                      <th className="py-3 px-3">Top Category</th>
                      <th className="py-3 px-3">AI Report</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/40 dark:divide-gray-800 text-xs">
                    {monthlyHistory.map((m) => (
                      <tr
                        key={m.periodKey}
                        className={`${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold">{m.label}</td>
                        <td className="py-3 px-3 text-gray-400">
                          {m.transactionCount}
                        </td>
                        <td className="py-3 px-3 text-emerald-500 font-medium">
                          ₹{addThousandsSeparator(m.totalIncome)}
                        </td>
                        <td className="py-3 px-3 text-rose-500 font-medium">
                          ₹{addThousandsSeparator(m.totalExpense)}
                        </td>
                        <td
                          className={`py-3 px-3 font-semibold ${
                            m.netSavings >= 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {m.netSavings < 0 ? "-" : ""}₹
                          {addThousandsSeparator(Math.abs(m.netSavings))}
                        </td>
                        <td className="py-3 px-3 text-gray-400">
                          {m.topCategory ? m.topCategory.category : "—"}
                        </td>
                        <td className="py-3 px-3">
                          {m.hasAiSummary ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-purple-500/15 text-purple-500 font-medium">
                              <LuSparkles size={11} /> Saved
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">
                              Not generated
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setPeriodType("month");
                              setPeriodKey(m.periodKey);
                              setSearchParams({
                                periodType: "month",
                                periodKey: m.periodKey,
                              });
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-3 py-1 rounded-lg bg-purple-600/15 text-purple-500 hover:bg-purple-600 hover:text-white font-medium cursor-pointer transition"
                          >
                            View Month
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Gemini API Key Configuration Modal */}
        <Modal
          isOpen={openKeyModal}
          onClose={() => setOpenKeyModal(false)}
          title="Configure Gemini API Key"
        >
          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <p
              className={`text-xs leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Enter your Google Gemini API key from{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-purple-500 underline"
              >
                Google AI Studio
              </a>
              . Your key is stored locally in your browser and sent securely to
              your backend when generating summaries. If you already added{" "}
              <code>GEMINI_API_KEY</code> in <code>backend/.env</code>, you can
              leave this blank.
            </p>
            <div>
              <label
                className={`block text-xs font-medium mb-1 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className={isDark ? "input-box-dark" : "input-box"}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenKeyModal(false)}
                className="px-4 py-2 rounded-lg text-xs border border-gray-400 text-gray-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs bg-purple-600 text-white font-medium cursor-pointer hover:bg-purple-700"
              >
                Save API Key
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

