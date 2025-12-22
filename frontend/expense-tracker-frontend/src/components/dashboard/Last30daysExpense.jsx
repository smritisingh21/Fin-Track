import React, { useMemo } from 'react' 
import {prepareExpenseBarChartData} from "../../utils/helper.js"
import CustomBarChart from "../charts/CustomBarChart.jsx"

export const Last30daysExpense = ({data}) => {
    
    const chartData = useMemo(() => {
        return prepareExpenseBarChartData(data);
    }, [data]); 

  return (
    <div className='card col-span-1 '>
        <div  className='flex items-center justify-between'>
            <h5 className='text-lg'>Last 30 days expenses</h5>
        </div>

        <CustomBarChart data={chartData}/>
    </div>
  )
}