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
       
    <div className={`w-screen h-screen md:w-[60vw] p-12
    ${isDark ? 'bg-black/80' : 'bg-white'}`}>
        
    <div className='flex justify-between items-center mb-10'> 
      
      <h2 className={`text-xl font-medium mb-3 bg-transparent
      ${isDark? ' text-white' : ' text-black'}`}>
      Expense Tracker
      </h2>


      <button 
        className={`cursor-pointer  bg-transparent  shadow-lg rounded-full ${isDark ? 'text-white hover:shadow-gray-100' : 'text-black hover:shadow-gray-400'}`}
        onClick={toggleDark}>
        {isDark ?  <IoIosSunny size={30} /> : <MdDarkMode size={20}/> }    
      </button>
      </div> 
   

       <StatsInfoCard
        icon={<LuTrendingUpDown/>}
        label="Track Your Income & Expenses"
        value="XXXX"
        color="bg-green-500"
        />
        {children}

    </div>

  )
}
  export function StatsInfoCard  ({icon , label,value, color})  {
 const {isDark} =useContext(ThemeContext);

      return(
      <div className={`flex gap-6 p-4 bg-transparent rounded-xl ${isDark? "text-gray-100" : "text-gray-800"}
      shadow-purple-400/10 border  border-gray-200/50 z-10`} >
      <div className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}>
      {icon}
      </div >
     
      <div>
        <h6 className='text-xs text-gray-500 mb-1'>{label}</h6>
        <span className='text-[20px]'>${value}</span>
      </div>
      </div>
    )}

   
