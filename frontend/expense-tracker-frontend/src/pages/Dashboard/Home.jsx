import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { IoMdCard } from "react-icons/io"
import { LuHandCoins, LuWalletMinimal } from "react-icons/lu"
import { addThousandsSeparator, getCurrentMonthString } from '../../utils/helper.js';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from "../../hooks/useUserAuth.jsx"
import InfoCard from '../../components/cards/InfoCard.jsx';
import RecentTransactions from '../../components/dashboard/RecentTransactions.jsx';
import FinanceOverview from '../../components/dashboard/FinanceOverview.jsx';
import { ExpenseTransactions } from '../../components/dashboard/ExpenseTransactions.jsx';
import { Last30daysExpense } from '../../components/dashboard/Last30daysExpense.jsx';
import RecentIncomeWithChart from '../../components/dashboard/RecentIncomeWithChart.jsx'
import RecentIncome from '../../components/dashboard/RecentIncome.jsx'
import PeriodFilter from '../../components/PeriodFilter.jsx';
import { RiLoader2Fill } from 'react-icons/ri';
import ThemeContext from '../../context/ThemeContext.jsx';

export default function Home() {

  useUserAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isDark } = useContext(ThemeContext);

  // Period filter state: default is "month"
  const [periodType, setPeriodType] = useState("month");
  const [periodValue, setPeriodValue] = useState(getCurrentMonthString);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const query = `?periodType=${encodeURIComponent(periodType)}&periodKey=${encodeURIComponent(periodValue || '')}`;
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}${query}`
      );

      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Something went wrong. Please Try again", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [periodType, periodValue]);

  const activePeriodLabel = dashboardData?.filterInfo?.label || "";

  return (
    <DashboardLayout activeMenu="Dashboard" mode>
      <div className='my-5 mx-auto space-y-6'>

        {/* Period Filter right above the KPI cards (defaults to Month) */}
        <PeriodFilter
          periodType={periodType}
          setPeriodType={setPeriodType}
          periodValue={periodValue}
          setPeriodValue={setPeriodValue}
          showAllTime={true}
        />

        {(!dashboardData || loading) ? (
          <div className='flex justify-center items-center gap-3 py-30'>
            <div className={`' animate-spin ' ${isDark ? 'text-white' : 'text-black'}`}><RiLoader2Fill size={40} /></div>
            <div className={`' text-center py-20' ${isDark ? 'text-white' : 'text-black'}`}>Loading your dashboard...</div>
          </div>

        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <InfoCard
                icon={<IoMdCard />}
                label={activePeriodLabel && periodType !== "all" ? `Balance` : "Total balance"}
                value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
                color="bg-cyan-700"
              />

              <InfoCard
                icon={<LuWalletMinimal />}
                label={activePeriodLabel && periodType !== "all" ? `Income` : "Total Income"}
                value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
                color="bg-emerald-700"
              />

              <InfoCard icon={<LuHandCoins />}
                label={activePeriodLabel && periodType !== "all" ? `Expense` : "Total Expense"}
                value={addThousandsSeparator(dashboardData?.totalExpense || 0)}
                color="bg-red-700"
              />
            </div>


            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>

              <FinanceOverview
                totalBalance={dashboardData?.totalBalance || 0}
                totalIncome={dashboardData?.totalIncome || 0}
                totalExpense={dashboardData?.totalExpense || 0}
              />
              <RecentTransactions
                transactions={dashboardData?.recentTransactions}
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

  )
}
