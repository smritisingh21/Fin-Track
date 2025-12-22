import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu';
import { prepareIncomeBarChartData } from '../../utils/helper.js'
import CustomBarChart from '../charts/CustomBarChart.jsx'
import CustomLineChart from '../charts/CustomLineChart.jsx';
import { prepareExpenseLineChartData } from '../../utils/helper';


export const ExpenseOverview = ({transactions, onAddExpense}) => {

    const [chartData , setChartData] = useState([]);

    useEffect(()=>{
        const res = prepareExpenseLineChartData(transactions);
        setChartData(res);
        return(() =>{});

    },[transactions])

  return <div className='card'>
    
       <div className='p-5'>
         <div className='flex items-center justify-between mb-20 '>
            <div>
            <h5 className='text-lg'>Expense overview</h5>

            <p className='text-xs text-gray-400 mt-0.5'>
                Track your spending trends overtime and gain insights into where your money goes.</p>
            </div>
             <button className='add-btn mt-3' onClick={onAddExpense}>
            <LuPlus className='text-lg '/>
            Add expense
            </button>
        </div>

       

        <div className='mt-10'>
            <CustomLineChart data={chartData}/>
        </div>
       </div>


    </div>
  
}

export default ExpenseOverview;
