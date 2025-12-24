import React, { useContext } from 'react'
import CARD_2 from '/src/assets/images/card2.png'
import {LuTrendingUpDown} from 'react-icons/lu'
import { ThemeContext } from '../../context/ThemeContext'
import { MdDarkMode } from 'react-icons/md'
import { IoIosSunny  } from "react-icons/io";
// AuthLayout component for authentication pages
// It includes a background image and a stats card
// This layout is used for both login and signup pages
export default function AuthLayout({children}) {
 const {isDark, toggleDark} =useContext(ThemeContext);
   

  return (
    <div className='flex'>
       
    <div className='w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12'>
        <button className={`cursor-pointer btn-primary rounded-full ${isDark ? 'bg-black' : 'bg-white'}`}
                 onClick={toggleDark}>
        
                  {isDark ?  <IoIosSunny size={30} /> : <MdDarkMode size={20}/> }
            
                </button>
     <h2 className={`text-lg font-medium ${isDark? 'bg-gray-800 text-white' : 'bg-white  text-black'}`}>Expense Tracker</h2>
        {children}
    </div>


    <div className={`${isDark? 'bg-gray-700' : 'bg-white'} hidden md:block w-[40vw] h-screen bg-violet-50 bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative`}>
        <div className='w-48 h-48 rounded-[40px] bg-emerald-600 absolute -top-7 -left-5'/>
        <div className='w-48 h-56 rounded-[40px] border-[20px] bg-emerald-300 absolute -top-[30%] -right-10'/>
        <div className='w-48 h-48 rounded-[40px] bg-emerald-500 absolute -bottom-7 -left-5'/>

       <div className='grid grid-cols-1 z-20'>

       <StatsInfoCard
       icon={<LuTrendingUpDown/>}
        label="Track Your Income & Expenses"
        value="XXXX"
        color="bg-primary"
        />
        </div>
        
        <img 
        src={CARD_2}
         className="w-64 lg:w-[90%] absolute bottom-10 shadow-lg shadow-blue-400/15 " />
    </div>
    </div>
  )
}
  export function StatsInfoCard  ({icon , label,value, color})  {
      return(
      <div className="flex gap-6 bg-white p-4 rounded xl shadow-purple-400/10 border  border-gray-200/50 z-10" >
      <div className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}>
      {icon}
      </div >
     
      <div>
        <h6 className='text-xs text-gray-500 mb-1'>{label}</h6>
        <span className='text-[20px]'>${value}</span>
      </div>
      </div>
    )}

   
