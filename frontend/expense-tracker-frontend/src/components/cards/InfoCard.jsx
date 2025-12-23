import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext';

const InfoCard = ({icon, label, color, value}) =>{

    const {isDark} = useContext(ThemeContext);

    return <div 
    className={`flex gap-6 ${isDark? 'bg-gray-700' : 'bg-white'} p-6  rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50`}>
       
        <div className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}>
            {icon}
        </div>

        <div className=''>
            <h6 className={` mb-1 ${isDark? 'text-white' : 'text-gray-900'}`}>{label}</h6>
            <span className={`text-[18px] ${isDark? 'text-white' : 'text-gray-900'}`}>{value} /-</span>
        </div>
    </div>
}

export default InfoCard;