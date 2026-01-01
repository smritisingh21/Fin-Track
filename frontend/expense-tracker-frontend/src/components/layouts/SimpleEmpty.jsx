import React, { useContext } from 'react'
import { FaMoneyCheck, FaRegMehRollingEyes, FaSadCry } from 'react-icons/fa'
import { ThemeContext } from '../../context/ThemeContext'

export default function SimpleEmpty() {
  const {isDark} = useContext(ThemeContext);
  return (
    <div className='flex justify-center items-center gap-4'>
        <FaMoneyCheck size={20} className={`bg-transparent ${isDark? 'text-white ' : 'text-black'}`}/>
        <i className={`bg-transparent opacity-70 ${isDark? 'text-white ' : 'text-black'}`}>
            Nothing here yet...
        </i>
    </div>
  )
}
