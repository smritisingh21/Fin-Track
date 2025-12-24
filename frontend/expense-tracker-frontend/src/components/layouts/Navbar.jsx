import React ,{useContext, useState}from 'react'
import {HiOutlineMenu , HiOutlineX} from "react-icons/hi"
import { MdDarkMode} from "react-icons/md";
import { IoIosSunny  } from "react-icons/io";
import SideMenu from "./SideMenu"
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = ({activeMenu}) => {

    const {isDark , toggleDark} = useContext(ThemeContext)
    const[openSideMenu , setOpenSideMenu] = useState(false);


  return (
    <div className={`flex justify-between gap-5 border backdrop-blur-xs border-b border-gray-400/50  py-4 px-7 sticky top-0 z-30 bg-transparent`}>

        <button className='block lg:hidden text-black ' 
            onClick={() => setOpenSideMenu(!openSideMenu)}>
            {openSideMenu ? 
            (<HiOutlineX className = "text-2xl"/>) 
            : 
            (<HiOutlineMenu className = "text-2xl"/>)}
        </button>

        <h2 className={`flex-row gap-2 text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>
          <b className='text-[30px] text-emerald-600'>FinTrack  </b> 
          <span className='text-[12px] text-gray-500'>Keep your finances in track</span>
        </h2>

        <button className={`cursor-pointer btn-primary rounded-full ${isDark ? 'bg-black' : 'bg-white'}`}
         onClick={toggleDark}>

          {isDark ?  <IoIosSunny size={30} /> : <MdDarkMode size={20}/> }
    
        </button>

        {openSideMenu && (
            <div className='fixed top-[61px] ml-4 bg-white '>
              <SideMenu activeMenu ={activeMenu}/> </div>
         )}
    </div>
    
  )
}

export default Navbar;