import React, { useMemo } from 'react' 
import {prepareExpenseBarChartData} from "../../utils/helper.js"
import CustomBarChart from "../charts/CustomBarChart.jsx"

export const Last30daysExpense = ({transactions}) => {
    
    const chartData = useMemo(() => {
        return prepareExpenseBarChartData(transactions);
    }, [transactions]); 

  return (
    <div className='card col-span-1 '>
        <div  className='flex items-center justify-between'>
            <h5 className='text-lg mb-15'>Last 30 days expenses</h5>
        </div>

        <CustomBarChart data={chartData} dataKey='label' color1='#630800' color2='#9C0C00'/>
    </div>
  )
}