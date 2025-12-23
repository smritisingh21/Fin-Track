import React, { useContext, useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu';
import { prepareIncomeBarChartData } from '../../utils/helper.js'
import CustomBarChart from '../charts/CustomBarChart.jsx'
import { ThemeContext } from '../../context/ThemeContext.jsx';

export const IncomeOverview = ({transactions, onAddIncome}) => {

    const [chartData , setChartData] = useState([]);
    const {isDark} = useContext(ThemeContext);

    useEffect(()=>{
        const res = prepareIncomeBarChartData(transactions);
        setChartData(res);
        return(() =>{});

    },[transactions])

  return <div className={`${isDark? 'card-dark' : 'card'}`}>
        <div className='flex items-center justify-between mb-20'>
            <div>
            <h5 className={`text-2xl  mb-3 ${isDark? 'text-white' : 'text-black'}`}>Income overview</h5>
            <p className='text-sm text-gray-400 mt-0.5'>
                Track your earnings overtime and analyze your income trends.</p>
            </div>

            <button className={`text-lg btn-primary ${isDark? 'bg-black ' : 'bg-white'}`} onClick={onAddIncome}>
            <LuPlus className='text-lg '/>
            Add income
        </button>

        </div>

        
        <div className='mt-10'>
            <CustomBarChart data={chartData} dataKey={'month'} color1="#355247" color2="#699176"/>
        </div>


    </div>
  
}

export default IncomeOverview;
