import React, { useMemo } from 'react' 
import {prepareExpenseBarChartData} from "../../utils/helper.js"
import CustomBarChart from "../charts/CustomBarChart.jsx"
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext.jsx'

export const Last30daysExpense = ({transactions}) => {

    const {isDark} = useContext(ThemeContext);
  
    
    const chartData = useMemo(() => {
        return prepareExpenseBarChartData(transactions);
    }, [transactions]); 

  return (
    <div className={`${isDark? 'card-dark': 'card'}`}>
        <div  className='flex items-center justify-between'>
            <h5 className={` text-lg ${isDark? 'text-white':'text-gray-900'}`}>Last 30 days expenses</h5>
        </div>

        <CustomBarChart data={chartData} dataKey='label' color1='#630800' color2='#9C0C00'/>
    </div>
  )
}