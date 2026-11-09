import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import {IoMdCard }from "react-icons/io"
import{LuHandCoins , LuLoaderCircle, LuLoaderPinwheel, LuSparkles, LuWalletMinimal} from "react-icons/lu"
import { addThousandsSeparator } from '../../utils/helper.js';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from "../../hooks/useUserAuth.jsx"
import InfoCard from '../../components/cards/InfoCard.jsx';
import RecentTransactions from '../../components/dashboard/RecentTransactions.jsx';
import FinanceOverview  from '../../components/dashboard/FinanceOverview.jsx';
import { ExpenseTransactions } from '../../components/dashboard/ExpenseTransactions.jsx';
import { Last30daysExpense } from '../../components/dashboard/Last30daysExpense.jsx';
import RecentIncomeWithChart from '../../components/dashboard/RecentIncomeWithChart.jsx'
import RecentIncome from '../../components/dashboard/RecentIncome.jsx'
import { RiLoader2Fill } from 'react-icons/ri';
import ThemeContext from '../../context/ThemeContext.jsx';

export default function Home() {

    useUserAuth();
    const navigate = useNavigate();
    const [dashboardData , setDashboardData] = useState(null);
    const [loading , setLoading] = useState(false);
    const {isDark} = useContext(ThemeContext);
    
    const fetchDashboardData = async () =>{
      if(loading ) return ;
      setLoading(true);

      try{
        const response = await axiosInstance.get(
          `${API_PATHS.DASHBOARD.GET_DATA}`
        );

        if(response.data){
          setDashboardData(response.data);
        }
      }catch(error){
        console.log("Something went wrong.Please Try again" , error);
      }finally{
        setLoading(false);
      }
    }

    useEffect(()=>{
      fetchDashboardData();
      return(() =>{});
    },[])

  return (
    <DashboardLayout activeMenu="Dashboard" mode>
      <div className=' my-5 mx-auto '>
      
      {(!dashboardData || loading) ? (
      <div className='flex justify-center items-center gap-3 py-30'>
        <div className={`' animate-spin ' ${isDark? 'text-white' :'text-black'}`}><RiLoader2Fill size={40} /></div>
         <div className={`' text-center py-20' ${isDark? 'text-white' :'text-black'}`}>Loading your dashboard...</div>
      </div>
       
      ) : (
        <>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <InfoCard 
          icon={<IoMdCard/>}
          label="Total balance"
          value = {addThousandsSeparator(dashboardData?.totalBalance || 0)}
          color = "bg-cyan-700"
          />

          <InfoCard 
          icon={<LuWalletMinimal/>}
          label="Total Income"
          value = {addThousandsSeparator(dashboardData?.totalIncome || 0)}
          color = "bg-emerald-700"
          />

          <InfoCard icon={<LuHandCoins/>}
          label="Total Expense"
          value = {addThousandsSeparator(dashboardData?.totalExpense || 0)}
          color = "bg-red-700"
          />
          </div>

          <div
            className={`mt-6 ${
              isDark ? "card-dark" : "card"
            } border-l-4 border-l-purple-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-500 mt-0.5">
                <LuSparkles size={20} />
              </div>
              <div>
                <h5
                  className={`text-base font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Gemini AI Monthly Summaries & Multi-Period Analytics
                </h5>
                <p className="text-xs text-gray-400 mt-0.5">
                  View stored monthly records, interactive Week / Month / Year
                  charts, and AI-generated spending insights.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate("/insights?periodType=week")}
                className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Weekly View
              </button>
              <button
                onClick={() => navigate("/insights?periodType=year")}
                className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Yearly View
              </button>
              <button
                onClick={() => navigate("/insights?periodType=month")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
              >
                <LuSparkles size={14} />
                <span>Summarize This Month</span>
              </button>
            </div>
          </div>

          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>

          <FinanceOverview 
              totalBalance ={dashboardData?.totalBalance || 0 }
              totalIncome ={dashboardData?.totalIncome || 0 }
              totalExpense ={dashboardData?.totalExpense || 0 }
          />
          <RecentTransactions 
          transactions ={dashboardData?.recentTransactions}
          />


          <ExpenseTransactions 
            transactions={dashboardData.last30daysExpense?.transactions || []}
            onseeMore ={()=> navigate("/expenses")}
            />

          <Last30daysExpense
            transactions={dashboardData.last30daysExpense?.transactions || []}

          />

          <RecentIncomeWithChart
          data={dashboardData.last60daysIncome?.transactions || []}
          totalIncome = {dashboardData.totalIncome || 0}
            
          />

          <RecentIncome
          transactions ={dashboardData.last60daysIncome?.transactions || []}
          onseeMore ={()=> navigate("/income")}
          />
        </div>
        </>
      )}
     </div>
    </DashboardLayout>
   
  )
}