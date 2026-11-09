import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { IoMdCard } from "react-icons/io";
import {
  LuHandCoins,
  LuSparkles,
  LuWalletMinimal,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuFilter,
  LuRotateCcw,
} from "react-icons/lu";
import { addThousandsSeparator } from "../../utils/helper.js";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth.jsx";
import InfoCard from "../../components/cards/InfoCard.jsx";
import RecentTransactions from "../../components/dashboard/RecentTransactions.jsx";
import FinanceOverview from "../../components/dashboard/FinanceOverview.jsx";
import { ExpenseTransactions } from "../../components/dashboard/ExpenseTransactions.jsx";
import { Last30daysExpense } from "../../components/dashboard/Last30daysExpense.jsx";
import RecentIncomeWithChart from "../../components/dashboard/RecentIncomeWithChart.jsx";
import RecentIncome from "../../components/dashboard/RecentIncome.jsx";
import { RiLoader2Fill } from "react-icons/ri";
import ThemeContext from "../../context/ThemeContext.jsx";

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function getCurrentWeekString(dateInput = new Date()) {
  const date = new Date(dateInput);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getCurrentMonthString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentYearString() {
  return String(new Date().getFullYear());
}

function shiftPeriod(periodType, currentVal, delta) {
  if (periodType === "date") {
    const parts = (currentVal || getTodayString()).split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2] + delta);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }
  if (periodType === "week") {
    const match = String(currentVal).match(/^(\d{4})-W(\d{1,2})$/i);
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
    const match = String(currentVal).match(/^(\d{4})-(\d{1,2})$/);
    const y = match ? Number(match[1]) : new Date().getFullYear();
    const m = match ? Number(match[2]) : new Date().getMonth() + 1;
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (periodType === "year") {
    const y = Number(currentVal) || new Date().getFullYear();
    return String(y + delta);
  }
  return currentVal;
}

