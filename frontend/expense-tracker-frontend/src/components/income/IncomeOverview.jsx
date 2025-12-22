import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu';
import { prepareIncomeBarChartData } from '../../utils/helper.js'
import CustomBarChart from '../charts/CustomBarChart.jsx'

export const IncomeOverview = ({transactions, onAddIncome}) => {

    const [chartData , setChartData] = useState([]);

    useEffect(()=>{
        const res = prepareIncomeBarChartData(transactions);
        setChartData(res);
        return(() =>{});

    },[transactions])

  return <div className='card'>
        <div className='flex items-center justify-between'>
            <div>
            <h5 className='text-lg'>Income overview</h5>
            <p className='text-xs text-gray-400 mt-0.5'>
                Track your earnings overtime and analyze your income trends.</p>
            </div>
        </div>

        <button className='add-btn mt-3' onClick={onAddIncome}>
            <LuPlus className='text-lg '/>
            Add income
        </button>

        <div className='mt-10'>
            <CustomBarChart data={chartData} dataKey={'month'} color1="#7BD190" color2="#4B7554"/>
        </div>


    </div>
  
}

export default IncomeOverview;
