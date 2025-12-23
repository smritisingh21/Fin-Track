import React, { useMemo } from 'react' // 👈 Import useMemo
import { CustomPieChart } from '../charts/CustomPieChart'
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';



 const FinanceOverview = ({totalBalance , totalIncome , totalExpense , mode}) => {

    const { isDark } = useContext(ThemeContext);

    const CHART_COLORS = useMemo(() => {
        return isDark 
            ? ["#60A5FA", "#4ADE80", "#FB7185"] 
            : ["#1E40AF", "#15803D", "#B91C1C"]; 
    }, [isDark]);

    const balanceData = useMemo(() => ([

        {name:"totalBalance" ,amount :totalBalance},
        {name:"totalIncome" ,amount :totalIncome},
        {name:"totalExpense" ,amount :totalExpense},
    ]), [totalBalance, totalIncome, totalExpense]); // Dependencies are the primitive values
    
  return (
    
    <div className={`${
            isDark ? 'card-dark' : 'card'
        }`}>
        <div className='flex items-center justify-between'>
            <h5 className={` text-lg ${isDark? "text-white" : "text-black"}`}>
              Overview
            </h5>
        </div>

        <CustomPieChart
        data={balanceData} 
        label ='Total balance'
        totalAmount={`${totalBalance}/-`}
        colors={CHART_COLORS}
        isDark={isDark}
        showTextAnchor
        />


    </div>
  )
}

export default FinanceOverview;