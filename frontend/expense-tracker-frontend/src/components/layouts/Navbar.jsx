import React ,{useContext, useState}from 'react'
import {HiOutlineMenu , HiOutlineX} from "react-icons/hi"
import { MdDarkMode} from "react-icons/md";
import { IoIosSunny  } from "react-icons/io";
import SideMenu from "./SideMenu"
import { ThemeContext } from '../../context/ThemeContext';
import { FaGithub } from 'react-icons/fa';
import { Link } from 'react-router';


const Navbar = ({activeMenu}) => {

    const {isDark , toggleDark} = useContext(ThemeContext)
    const[openSideMenu , setOpenSideMenu] = useState(false);


  return (
    <div className={`flex justify-between gap-5 border backdrop-blur-xs border-b border-gray-400/30  py-4 px-7 sticky top-0 z-30 bg-transparent`}>

        <button className={`block lg:hidden  text-black ${isDark ? 'text-white' : 'text-black'}`}
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

     <div className='flex justify-center items-center gap-2'>

         <button className={`px-3 flex justify-center items-center gap-2 cursor-pointer rounded-full ${isDark ? 'darkmode-btn' : 'lightmode-btn'}`}
         onClick={toggleDark}>
          {isDark ?  <IoIosSunny size={20} />  : <MdDarkMode size={20}/> }
          {isDark ? 'Light' :'Dark'}
        </button>

        <Link to={'https://github.com/smritisingh21/Fin-Track'} target="_blank" className={`cursor-pointer rounded-full ${isDark ? 'darkmode-btn' : 'lightmode-btn'}`}>
        <FaGithub size ={20} /> Repo
      </Link>
     </div>
        

        {openSideMenu && (
            <div className='fixed top-[61px] ml-4 bg-white '>
              <SideMenu activeMenu ={activeMenu}/> </div>
         )}
    </div>
    
  )
}

export default Navbar;