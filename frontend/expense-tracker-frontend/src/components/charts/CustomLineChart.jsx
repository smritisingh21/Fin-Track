import React from 'react'
import{XAxis , YAxis , Tooltip, ResponsiveContainer, AreaChart, CartesianGrid, Area} from "recharts"
import { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext'

export const CustomLineChart = ({data}) => {
        const {isDark} = useContext(ThemeContext)
    

    const CustomToolTip = ({ active, payload }) =>{
    if(active && payload.length){
        return(
            <div className={`${isDark? 'bg-white' :'bg-black'} shadow-md rounded-lg p-2 border-gray-300 `}>
                <p className='text-xs font-semibold text-gray-800 mb-1'>{payload[0].payload.category}</p>
                <p className='text-sm text-gray-600'>
                    Amount : <span className='text-sm font-medium text-gray-900'>${payload[0].payload.amount}</span>
                </p>
            </div>
        );
    }
    return null;
    };

    return <div className={`transition-all duration-300 ${isDark? 'bg-[#11131E]' :'bg-white'}`}>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data ={data}>
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9E3A29" stopOpacity={0.4}></stop>
                        <stop offset="95%" stopColor="#9E3A29" stopOpacity={0}></stop>
                    </linearGradient>
                </defs>

                <CartesianGrid stroke='none' />
                    <XAxis dataKey="month" tick={{fontSize :12 , fill:"#555"}} stroke='none' />
                    <YAxis  tick={{fontSize :12 , fill:"#555"}} stroke='none'/>
                    <Tooltip content={<CustomToolTip/>} />
                    <Area type="monottone" dataKey='amount' stroke="#9E3A29" fill="url(#incomeGradient)" strokeWidth={3} dot={{r:3, fill:"#ab8df8"}}/>
            </AreaChart>
        </ResponsiveContainer>
    </div>
   

}

export default CustomLineChart;
