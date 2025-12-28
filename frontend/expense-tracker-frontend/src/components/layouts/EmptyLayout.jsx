import React from 'react'
import { FaMoneyBillWave } from 'react-icons/fa';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
export const EmptyLayout = ({type}) => {

        const {isDark} = useContext(ThemeContext);
  
  return (
    <div className={`flex flex-col min-h-100% items-center justify-center py-10 px-4 border-2 border-dashed rounded-3xl ${
      isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-100 bg-gray-50/50'
    }`}>
      <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-400'}`}>
        <FaMoneyBillWave size={32} />
      </div>
      <h3 className={`text-base font-bold ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
        No {type}s added yet
      </h3>
      <p className={`text-sm text-center mt-1 max-w-[200px] ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
        Start tracking your finances by adding your first {type}.
      </p>
    </div>
  );
}
