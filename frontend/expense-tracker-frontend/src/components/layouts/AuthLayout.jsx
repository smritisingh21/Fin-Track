import React, { useContext } from 'react'
import CARD_2 from '/src/assets/images/card2.png'
import {LuTrendingUpDown} from 'react-icons/lu'
import { ThemeContext } from '../../context/ThemeContext'
import { MdDarkMode } from 'react-icons/md'
import { IoIosSunny  } from "react-icons/io";
import { FaHeart } from 'react-icons/fa'


export default function AuthLayout({ children }) {
  const { isDark, toggleDark } = useContext(ThemeContext);

return (
  <div
    className={`relative min-h-screen flex items-center justify-center
    px-4 sm:px-6 lg:px-12 overflow-hidden
    ${isDark ? "bg-neutral-900" : "bg-gray-100"}`}
  >
   

    {/*MAIN CARD */}
    <div
      className={`relative z-10 w-full max-w-3xl p-6 sm:p-10 rounded-xl border-x
      ${isDark ? "bg-black/80 text-white hover:border-gray-700 shadow-2xl shadow-gray-900/50" : "bg-white hover:border-gray-600/80"}`}
    >
      <div className="flex justify-between items-center mb-8">
        <b className="text-2xl sm:text-3xl text-emerald-600">
          FinTrack
          <span className="block sm:inline text-xs text-gray-500 sm:ml-3">
            For your finances
          </span>
        </b>

        <button
          onClick={toggleDark}
          className={`p-2 rounded-full shadow-md transition
          ${isDark ? "text-white hover:shadow-gray-300" : "text-black hover:shadow-gray-500"}`}
        >
          {isDark ? <IoIosSunny size={20} /> : <MdDarkMode size={20} />}
        </button>
      </div>

      {/* STATS CARD */}
      <StatsInfoCard
        icon={<LuTrendingUpDown />}
        label="Track Your Income & Expenses"
        value="XXXX"
        color="bg-green-500"
      />

      {/* FORM CONTENT */}
      <div className="mt-10">{children}</div>


    </div>

  </div>
);
}

export function StatsInfoCard({ icon, label, value, color }) {
  const { isDark } = useContext(ThemeContext);

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm
      ${isDark ? "text-gray-100 border-gray-700" : "text-gray-800 border-gray-200"}`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl text-white
        ${color} rounded-full`}
      >
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <span className="text-lg font-semibold">${value}</span>
      </div>
    </div>
  );
}

   