export default function Home() {
  useUserAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useContext(ThemeContext);

  // Filter state: "all" | "date" | "week" | "month" | "year"
  const [filterMode, setFilterMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState(getTodayString);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekString);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString);
  const [selectedYear, setSelectedYear] = useState(getCurrentYearString);

  const getActivePeriodKey = () => {
    if (filterMode === "date") return selectedDate;
    if (filterMode === "week") return selectedWeek;
    if (filterMode === "month") return selectedMonth;
    if (filterMode === "year") return selectedYear;
    return "";
  };

  const handleShiftPeriod = (delta) => {
    if (filterMode === "date") {
      setSelectedDate((prev) => shiftPeriod("date", prev, delta));
    } else if (filterMode === "week") {
      setSelectedWeek((prev) => shiftPeriod("week", prev, delta));
    } else if (filterMode === "month") {
      setSelectedMonth((prev) => shiftPeriod("month", prev, delta));
    } else if (filterMode === "year") {
      setSelectedYear((prev) => shiftPeriod("year", prev, delta));
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      let queryUrl = API_PATHS.DASHBOARD.GET_DATA;
      if (filterMode !== "all") {
        const key = getActivePeriodKey();
        queryUrl += `?periodType=${encodeURIComponent(
          filterMode
        )}&periodKey=${encodeURIComponent(key)}`;
      }

      const response = await axiosInstance.get(queryUrl);

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please try again", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterMode, selectedDate, selectedWeek, selectedMonth, selectedYear]);

  const filterLabel =
    dashboardData?.filterInfo?.label && filterMode !== "all"
      ? dashboardData.filterInfo.label
      : "";

  return (
    <DashboardLayout activeMenu="Dashboard" mode>
      <div className="my-5 mx-auto space-y-6">

        {/* Quick Gemini AI Insights Banner */}
        <div
          className={`${isDark ? "card-dark" : "card"
            } border-l-4 border-l-purple-600 flex flex-col
             md:flex-row md:items-center md:justify-between gap-4`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-500 mt-0.5">
              <LuSparkles size={20} />
            </div>
            <div>
              <h5
                className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                Gemini AI Financial Intelligence & Reports
              </h5>
              <p className="text-xs text-gray-400 mt-0.5">
                Generate structured personal finance summaries, category recommendations, saving tips, and forecasts for this {filterMode !== "all" ? filterMode : "period"}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const pType = filterMode === "all" ? "month" : filterMode;
                const pKey = getActivePeriodKey() || getCurrentMonthString();
                navigate(`/insights?periodType=${pType}&periodKey=${pKey}`);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
            >
              <LuSparkles size={14} />
              <span>
                {filterLabel ? `Analyze ${filterLabel} with AI` : "Generate AI Insights"}
              </span>
            </button>
          </div>
        </div>


        {/* Analytics Filter Toolbar */}
        <div
          className={`${isDark ? "card-dark" : "card"
            } flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Mode Selector */}
            <div
              className={`inline-flex rounded-xl p-1 border ${isDark
                ? "bg-gray-900 border-gray-800"
                : "bg-gray-100 border-gray-200"
                }`}
            >
              {[
                { id: "all", label: "All" },
                { id: "date", label: "Date" },
                { id: "week", label: "Week" },
                { id: "month", label: "Month" },
                { id: "year", label: "Year" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterMode === tab.id
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

            {/* Dynamic Controls based on selected mode */}
            {filterMode !== "all" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleShiftPeriod(-1)}
                  title="Previous"
                  className={`p-2 rounded-lg border cursor-pointer ${isDark
                    ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <LuChevronLeft size={16} />
                </button>

                {filterMode === "date" && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${isDark
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                      }`}
                  />
                )}

                {filterMode === "week" && (
                  <input
                    type="week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${isDark
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                      }`}
                  />
                )}

                {filterMode === "month" && (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${isDark
                      ? "bg-gray-900 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-800"
                      }`}
                  />
                )}

                {filterMode === "year" && (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${isDark
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
                  onClick={() => handleShiftPeriod(1)}
                  title="Next"
                  className={`p-2 rounded-lg border cursor-pointer ${isDark
                    ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <LuChevronRight size={16} />
                </button>

                {filterMode === "date" && (
                  <button
                    onClick={() => setSelectedDate(getTodayString())}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${isDark
                      ? "bg-gray-900 border-gray-700 text-gray-300 hover:text-white"
                      : "bg-white border-gray-300 text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Today
                  </button>
                )}
              </div>
            )}

            {filterMode !== "all" && (
              <button
                onClick={() => setFilterMode("all")}
                title="Reset to All Time"
                className={`p-2 rounded-lg border text-xs text-gray-400 hover:text-purple-500 cursor-pointer ${isDark ? "border-gray-800 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-100"
                  }`}
              >
                <LuRotateCcw size={15} />
              </button>
            )}
          </div>
        </div>

        {!dashboardData || loading ? (
          <div className="flex justify-center items-center gap-3 py-30">
            <div className={`animate-spin ${isDark ? "text-white" : "text-black"}`}>
              <RiLoader2Fill size={40} />
            </div>
            <div className={`text-center py-20 ${isDark ? "text-white" : "text-black"}`}>
              Loading analytics...
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoCard
                icon={<IoMdCard />}
                label={filterLabel ? `Balance` : "Total balance"}
                value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
                color="bg-cyan-700"
              />

              <InfoCard
                icon={<LuWalletMinimal />}
                label={filterLabel ? `Income` : "Total Income"}
                value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
                color="bg-emerald-700"
              />

              <InfoCard
                icon={<LuHandCoins />}
                label={filterLabel ? `Expense` : "Total Expense"}
                value={addThousandsSeparator(dashboardData?.totalExpense || 0)}
                color="bg-red-700"
              />
            </div>



            {/* Analytics & Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FinanceOverview
                totalBalance={dashboardData?.totalBalance || 0}
                totalIncome={dashboardData?.totalIncome || 0}
                totalExpense={dashboardData?.totalExpense || 0}
              />

              <RecentTransactions
                transactions={dashboardData?.recentTransactions || []}
              />

              <ExpenseTransactions
                transactions={dashboardData.last30daysExpense?.transactions || []}
                onseeMore={() => navigate("/expenses")}
              />

              <Last30daysExpense
                title={
                  filterLabel
                    ? `Expenses (${filterLabel})`
                    : "Last 30 days expenses"
                }
                transactions={dashboardData.last30daysExpense?.transactions || []}
              />

              <RecentIncomeWithChart
                title={
                  filterLabel
                    ? `Income (${filterLabel})`
                    : "Last 60 days Income"
                }
                data={dashboardData.last60daysIncome?.transactions || []}
                totalIncome={dashboardData.totalIncome || 0}
              />

              <RecentIncome
                transactions={dashboardData.last60daysIncome?.transactions || []}
                onseeMore={() => navigate("/income")}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
