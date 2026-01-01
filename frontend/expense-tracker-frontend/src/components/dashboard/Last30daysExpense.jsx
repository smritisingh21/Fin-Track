import React, { useMemo } from 'react' 
import {prepareExpenseBarChartData} from "../../utils/helper.js"
import CustomBarChart from "../charts/CustomBarChart.jsx"
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext.jsx'
import SimpleEmpty from '../layouts/SimpleEmpty.jsx'

export const Last30daysExpense = ({transactions}) => {

    const {isDark} = useContext(ThemeContext);
    const hasTransactions = transactions.length > 0;
  
    
    const chartData = useMemo(() => {
        return prepareExpenseBarChartData(transactions);
    }, [transactions]); 

  return (
    <div className={`${isDark? 'card-dark': 'card'}`}>
        <div  className='flex items-center justify-between'>
            <h5 className={` text-lg mb-20 ${isDark? 'text-white':'text-gray-900'}`}>Last 30 days expenses</h5>
        </div>
      {
        hasTransactions?(
          <CustomBarChart 
             data={chartData} 
             dataKey='label' 
              color1='#FF3B3B' 
              color2='#FF3B3B'/>

        ):(
            <SimpleEmpty/>
        )
      }
    </div>
  )
}