import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";
import { IoMdCard } from "react-icons/io";
import {
  LuHandCoins,
  LuSparkles,
  LuWalletMinimal,
} from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout.jsx";
import InfoCard from "../../components/cards/InfoCard.jsx";
import { addThousandsSeparator, getCurrentMonthString } from "../../utils/helper.js";
import PeriodFilter from "../../components/PeriodFilter.jsx";
import FinanceOverview from "../../components/dashboard/FinanceOverview.jsx";
import ExpenseTransactions from "../../components/dashboard/ExpenseTransactions.jsx";
import Last30daysExpense from "../../components/dashboard/Last30daysExpense.jsx";
import RecentIncomeWithChart from "../../components/dashboard/RecentIncomeWithChart.jsx";
import RecentIncome from "../../components/dashboard/RecentIncome.jsx";
import RecentTransactions from "../../components/dashboard/RecentTransactions.jsx";
import useUserAuth from "../../hooks/useUserAuth.jsx";
import { RiLoader2Fill } from "react-icons/ri";
import ThemeContext from '../../context/ThemeContext.jsx';

export default function Home() {
  useUserAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useContext(ThemeContext);

  // Period filter state: defaults to "month"
  const [periodType, setPeriodType] = useState("month");
  const [periodValue, setPeriodValue] = useState(getCurrentMonthString);

  const fetchDashboardData = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("periodType", periodType);
      if (periodType !== "all" && periodValue) {
        params.set("periodKey", periodValue);
      }

      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}?${params.toString()}`
      );
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [periodType, periodValue]);

  const activePeriodLabel = dashboardData?.filterInfo?.label || "";

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto space-y-6">

        {/* Quick Gemini AI Insights Banner */}
        <div
          className={`${isDark ? "card-dark" : "card"
            } border-l-4 border-l-purple-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
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
                Generate structured personal finance summaries, category recommendations, saving tips, and forecasts for this {periodType !== "all" ? periodType : "period"}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const pType = periodType === "all" ? "month" : periodType;
                const pKey = periodValue || getCurrentMonthString();
                navigate(`/insights?periodType=${pType}&periodKey=${pKey}`);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer transition"
            >
              <LuSparkles size={14} />
              <span>
                {activePeriodLabel && periodType !== "all"
                  ? `Analyze ${activePeriodLabel} with AI`
                  : "Generate AI Insights"}
              </span>
            </button>
          </div>
        </div>

        {/* Period Filter Bar */}
        <PeriodFilter
          periodType={periodType}
          setPeriodType={setPeriodType}
          periodValue={periodValue}
          setPeriodValue={setPeriodValue}
          showAllTime={true}
        />

        {(!dashboardData || loading) ? (
          <div className="flex justify-center items-center gap-3 py-30">
            <div
              className={`animate-spin ${isDark ? "text-white" : "text-black"}`}
            >
              <RiLoader2Fill size={40} />
            </div>
            <div
              className={`text-center py-20 ${isDark ? "text-white" : "text-black"}`}
            >
              Loading your financial dashboard...
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoCard
                icon={<IoMdCard />}
                label={activePeriodLabel && periodType !== "all" ? `Balance (${activePeriodLabel})` : "Total balance"}
                value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
                color="bg-cyan-700"
              />

              <InfoCard
                icon={<LuWalletMinimal />}
                label={activePeriodLabel && periodType !== "all" ? `Income (${activePeriodLabel})` : "Total Income"}
                value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
                color="bg-emerald-700"
              />

              <InfoCard
                icon={<LuHandCoins />}
                label={activePeriodLabel && periodType !== "all" ? `Expense (${activePeriodLabel})` : "Total Expense"}
                value={addThousandsSeparator(dashboardData?.totalExpense || 0)}
                color="bg-red-700"
              />
            </div>

            {/* Analytics & Charts Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
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
                title={activePeriodLabel && periodType !== "all" ? `Expenses (${activePeriodLabel})` : "Last 30 days expenses"}
                transactions={dashboardData.last30daysExpense?.transactions || []}
              />

              <RecentIncomeWithChart
                title={activePeriodLabel && periodType !== "all" ? `Income (${activePeriodLabel})` : "Last 60 days Income"}
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
