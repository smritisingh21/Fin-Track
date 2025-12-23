import React ,{useContext, useState}from 'react'
import {HiOutlineMenu , HiOutlineX} from "react-icons/hi"
import { MdDarkMode ,MdOutlineDarkMode} from "react-icons/md";
import SideMenu from "./SideMenu"
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = ({activeMenu}) => {

    const {isDark , toggleDark} = useContext(ThemeContext)
    const[openSideMenu , setOpenSideMenu] = useState(false);


  return (
    <div className={`flex justify-between gap-5 border border-b  border-gray-400/10 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>

        <button className='block lg:hidden text-black ' 
            onClick={() => setOpenSideMenu(!openSideMenu)}>
            {openSideMenu ? 
            (<HiOutlineX className = "text-2xl"/>) 
            : 
            (<HiOutlineMenu className = "text-2xl"/>)}
        </button>

        <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>Expense tracker</h2>

        <button className='cursor-pointer btn-primary'
         onClick={toggleDark}>

          {isDark ?  <MdOutlineDarkMode size={20}/> : <MdDarkMode size={20}/> }
          {isDark ? "Day" : "Night"}

        </button>

        {openSideMenu && (
            <div className='fixed top-[61px] ml-4 bg-white '>
              <SideMenu activeMenu ={activeMenu}/> </div>
         )}
    </div>
    
  )
}

export default Navbar;