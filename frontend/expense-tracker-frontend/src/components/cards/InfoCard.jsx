import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext';

const InfoCard = ({icon, label, color, value}) =>{

    const {isDark} = useContext(ThemeContext);

    return <div className={`
      relative overflow-hidden flex items-center gap-6 p-8 rounded-3xl 
      backdrop-blur-md transition-all duration-500
      border border-white/20 dark:border-white/10
      shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
      ${isDark 
        ? 'bg-slate-900/40 hover:bg-slate-900/50' 
        : 'bg-white/30 hover:bg-white/40'}
    `}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Icon Container */}
      <div className={`
        shrink-0 w-16 h-16 flex items-center justify-center text-2xl text-white 
        rounded-2xl shadow-lg ring-4 ring-white/10
        ${color} /* e.g., bg-blue-500 */
      `}>
        {icon}
      </div>

        <div className=''>
            <h6 className={` mb-1 ${isDark? 'text-white' : 'text-gray-900'}`}>{label}</h6>
            {/* <h6 className='text-white'>{label}</h6> */}
            <span className={`text-[18px] ${isDark? 'text-white' : 'text-gray-900'}`}>{value} /-</span>
            {/* <span className='text-white'>{value} /-</span> */}
        </div>
    </div>
}

export default InfoCard;